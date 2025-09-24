"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Search, Share2, Shield, Clock, Code, Key, Lock, Eye } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
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
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-background">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/nullbin-logo.png"
                alt="NullBin Logo"
                width={32}
                height={32}
                className="w-8 h-8 rounded"
              />
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
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-background">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/nullbin-logo.png"
                alt="NullBin Logo"
                width={32}
                height={32}
                className="w-8 h-8 rounded"
              />
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
            <h1 className="text-3xl font-bold mb-4">View Paste</h1>
            <p className="text-muted-foreground">
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
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold">NullBin</span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Privacy-first encrypted pastebin
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-12 px-4">

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Create Paste */}
          <Card className="hover:shadow-md transition-shadow flex flex-col h-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Create Paste</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-muted-foreground mb-6">
                Share your code, notes, or data securely. Everything is encrypted in your browser before being sent.
              </p>
              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-green-600" />
                  Client-side encryption
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4 text-orange-600" />
                  Optional password protection
                </div>
              </div>
              <Button 
                onClick={() => setMode("create")}
                className="w-full mt-auto"
              >
                Start Creating
              </Button>
            </CardContent>
          </Card>

          {/* View Paste */}
          <Card className="hover:shadow-md transition-shadow flex flex-col h-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle>View Paste</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-muted-foreground mb-6">
                Enter your paste link or ID to decrypt and view the content securely. No account needed.
              </p>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Key className="h-4 w-4 text-blue-600" />
                  Automatic decryption
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4 text-purple-600" />
                  Instant viewing
                </div>
              </div>
              <Button 
                onClick={() => setMode("view")}
                variant="outline"
                className="w-full mt-auto"
              >
                Find Paste
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Why NullBin?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Client-Side Encryption</h3>
              <p className="text-sm text-muted-foreground">
                Your data is encrypted in your browser before leaving your device. We never see your content.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Share2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Secure Sharing</h3>
              <p className="text-sm text-muted-foreground">
                Decryption keys are embedded in the URL hash, never sent to our servers.
              </p>
            </div>
            <div className="text-center sm:col-span-2 lg:col-span-1">
              <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
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
