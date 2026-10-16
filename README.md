# SWYNEX — Deployable Backend Service (Task 4)

A deployable Node.js + Express REST API with SQLite persistence, API-key authentication, payload validation, consistent JSON errors, sample requests, and deployment configuration.

## Features
- Public GET / and GET /health health endpoints
- SQLite persistence using better-sqlite3
- Complete task CRUD: create, list, read one, update, and delete
- API-key protection on every /tasks endpoint using x-api-key
- Timing-safe API-key comparison and payload validation
- Consistent JSON error responses and 10 KB request-body limit
- Postman collections for CRUD and authentication/validation
- Dockerfile and Render Blueprint for deployment
- Configurable DATA_DIR for persistent SQLite storage
- Sample task payloads in samples/tasks.json

## Run locally
Requirements: Node.js 20+ and npm.

    git clone https://github.com/Avishekchaudhary01/SWYNEX-API-Project-Setup.git
    cd SWYNEX-API-Project-Setup
    npm install
    Copy-Item .env.example .env
    npm start

Use Copy-Item on PowerShell or cp .env.example .env on macOS/Linux. Edit .env and replace API_KEY with a long, unique secret. Never commit your real .env file. The server listens on http://localhost:3000 by default; check http://localhost:3000/health.

## Environment variables
| Variable | Purpose |
|---|---|
| PORT | HTTP port; defaults to 3000 locally. Hosting providers may supply this. |
| NODE_ENV | Environment label; defaults to development. |
| API_KEY | Secret required for all /tasks routes. |
| DATA_DIR | Optional database directory; defaults to the project's data directory. |

If API_KEY is missing, protected task routes fail closed with 503 AUTH_NOT_CONFIGURED.

## API endpoints
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | / | Public | Service message |
| GET | /health | Public | Health, uptime, timestamp, environment |
| POST | /tasks | API key | Create task |
| GET | /tasks | API key | List tasks |
| GET | /tasks/:id | API key | Read one task |
| PUT | /tasks/:id | API key | Update task fields |
| DELETE | /tasks/:id | API key | Delete task |

For task routes, add request header x-api-key with the exact value configured in .env or the hosting environment.

### Create task example
POST /tasks with Content-Type: application/json and x-api-key headers:

    {
      "title": "Learn Node.js",
      "description": "Complete Task 4",
      "completed": false
    }

Expected status: 201 Created. Partial updates are supported for PUT /tasks/:id. Sample payloads are in samples/tasks.json; create them with POST /tasks to populate your database. Demo records are not inserted automatically.

## Error responses
API errors use a consistent shape with error.code and error.message. Common status codes: 400 VALIDATION_ERROR, 401 UNAUTHORIZED, 404 NOT_FOUND or ROUTE_NOT_FOUND, 413 PAYLOAD_TOO_LARGE, 503 AUTH_NOT_CONFIGURED, and 500 INTERNAL_SERVER_ERROR.

## Test with Postman
Import the collections in postman/: SWYNEX-API-Task2-CRUD.postman_collection.json and SWYNEX-API-Task3-Auth-Validation.postman_collection.json. For Task 3 tests, set the collection variable apiKey to your local .env API_KEY. Start the server before sending requests. Health checks are public; task endpoints require the key. Never commit real credentials.

## Deployment option A: Render Blueprint
This repository includes render.yaml. Push to GitHub, sign in to Render, choose New → Blueprint, connect this repository, and deploy. Confirm the generated API_KEY secret in the service environment. After deployment, visit the provided service URL plus /health. The Blueprint mounts a persistent disk at /var/data and sets DATA_DIR=/var/data so SQLite data can persist across restarts and deploys. A persistent disk may require a paid Render plan; verify current pricing and plan requirements. No live URL is claimed until you deploy it.

## Deployment option B: Docker
Build and run:

    docker build -t swynex-api .
    docker run --rm -p 3000:3000 -e API_KEY="replace-with-a-long-random-secret" -e NODE_ENV=production -v swynex-data:/app/data swynex-api

Then visit http://localhost:3000/health. The named Docker volume stores the SQLite database outside the disposable container.

## Operational notes
- Keep API_KEY in the hosting provider's secret/environment settings, never in source control.
- SQLite is suitable for this learning project; use persistent storage when deploying.
- Use HTTPS in production and rotate the key if exposed.
- A successful local run is not the same as a live deployment. Add your actual hosted URL here after deployment.

## Project history
This repository builds on Task 2 (SQLite CRUD) and Task 3 (authentication and validation) and packages the service for Task 4 deployment.
