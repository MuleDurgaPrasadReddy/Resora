# RESORA

RESORA is a smart campus resource network for discovering and booking campus resources, managing opportunities, and supporting student growth.

## Requirements

- Node.js 18 or later
- npm
- PostgreSQL and Supabase credentials for database-backed features

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Set the values in `.env`. `DATABASE_URL` and `DIRECT_URL` should point to your PostgreSQL database. Add your Supabase project URL and publishable key. The app also accepts the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` variable.

4. Generate the Prisma client and start the development server:

   ```bash
   npx prisma generate
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the production application |
| `npm run start` | Start the production server |
| `npm run lint` | Run Next.js lint checks |

## GitHub setup

Local environment files, dependencies, and generated build output are excluded by `.gitignore`. Keep real credentials in `.env`; only `.env.example` should be committed.

To connect this repository to GitHub, create an empty repository there, then run:

```bash
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git add .
git commit -m "Initial commit"
git push -u origin main
```
