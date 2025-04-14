import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import duckDBConnection from "../../lib/duckDb";
import { Readable } from "stream";

function webStreamToNodeReadable(webStream: ReadableStream): Readable {
  const reader = webStream.getReader();
  return new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) {
        this.push(null);
      } else {
        this.push(value);
      }
    },
  });
}

export const processCsvFile = async (file: File) => {
  const fileName = `${randomUUID()}.csv`;
  const filePath = path.join("/tmp", fileName);

  const nodeStream = webStreamToNodeReadable(file.stream());
  const writeStream = fs.createWriteStream(filePath);

  await new Promise<void>((resolve, reject) => {
    nodeStream.pipe(writeStream);
    writeStream.on("finish", () => resolve());
    writeStream.on("error", reject);
  });

  await duckDBConnection.runSQL(`
    DROP TABLE IF EXISTS uploaded_data;
  `);

  const query = `
    CREATE OR REPLACE TABLE uploaded_data AS 
    SELECT * FROM read_csv('${filePath}', all_varchar=true);
  `;

  await duckDBConnection.runSQL(query);

  const rows: any = await duckDBConnection.executeQuery(
    `SELECT COUNT(*) as row_count FROM uploaded_data`
  );
  return Number(rows?.[0]?.row_count) || 0;
};

export const previewData = async (limit = 50) => {
  try {
    const result = await duckDBConnection.executeQuery(
      `SELECT * FROM uploaded_data LIMIT ${limit}`
    );

    return result.map((row) => {
      const plainRow: Record<string, any> = {};
      Object.keys(row).forEach((key) => {
        plainRow[key] = row[key];
      });
      return plainRow;
    });
  } catch (error) {
    console.error("Preview data error:", error);
    throw error;
  }
};
