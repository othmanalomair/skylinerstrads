# Skyliners Trades

Pokemon GO trading platform built with Next.js 16, TypeScript, and PostgreSQL.

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Database**: PostgreSQL via Docker, Prisma 7 with `@prisma/adapter-pg`
- **Auth**: NextAuth v5 beta (credentials provider, JWT sessions)
- **Real-time**: Socket.IO (custom server in `server.ts`)
- **Image Processing**: sharp (avatar upload)

## Commands

```bash
npm run dev            # Dev server (no Socket.IO)
npm run dev:socket     # Dev with Socket.IO via custom server
npm run build          # Production build
npm run fetch-pokemon  # Regenerate pokemon.json from PokeAPI
```

## Database

PostgreSQL runs in Docker (container name: `postgres`, user: `most3mr`, db: `poketrade`).

```bash
npx prisma migrate deploy   # Apply migrations
npx prisma generate         # Regenerate client after schema changes
```

Prisma 7 uses `prisma.config.ts` at root for the datasource URL (not in `schema.prisma`). The client uses `@prisma/adapter-pg` driver adapter configured in `src/lib/prisma.ts`.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── layout.tsx                      # Root layout (metadata, providers)
│   ├── admin/page.tsx                  # Admin dashboard (stats, user mgmt)
│   ├── auth/login/page.tsx             # Login
│   ├── auth/register/page.tsx          # Registration
│   ├── dashboard/page.tsx              # User's want/offer lists
│   ├── dashboard/edit/page.tsx         # Edit profile + avatar upload
│   ├── traders/page.tsx                # Search traders (by name or Pokemon)
│   ├── traders/[username]/page.tsx     # Trader profile
│   ├── messages/page.tsx               # Conversations list
│   ├── messages/[id]/page.tsx          # Chat view
│   └── api/
│       ├── auth/register/              # POST - create account
│       ├── auth/[...nextauth]/         # NextAuth handlers
│       ├── profile/                    # GET/PUT - user profile
│       ├── profile/avatar/             # POST - upload avatar
│       ├── pokemon-list/               # GET/POST - manage lists
│       ├── pokemon-list/[id]/          # DELETE - remove entry
│       ├── traders/                    # GET - search traders
│       ├── traders/[username]/         # GET - trader profile
│       ├── conversations/              # GET/POST - conversations
│       ├── conversations/[id]/messages/# GET/POST - messages
│       ├── admin/stats/                # GET - platform stats
│       └── admin/users/[id]/           # GET/DELETE - user management
├── components/
│   ├── ui/       # Avatar, Badge, Button, Input, Modal, Spinner
│   ├── layout/   # Navbar, MobileNav
│   ├── pokemon/  # PokemonCard, PokemonGrid, PokemonPicker, PokemonSearch
│   ├── trade/    # TraderCard
│   ├── chat/     # ChatWindow, ChatMessage, ChatInput, ConversationList
│   └── providers/# SessionProvider
├── lib/
│   ├── auth.ts        # NextAuth config + type augmentation
│   ├── auth.config.ts # Session strategy, route protection
│   ├── prisma.ts      # Prisma client singleton
│   ├── socket.ts      # Socket.IO client
│   └── pokemon.ts     # Pokemon data utilities
├── types/index.ts     # Shared TypeScript interfaces
├── data/pokemon.json  # 905 Pokemon (Gen 1-8)
└── middleware.ts       # Route protection (deprecated but functional)
```

## Key Architecture Notes

- **Prisma 7**: Requires `prisma.config.ts` at root. Uses driver adapter, not direct connection in schema.
- **NextAuth v5**: Module augmentation for `next-auth/jwt` does NOT work — augment `next-auth` only. Use `any` for jwt/session callback types.
- **Next.js 16**: `params` in page/route components is a `Promise` — must use `use(params)` or `await params`. `middleware.ts` is deprecated in favor of `proxy` but still works.
- **Avatar uploads**: Client compresses to 256x256 WebP via canvas before uploading. Server re-processes with sharp. Stored in `public/uploads/avatars/`.
- **Session updates**: After avatar upload or profile changes, call `updateSession()` client-side. JWT callback re-fetches from DB on `trigger === "update"`.

## Database Schema

**User**: id, email, passwordHash, username (unique), displayName, avatarUrl, bio, trainerCode (unique, required), trainerCode2 (optional), team (enum), role (USER/ADMIN)

**PokemonList**: userId, pokemonId, pokemonName, listType (WANT/OFFER), isShiny, isMirror, isDynamax, notes. Unique on (userId, pokemonId, listType, isShiny, isMirror).

**Conversation**: user1Id, user2Id, lastMessageText, lastMessageAt. Unique on (user1Id, user2Id).

**Message**: conversationId, senderId, content, readAt.

All relations cascade on user delete.

## Socket.IO Events

Server runs in `server.ts` on port 3000, path `/api/socketio`.

- `join` — user joins personal room `user:{userId}`
- `join-conversation` / `leave-conversation` — join/leave chat room
- `send-message` — broadcasts `new-message` to room + `conversation-updated` to recipient
- `typing` / `stop-typing` — typing indicators

## Branding

- Logo icon (without text): `public/images/logo-icon.png`
- Navbar logo: `public/images/logo-navbar.png` (generated from icon)
- Favicon: `public/icon.png`
- App name: **Skyliners Trades**
- Domain: skyliners-trades.com
