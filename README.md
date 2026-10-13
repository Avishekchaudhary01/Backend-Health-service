# SWYNEX API Project Setup

A beginner-friendly backend API built with Node.js and Express.js. It provides a health-check endpoint, environment-based configuration, and JSON responses.

## Features

- `GET /` — returns a service welcome message
- `GET /health` — returns service status, uptime, timestamp, and environment
- Environment variables for port and runtime environment
- JSON responses and a simple 404 handler

## Requirements

- Node.js 18 or newer
- npm

## Setup

Clone this repository:

```bash
git clone https://github.com/Avishekchaudhary01/SWYNEX-API-Project-Setup.git
cd SWYNEX-API-Project-Setup
```

Install dependencies:

```bash
npm install
```

Create a local `.env` file from the example.

PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Start the server:

```bash
npm start
```

For development with automatic restart on file changes:

```bash
npm run dev
```

The server runs at `http://localhost:3000` by default.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port used by the HTTP server |
| `NODE_ENV` | `development` | Runtime environment label |

Do not commit your real `.env` file. It is excluded by `.gitignore`.

## API endpoints

### `GET /`

Returns basic service information.

Example response:

```json
{
  "message": "Backend Health Service is running",
  "environment": "development"
}
```

### `GET /health`

Returns the health status, uptime, timestamp, and environment.

Example response:

```json
{
  "status": "ok",
  "uptime": 12.345,
  "timestamp": "2026-10-13T04:44:23.198Z",
  "environment": "development"
}
```

The uptime and timestamp will differ for each request.

### Unknown routes

Any unrecognized route returns HTTP 404 with a JSON error.

## Testing

Open these URLs after starting the server:

- `http://localhost:3000/`
- `http://localhost:3000/health`

## License

Created for learning and API project setup practice.
