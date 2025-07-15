import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      )
    }

    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: `Invalid file type: ${file.type}. Only JPEG, PNG, and WebP are allowed.` },
          { status: 400 }
        )
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          { success: false, error: `File too large: ${file.name}. Maximum size is 10MB.` },
          { status: 400 }
        )
      }
    }

    const uploadedFiles: string[] = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = new Uint8Array(bytes)

      // Generate unique filename
      const fileExtension = file.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExtension}`
      const blobPath = `properties/${fileName}`

      // Process and compress image using Sharp
      let processedBuffer: Buffer | Uint8Array = buffer
      try {
        processedBuffer = await sharp(Buffer.from(buffer))
          .jpeg({ quality: 85 }) // Convert to JPEG with 85% quality
          .resize(1200, 800, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .toBuffer()
      } catch (sharpError) {
        console.warn('Sharp processing failed, using original:', sharpError)
        // Fall back to original buffer if sharp processing fails
      }

      // Upload to Vercel Blob
      const blob = await put(blobPath, Buffer.from(processedBuffer), {
        access: 'public',
        contentType: 'image/jpeg'
      })

      uploadedFiles.push(blob.url)
    }

    return NextResponse.json({
      success: true,
      data: {
        files: uploadedFiles
      }
    })
  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to upload files' 
      },
      { status: 500 }
    )
  }
}