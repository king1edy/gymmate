This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

// =====================================================
// README.md content for database setup


# GymMate Database Setup

## Prerequisites

1. PostgreSQL 14+ installed and running
2. Node.js 18+ with npm/yarn
3. Environment variables configured

## Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database credentials
   ```

3. **Run complete setup:**
   ```bash
   npm run setup:db
   ```

This will:
- Create the database if it doesn't exist
- Run all migrations
- Seed initial data

## Manual Setup Steps

If you prefer to run each step manually:

1. **Generate migrations:**
   ```bash
   npm run db:generate
   ```

2. **Run migrations:**
   ```bash
   npm run db:migrate
   ```

3. **Seed database:**
   ```bash
   npm run db:seed
   ```

## Development Tools

- **Drizzle Studio:** `npm run db:studio`
- **Push schema changes:** `npm run db:push`
- **Reset database:** `npm run db:reset`

## Default Login Credentials

After seeding:
- **Admin:** admin@fitlifegym.com / admin123
- **Trainer:** trainer@fitlifegym.com / trainer123  
- **Member:** member@fitlifegym.com / member123

## Database Schema Overview

The database supports:
- Multi-tenant SaaS architecture
- Complete gym management (members, classes, equipment)
- Financial tracking (payments, invoices, subscriptions)
- Health & fitness tracking
- Access control & security
- Marketing & communications
- Analytics & reporting

## Key Features

- **Type Safety:** Full TypeScript support with Drizzle ORM
- **Performance:** Optimized indexes for common queries
- **Scalability:** UUID primary keys, proper relationships
- **Security:** Role-based access, audit logging
- **Flexibility:** JSONB fields for extensible data

## API Query Examples

```typescript
// Get member with full profile
const member = await MemberQueries.getMemberProfile(memberId);

// Book a class
const booking = await ClassQueries.bookClass(memberId, scheduleId);

// Get gym analytics
const stats = await AnalyticsQueries.getGymOverview(gymId);
```
