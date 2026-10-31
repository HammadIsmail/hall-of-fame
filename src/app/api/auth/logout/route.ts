import { NextResponse } from 'next/server';


export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('hof_curator_session');
  return response;
}

