# Nieshie Dump (React + Framer Motion)

Surreal photo-dump website with 3D animated background, smooth motion, upload/edit/delete, and a dashboard page.

## Stack

- React + React Router
- Framer Motion
- Vite (builds frontend into `public/`)
- Node.js backend (`server.js`)
- Local file database: `data/gallery.json`

## Run (production-like)

```bash
npm run build
npm start
```

Open: `http://localhost:3000`

## Run (frontend dev)

```bash
npm run dev
```

## Routes

- `/` surreal landing + photo dump gallery
- `/dashboard` summary dashboard (last page)

## API (existing backend)

- `GET /api/photos`
- `POST /api/photos`
- `PUT /api/photos`
- `DELETE /api/photos?id=<photoId>`
- `GET /api/stats`
