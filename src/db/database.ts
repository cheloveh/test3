import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;
let initPromise: Promise<void> | null = null;

const DB_KEY = 'techzone_db';

// Загрузка WASM — пробуем несколько источников
async function loadWasm(): Promise<Uint8Array | undefined> {
  const wasmUrls = [
    // Локальный файл (если скопирован в public)
    './sql-wasm.wasm',
    // CDN unpkg
    'https://unpkg.com/sql.js@1.10.3/dist/sql-wasm.wasm',
    // CDN jsdelivr
    'https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/sql-wasm.wasm',
    // CDN sql.js.org
    'https://sql.js.org/dist/sql-wasm.wasm',
  ];

  for (const url of wasmUrls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
      }
    } catch (e) {
      console.warn(`Failed to load WASM from ${url}:`, e);
      continue;
    }
  }
  
  console.warn('All WASM sources failed, trying without wasmBinary...');
  return undefined;
}

export async function initDB(): Promise<Database> {
  if (db) return db;
  if (initPromise) {
    await initPromise;
    return db!;
  }

  initPromise = (async () => {
    const wasmBinary = await loadWasm();

    const SQL = await initSqlJs({
      wasmBinary: wasmBinary ? wasmBinary.buffer.slice(wasmBinary.byteOffset, wasmBinary.byteOffset + wasmBinary.byteLength) as ArrayBuffer : undefined,
      locateFile: (file: string) => {
        // Fallback — пробуем разные CDN
        if (file.endsWith('.wasm')) {
          return `https://unpkg.com/sql.js@1.10.3/dist/${file}`;
        }
        return `https://unpkg.com/sql.js@1.10.3/dist/${file}`;
      }
    });

    const savedDb = localStorage.getItem(DB_KEY);
    if (savedDb) {
      try {
        const binaryString = atob(savedDb);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        db = new SQL.Database(bytes);
      } catch (e) {
        console.warn('Failed to load saved DB, creating new one:', e);
        db = new SQL.Database();
      }
    } else {
      db = new SQL.Database();
    }

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        delivery_method TEXT DEFAULT 'courier',
        payment_method TEXT DEFAULT 'card',
        delivery_address TEXT,
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id)
      );

      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        text TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    saveDB();
  })();

  await initPromise;
  return db!;
}

export function saveDB() {
  if (!db) return;
  try {
    const data = db.export();
    const bytes = new Uint8Array(data);
    let str = '';
    for (let i = 0; i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(str);
    localStorage.setItem(DB_KEY, base64);
  } catch (e) {
    console.warn('Failed to save DB:', e);
  }
}

function rowToObject(columns: string[], values: any[]): any {
  const obj: any = {};
  columns.forEach((col: string, i: number) => { obj[col] = values[i]; });
  return obj;
}

// User operations
export function createUser(email: string, password: string, name: string, phone?: string): number | null {
  if (!db) return null;
  try {
    db.run('INSERT INTO users (email, password, name, phone) VALUES (?, ?, ?, ?)', [email, password, name, phone || '']);
    saveDB();
    const result = db.exec('SELECT last_insert_rowid() as id');
    return result[0].values[0][0] as number;
  } catch {
    return null;
  }
}

export function authenticateUser(email: string, password: string): any | null {
  if (!db) return null;
  const result = db.exec('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
  if (result.length === 0 || result[0].values.length === 0) return null;
  return rowToObject(result[0].columns, result[0].values[0]);
}

export function getUserById(id: number): any | null {
  if (!db) return null;
  const result = db.exec('SELECT * FROM users WHERE id = ?', [id]);
  if (result.length === 0 || result[0].values.length === 0) return null;
  return rowToObject(result[0].columns, result[0].values[0]);
}

export function updateUser(id: number, data: { name?: string; phone?: string; address?: string }): boolean {
  if (!db) return false;
  const sets: string[] = [];
  const values: any[] = [];
  if (data.name) { sets.push('name = ?'); values.push(data.name); }
  if (data.phone) { sets.push('phone = ?'); values.push(data.phone); }
  if (data.address) { sets.push('address = ?'); values.push(data.address); }
  if (sets.length === 0) return false;
  values.push(id);
  db.run(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, values);
  saveDB();
  return true;
}

// Cart operations
export function addToCart(userId: number, productId: number, quantity: number = 1): boolean {
  if (!db) return false;
  const existing = db.exec('SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId]);
  if (existing.length > 0 && existing[0].values.length > 0) {
    const currentQty = existing[0].values[0][1] as number;
    db.run('UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?', [currentQty + quantity, userId, productId]);
  } else {
    db.run('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [userId, productId, quantity]);
  }
  saveDB();
  return true;
}

export function removeFromCart(userId: number, productId: number): boolean {
  if (!db) return false;
  db.run('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId]);
  saveDB();
  return true;
}

export function updateCartQuantity(userId: number, productId: number, quantity: number): boolean {
  if (!db) return false;
  if (quantity <= 0) {
    db.run('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId]);
  } else {
    db.run('UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?', [quantity, userId, productId]);
  }
  saveDB();
  return true;
}

export function getCart(userId: number): any[] {
  if (!db) return [];
  const result = db.exec('SELECT * FROM cart WHERE user_id = ?', [userId]);
  if (result.length === 0) return [];
  return result[0].values.map((row: any[]) => rowToObject(result[0].columns, row));
}

export function clearCart(userId: number): boolean {
  if (!db) return false;
  db.run('DELETE FROM cart WHERE user_id = ?', [userId]);
  saveDB();
  return true;
}

// Order operations
export function createOrder(userId: number, items: { productId: number; productName: string; quantity: number; price: number }[], deliveryAddress: string, deliveryMethod: string, paymentMethod: string, comment?: string): number | null {
  if (!db) return null;
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  db.run(
    'INSERT INTO orders (user_id, total_amount, delivery_address, delivery_method, payment_method, comment) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, total, deliveryAddress, deliveryMethod, paymentMethod, comment || '']
  );
  const orderIdResult = db.exec('SELECT last_insert_rowid() as id');
  const orderId = orderIdResult[0].values[0][0] as number;

  for (const item of items) {
    db.run(
      'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
      [orderId, item.productId, item.productName, item.quantity, item.price]
    );
  }

  db.run('DELETE FROM cart WHERE user_id = ?', [userId]);
  saveDB();
  return orderId;
}

export function getUserOrders(userId: number): any[] {
  if (!db) return [];
  const result = db.exec('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  if (result.length === 0) return [];
  return result[0].values.map((row: any[]) => rowToObject(result[0].columns, row));
}

export function getOrderItems(orderId: number): any[] {
  if (!db) return [];
  const result = db.exec('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
  if (result.length === 0) return [];
  return result[0].values.map((row: any[]) => rowToObject(result[0].columns, row));
}

// Favorites
export function addFavorite(userId: number, productId: number): boolean {
  if (!db) return false;
  try {
    db.run('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)', [userId, productId]);
    saveDB();
    return true;
  } catch {
    return false;
  }
}

export function removeFavorite(userId: number, productId: number): boolean {
  if (!db) return false;
  db.run('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [userId, productId]);
  saveDB();
  return true;
}

export function getFavorites(userId: number): number[] {
  if (!db) return [];
  const result = db.exec('SELECT product_id FROM favorites WHERE user_id = ?', [userId]);
  if (result.length === 0) return [];
  return result[0].values.map((row: any[]) => row[0] as number);
}

export function isFavorite(userId: number, productId: number): boolean {
  if (!db) return false;
  const result = db.exec('SELECT id FROM favorites WHERE user_id = ? AND product_id = ?', [userId, productId]);
  return result.length > 0 && result[0].values.length > 0;
}
