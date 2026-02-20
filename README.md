# JOAP Hardware Supplier Management System

Full-stack TypeScript monorepo with React + Vite frontend and Node + Express + MongoDB backend.

## Stack
- client: React, TypeScript, Vite, React Router, Recharts
- server: Express, TypeScript, Mongoose, Zod, JWT, bcrypt

## MongoDB
Edit `server/src/config/key_db.ts` and set the URI.

## Run locally
1. `npm install`
2. `npm run seed`
3. `npm run dev`

Frontend: `http://localhost:5173`
Backend: `http://localhost:4000`

## Default Admin
- username: `admin`
- password: `Admin123!`

## Deployment (Railway)
- Set project root.
- Run `npm install` and `npm run build`.
- Start command: `npm run start`.
- Ensure Mongo URI is set in `server/src/config/key_db.ts`.


## PR Upload Compatibility
- This repo intentionally avoids tracked binary assets in `client/public` to prevent PR tools that reject binary patches ("Binary files are not supported").
- UI assets are kept in source CSS and standard web-safe rendering so PR creation stays text-only.
