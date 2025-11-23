import { DatabaseError } from '../errors/AppError';

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export interface QueryResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

export class Database {
  private tables: Map<string, Map<string, unknown>>;
  private connected: boolean;
  private transactionActive: boolean;
  private transactionBackup?: Map<string, Map<string, unknown>>;

  constructor() {
    this.tables = new Map();
    this.connected = false;
    this.transactionActive = false;
  }

  public async connect(): Promise<void> {
    if (this.connected) {
      throw new DatabaseError('Database is already connected');
    }
    // Simulate connection delay
    await this.delay(10);
    this.connected = true;
  }

  public async disconnect(): Promise<void> {
    if (!this.connected) {
      throw new DatabaseError('Database is not connected');
    }
    if (this.transactionActive) {
      throw new DatabaseError('Cannot disconnect during active transaction');
    }
    this.connected = false;
    this.tables.clear();
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public createTable(tableName: string): void {
    this.ensureConnected();

    if (this.tables.has(tableName)) {
      throw new DatabaseError(`Table ${tableName} already exists`);
    }

    this.tables.set(tableName, new Map());
  }

  public dropTable(tableName: string): void {
    this.ensureConnected();

    if (!this.tables.has(tableName)) {
      throw new DatabaseError(`Table ${tableName} does not exist`);
    }

    this.tables.delete(tableName);
  }

  public tableExists(tableName: string): boolean {
    return this.tables.has(tableName);
  }

  public async insert<T extends { id: string }>(tableName: string, record: T): Promise<T> {
    this.ensureConnected();
    this.ensureTableExists(tableName);

    const table = this.tables.get(tableName)!;

    if (table.has(record.id)) {
      throw new DatabaseError(`Record with id ${record.id} already exists in ${tableName}`);
    }

    await this.delay(5);
    table.set(record.id, record);
    return record;
  }

  public async findById<T>(tableName: string, id: string): Promise<T | null> {
    this.ensureConnected();
    this.ensureTableExists(tableName);

    await this.delay(5);
    const table = this.tables.get(tableName)!;
    return (table.get(id) as T) || null;
  }

  public async findAll<T>(tableName: string, options?: QueryOptions): Promise<QueryResult<T>> {
    this.ensureConnected();
    this.ensureTableExists(tableName);

    await this.delay(10);
    const table = this.tables.get(tableName)!;
    let data = Array.from(table.values()) as T[];

    // Apply sorting
    if (options?.orderBy) {
      data = this.sortData(data, options.orderBy, options.orderDirection);
    }

    const total = data.length;

    // Apply pagination
    if (options?.offset !== undefined) {
      data = data.slice(options.offset);
    }

    if (options?.limit !== undefined) {
      data = data.slice(0, options.limit);
    }

    const hasMore = options?.limit
      ? (options.offset || 0) + options.limit < total
      : false;

    return { data, total, hasMore };
  }

  public async update<T extends { id: string }>(tableName: string, record: T): Promise<T> {
    this.ensureConnected();
    this.ensureTableExists(tableName);

    const table = this.tables.get(tableName)!;

    if (!table.has(record.id)) {
      throw new DatabaseError(`Record with id ${record.id} not found in ${tableName}`);
    }

    await this.delay(5);
    table.set(record.id, record);
    return record;
  }

  public async delete(tableName: string, id: string): Promise<boolean> {
    this.ensureConnected();
    this.ensureTableExists(tableName);

    await this.delay(5);
    const table = this.tables.get(tableName)!;
    return table.delete(id);
  }

  public async count(tableName: string): Promise<number> {
    this.ensureConnected();
    this.ensureTableExists(tableName);

    await this.delay(5);
    const table = this.tables.get(tableName)!;
    return table.size;
  }

  public async clear(tableName: string): Promise<void> {
    this.ensureConnected();
    this.ensureTableExists(tableName);

    await this.delay(5);
    const table = this.tables.get(tableName)!;
    table.clear();
  }

  public async beginTransaction(): Promise<void> {
    this.ensureConnected();

    if (this.transactionActive) {
      throw new DatabaseError('Transaction already active');
    }

    // Create backup of current state
    this.transactionBackup = new Map();
    this.tables.forEach((table, tableName) => {
      const tableBackup = new Map(table);
      this.transactionBackup!.set(tableName, tableBackup);
    });

    this.transactionActive = true;
  }

  public async commit(): Promise<void> {
    this.ensureConnected();

    if (!this.transactionActive) {
      throw new DatabaseError('No active transaction to commit');
    }

    // Clear backup and finalize transaction
    this.transactionBackup = undefined;
    this.transactionActive = false;
  }

  public async rollback(): Promise<void> {
    this.ensureConnected();

    if (!this.transactionActive) {
      throw new DatabaseError('No active transaction to rollback');
    }

    if (!this.transactionBackup) {
      throw new DatabaseError('Transaction backup not found');
    }

    // Restore from backup
    this.tables = this.transactionBackup;
    this.transactionBackup = undefined;
    this.transactionActive = false;
  }

  public isTransactionActive(): boolean {
    return this.transactionActive;
  }

  private ensureConnected(): void {
    if (!this.connected) {
      throw new DatabaseError('Database is not connected');
    }
  }

  private ensureTableExists(tableName: string): void {
    if (!this.tables.has(tableName)) {
      throw new DatabaseError(`Table ${tableName} does not exist`);
    }
  }

  private sortData<T>(
    data: T[],
    orderBy: string,
    direction: 'ASC' | 'DESC' = 'ASC',
  ): T[] {
    return [...data].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[orderBy];
      const bValue = (b as Record<string, unknown>)[orderBy];

      if (aValue === bValue) return 0;

      const comparison = (aValue as number | string) < (bValue as number | string) ? -1 : 1;
      return direction === 'ASC' ? comparison : -comparison;
    });
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
