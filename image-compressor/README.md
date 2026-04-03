# SquishIt — Image Compressor

A full-stack image compression web app. Upload an image, adjust quality, preview the result, and download the compressed file — no sign-up required.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Image processing | sharp |
| File upload | multer (memory storage) |
| Frontend hosting | Vercel (free) |
| Backend hosting | Render (free) |

---

## Local Development

### 1. Backend

```bash
cd backend
npm install
node server.js          # runs on http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # leave VITE_API_URL blank for local proxy
npm run dev                  # runs on http://localhost:5173
```

Vite proxies `/compress` → `http://localhost:3001` automatically in dev, so no CORS issues locally.

---

## Deployment

### Backend → Render

1. Push `/backend` to a GitHub repository.
2. Create a new **Web Service** on [render.com](https://render.com).
3. Settings:
   - **Build command**: `npm install`
   - **Start command**: `node server.js`
   - **Environment variable**: `FRONTEND_URL` = your Vercel frontend URL
4. Copy the Render service URL (e.g. `https://squishit-api.onrender.com`).

### Frontend → Vercel

1. Push `/frontend` to GitHub.
2. Import the repo on [vercel.com](https://vercel.com).
3. Add environment variable:
   - `VITE_API_URL` = your Render backend URL (from step above).
4. Deploy — Vercel auto-detects Vite.

---

## API Reference

### `GET /`

Health check.

```
200 OK
{ "status": "ok", "message": "Image Compressor API" }
```

---

### `POST /compress`

Compresses an uploaded image.

**Request** — `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | File | ✅ | JPEG, PNG, or WebP image (max 5 MB) |
| `quality` | number | ❌ | 1–100, default 75 |

**Response** — `application/json`

```json
{
  "image":          "<base64-encoded compressed image>",
  "mimeType":       "image/jpeg",
  "originalSize":   204800,
  "compressedSize": 98304,
  "reduction":      "51.95"
}
```

**Error responses**

| Status | Reason |
|---|---|
| 400 | No file uploaded |
| 400 | Invalid quality value |
| 413 | File exceeds 5 MB |
| 415 | Unsupported file type |
| 500 | Compression failed |

---

## Postman Examples

### Compress a JPEG at quality 60

```
POST http://localhost:3001/compress
Content-Type: multipart/form-data

file:    <select a JPEG file>
quality: 60
```

### Edge cases to test

| Test | How |
|---|---|
| No file | Send request with no `file` field → expect 400 |
| Invalid format | Upload a `.gif` or `.pdf` → expect 415 |
| File > 5 MB | Upload a large file → expect 413 |
| Quality out of range | `quality: 999` → clamped to 100 |
| Missing quality | Omit the field → defaults to 75 |

---

## Security Notes

- Only `image/jpeg`, `image/png`, `image/webp` MIME types accepted.
- Hard 5 MB file size limit enforced by multer before sharp runs.
- No files written to disk — everything is processed in memory.
- CORS restricted to `FRONTEND_URL` environment variable in production.
