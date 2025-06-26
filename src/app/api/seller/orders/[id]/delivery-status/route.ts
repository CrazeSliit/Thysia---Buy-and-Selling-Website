import { NextRequest, NextResponse } from 'next/server';

// This is a placeholder API route to satisfy the build
// TODO: Implement actual delivery status functionality

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Delivery status endpoint not implemented' }, { status: 501 });
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({ message: 'Delivery status endpoint not implemented' }, { status: 501 });
}
