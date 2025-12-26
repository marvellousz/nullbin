import React from 'react'
import { Shield, Lock, Clock, Code } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t bg-background/80 backdrop-blur-xl mt-12 sm:mt-16">
      <div className="container mx-auto px-4 py-8 sm:py-10">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm sm:text-base font-semibold">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">NullBin</span>
            </p>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
            Privacy-first pastebin with client-side encryption
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>No tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>No accounts</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Auto-expiry</span>
            </div>
            <div className="flex items-center gap-2">
              <Code className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Open source</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
