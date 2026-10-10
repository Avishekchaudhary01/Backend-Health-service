# Backend Health Service

A beginner-friendly Node.js and Express backend with a health-check endpoint and environment-based configuration.

## Features
- `GET /` — basic service information
- `GET /health` — health status, uptime, timestamp, and environment
- Environment variables for the port and runtime environment
- JSON responses and a simple 404 handler

## Requirements
- Node.js 18 or newer
- npm

## Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Avishekchaudhary01/Backend-Health-service.git
   cd Backend-Health-service
   ```
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` (PowerShell: `Copy-Item .env.example .env`; macOS/Linux: `cp .env.example .env`).
4. Start the service: `npm start`
5. Test `http://localhost:3000/` and `http://localhost:3000/health`.

## Environment variables
| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP server port |
| `NODE_ENV` | `development` | Runtime environment label |

Never commit your real `.env` file; `.gitignore` excludes it.

## Example health response
```json
{
  "status": "ok",
  "uptime": 12.345,
  "timestamp": "2026-10-10T12:00:00.000Z",
  "environment": "development"
}
```

The uptime and timestamp vary on each request.

## API summary
| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | Service welcome response |
| `GET` | `/health` | Health check |
| Any other path | — | JSON 404 response |

## License
This project is provided for learning and portfolio use.
