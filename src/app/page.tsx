"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Search, Share2, Shield, Clock, Key, Lock, Eye } from "lucide-react"
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
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center group">
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                NullBin
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setMode("select")}
                className="transition-all duration-200 hover:scale-105 active:scale-95"
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
        <header className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center group">
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                NullBin
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setMode("select")}
                className="transition-all duration-200 hover:scale-105 active:scale-95"
              >
                ← Back
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto py-8 px-4 max-w-2xl">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
              <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">View Paste</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Find Your Paste</h1>
            <p className="text-muted-foreground text-lg">
              Enter a paste ID or URL to view shared content
            </p>
          </div>

          <Card className="border-0 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Find Paste
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paste-id" className="text-sm font-medium">Paste ID or URL</Label>
                <Input
                  id="paste-id"
                  placeholder="Enter paste ID (e.g., abc123) or full URL"
                  value={pasteId}
                  onChange={(e) => setPasteId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleViewPaste()}
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button 
                onClick={handleViewPaste} 
                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              >
                <Search className="mr-2 h-5 w-5" />
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
      <header className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              NullBin
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground hidden sm:inline font-medium">
              Privacy-first encrypted pastebin
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-12 px-4">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">End-to-End Encrypted</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span className="block">Share securely,</span>
            <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              stay private
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Client-side encrypted pastebin with zero-knowledge architecture. 
            Your data is encrypted before it leaves your device.
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-16">
          {/* Create Paste */}
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 flex flex-col h-full hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:bg-primary/30 transition-all duration-300"></div>
                  <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl sm:text-2xl">Create Paste</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 relative z-10">
              <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                Share your code, notes, or data securely. Everything is encrypted in your browser before being sent.
              </p>
              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-3 text-sm text-muted-foreground p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium">Client-side encryption</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                  <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="font-medium">Optional password protection</span>
                </div>
              </div>
              <Button 
                onClick={() => setMode("create")}
                className="w-full mt-auto h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group-hover:scale-[1.02]"
              >
                <Plus className="mr-2 h-5 w-5" />
                Start Creating
              </Button>
            </CardContent>
          </Card>

          {/* View Paste */}
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm shadow-xl shadow-blue-500/5 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col h-full hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-lg group-hover:bg-blue-500/30 transition-all duration-300"></div>
                  <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <CardTitle className="text-xl sm:text-2xl">View Paste</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 relative z-10">
              <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                Enter your paste link or ID to decrypt and view the content securely. No account needed.
              </p>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Key className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">Automatic decryption</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="font-medium">Instant viewing</span>
                </div>
              </div>
              <Button 
                onClick={() => setMode("view")}
                variant="outline"
                className="w-full mt-auto h-12 text-base font-semibold border-2 hover:bg-accent hover:border-primary/50 transition-all duration-300 group-hover:scale-[1.02]"
              >
                <Search className="mr-2 h-5 w-5" />
                Find Paste
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why NullBin?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built with privacy and security as the foundation
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="group text-center border-0 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="relative mx-auto mb-4 h-14 w-14">
                  <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:bg-primary/30 transition-all duration-300"></div>
                  <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2 text-lg">Client-Side Encryption</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your data is encrypted in your browser before leaving your device. We never see your content.
                </p>
              </CardContent>
            </Card>
            <Card className="group text-center border-0 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="relative mx-auto mb-4 h-14 w-14">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-lg group-hover:bg-blue-500/30 transition-all duration-300"></div>
                  <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Share2 className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2 text-lg">Secure Sharing</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Decryption keys are embedded in the URL hash, never sent to our servers.
                </p>
              </CardContent>
            </Card>
            <Card className="group text-center border-0 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
              <CardContent className="pt-6">
                <div className="relative mx-auto mb-4 h-14 w-14">
                  <div className="absolute inset-0 bg-green-500/20 rounded-xl blur-lg group-hover:bg-green-500/30 transition-all duration-300"></div>
                  <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center border border-green-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2 text-lg">Auto-Expiring</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Set expiration times to automatically delete pastes for enhanced privacy.
                </p>
              </CardContent>
            </Card>
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
