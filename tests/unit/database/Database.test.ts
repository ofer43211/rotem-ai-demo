import { Database } from '../../../src/database/Database';
import { DatabaseError } from '../../../src/errors/AppError';

interface TestRecord {
  id: string;
  name: string;
  age: number;
}

describe('Database', () => {
  let db: Database;

  beforeEach(async () => {
    db = new Database();
    await db.connect();
    db.createTable('users');
  });

  afterEach(async () => {
    if (db.isConnected()) {
      await db.disconnect();
    }
  });

  describe('Connection management', () => {
    it('should connect to database', async () => {
      const newDb = new Database();
      await newDb.connect();

      expect(newDb.isConnected()).toBe(true);
      await newDb.disconnect();
    });

    it('should throw error when connecting twice', async () => {
      await expect(db.connect()).rejects.toThrow('Database is already connected');
    });

    it('should disconnect from database', async () => {
      await db.disconnect();

      expect(db.isConnected()).toBe(false);
    });

    it('should throw error when disconnecting without connection', async () => {
      await db.disconnect();

      await expect(db.disconnect()).rejects.toThrow('Database is not connected');
    });
  });

  describe('Table management', () => {
    it('should create table', () => {
      db.createTable('products');

      expect(db.tableExists('products')).toBe(true);
    });

    it('should throw error when creating duplicate table', () => {
      expect(() => db.createTable('users')).toThrow('Table users already exists');
    });

    it('should drop table', () => {
      db.dropTable('users');

      expect(db.tableExists('users')).toBe(false);
    });

    it('should throw error when dropping non-existent table', () => {
      expect(() => db.dropTable('nonexistent')).toThrow('Table nonexistent does not exist');
    });

    it('should check if table exists', () => {
      expect(db.tableExists('users')).toBe(true);
      expect(db.tableExists('nonexistent')).toBe(false);
    });
  });

  describe('Insert operations', () => {
    it('should insert record', async () => {
      const record: TestRecord = { id: '1', name: 'John', age: 30 };
      const inserted = await db.insert('users', record);

      expect(inserted).toEqual(record);
    });

    it('should throw error when inserting duplicate id', async () => {
      const record: TestRecord = { id: '1', name: 'John', age: 30 };
      await db.insert('users', record);

      await expect(db.insert('users', record)).rejects.toThrow(
        'Record with id 1 already exists',
      );
    });

    it('should throw error when inserting into non-existent table', async () => {
      const record: TestRecord = { id: '1', name: 'John', age: 30 };

      await expect(db.insert('nonexistent', record)).rejects.toThrow(
        'Table nonexistent does not exist',
      );
    });

    it('should throw error when database not connected', async () => {
      await db.disconnect();
      const record: TestRecord = { id: '1', name: 'John', age: 30 };

      await expect(db.insert('users', record)).rejects.toThrow('Database is not connected');
    });
  });

  describe('Find operations', () => {
    beforeEach(async () => {
      await db.insert('users', { id: '1', name: 'John', age: 30 });
      await db.insert('users', { id: '2', name: 'Jane', age: 25 });
      await db.insert('users', { id: '3', name: 'Bob', age: 35 });
    });

    it('should find record by id', async () => {
      const record = await db.findById<TestRecord>('users', '1');

      expect(record).toEqual({ id: '1', name: 'John', age: 30 });
    });

    it('should return null for non-existent id', async () => {
      const record = await db.findById('users', 'nonexistent');

      expect(record).toBeNull();
    });

    it('should find all records', async () => {
      const result = await db.findAll<TestRecord>('users');

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.hasMore).toBe(false);
    });

    it('should paginate results', async () => {
      const result = await db.findAll<TestRecord>('users', { limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.hasMore).toBe(true);
    });

    it('should apply offset', async () => {
      const result = await db.findAll<TestRecord>('users', { offset: 1, limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.hasMore).toBe(false);
    });

    it('should sort results ascending', async () => {
      const result = await db.findAll<TestRecord>('users', {
        orderBy: 'age',
        orderDirection: 'ASC',
      });

      expect(result.data[0].age).toBe(25);
      expect(result.data[1].age).toBe(30);
      expect(result.data[2].age).toBe(35);
    });

    it('should sort results descending', async () => {
      const result = await db.findAll<TestRecord>('users', {
        orderBy: 'age',
        orderDirection: 'DESC',
      });

      expect(result.data[0].age).toBe(35);
      expect(result.data[1].age).toBe(30);
      expect(result.data[2].age).toBe(25);
    });
  });

  describe('Update operations', () => {
    beforeEach(async () => {
      await db.insert('users', { id: '1', name: 'John', age: 30 });
    });

    it('should update existing record', async () => {
      const updated: TestRecord = { id: '1', name: 'John Updated', age: 31 };
      const result = await db.update('users', updated);

      expect(result).toEqual(updated);

      const found = await db.findById<TestRecord>('users', '1');
      expect(found).toEqual(updated);
    });

    it('should throw error when updating non-existent record', async () => {
      const record: TestRecord = { id: 'nonexistent', name: 'Test', age: 30 };

      await expect(db.update('users', record)).rejects.toThrow('Record with id nonexistent not found');
    });
  });

  describe('Delete operations', () => {
    beforeEach(async () => {
      await db.insert('users', { id: '1', name: 'John', age: 30 });
    });

    it('should delete existing record', async () => {
      const result = await db.delete('users', '1');

      expect(result).toBe(true);

      const found = await db.findById('users', '1');
      expect(found).toBeNull();
    });

    it('should return false when deleting non-existent record', async () => {
      const result = await db.delete('users', 'nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('Count operations', () => {
    it('should count records in table', async () => {
      await db.insert('users', { id: '1', name: 'John', age: 30 });
      await db.insert('users', { id: '2', name: 'Jane', age: 25 });

      const count = await db.count('users');

      expect(count).toBe(2);
    });

    it('should return zero for empty table', async () => {
      const count = await db.count('users');

      expect(count).toBe(0);
    });
  });

  describe('Clear operations', () => {
    it('should clear all records from table', async () => {
      await db.insert('users', { id: '1', name: 'John', age: 30 });
      await db.insert('users', { id: '2', name: 'Jane', age: 25 });

      await db.clear('users');

      const count = await db.count('users');
      expect(count).toBe(0);
    });
  });

  describe('Transaction management', () => {
    beforeEach(async () => {
      await db.insert('users', { id: '1', name: 'John', age: 30 });
    });

    it('should begin transaction', async () => {
      await db.beginTransaction();

      expect(db.isTransactionActive()).toBe(true);
    });

    it('should throw error when beginning nested transaction', async () => {
      await db.beginTransaction();

      await expect(db.beginTransaction()).rejects.toThrow('Transaction already active');
    });

    it('should commit transaction', async () => {
      await db.beginTransaction();
      await db.insert('users', { id: '2', name: 'Jane', age: 25 });
      await db.commit();

      expect(db.isTransactionActive()).toBe(false);

      const count = await db.count('users');
      expect(count).toBe(2);
    });

    it('should rollback transaction', async () => {
      await db.beginTransaction();
      await db.insert('users', { id: '2', name: 'Jane', age: 25 });
      await db.rollback();

      expect(db.isTransactionActive()).toBe(false);

      const count = await db.count('users');
      expect(count).toBe(1);
    });

    it('should restore data on rollback', async () => {
      const original = await db.findById<TestRecord>('users', '1');

      await db.beginTransaction();
      await db.update('users', { id: '1', name: 'Modified', age: 99 });
      await db.rollback();

      const restored = await db.findById<TestRecord>('users', '1');
      expect(restored).toEqual(original);
    });

    it('should throw error when committing without transaction', async () => {
      await expect(db.commit()).rejects.toThrow('No active transaction to commit');
    });

    it('should throw error when rolling back without transaction', async () => {
      await expect(db.rollback()).rejects.toThrow('No active transaction to rollback');
    });

    it('should prevent disconnect during transaction', async () => {
      await db.beginTransaction();

      await expect(db.disconnect()).rejects.toThrow('Cannot disconnect during active transaction');
    });
  });

  describe('Error handling', () => {
    it('should throw DatabaseError for invalid operations', async () => {
      await db.disconnect();

      await expect(db.insert('users', { id: '1', name: 'Test', age: 30 })).rejects.toThrow(
        DatabaseError,
      );
    });
  });
});
