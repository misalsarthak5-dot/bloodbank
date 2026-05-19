import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tzknikvqjyswoxdhannv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6a25pa3Zxanlzd294ZGhhbm52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MjU0NjYsImV4cCI6MjA5MzIwMTQ2Nn0.bJ3lQCZZPqM-2D0IbgkraU3MMIb5BGW9hX33Wj1PvKY';

const realSupabase = createClient(supabaseUrl, supabaseAnonKey);

let useLocalMock = false;

// Seed data matching the SQL setup
const initialDatabase = {
  admins: [
    { id: 'admin-uuid-1', name: 'Blood Bank Admin', email: 'admin@blood.com', password_hash: '1234', role: 'super_admin', is_super_admin: true }
  ],
  users: [
    { id: 'user-uuid-1', name: 'Demo User', email: 'user@blood.com', password_hash: '1234', blood_group: 'O+', role: 'user', city: 'Nanded', is_verified: true }
  ],
  hospitals: [
    { id: 'h1', name: 'Jeevan Adhar Blood Bank', address: 'Vazirabad, Nanded', city: 'Nanded', state: 'Maharashtra', lat: 19.1383, lng: 77.3210, phone: '02462-123456', is_verified: true, admin_id: 'admin-uuid-1' },
    { id: 'h2', name: 'Guru Gobind Singh Blood Center', address: 'Shivaji Nagar, Nanded', city: 'Nanded', state: 'Maharashtra', lat: 19.1450, lng: 77.3150, phone: '02462-234567', is_verified: true, admin_id: 'admin-uuid-1' },
    { id: 'h3', name: 'Shree Hajur Saheb Blood Bank', address: 'Guru Gobind Singh Road, Nanded', city: 'Nanded', state: 'Maharashtra', lat: 19.1520, lng: 77.3100, phone: '02462-345678', is_verified: true, admin_id: 'admin-uuid-1' },
    { id: 'h4', name: 'Nanded Blood Bank', address: 'Aadhar Hospital Road, Nanded', city: 'Nanded', state: 'Maharashtra', lat: 19.1300, lng: 77.3250, phone: '02462-456789', is_verified: true, admin_id: 'admin-uuid-1' },
    { id: 'h5', name: 'Golvalkar Guruji Blood Bank', address: 'Langer Saheb Road, Nanded', city: 'Nanded', state: 'Maharashtra', lat: 19.1350, lng: 77.3180, phone: '02462-567890', is_verified: true, admin_id: 'admin-uuid-1' },
    { id: 'h6', name: 'Jijai Blood Centre', address: 'Shivaji Nagar, Nanded', city: 'Nanded', state: 'Maharashtra', lat: 19.1420, lng: 77.3160, phone: '02462-678901', is_verified: true, admin_id: 'admin-uuid-1' },
    { id: 'h7', name: 'Aadhar Hospital', address: 'Nanded', city: 'Nanded', state: 'Maharashtra', lat: 19.1380, lng: 77.3220, phone: '02462-789012', is_verified: true, admin_id: 'admin-uuid-1' },
    { id: 'h8', name: 'Global Hospital', address: 'Nanded', city: 'Nanded', state: 'Maharashtra', lat: 19.1400, lng: 77.3200, phone: '02462-890123', is_verified: true, admin_id: 'admin-uuid-1' },
    { id: 'h9', name: 'Life Care Hospital', address: 'Nanded', city: 'Nanded', state: 'Maharashtra', lat: 19.1360, lng: 77.3240, phone: '02462-901234', is_verified: true, admin_id: 'admin-uuid-1' },
  ],
  blood_inventory: [
    // Hospital 1: Jeevan Adhar
    { id: 'bi-1', hospital_id: 'h1', blood_group: 'A+', units_available: 3, status: 'available', component_type: 'Whole Blood' },
    { id: 'bi-2', hospital_id: 'h1', blood_group: 'A-', units_available: 2, status: 'critical', component_type: 'Red Cells' },
    { id: 'bi-3', hospital_id: 'h1', blood_group: 'B+', units_available: 2, status: 'critical', component_type: 'Whole Blood' },
    { id: 'bi-4', hospital_id: 'h1', blood_group: 'B-', units_available: 1, status: 'critical', component_type: 'Red Cells' },
    { id: 'bi-5', hospital_id: 'h1', blood_group: 'O+', units_available: 3, status: 'available', component_type: 'Whole Blood' },
    { id: 'bi-6', hospital_id: 'h1', blood_group: 'O-', units_available: 1, status: 'critical', component_type: 'Platelets' },
    { id: 'bi-7', hospital_id: 'h1', blood_group: 'AB+', units_available: 1, status: 'critical', component_type: 'Platelets' },
    { id: 'bi-8', hospital_id: 'h1', blood_group: 'AB-', units_available: 1, status: 'critical', component_type: 'Platelets' },
    // Hospital 2: Guru Gobind Singh
    { id: 'bi-9', hospital_id: 'h2', blood_group: 'A+', units_available: 1, status: 'critical', component_type: 'Whole Blood' },
    { id: 'bi-10', hospital_id: 'h2', blood_group: 'O+', units_available: 1, status: 'critical', component_type: 'Plasma' },
    { id: 'bi-11', hospital_id: 'h2', blood_group: 'B+', units_available: 0, status: 'out_of_stock', component_type: 'Whole Blood' },
    // Hospital 3: Shree Hajur Saheb
    { id: 'bi-12', hospital_id: 'h3', blood_group: 'A-', units_available: 2, status: 'critical', component_type: 'Red Cells' },
    { id: 'bi-13', hospital_id: 'h3', blood_group: 'O-', units_available: 2, status: 'critical', component_type: 'Platelets' },
    { id: 'bi-14', hospital_id: 'h3', blood_group: 'AB-', units_available: 2, status: 'critical', component_type: 'Platelets' },
    // Hospital 4: Nanded Blood Bank
    { id: 'bi-15', hospital_id: 'h4', blood_group: 'A+', units_available: 0, status: 'out_of_stock', component_type: 'Whole Blood' },
    { id: 'bi-16', hospital_id: 'h4', blood_group: 'B+', units_available: 0, status: 'out_of_stock', component_type: 'Whole Blood' },
    { id: 'bi-17', hospital_id: 'h4', blood_group: 'O+', units_available: 0, status: 'out_of_stock', component_type: 'Red Cells' },
    { id: 'bi-18', hospital_id: 'h4', blood_group: 'AB+', units_available: 0, status: 'out_of_stock', component_type: 'Platelets' },
    // Hospital 5: Golvalkar Guruji
    { id: 'bi-19', hospital_id: 'h5', blood_group: 'O+', units_available: 10, status: 'available', component_type: 'Whole Blood' },
    { id: 'bi-20', hospital_id: 'h5', blood_group: 'A+', units_available: 8, status: 'available', component_type: 'Red Cells' },
    { id: 'bi-21', hospital_id: 'h5', blood_group: 'AB+', units_available: 7, status: 'available', component_type: 'Plasma' },
    // Hospital 6: Jijai
    { id: 'bi-22', hospital_id: 'h6', blood_group: 'B+', units_available: 4, status: 'critical', component_type: 'Platelets' },
    { id: 'bi-23', hospital_id: 'h6', blood_group: 'B-', units_available: 2, status: 'critical', component_type: 'Platelets' },
    { id: 'bi-24', hospital_id: 'h6', blood_group: 'AB+', units_available: 2, status: 'critical', component_type: 'Platelets' },
    // Hospital 7: Aadhar
    { id: 'bi-25', hospital_id: 'h7', blood_group: 'O+', units_available: 2, status: 'critical', component_type: 'Whole Blood' },
    { id: 'bi-26', hospital_id: 'h7', blood_group: 'O-', units_available: 1, status: 'critical', component_type: 'Whole Blood' },
    // Hospital 8: Global
    { id: 'bi-27', hospital_id: 'h8', blood_group: 'A+', units_available: 2, status: 'critical', component_type: 'Whole Blood' },
    { id: 'bi-28', hospital_id: 'h8', blood_group: 'B+', units_available: 2, status: 'critical', component_type: 'Plasma' },
    { id: 'bi-29', hospital_id: 'h8', blood_group: 'O+', units_available: 3, status: 'available', component_type: 'Whole Blood' },
    { id: 'bi-30', hospital_id: 'h8', blood_group: 'O-', units_available: 2, status: 'critical', component_type: 'Plasma' },
    { id: 'bi-31', hospital_id: 'h8', blood_group: 'AB+', units_available: 1, status: 'critical', component_type: 'Red Cells' },
    { id: 'bi-32', hospital_id: 'h8', blood_group: 'AB-', units_available: 2, status: 'critical', component_type: 'Red Cells' },
    // Hospital 9: Life Care
    { id: 'bi-33', hospital_id: 'h9', blood_group: 'A+', units_available: 0, status: 'out_of_stock', component_type: 'Red Cells' },
    { id: 'bi-34', hospital_id: 'h9', blood_group: 'B+', units_available: 0, status: 'out_of_stock', component_type: 'Red Cells' },
  ],
  blood_requests: [
    {
      id: 'req-uuid-1',
      hospital_id: 'h1',
      blood_group: 'A+',
      component_type: 'Whole Blood',
      units_needed: 2,
      notes: 'Patient: Amit Sharma | Contact: 9876543210',
      status: 'pending',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'req-uuid-2',
      hospital_id: 'h5',
      blood_group: 'O+',
      component_type: 'Whole Blood',
      units_needed: 5,
      notes: 'Patient: Sunita Patel | Contact: 9123456789',
      status: 'accepted',
      created_at: new Date(Date.now() - 7200000).toISOString()
    }
  ]
};

function getDb() {
  const dbStr = localStorage.getItem('blood_bank_db');
  if (!dbStr) {
    localStorage.setItem('blood_bank_db', JSON.stringify(initialDatabase));
    return initialDatabase;
  }
  try {
    return JSON.parse(dbStr);
  } catch {
    localStorage.setItem('blood_bank_db', JSON.stringify(initialDatabase));
    return initialDatabase;
  }
}

function saveDb(db) {
  localStorage.setItem('blood_bank_db', JSON.stringify(db));
}

async function executeMockQuery(builder) {
  const db = getDb();
  let table = db[builder.tableName] || [];

  // Handle Insert
  if (builder.insertData) {
    const rows = Array.isArray(builder.insertData) ? builder.insertData : [builder.insertData];
    const newRows = rows.map(r => {
      const newRow = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
        created_at: new Date().toISOString(),
        ...r
      };
      table.push(newRow);
      return newRow;
    });
    db[builder.tableName] = table;
    saveDb(db);
    return { data: builder.singleRow ? newRows[0] : newRows, error: null };
  }

  // Handle Upsert
  if (builder.upsertData) {
    const rows = Array.isArray(builder.upsertData) ? builder.upsertData : [builder.upsertData];
    const updatedRows = rows.map(r => {
      const existingIndex = builder.tableName === 'blood_inventory'
        ? table.findIndex(item =>
            item.hospital_id === r.hospital_id &&
            item.blood_group === r.blood_group &&
            item.component_type === r.component_type
          )
        : table.findIndex(item => item.id === r.id);

      if (existingIndex > -1) {
        table[existingIndex] = { ...table[existingIndex], ...r, updated_at: new Date().toISOString() };
        return table[existingIndex];
      } else {
        const newRow = {
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
          created_at: new Date().toISOString(),
          ...r
        };
        table.push(newRow);
        return newRow;
      }
    });
    db[builder.tableName] = table;
    saveDb(db);
    return { data: builder.singleRow ? updatedRows[0] : updatedRows, error: null };
  }

  // Handle Update
  if (builder.updateData) {
    let matchIndices = [];
    table.forEach((row, idx) => {
      let matches = true;
      for (const filter of builder.filters) {
        if (filter.type === 'eq') {
          if (row[filter.col] !== filter.val) {
            matches = false;
            break;
          }
        }
      }
      if (matches) {
        matchIndices.push(idx);
      }
    });

    const updatedRows = matchIndices.map(idx => {
      table[idx] = { ...table[idx], ...builder.updateData, updated_at: new Date().toISOString() };
      return table[idx];
    });

    db[builder.tableName] = table;
    saveDb(db);
    return { data: builder.singleRow ? updatedRows[0] : updatedRows, error: null };
  }

  // Handle Select (Read)
  let result = [...table];

  // Filters
  for (const filter of builder.filters) {
    if (filter.type === 'eq') {
      result = result.filter(row => row[filter.col] === filter.val);
    }
  }

  // Order
  if (builder.orderOptions) {
    const { col, ascending } = builder.orderOptions;
    result.sort((a, b) => {
      const valA = a[col];
      const valB = b[col];
      if (valA < valB) return ascending ? -1 : 1;
      if (valA > valB) return ascending ? 1 : -1;
      return 0;
    });
  }

  // Joins
  if (builder.tableName === 'hospitals' && builder.selectColumns.includes('blood_inventory')) {
    result = result.map(h => {
      const inventory = db['blood_inventory'].filter(inv => inv.hospital_id === h.id);
      return { ...h, blood_inventory: inventory };
    });
  }

  if (builder.tableName === 'blood_requests' && builder.selectColumns.includes('hospitals')) {
    result = result.map(req => {
      const hospital = db['hospitals'].find(h => h.id === req.hospital_id);
      return { ...req, hospitals: hospital ? { name: hospital.name } : null };
    });
  }

  // Limit check / single
  if (builder.singleRow) {
    return { data: result[0] || null, error: result[0] ? null : new Error('Row not found') };
  }

  return { data: result, error: null };
}

class MockQueryBuilder {
  constructor(tableName) {
    this.tableName = tableName;
    this.filters = [];
    this.selectColumns = '*';
    this.orderOptions = null;
    this.insertData = null;
    this.updateData = null;
    this.upsertData = null;
    this.singleRow = false;
  }

  select(cols) {
    this.selectColumns = cols || '*';
    return this;
  }

  eq(col, val) {
    this.filters.push({ type: 'eq', col, val });
    return this;
  }

  single() {
    this.singleRow = true;
    return this;
  }

  order(col, options) {
    this.orderOptions = { col, ...options };
    return this;
  }

  insert(data) {
    this.insertData = data;
    return this;
  }

  upsert(data) {
    this.upsertData = data;
    return this;
  }

  update(data) {
    this.updateData = data;
    return this;
  }

  then(onFulfilled, onRejected) {
    return executeMockQuery(this).then(onFulfilled, onRejected);
  }
}

// Connect test at startup
async function checkConnectivity() {
  try {
    const { error } = await realSupabase.from('hospitals').select('id').limit(1);
    if (error) {
      console.warn('Supabase returned error, falling back to local database:', error.message);
      useLocalMock = true;
    } else {
      console.info('Successfully connected to remote Supabase instance.');
    }
  } catch (err) {
    console.warn('Network connection to Supabase failed, falling back to local database:', err.message);
    useLocalMock = true;
  }
}

checkConnectivity();

export const supabase = {
  from(tableName) {
    if (useLocalMock) {
      return new MockQueryBuilder(tableName);
    }

    const realBuilder = realSupabase.from(tableName);
    
    // Proxy query builder to fall back to mock on TypeErrors/fetch errors
    return new Proxy(realBuilder, {
      get(target, prop, receiver) {
        if (prop === 'then') {
          return function(onFulfilled, onRejected) {
            return target.then(
              (res) => {
                return onFulfilled(res);
              },
              async (err) => {
                const isNetworkError = err && (
                  err.message?.includes('Failed to fetch') || 
                  err.message?.includes('network') || 
                  err.name === 'TypeError'
                );
                if (isNetworkError) {
                  console.warn('Supabase fetch failed mid-flight. Switching to local database...');
                  useLocalMock = true;
                  return new MockQueryBuilder(tableName).then(onFulfilled, onRejected);
                }
                if (onRejected) {
                  return onRejected(err);
                }
                throw err;
              }
            );
          };
        }

        const value = Reflect.get(target, prop, receiver);
        if (typeof value === 'function') {
          return function(...args) {
            const result = value.apply(target, args);
            return typeof result === 'object' && result !== null ? new Proxy(result, this) : result;
          };
        }
        return value;
      }
    });
  }
};
