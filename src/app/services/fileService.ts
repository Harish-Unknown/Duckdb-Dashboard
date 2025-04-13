import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import duckDBConnection from '../../lib/duckDb';

const processCsvFile = async (file: File) => {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${randomUUID()}.csv`;
    const filePath = path.join('/tmp', fileName);

    await fs.promises.writeFile(filePath, buffer);

    const query = `
    CREATE OR REPLACE TABLE uploaded_data AS 
    SELECT * FROM read_csv_auto('${filePath}');
  `;

    await duckDBConnection.runSQL(query);

    const rows: any = await duckDBConnection.executeQuery(`SELECT COUNT(*) as row_count FROM uploaded_data`);
    return rows?.[0]?.row_count || 0;
}

const previewData = async (limit = 50) => {
    return duckDBConnection.executeQuery(`SELECT * FROM uploaded_data LIMIT ${limit}`);
}

export { processCsvFile, previewData }
