import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');
  
  // Check secret token for security
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
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
        paths: [
          '/organisasi',
          '/organisasi/departemen',
          '/organisasi/struktur-kepengurusan',
          '/organisasi/departemen/sosgam',
          '/organisasi/departemen/psdm',
          '/organisasi/departemen/minba',
          '/organisasi/departemen/kominfo',
          '/organisasi/departemen/kastrat',
          '/tentang'
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
