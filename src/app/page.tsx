"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Search, Share2, Shield, Clock, Code, Key, Lock, Eye } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import PasteForm from "@/components/paste-form"
import { ThemeToggle } from '@/components/theme-toggle'
import Footer from '@/components/footer'

function HomeContent() {
  const [mode, setMode] = useState<"select" | "create" | "view">("select")
  const [pasteId, setPasteId] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for mode parameter in URL
  useEffect(() => {
    const modeParam = searchParams.get('mode')
    if (modeParam === 'create' || modeParam === 'view') {
      setMode(modeParam)
    }
  }, [searchParams])

  const handleViewPaste = () => {
    if (!pasteId.trim()) {
      toast.error("Please enter a paste ID or URL")
      return
    }

    const input = pasteId.trim()
    
    // If it's a full URL, extract the path and preserve the hash fragment
    if (input.includes('://')) {
      try {
        const url = new URL(input)
        // Extract path and hash from the URL
        const pathAndHash = url.pathname + url.hash
        router.push(pathAndHash)
        return
      } catch {
        toast.error("Invalid URL format")
        return
      }
    }
    
    // If it contains paste/ prefix but not a full URL
    const urlMatch = input.match(/paste\/([a-zA-Z0-9]+(?:#.*)?)/)
    if (urlMatch) {
      router.push(`/paste/${urlMatch[1]}`)
      return
    }
    
    // If it's just a paste ID (with or without hash fragment)
    router.push(`/paste/${input}`)
  }

  if (mode === "create") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
        <header className="border-b backdrop-blur-sm bg-background/80">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">N</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">NullBin</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setMode("select")}
              >
                ← Back
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        <main className="flex-1 container mx-auto py-8 px-4">
          <PasteForm />
        </main>
        
        <Footer />
      </div>
    )
  }

  if (mode === "view") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
        <header className="border-b backdrop-blur-sm bg-background/80">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">N</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">NullBin</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setMode("select")}
              >
                ← Back
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto py-8 px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">View Paste</h1>
            <p className="text-lg text-muted-foreground">
              Enter a paste ID or URL to view shared content
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Paste
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paste-id">Paste ID or URL</Label>
                <Input
                  id="paste-id"
                  placeholder="Enter paste ID (e.g., abc123) or full URL"
                  value={pasteId}
                  onChange={(e) => setPasteId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleViewPaste()}
                />
              </div>
              <Button onClick={handleViewPaste} className="w-full">
                <Search className="mr-2 h-4 w-4" />
                View Paste
              </Button>
            </CardContent>
          </Card>
        </main>
        
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      <header className="border-b backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-base sm:text-lg">N</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">NullBin</h1>
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
              Privacy-first encrypted pastebin
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8 sm:py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            NullBin
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-3 leading-relaxed px-4">
            Instantly share encrypted notes, code, or data — no sign-up needed
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              End-to-end encrypted
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Auto-expiring
            </div>
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-purple-500" />
              Syntax highlighting
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {/* Create Paste */}
          <Card className="group transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 rounded-2xl border-0 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm h-full min-h-[420px] sm:min-h-[480px] flex flex-col">
            <CardHeader className="text-center pb-4 sm:pb-6">
              <div className="mx-auto mb-4 sm:mb-6 h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-4 ring-primary/5 group-hover:ring-primary/10 transition-all duration-300">
                <Plus className="h-8 w-8 sm:h-10 sm:w-10 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-semibold tracking-tight">Create Paste</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6 sm:space-y-8 flex-1 flex flex-col justify-between px-6 sm:px-8">
              <div className="space-y-4 sm:space-y-6">
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  Share your code, notes, or data securely. Everything is encrypted in your browser before being sent—we never see your content.
                </p>
                <div className="space-y-3 sm:space-y-4 max-w-sm mx-auto">
                  <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="leading-5">Client-side encryption</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    <span className="leading-5">Optional password protection</span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => setMode("create")}
                className="w-full h-11 sm:h-12 text-base sm:text-lg font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/25 transition-all duration-200 mt-6 sm:mt-8 group-hover:shadow-xl group-hover:shadow-primary/30 active:scale-[0.98] touch-manipulation"
              >
                Start Creating
              </Button>
            </CardContent>
          </Card>

          {/* View Paste */}
          <Card className="group transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 rounded-2xl border-0 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm h-full min-h-[420px] sm:min-h-[480px] flex flex-col">
            <CardHeader className="text-center pb-4 sm:pb-6">
              <div className="mx-auto mb-4 sm:mb-6 h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center ring-4 ring-blue-500/5 group-hover:ring-blue-500/15 transition-all duration-300">
                <Search className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-semibold tracking-tight">View Paste</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6 sm:space-y-8 flex-1 flex flex-col justify-between px-6 sm:px-8">
              <div className="space-y-4 sm:space-y-6">
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  Enter your paste link or ID to decrypt and view the content securely. No account needed—just paste and view instantly.
                </p>
                <div className="space-y-3 sm:space-y-4 max-w-sm mx-auto">
                  <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                    <Key className="h-4 w-4 text-blue-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="leading-5">Automatic decryption</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4 text-purple-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="leading-5">Instant viewing</span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => setMode("view")}
                className="w-full h-11 sm:h-12 text-base sm:text-lg font-medium bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 mt-6 sm:mt-8 group-hover:shadow-xl group-hover:shadow-blue-500/30 active:scale-[0.98] touch-manipulation"
              >
                Find Paste
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">Why NullBin?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center group">
              <div className="mx-auto mb-4 h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Client-Side Encryption</h3>
              <p className="text-sm text-muted-foreground">
                Your data is encrypted in your browser before leaving your device. We never see your content.
              </p>
            </div>
            <div className="text-center group">
              <div className="mx-auto mb-4 h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Share2 className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Secure Sharing</h3>
              <p className="text-sm text-muted-foreground">
                Decryption keys are embedded in the URL hash, never sent to our servers.
              </p>
            </div>
            <div className="text-center group sm:col-span-2 lg:col-span-1">
              <div className="mx-auto mb-4 h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Auto-Expiring</h3>
              <p className="text-sm text-muted-foreground">
                Set expiration times to automatically delete pastes for enhanced privacy.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}
