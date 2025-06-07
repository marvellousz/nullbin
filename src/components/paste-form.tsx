"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Share2, Eye, EyeOff } from "lucide-react"
import { encryptData, generateShareableLink } from "@/lib/crypto"
import { languageOptions, getLanguageFromFilename } from "@/lib/syntax"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const expiryOptions = [
  { value: "1m", label: "1 minute" },
  { value: "5m", label: "5 minutes" },
  { value: "10m", label: "10 minutes" },
  { value: "15m", label: "15 minutes" },
  { value: "30m", label: "30 minutes" },
  { value: "45m", label: "45 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "3h", label: "3 hours" },
  { value: "6h", label: "6 hours" },
  { value: "12h", label: "12 hours" },
  { value: "1d", label: "1 day" },
  { value: "3d", label: "3 days" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "never", label: "Never" },
]

export function PasteForm() {  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
  const [language, setLanguage] = useState("text")
  const [expiry, setExpiry] = useState("1h")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Auto-detect language from filename
    const detectedLanguage = getLanguageFromFilename(file.name)
    setLanguage(detectedLanguage)
    setTitle(file.name)

    // Read file content
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setContent(text)
    }
    reader.readAsText(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      toast.error("Please enter some content")
      return    }

    setIsLoading(true)

    try {
      // Encrypt the content
      const { encryptedData, key, iv, salt } = await encryptData(content, password)

      // Create the paste
      const response = await fetch("/api/paste", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },        body: JSON.stringify({
          title: title || undefined,
          content: encryptedData,
          language,
          expiry,
          password: password ? "protected" : undefined,
          iv,
          salt,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create paste")
      }      const { id } = await response.json()      // Generate shareable link with encryption key in hash fragment
      console.log('🔒 Creating shareable link with:', {
        hasPassword: !!password,
        hasSalt: !!salt,
        keyPreview: key.substring(0, 15) + '...',
      })
      const shareableLink = generateShareableLink(id, key, iv, salt)
      console.log('🔗 Generated link:', shareableLink)

      // Try to copy to clipboard (may fail due to user activation)
      try {
        await navigator.clipboard.writeText(shareableLink)
        toast.success("🎉 Paste created successfully!", {
          description: "Shareable link copied to clipboard. You can now share it with others!"
        })
      } catch (clipboardError) {
        console.warn("Clipboard copy failed:", clipboardError)
        toast.success("🎉 Paste created successfully!", {
          description: "You'll find the shareable link on the next page. Look for the green 'Share This Paste' section!"
        })
      }

      // Navigate to the paste
      router.push(shareableLink)
    } catch (error) {
      console.error("Error creating paste:", error)
      toast.error("Failed to create paste. Please try again.")    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto rounded-2xl border-0 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm shadow-2xl shadow-primary/5">
      <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
        <div className="mx-auto mb-3 sm:mb-4 h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-4 ring-primary/5 transition-transform duration-300 hover:scale-105">
          <Share2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        </div>
        <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight">
          Create New Paste
        </CardTitle>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Share your content securely with client-side encryption
        </p>
      </CardHeader>      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Title and File Upload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">Title (optional)</Label>
              <Input
                id="title"
                placeholder="Enter a title for your paste"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file" className="text-sm font-medium">Upload File (optional)</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileUpload}
                accept="text/*,.js,.ts,.tsx,.jsx,.py,.java,.c,.cpp,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.html,.css,.scss,.json,.xml,.yml,.yaml,.toml,.md,.sql,.sh,.ps1,.dockerfile,.vue,.svelte,.r,.m,.lua,.pl,.hs,.clj,.ex,.erl,.dart,.sol,.graphql,.diff"
                className="h-10 sm:h-11 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* Language and Expiry */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-medium">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry" className="text-sm font-medium">Expiration</Label>
              <Select value={expiry} onValueChange={setExpiry}>
                <SelectTrigger className="h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent>
                  {expiryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Password Protection */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password Protection (optional)</Label>
            <div className="relative group">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password for additional protection"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-12 h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent group-hover:text-primary transition-colors duration-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">Content</Label>
            <Textarea
              id="content"
              placeholder="Paste your code or text here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[250px] sm:min-h-[300px] font-mono text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20 resize-y"
              required
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-11 sm:h-12 text-base sm:text-lg font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/25 transition-all duration-200 active:scale-[0.98] touch-manipulation group" 
            disabled={isLoading || !content.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                <span className="hidden sm:inline">Creating Paste...</span>
                <span className="sm:hidden">Creating...</span>
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="hidden sm:inline">Create Encrypted Paste</span>
                <span className="sm:hidden">Create Paste</span>
              </>
            )}
          </Button>
        </form>
      </CardContent></Card>
  )
}

export default PasteForm
