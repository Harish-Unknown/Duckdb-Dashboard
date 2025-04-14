import { Database } from "duckdb-async";

class DuckDBConnection {
  private db: Database | null = null;

  private async connect() {
    if (!this.db) {
      this.db = await Database.create(":memory:");
    }
  }

  async executeQuery(sql: string): Promise<any[]> {
    await this.connect();
    return this.db!.all(sql);
  }

  async runSQL(sql: string): Promise<void> {
    await this.connect();
    await this.db!.run(sql);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

const duckDBConnection = new DuckDBConnection();

export default duckDBConnection;
