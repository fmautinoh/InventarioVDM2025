import { createClient, Client, InStatement } from '@libsql/client/web';
import { ItemTemplate, Location, InventoryItem, ConservationState } from '../types';

// Hardcoded Turso credentials as environment variables are not available in this context.
const tursoUrl = 'libsql://inventario-fmautinoh.aws-us-west-2.turso.io';
const tursoAuthToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjIzNTU2NzgsImlkIjoiYTQxMWQzZTktMjAwYS00ZTMxLWI3ZDUtNWZlMmM0YzNiZDBiIiwicmlkIjoiODczNjlhNzYtYzFmZC00NjdlLTgzYzMtNTAwODUxYWIwYTJkIn0.1wVtV5L8xrojuUKxd55Xo_KM40GHLozlgJOfF85ulZUMNiutkhdL_0BJr9uevDzM9F2sQPNtTitE0BV9d3e_DQ';


const client: Client = createClient({
    url: tursoUrl,
    authToken: tursoAuthToken,
});

// Type assertion helpers to ensure rows match our front-end types
const rowToItemTemplate = (row: any): ItemTemplate => row as ItemTemplate;
const rowToLocation = (row: any): Location => row as Location;
const rowToInventoryItem = (row: any): InventoryItem => row as InventoryItem;

const tursoService = {
  // --- ItemTemplates CRUD ---
  async getItemTemplates(): Promise<ItemTemplate[]> {
    const rs = await client.execute("SELECT * FROM ItemTemplates ORDER BY name");
    return rs.rows.map(rowToItemTemplate);
  },

  async createItemTemplate(data: Omit<ItemTemplate, 'id'>): Promise<ItemTemplate> {
    const newTemplate = { ...data, id: crypto.randomUUID() };
    const sql = `
      INSERT INTO ItemTemplates (id, assetCode, name, brand, model, type, color, dimensions, other, origin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const args = [
      newTemplate.id, newTemplate.assetCode, newTemplate.name, data.brand || null, data.model || null,
      data.type || null, data.color || null, data.dimensions || null, data.other || null, data.origin || null
    ];
    await client.execute({ sql, args });
    return newTemplate;
  },

  async updateItemTemplate(id: string, data: Partial<ItemTemplate>): Promise<ItemTemplate> {
    const fields = Object.keys(data).filter(k => k !== 'id' && data[k as keyof typeof data] !== undefined);
    if (fields.length === 0) { // If no data to update, just fetch and return current state
        const result = await client.execute({ sql: "SELECT * FROM ItemTemplates WHERE id = ?", args: [id] });
        if (result.rows.length === 0) throw new Error('Template not found');
        return rowToItemTemplate(result.rows[0]);
    }
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const args = [...fields.map(field => data[field as keyof typeof data]), id];
    
    const sql = `UPDATE ItemTemplates SET ${setClause} WHERE id = ?`;
    await client.execute({ sql, args });

    const updatedResult = await client.execute({ sql: "SELECT * FROM ItemTemplates WHERE id = ?", args: [id] });
    return rowToItemTemplate(updatedResult.rows[0]);
  },

  async deleteItemTemplate(id: string): Promise<void> {
    await client.execute({ sql: "DELETE FROM ItemTemplates WHERE id = ?", args: [id] });
  },

  // --- Locations CRUD ---
  async getLocations(): Promise<Location[]> {
    const rs = await client.execute("SELECT * FROM Locations ORDER BY name");
    return rs.rows.map(rowToLocation);
  },

  async createLocation(data: Omit<Location, 'id'>): Promise<Location> {
     const newLocation = { ...data, id: crypto.randomUUID() };
     try {
       await client.execute({ sql: "INSERT INTO Locations (id, name) VALUES (?, ?)", args: [newLocation.id, newLocation.name] });
       return newLocation;
     } catch (e: any) {
       if (e.message?.includes('UNIQUE constraint failed: Locations.name')) {
         throw new Error('Location name must be unique.');
       }
       throw e;
     }
  },

  async updateLocation(id: string, data: Partial<Location>): Promise<Location> {
    try {
      await client.execute({ sql: "UPDATE Locations SET name = ? WHERE id = ?", args: [data.name, id] });
      const updatedResult = await client.execute({ sql: "SELECT * FROM Locations WHERE id = ?", args: [id] });
      if (updatedResult.rows.length === 0) throw new Error('Location not found');
      return rowToLocation(updatedResult.rows[0]);
    } catch (e: any) {
        if (e.message?.includes('UNIQUE constraint failed: Locations.name')) {
         throw new Error('Location name must be unique.');
       }
       throw e;
    }
  },

  async deleteLocation(id: string): Promise<void> {
    await client.execute({ sql: "DELETE FROM Locations WHERE id = ?", args: [id] });
  },

  // --- InventoryItems CRUD ---
  async getInventoryItems(): Promise<InventoryItem[]> {
    const rs = await client.execute("SELECT * FROM InventoryItems ORDER BY position");
    return rs.rows.map(rowToInventoryItem);
  },

  async createInventoryItems(data: {
    templateId: string;
    locationId?: string;
    quantities: Record<ConservationState, number>;
    situation?: string;
    observations?: string;
  }): Promise<InventoryItem[]> {
    const newItems: InventoryItem[] = [];
    const tx = await client.transaction();
    try {
      const maxPosResult = await tx.execute("SELECT MAX(position) as maxPosition FROM InventoryItems");
      let lastPosition = Number(maxPosResult.rows[0]?.maxPosition || 0);

      const statements: InStatement[] = [];

      for (const [state, count] of Object.entries(data.quantities)) {
        if (count > 0) {
          for (let i = 0; i < count; i++) {
            lastPosition++;
            const newItem: InventoryItem = {
              id: crypto.randomUUID(),
              position: lastPosition,
              templateId: data.templateId,
              locationId: data.locationId,
              situation: data.situation,
              conservationState: state as ConservationState,
              observations: data.observations,
            };
            newItems.push(newItem);

            statements.push({
              sql: `INSERT INTO InventoryItems (id, position, templateId, locationId, situation, conservationState, observations, serial) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [newItem.id, newItem.position, newItem.templateId, newItem.locationId || null, newItem.situation || null, newItem.conservationState, newItem.observations || null, null],
            });
          }
        }
      }
      if (statements.length > 0) {
        await tx.batch(statements);
      }
      await tx.commit();
      return newItems;
    } catch (e) {
      await tx.rollback();
      console.error("Transaction failed:", e);
      if (e instanceof Error && e.message.includes('UNIQUE constraint failed')) {
          throw new Error('Failed to create items due to a duplicate position. Please try again.');
      }
      throw new Error("Failed to create inventory items.");
    }
  },

  async updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'position' && data[k as keyof typeof data] !== undefined);
    if (fields.length === 0) {
      const result = await client.execute({ sql: "SELECT * FROM InventoryItems WHERE id = ?", args: [id] });
      if (result.rows.length === 0) throw new Error('Inventory item not found');
      return rowToInventoryItem(result.rows[0]);
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const args = [...fields.map(field => {
      const value = data[field as keyof typeof data];
      return field === 'locationId' && value === '' ? null : value;
    }), id];

    const sql = `UPDATE InventoryItems SET ${setClause} WHERE id = ?`;
    await client.execute({ sql, args });
    
    const updatedResult = await client.execute({ sql: "SELECT * FROM InventoryItems WHERE id = ?", args: [id] });
    return rowToInventoryItem(updatedResult.rows[0]);
  },

  async deleteInventoryItem(id: string): Promise<void> {
    await client.execute({ sql: "DELETE FROM InventoryItems WHERE id = ?", args: [id] });
  },
};

export default tursoService;