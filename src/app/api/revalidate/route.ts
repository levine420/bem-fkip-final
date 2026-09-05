import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

async function handleRevalidate(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const force = url.searchParams.get('force');
    
    // For production, require secret. For development, allow direct access
    if (process.env.NODE_ENV === 'production' && !force) {
      const secret = request.headers.get('x-revalidate-secret');
      if (secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Revalidate all department and organization pages
    revalidatePath('/organisasi');
    revalidatePath('/organisasi/departemen');
    revalidatePath('/organisasi/struktur-kepengurusan');
    revalidatePath('/organisasi/departemen/sosgam');
    revalidatePath('/organisasi/departemen/psdm');
    revalidatePath('/organisasi/departemen/minba');
    revalidatePath('/organisasi/departemen/kominfo');
    revalidatePath('/organisasi/departemen/kastrat');
    revalidatePath('/tentang');

    return NextResponse.json(
      { 
        success: true,
        message: 'Cache revalidated successfully',
        ]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    );
  }
}
