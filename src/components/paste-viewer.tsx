"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Copy, 
  Download, 
  Eye, 
  Calendar, 
  Code, 
  Lock, 
  Unlock,
  Loader2,
  AlertCircle,
  Share2,
  ArrowLeft
} from "lucide-react"
import { decryptData, extractEncryptionFromHash } from "@/lib/crypto"
import { highlightCode } from "@/lib/syntax"
import { formatTimestamp, formatExpirationTime, isExpired } from "@/lib/utils"
import { toast } from "sonner"
import { notFound } from "next/navigation"
import Link from "next/link"

interface PasteData {
  id: string
  title?: string
  content: string
  language: string
  createdAt: number
  expiresAt: number | null
  iv: string
  salt?: string
  passwordProtected: boolean
  viewCount: number
}

interface PasteViewerProps {
  pasteId: string
}

export function PasteViewer({ pasteId }: PasteViewerProps) {
  const [paste, setPaste] = useState<PasteData | null>(null)
  const [decryptedContent, setDecryptedContent] = useState<string>("")
  const [highlightedContent, setHighlightedContent] = useState<string>("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [isDecrypted, setIsDecrypted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(Date.now())
  // Update current time for live timestamp updates
  useEffect(() => {
    const updateInterval = () => {
      const now = Date.now()
      setCurrentTime(now)
      
      // If we have a paste and it's expiring soon, update more frequently
      if (paste?.expiresAt) {
        const timeToExpiry = paste.expiresAt - now
        if (timeToExpiry < 5 * 60 * 1000) { // Less than 5 minutes
          return 1000 // Update every second
        } else if (timeToExpiry < 60 * 60 * 1000) { // Less than 1 hour
          return 10000 // Update every 10 seconds
        }
      }
      return 60000 // Default: update every minute
    }

    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, updateInterval())

    // Initial update
    setCurrentTime(Date.now())

    return () => clearInterval(timer)
  }, [paste?.expiresAt])
  useEffect(() => {
    loadPaste()
  }, [pasteId]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (decryptedContent && paste) {
      highlightCodeContent()
    }
  }, [decryptedContent, paste]) // eslint-disable-line react-hooks/exhaustive-deps
  
  const loadPaste = async () => {
    try {
      console.log(`Loading paste: ${pasteId}`)
      const response = await fetch(`/api/paste/${pasteId}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        
        if (response.status === 404) {
          console.log(`Paste not found: ${pasteId} - redirecting to 404`)
          notFound()
        } else if (response.status === 410) {
          // Paste expired
          console.log(`Paste expired: ${pasteId} - ${errorData.message}`)
          setError(errorData.message || 'This paste has expired and has been automatically removed for security.')
          return
        }
        
        console.error(`Failed to load paste: ${pasteId} - ${response.status}: ${errorData.error}`)
        throw new Error(`Failed to load paste: ${errorData.error}`)
      }
      
      // Add some debugging for the URL hash
      const hashData = window.location.hash ? window.location.hash.substring(1) : null;
      console.log('URL hash:', hashData ? hashData.substring(0, 20) + '...' : 'none');
      
      const pasteData: PasteData = await response.json()
      console.log(`Paste loaded successfully: ${pasteId} - Language: ${pasteData.language}, Expires: ${pasteData.expiresAt ? new Date(pasteData.expiresAt).toISOString() : 'Never'}`)
      console.log(`Paste details: Password protected: ${pasteData.passwordProtected}, Has salt: ${!!pasteData.salt}`)

      // Check if expired (client-side double-check)
      if (isExpired(pasteData.expiresAt)) {
        const expiredTime = pasteData.expiresAt ? new Date(pasteData.expiresAt).toLocaleString() : 'Unknown'
        console.log(`Paste expired: ${pasteId} - Expired at ${expiredTime}`)
        setError(`This paste expired on ${expiredTime} and has been automatically removed for security.`)
        return
      }
      
      setPaste(pasteData)
      
      // Only auto-decrypt non-password-protected pastes
      const encryptionData = extractEncryptionFromHash()
      if (encryptionData && 
          !pasteData.passwordProtected && 
          encryptionData.key !== 'password-protected') {
        await attemptDecryption(pasteData, encryptionData.key, encryptionData.iv)
      }
    } catch (error) {
      console.error("Error loading paste:", error)
      setError("Failed to load paste. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }  }
  
  const attemptDecryption = async (
    pasteData: PasteData, 
    key: string, 
    iv: string, 
    userPassword?: string
  ) => {
    setIsDecrypting(true)
    setError(null)

    console.log('🔑 Attempting decryption:', {
      hasPassword: !!userPassword,
      isPwdProtected: pasteData.passwordProtected,
      hasSalt: !!pasteData.salt,
      key: key === 'password-protected' ? 'password-protected' : key.substring(0, 10) + '...',
      keyIsPlaceholder: key === 'password-protected'
    })

    try {
      const decryptionParams: {
        encryptedData: string;
        key: string;
        iv: string;
        password?: string;
        salt?: string;
      } = {
        encryptedData: pasteData.content,
        key,
        iv,
      }

      // For password-protected content, include password and salt
      if (pasteData.passwordProtected && userPassword) {
        // Key must be 'password-protected' to force using password+salt for decryption
        if (key !== 'password-protected') {
          console.warn('Forcing key to password-protected for password-protected paste');
          decryptionParams.key = 'password-protected';
        }
        
        // Make sure we have the salt
        if (!pasteData.salt) {
          console.error('Attempting to decrypt password-protected paste without salt');
          throw new Error('Salt is required for password-protected decryption');
        }
        decryptionParams.password = userPassword;
        decryptionParams.salt = pasteData.salt;
        
        // Log the salt but handle case where it might be shorter than 10 chars
        const saltPreview = decryptionParams.salt.length > 10 
          ? decryptionParams.salt.substring(0, 10) + '...' 
          : decryptionParams.salt;
        console.log('Using salt for password decryption:', saltPreview);
      }      try {
        const decrypted = await decryptData(decryptionParams)
        setDecryptedContent(decrypted)
        setIsDecrypted(true)
        toast.success("Content decrypted successfully")
      } catch (decryptError: unknown) {
        // Silently handle the incorrect password error without console output
        if (pasteData.passwordProtected && userPassword) {
          toast.error("Incorrect password. Please try again.")
        } else if (pasteData.passwordProtected) {
          toast.error("This paste is password-protected. Please enter the correct password.")
        } else {
          console.error("Decryption failed:", decryptError)
          setError("Failed to decrypt content. The decryption link may be invalid or corrupted.")
        }
      }
    } catch (error) {
      console.error("Error preparing decryption:", error)
      setError("Failed to prepare decryption parameters.")
    } finally {
      setIsDecrypting(false)
    }
  }
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!paste || !password) return

    const encryptionData = extractEncryptionFromHash()
    if (!encryptionData) {
      alert("Invalid decryption link")
      return
    }

    // Add debugging
    console.log('🔒 Password form submitted:', {
      passwordLength: password.length,
      encryptionData: {
        key: encryptionData.key.substring(0, 10) + '...',
        hasSalt: !!encryptionData.salt
      },
      pasteHasSalt: !!paste.salt
    })

    // For password-protected pastes:
    // 1. The salt might be in the paste data and/or in the URL hash
    // 2. We need to ensure we use one of them for decryption
    
    // Create a new paste object with salt from either source
    const pasteWithSalt = {
      ...paste,
      salt: paste.salt || encryptionData.salt
    };
    
    if (!pasteWithSalt.salt) {
      console.error("No salt found in either the paste data or URL fragment");
      alert("This paste is missing salt information required for password decryption");
      return;
    }
    
    // For password-protected content, always use 'password-protected' as the key
    // The crypto.ts will use the password+salt to derive the real key
    await attemptDecryption(pasteWithSalt, 'password-protected', encryptionData.iv, password)
  }

  const highlightCodeContent = async () => {
    if (!paste || !decryptedContent) return

    try {
      const highlighted = await highlightCode(decryptedContent, paste.language)
      setHighlightedContent(highlighted)
    } catch {
      console.error("Error highlighting code")
      // Fallback to plain text
      setHighlightedContent(`<pre><code>${decryptedContent}</code></pre>`)
    }
  }
  const copyToClipboard = async () => {    if (!decryptedContent) return
    try {
      await navigator.clipboard.writeText(decryptedContent)
      toast.success("Content copied to clipboard")
    } catch {
      toast.error("Failed to copy content")
    }
  }

  const copyShareableLink = async () => {
    try {
      const currentUrl = window.location.href
      await navigator.clipboard.writeText(currentUrl)
      toast.success("Shareable link copied to clipboard")
    } catch {
      toast.error("Failed to copy link")
    }
  }

  const downloadPaste = () => {
    if (!decryptedContent || !paste) return

    const blob = new Blob([decryptedContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = paste.title || `paste-${paste.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("File downloaded")
  }
  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-3 sm:space-y-4 lg:space-y-6 px-3 sm:px-4 lg:px-6">
        {/* Skeleton for paste info */}
        <Card className="rounded-xl sm:rounded-2xl border-0 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm shadow-2xl shadow-primary/5">
          <CardHeader className="px-4 sm:px-6">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 sm:h-5 sm:w-5 bg-muted rounded animate-pulse" />
                <div className="h-5 sm:h-6 w-24 sm:w-32 bg-muted rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center">
                <div className="h-5 sm:h-6 w-12 bg-muted rounded animate-pulse" />
                <div className="h-5 sm:h-6 w-16 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:gap-4">
              <div className="h-3 sm:h-4 w-20 sm:w-24 bg-muted rounded animate-pulse" />
              <div className="h-3 sm:h-4 w-16 sm:w-20 bg-muted rounded animate-pulse" />
            </div>
          </CardHeader>
        </Card>
        
        {/* Skeleton for share section */}
        <Card className="rounded-xl sm:rounded-2xl border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader className="px-4 sm:px-6">
            <div className="h-5 sm:h-6 w-24 sm:w-32 bg-green-200 dark:bg-green-800 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3">
              <div className="h-3 sm:h-4 w-full bg-green-200 dark:bg-green-800 rounded animate-pulse" />
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="h-9 sm:h-10 flex-1 bg-green-100 dark:bg-green-900 rounded animate-pulse" />
                <div className="h-9 sm:h-10 w-20 sm:w-24 bg-green-300 dark:bg-green-700 rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Skeleton for content */}
        <Card className="rounded-xl sm:rounded-2xl border-0 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm shadow-2xl shadow-primary/5">
          <CardHeader className="px-4 sm:px-6">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center justify-between">
              <div className="h-5 sm:h-6 w-16 sm:w-20 bg-muted rounded animate-pulse" />
              <div className="flex items-center gap-2">
                <div className="h-7 sm:h-8 w-16 sm:w-20 bg-muted rounded animate-pulse" />
                <div className="h-7 sm:h-8 w-20 sm:w-24 bg-muted rounded animate-pulse" />
                <div className="h-7 sm:h-8 w-16 sm:w-20 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-2 sm:space-y-3">
              <div className="h-3 sm:h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-3 sm:h-4 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-3 sm:h-4 w-5/6 bg-muted rounded animate-pulse" />
              <div className="h-3 sm:h-4 w-2/3 bg-muted rounded animate-pulse" />
              <div className="h-3 sm:h-4 w-4/5 bg-muted rounded animate-pulse" />
              <div className="h-3 sm:h-4 w-1/2 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex items-center justify-center py-6 sm:py-8">
          <div className="text-center">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto mb-3 sm:mb-4 text-primary" />
            <p className="text-muted-foreground font-medium text-sm sm:text-base">Loading paste...</p>
          </div>
        </div>
      </div>    )
  }
  
  if (error) {
    const isExpiredError = error.includes("expired")
    
    return (
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
        <Card className={`rounded-xl sm:rounded-2xl border-0 bg-gradient-to-br ${
          isExpiredError 
            ? 'from-orange-500/5 via-card to-card/95 shadow-2xl shadow-orange-500/5' 
            : 'from-destructive/5 via-card to-card/95 shadow-2xl shadow-destructive/5'
        } backdrop-blur-sm`}>
          <CardContent className="pt-6 px-4 sm:px-6">
            <div className="text-center">
              <AlertCircle className={`h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 ${
                isExpiredError 
                  ? 'text-orange-500 animate-pulse' 
                  : 'text-destructive animate-pulse'
              }`} />
              <h2 className="text-lg sm:text-xl font-semibold mb-2">
                {isExpiredError ? 'Paste Expired' : 'Error'}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-4">{error}</p>
              
              {isExpiredError && (
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30 rounded-lg p-4 text-left">
                  <h3 className="font-medium text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    What happened?
                  </h3>
                  <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                    <li>• This paste reached its expiration time and was automatically deleted</li>
                    <li>• NullBin automatically removes expired content for privacy and security</li>
                    <li>• The content is permanently gone and cannot be recovered</li>
                  </ul>
                </div>
              )}
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" asChild className="transition-all duration-200 hover:scale-105 active:scale-95">
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
                <Button asChild className="transition-all duration-200 hover:scale-105 active:scale-95">
                  <Link href="/?mode=create">
                    Create New Paste
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!paste) {
    notFound()
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-3 sm:space-y-4 lg:space-y-6 px-3 sm:px-4 lg:px-6">
      {/* Paste Info */}
      <Card className="rounded-xl sm:rounded-2xl border-0 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm shadow-2xl shadow-primary/5 transition-all duration-300 hover:shadow-primary/10 animate-fade-in">
        <CardHeader className="pb-3 sm:pb-6 px-4 sm:px-6">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-base sm:text-lg lg:text-xl">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                {paste.passwordProtected ? (
                  <Lock className="h-5 w-5 text-orange-500 animate-pulse" />
                ) : (
                  <Code className="h-5 w-5 text-primary" />
                )}
              </div>
              <span className="truncate text-sm sm:text-base lg:text-lg font-semibold">{paste.title || `Paste ${paste.id}`}</span>
            </CardTitle>
            <div className="flex items-center gap-2 self-start sm:self-center">
              <Badge variant="secondary" className="flex items-center gap-1.5 text-xs font-medium transition-all duration-200 hover:bg-secondary/80 hover:scale-105 shadow-sm">
                <Eye className="h-3 w-3" />
                <span className="hidden sm:inline">Views: </span>{paste.viewCount}
              </Badge>
              <Badge variant="outline" className="text-xs font-medium transition-all duration-200 hover:bg-primary/10 hover:scale-105 shadow-sm">{paste.language}</Badge>
            </div>
          </div>          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1 group">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 group-hover:text-primary transition-colors duration-200" />
              <span className="hidden sm:inline">Created </span>{formatTimestamp(paste.createdAt, currentTime)}
            </span>
            {paste.expiresAt && (
              <span className={`flex items-center gap-1 group ${
                (paste.expiresAt - currentTime) <= 0 ? 'text-red-500 font-medium' :
                (paste.expiresAt - currentTime) < 5 * 60 * 1000 ? 'text-red-500 animate-pulse' : 
                (paste.expiresAt - currentTime) < 60 * 60 * 1000 ? 'text-orange-500' : ''
              }`}>
                {(paste.expiresAt - currentTime) <= 0 ? (
                  <>
                    <span className="text-red-500">⚠️</span>
                    <span className="font-medium">Paste expired</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Expires </span>{formatExpirationTime(paste.expiresAt, currentTime)}
                  </>
                )}
              </span>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Share Link Section */}
      <Card className="border-green-200/50 dark:border-green-800/50 bg-gradient-to-br from-green-50 via-green-50/50 to-green-50/30 dark:from-green-950 dark:via-green-950/50 dark:to-green-950/30 rounded-xl sm:rounded-2xl shadow-xl shadow-green-500/10 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 backdrop-blur-sm">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200 text-base sm:text-lg font-semibold">
            <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="hidden sm:inline">Share This Paste</span>
            <span className="sm:hidden">Share</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-medium">
              <span className="hidden sm:inline">Share this encrypted paste with others using the link below:</span>
              <span className="sm:hidden">Share this encrypted paste:</span>
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input 
                value={window.location.href}
                readOnly 
                className="font-mono text-xs sm:text-sm bg-white dark:bg-gray-900 border-green-200 dark:border-green-800 flex-1 transition-all duration-200 focus:ring-2 focus:ring-green-500/20 h-10 sm:h-11"
              />
              <Button 
                onClick={copyShareableLink}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg shadow-green-500/25 whitespace-nowrap active:scale-95 touch-manipulation h-10 sm:h-11 font-semibold"
              >
                <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Copy Link</span>
                <span className="sm:hidden">Copy</span>
              </Button>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-green-100/50 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/50">
              <span className="text-base">💡</span>
              <p className="text-xs text-green-700 dark:text-green-300 flex-1">
                The decryption key is included in the URL fragment and never sent to our servers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Protection */}
      {paste.passwordProtected && !isDecrypted && (
        <Card className="rounded-xl sm:rounded-2xl border-0 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm shadow-2xl shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300 animate-slide-in">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
              <div className="h-8 w-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 animate-pulse" />
              </div>
              Password Protected
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Enter Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter the paste password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 sm:h-12 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 text-base"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isDecrypting || !password} 
                className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 disabled:hover:scale-100 active:scale-95 touch-manipulation h-11 sm:h-12 font-semibold"
              >
                {isDecrypting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span className="hidden sm:inline">Decrypting...</span>
                    <span className="sm:hidden">Decrypting...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2 h-5 w-5" />
                    <span className="hidden sm:inline">Decrypt Content</span>
                    <span className="sm:hidden">Decrypt</span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {isDecrypted && decryptedContent && (
        <Card className="rounded-xl sm:rounded-2xl border-0 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm shadow-2xl shadow-primary/5 transition-all duration-300 hover:shadow-primary/10">
          <CardHeader className="pb-3 sm:pb-6 px-4 sm:px-6">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                <Code className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-primary" />
                Content
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyShareableLink}
                  className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:border-blue-700 dark:hover:text-blue-300 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation h-9 sm:h-10 font-medium shadow-sm hover:shadow-md"
                >
                  <Share2 className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Copy </span>Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 dark:hover:bg-emerald-950 dark:hover:border-emerald-700 dark:hover:text-emerald-300 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation h-9 sm:h-10 font-medium shadow-sm hover:shadow-md"
                >
                  <Copy className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Copy </span>Content
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadPaste}
                  className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 dark:hover:bg-purple-950 dark:hover:border-purple-700 dark:hover:text-purple-300 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation h-9 sm:h-10 font-medium shadow-sm hover:shadow-md"
                >
                  <Download className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Download</span>
                  <span className="sm:hidden">DL</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="relative group">
              {highlightedContent ? (
                <div
                  className="overflow-x-auto rounded-lg sm:rounded-xl border border-border/50 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm transition-all duration-300 group-hover:border-border/70"
                  dangerouslySetInnerHTML={{ __html: highlightedContent }}
                />
              ) : (
                <pre className="overflow-x-auto rounded-lg sm:rounded-xl border border-border/50 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm p-4 sm:p-6 font-mono text-xs sm:text-sm leading-relaxed transition-all duration-300 group-hover:border-border/70">
                  <code className="block">{decryptedContent}</code>
                </pre>
              )}
            </div>
          </CardContent>
        </Card>
      )}      {/* No decryption data */}
      {!paste.passwordProtected && !isDecrypted && (!extractEncryptionFromHash() || extractEncryptionFromHash()?.key === 'password-protected') && (
        <Card className="rounded-xl sm:rounded-2xl border-0 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm shadow-2xl shadow-primary/5">
          <CardContent className="pt-6 px-4 sm:px-6">
            <div className="text-center">
              <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Missing Decryption Key</h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                This paste is encrypted and requires a valid decryption link to view.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PasteViewer
