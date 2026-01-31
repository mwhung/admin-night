# Admin Night - Setup Instructions

## Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works)
- OpenAI or Anthropic API key

## Database Setup

### Option 1: Supabase (Recommended)

1. Create a new Supabase project at https://supabase.com
2. Copy your project URL and anon key
3. Get your database connection string from Settings > Database
4. Update `.env` file:
   ```
   DATABASE_URL="your-supabase-connection-string"
   NEXT_PUBLIC_SUPABASE_URL="your-project-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

### Option 2: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
   ```bash
   createdb admin_night
   ```
3. Update `.env`:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/admin_night"
   ```

## Running Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

## Authentication Setup

### Using NextAuth.js

1. Generate a secret:
   ```bash
   openssl rand -base64 32
   ```
2. Add to `.env`:
   ```
   NEXTAUTH_SECRET="your-generated-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

## AI Provider Setup

### Option 1: OpenAI
1. Get API key from https://platform.openai.com/api-keys
2. Add to `.env`:
   ```
   OPENAI_API_KEY="sk-..."
   ```

### Option 2: Anthropic Claude
1. Get API key from https://console.anthropic.com/
2. Add to `.env`:
   ```
   ANTHROPIC_API_KEY="sk-ant-..."
   ```

## Development

```bash
# Install dependencies
npm install

# Run development server with Turbopack
npm run dev

# Open http://localhost:3000
```

## Next Steps

1. ✅ Database schema is defined
2. ⏳ Run migrations (see above)
3. ⏳ Implement authentication
4. ⏳ Build core features
5. ⏳ Deploy to Vercel

## Troubleshooting

### Prisma Issues
```bash
# Reset database (careful: deletes all data)
npx prisma migrate reset

# Force regenerate client
rm -rf node_modules/.prisma
npx prisma generate
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```
