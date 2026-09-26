import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'routim',
    mode: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'shared-ready' : 'local-demo',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  }, { headers: { 'Cache-Control': 'no-store' } });
}
