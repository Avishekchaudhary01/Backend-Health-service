# SWYNEX API — Task 3: Authentication, Validation, and Integration

A Node.js + Express REST API with SQLite persistence, protected task endpoints, payload validation, and consistent JSON errors.

## Features

- Public `GET /` and `GET /health` health endpoints
- SQLite persistence through `better-sqlite3`
- Full task CRUD endpoints
- API-key authentication using the `x-api-key` header
- Timing-safe API-key comparison
- Validation for required/unknown fields, title and description lengths, boolean completion state, and positive integer IDs
- Consistent error response shape for API errors
- JSON body limit of 10 KB
- Postman collections for CRUD and Task 3 authentication testing

## Requirements

- Node.js 18+
- npm

## Setup

```bash
git clone https://github.com/Avishekchaudhary01/SWYNEX-API-Project-Setup.git
cd SWYNEX-API-Project-Setup
npm install
```

Create your local environment file.

PowerShell:
```powershell
Copy-Item .env.example .env
```

macOS/Linux:
```bash
cp .env.example .env
```

Open `.env` and replace the example `API_KEY` with a long, unique secret. Keep `.env` private; it is excluded from Git. Do not use the example key in a deployed application.

Start the server:
```bash
npm start
```

The default URL is `http://localhost:3000`. SQLite creates `data/tasks.db` automatically. The `data/` directory and database files are excluded from Git.

## Environment variables

| Variable | Default/example | Purpose |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | Environment label |
| `API_KEY` | Set in your local `.env` | Secret required for all `/tasks` endpoints |

If `API_KEY` is missing, task routes return `503 AUTH_NOT_CONFIGURED` rather than becoming unprotected.

## Endpoints

| Method | Endpoint | Authentication |
|---|---|---|
| GET | `/` | Public |
| GET | `/health` | Public |
| POST | `/tasks` | `x-api-key` required |
| GET | `/tasks` | `x-api-key` required |
| GET | `/tasks/:id` | `x-api-key` required |
| PUT | `/tasks/:id` | `x-api-key` required |
| DELETE | `/tasks/:id` | `x-api-key` required |

### Authentication

For every task request, add this header in Postman:

```
x-api-key: YOUR_LOCAL_API_KEY
```

Use the exact value configured in your local `.env` file. The health endpoints remain public so they can be checked without credentials.

### Create a task

`POST http://localhost:3000/tasks`

Headers: `Content-Type: application/json`, `x-api-key: YOUR_LOCAL_API_KEY`

Body:
```json
{
  "title": "Learn Node.js",
  "description": "Complete Task 3",
  "completed": false
}
```

Returns `201 Created`.

### Read tasks

- `GET http://localhost:3000/tasks` — list tasks
- `GET http://localhost:3000/tasks/1` — get a task by ID

Both require the API-key header.

### Update a task

`PUT http://localhost:3000/tasks/1`

Body:
```json
{
  "completed": true
}
```

Partial updates are supported. At least one valid field must be provided.

### Delete a task

`DELETE http://localhost:3000/tasks/1`

Replace `1` with the ID of an existing task.

## Consistent error responses

All API errors use this shape:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "A valid x-api-key header is required"
  }
}
```

Common status codes:

- `400 VALIDATION_ERROR` — invalid body or ID
- `401 UNAUTHORIZED` — missing or incorrect API key
- `404 NOT_FOUND` — task does not exist
- `404 ROUTE_NOT_FOUND` — unknown endpoint
- `413 PAYLOAD_TOO_LARGE` — JSON body exceeds 10 KB
- `503 AUTH_NOT_CONFIGURED` — server's API key is not configured
- `500 INTERNAL_SERVER_ERROR` — unexpected server error

## Test with Postman

Import `postman/SWYNEX-API-Task3-Auth-Validation.postman_collection.json`.

1. Start the API with `npm start`.
2. In the imported collection, edit the collection variable `apiKey` and set it to the same value as your local `.env` `API_KEY`.
3. Run **Health Check** (no key required).
4. Run **Protected route — missing key**; it should return `401`.
5. Run **List tasks — valid key**; it should return `200`.
6. Run **Create task — valid key**; it should return `201`.
7. Try **Create task — invalid payload**; it should return `400`.
8. Use a real task ID for get, update, and delete requests.

The collection contains an example variable only. Do not save or commit a real API key in the repository.

## Previous task

The same repository retains the Task 2 SQLite CRUD implementation. This version extends it with authentication, stronger validation, and standard error responses.
