import { NextRequest, NextResponse } from 'next/server'
import { createPaste, type CreatePasteRequest } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const body: CreatePasteRequest = await request.json()
    
    // Validate required fields
    if (!body.content || !body.language || !body.expiry || !body.iv) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }    
    // Create the paste (now async)
    const pasteId = await createPaste(body)
    
    // Generate shareable URL (we don't include the key here since it should be in the hash fragment)
    const url = `${request.nextUrl.origin}/paste/${pasteId}`
    
    return NextResponse.json({
      id: pasteId,
      url,
    })
  } catch (error) {
    console.error('Error creating paste:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
