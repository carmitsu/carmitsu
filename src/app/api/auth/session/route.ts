import { NextRequest, NextResponse } from 'next/server';
import { isRequestAuthenticated } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authenticated = isRequestAuthenticated(request);
  return NextResponse.json(
    { authenticated },
    {
      status: authenticated ? 200 : 401,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    }
  );
}
