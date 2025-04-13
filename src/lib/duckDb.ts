import { Database, Connection } from 'duckdb';

class DuckDBConnection {
    private db: Database;
    private connection: Connection;

    constructor() {
        this.db = new Database(':memory:');
        this.connection = this.db.connect();
    }

    async executeQuery(sql: string) {
        return new Promise((resolve, reject) => {
            this.connection.all(sql, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async runSQL(sql: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection.run(sql, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

const duckDBConnection = new DuckDBConnection();

export default duckDBConnection;
