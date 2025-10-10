# Roomie

Visual meeting room booking for small and medium teams.

## Features

- **Instant booking**: Quick-book rooms by capacity (2, 4, or 8 people)
- **Calendar views**: Week and day views with visual availability
- **AI-powered**: Theme-based room naming and image generation
- **Smart scheduling**: Conflict detection, extend/shrink active bookings
- **Team management**: Owner, Admin, and User roles with granular permissions
- **Repeat bookings**: Weekly recurring meetings with optional end dates

## Tech Stack

- **Next.js 15** (App Router) + **React 19**
- **Convex** for database and real-time backend
- **Clerk** for authentication (Google sign-in only)
- **Vercel AI SDK** with GPT-5-mini and Gemini 2.5 Flash
- **Tailwind CSS** + **ShadCN** components

## Environment Setup

Create `.env.local` with:

```bash
# Clerk Authentication
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# AI Models
OPENAI_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=

# Convex Backend
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Lint code
npm run lint

# Build for production
npm run build
```

## First-Time Setup

1. Sign in with a company Google account
2. First user from a domain becomes **Owner**
3. Complete onboarding: set timezone, business hours, and theme
4. Create meeting rooms with AI-generated names and images
5. Start booking!

## Roles & Permissions

- **Owner**: Full access, transfer ownership, remove anyone
- **Admin**: Create rooms, cancel any booking, remove users
- **User**: Create/cancel own bookings

## Project Structure

```
src/
├── app/              # Next.js routes
│   ├── (app)/        # Authenticated routes
│   └── actions.ts    # Server actions
├── components/       # React components
│   ├── booking/      # Booking modals and cards
│   ├── calendar/     # Calendar views
│   └── ui/           # ShadCN components
├── lib/              # Utilities and hooks
└── middleware.ts     # Clerk auth middleware

convex/
├── schema.ts         # Database schema
├── bookings.ts       # Booking mutations/queries
├── rooms.ts          # Room management
└── users.ts          # User management
```
