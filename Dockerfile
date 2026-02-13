FROM node:22-alpine AS base

# --- Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- Builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dummy DATABASE_URL for prisma generate & next build (not used at runtime)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN echo "DATABASE_URL=${DATABASE_URL}" > .env

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Compile server.ts to server.js
RUN npx tsc server.ts --module nodenext --moduleResolution nodenext --esModuleInterop --skipLibCheck

# --- Runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Create uploads directory
RUN mkdir -p public/uploads/avatars && chown -R nextjs:nodejs public/uploads

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
