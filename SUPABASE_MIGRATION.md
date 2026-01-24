# Supabase Migration Guide

This application is architected to easily migrate from localStorage to Supabase when ready to scale.

## Architecture Overview

The application uses a **Repository Pattern** with clear interfaces:

```
Components → DataService → IDataRepository ← LocalStorageRepository
                                          ← SupabaseRepository (future)
```

## Current Structure

- **`src/services/interfaces/IDataRepository.ts`** - Interface contract for all data operations
- **`src/services/repositories/LocalStorageRepository.ts`** - Current localStorage implementation
- **`src/services/DataService.ts`** - Central service that components import from

## Migration Steps

### 1. Setup Supabase

```bash
npm install @supabase/supabase-js
```

Create `.env` file:
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Create Database Schema

Run these SQL commands in Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT, -- Use Supabase Auth instead in production
  role TEXT NOT NULL CHECK (role IN ('admin', 'branch_admin', 'telecaller')),
  name TEXT NOT NULL,
  branch_id TEXT REFERENCES branches(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branches table
CREATE TABLE branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  short_description TEXT,
  price_range TEXT NOT NULL,
  demo_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enquiries table
CREATE TABLE enquiries (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  location TEXT NOT NULL,
  product_id TEXT REFERENCES products(id),
  branch_id TEXT REFERENCES branches(id),
  purchase_intent TEXT NOT NULL,
  pipeline_stage TEXT NOT NULL,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enquiry history table
CREATE TABLE enquiry_history (
  id SERIAL PRIMARY KEY,
  enquiry_id TEXT REFERENCES enquiries(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT REFERENCES users(id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiry_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies (examples - adjust based on your needs)
CREATE POLICY "Users can view all users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Branches visible to all authenticated users" ON branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Products visible to all authenticated users" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Branch admins can only view their branch enquiries" ON enquiries FOR SELECT TO authenticated 
  USING (
    branch_id IN (
      SELECT branch_id FROM users WHERE id = auth.uid()
    )
    OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
```

### 3. Create Supabase Repository

Create `src/services/repositories/SupabaseRepository.ts`:

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { IDataRepository } from '../interfaces/IDataRepository';
import type { User, Product, Branch, Enquiry, PipelineStage } from '../../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export class SupabaseRepository implements IDataRepository {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    // User Operations
    async getUsers(): Promise<User[]> {
        const { data, error } = await this.supabase.from('users').select('*');
        if (error) throw error;
        return data || [];
    }

    async getUserById(id: string): Promise<User | null> {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        if (error) return null;
        return data;
    }

    async addUser(user: User): Promise<void> {
        const { error } = await this.supabase.from('users').insert([user]);
        if (error) throw error;
    }

    async login(username: string, password: string): Promise<User | null> {
        // Consider using Supabase Auth instead
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();
        if (error) return null;
        return data;
    }

    // Implement remaining methods following the same pattern...
    // See LocalStorageRepository for the full list
}
```

### 4. Switch to Supabase

In `src/services/DataService.ts`, change line 14:

```typescript
// FROM:
const repository: IDataRepository = new LocalStorageRepository();

// TO:
import { SupabaseRepository } from './repositories/SupabaseRepository';
const repository: IDataRepository = new SupabaseRepository();
```

### 5. Update Components to Use Async (Gradual Migration)

Update components one by one to use async/await:

```typescript
// OLD (synchronous):
const products = storage.getProducts();

// NEW (asynchronous):
const products = await dataService.getProducts();
```

Since React components can't be async, use hooks:

```typescript
const [products, setProducts] = useState<Product[]>([]);

useEffect(() => {
    dataService.getProducts().then(setProducts);
}, []);
```

### 6. Data Migration

Export data from localStorage and import to Supabase:

```typescript
// Export script
const exportData = () => {
    const data = {
        users: storage.getUsers(),
        branches: storage.getBranches(),
        products: storage.getProducts(),
        enquiries: storage.getEnquiries()
    };
    console.log(JSON.stringify(data, null, 2));
};

// Then bulk insert into Supabase
```

## Benefits of This Architecture

✅ **Zero vendor lock-in** - Easy to switch storage backends
✅ **Testable** - Mock repositories for testing
✅ **Type-safe** - Full TypeScript support
✅ **Gradual migration** - Can migrate piece by piece
✅ **Future-proof** - Easy to add Redis, PostgreSQL, etc.

## Development vs Production

You can use environment variables to switch storage:

```typescript
const repository: IDataRepository = 
    import.meta.env.MODE === 'development' 
        ? new LocalStorageRepository()
        : new SupabaseRepository();
```

This lets you develop locally with localStorage and deploy with Supabase!
