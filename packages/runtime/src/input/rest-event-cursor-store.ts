export interface RestEventCursorStore {
  load(key: string): Promise<string | undefined>;
  save(key: string, cursor: string): Promise<void>;
  clear(key: string): Promise<void>;
}

export class InMemoryRestEventCursorStore implements RestEventCursorStore {
  private readonly cursors = new Map<string, string>();

  public async load(key: string): Promise<string | undefined> {
    return this.cursors.get(key);
  }

  public async save(key: string, cursor: string): Promise<void> {
    if (!key.trim()) {
      throw new Error("Cursor store key must be non-empty");
    }

    if (!cursor.trim()) {
      throw new Error("Cursor must be non-empty");
    }

    this.cursors.set(key, cursor);
  }

  public async clear(key: string): Promise<void> {
    this.cursors.delete(key);
  }
}
