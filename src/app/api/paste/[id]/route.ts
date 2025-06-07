import { NextRequest, NextResponse } from 'next/server'
import { getPaste } from '@/lib/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Paste ID is required' },
        { status: 400 }
      )
    }    // Get paste (now async)
    const result = await getPaste(id)
    
    if (!result.paste) {
      if (result.expired) {
        console.log(`Paste access attempt: ID "${id}" - Paste expired at ${result.expiredAt?.toISOString()}`)
        return NextResponse.json(
          { 
            error: 'Paste expired',
            expiredAt: result.expiredAt?.toISOString(),
            message: `This paste expired on ${result.expiredAt?.toLocaleString()} and has been automatically removed for security.`
          },
          { status: 410 } // 410 Gone - resource existed but is no longer available
        )
      } else {
        console.log(`Paste access attempt: ID "${id}" - Paste not found`)
        return NextResponse.json(
          { error: 'Paste not found' },
          { status: 404 }
        )
      }
    }
    
    const paste = result.paste
    console.log(`Paste accessed successfully: ID "${id}", Language: ${paste.language}, Views: ${paste.viewCount}, Expires: ${paste.expiresAt ? new Date(paste.expiresAt instanceof Date ? paste.expiresAt.getTime() : paste.expiresAt).toISOString() : 'Never'}`)
      // Return paste data (content is encrypted)
    // Convert expiresAt to timestamp for client, handling both Date objects and timestamps
    const expiresAtTimestamp = paste.expiresAt ? 
      (paste.expiresAt instanceof Date ? paste.expiresAt.getTime() : paste.expiresAt) : 
      null;
      
    return NextResponse.json({
      id: paste.id,
      title: paste.title,
      content: paste.content,
      language: paste.language,
      createdAt: paste.createdAt,
      expiresAt: expiresAtTimestamp,
      iv: paste.iv,
      passwordProtected: paste.passwordProtected,
      viewCount: paste.viewCount,
    })
  } catch (error) {
    console.error('Error fetching paste:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
