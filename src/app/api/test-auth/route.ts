import { NextRequest, NextResponse } from 'next/server';

// This is a test auth endpoint for development/testing purposes
// TODO: Remove in production or implement proper auth testing

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Test auth endpoint', authenticated: false }, { status: 200 });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Test auth endpoint', authenticated: false }, { status: 200 });
}