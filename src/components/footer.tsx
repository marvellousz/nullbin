import React from 'react'

export default function Footer() {
  return (
    <footer className="border-t mt-12 sm:mt-16">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="text-center text-xs sm:text-sm text-muted-foreground">
          <p className="mb-2">
            <strong>NullBin</strong> - Privacy-first pastebin with client-side encryption
          </p>
          <p>
            No tracking • No accounts • Auto-expiry • Open source
          </p>
        </div>
      </div>
    </footer>
  )
}
