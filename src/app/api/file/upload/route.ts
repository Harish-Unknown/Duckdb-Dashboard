import { NextRequest, NextResponse } from 'next/server';
import { processCsvFile } from '../../../services/fileService';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file || file.type !== 'text/csv') {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  try {
    const rowCount = await processCsvFile(file);
    return NextResponse.json({ rows: rowCount });
  } catch (e) {
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
