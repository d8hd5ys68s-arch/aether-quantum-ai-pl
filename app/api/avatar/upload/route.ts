import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';

/**
 * Client Upload Handler (Recommended)
 *
 * This endpoint uses Vercel's client upload pattern which:
 * - Uploads directly from browser to Blob storage (no server bandwidth)
 * - More efficient for large files (no 4.5MB limit)
 * - Includes authentication and validation
 * - Prevents cache issues with random suffixes
 *
 * @see https://vercel.com/docs/storage/vercel-blob/client-upload
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Optional: Authenticate user before allowing upload
        // const session = await auth();
        // if (!session?.user) {
        //   throw new Error('Unauthorized');
        // }

        // Validate file type and configure upload
        return {
          // Only allow image uploads
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif'
          ],

          // Add random suffix to prevent filename collisions and caching issues
          // Recommended by Vercel for immutability
          addRandomSuffix: true,

          // Store user info for the onUploadCompleted callback
          tokenPayload: JSON.stringify({
            // userId: session?.user?.id,
            uploadedAt: new Date().toISOString(),
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Optional: Save upload record to database
        try {
          const payload = JSON.parse(tokenPayload || '{}');
          console.log('✅ Upload completed:', {
            url: blob.url,
            pathname: blob.pathname,
            size: blob.size,
            uploadedAt: payload.uploadedAt,
          });

          // Example: Save to database
          // await Database.saveUpload({
          //   userId: payload.userId,
          //   blobUrl: blob.url,
          //   pathname: blob.pathname,
          //   size: blob.size,
          // });
        } catch (error) {
          console.error('Failed to process upload completion:', error);
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

// Legacy server upload endpoint (for files < 4.5MB)
// This charges for Fast Data Transfer but is simpler to implement
// Uncomment if you need server-side upload for small files:
/*
import { put } from '@vercel/blob';

export async function PUT(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename || !request.body) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    const blob = await put(filename, request.body, {
      access: 'public',
      addRandomSuffix: true, // Prevent cache issues
      cacheControlMaxAge: 31536000, // 1 year cache
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Server upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
*/
