import { NextResponse } from 'next/server';
import { previewData } from '../../../services/fileService';

export async function GET() {
  try {
    const rows = await previewData(50);
    return NextResponse.json({ rows });
  } catch (error) {
    console.error('Preview Failed:', error);
    return NextResponse.json({ error: 'Failed to preview data' }, { status: 400 });
  }
}
