'use client'

import { useParams } from 'next/navigation'
import PasteViewer from '@/components/paste-viewer'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Footer from '@/components/footer'

export default function PastePage() {
  const params = useParams()
  const id = params.id as string
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 hover:shadow-xl">
                <span className="text-primary-foreground font-bold text-base sm:text-lg">N</span>
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">NullBin</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="hover:bg-primary/10 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation h-8 sm:h-9">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
                <span className="sm:hidden">←</span>
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>      </header>
      <main className="flex-1 container mx-auto px-0 py-4 sm:py-6 lg:py-8">
        <div className="max-w-6xl mx-auto">
          <PasteViewer pasteId={id} />
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
