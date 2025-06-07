import { NextRequest, NextResponse } from 'next/server'
import { createPaste, type CreatePasteRequest } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    console.log('API: Starting paste creation request handler');
    
    // Parse JSON with error handling
    let body: CreatePasteRequest;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Failed to parse request JSON:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!body.content || !body.language || !body.expiry || !body.iv) {
      console.error('API: Missing required fields in request', { 
        hasContent: !!body.content, 
        language: body.language || 'missing', 
        expiry: body.expiry || 'missing',
        hasIv: !!body.iv
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Log request info (excluding sensitive content)
    console.log(`API: Creating paste with language: ${body.language}, expiry: ${body.expiry}`);
    
    // Check MongoDB connection
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI environment variable is not set');
      return NextResponse.json(
        { error: 'Database configuration issue' },
        { status: 500 }
      );
    }
    
    console.log('API: About to call createPaste function');  
    // Create the paste (now async)
    const pasteId = await createPaste(body);
    console.log(`API: Successfully created paste with ID: ${pasteId}`);
    
    // Generate shareable URL (we don't include the key here since it should be in the hash fragment)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const url = `${baseUrl}/paste/${pasteId}`;
    
    return NextResponse.json({
      id: pasteId,
      url,
    })  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error creating paste:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace available'
    });
    
    // Check for specific error types
    if (errorMessage.includes('ECONNREFUSED') || 
        errorMessage.includes('connection') || 
        errorMessage.includes('timeout')) {
      console.error('Database connection error detected');
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }  // Service Unavailable
      );
    }
    
    return NextResponse.json(
      { error: `Failed to create paste: ${errorMessage}` },
      { status: 500 }
    );
  }
}
