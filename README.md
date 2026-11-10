# SupportDesk

A one-day support ticket MVP built with React, TypeScript, Vite, ASP.NET Core Web API, Entity Framework Core, and SQLite.

## Prerequisites

- Node.js 20.19+ or 22.12+
- .NET 10 SDK
- Git

## Run locally

Open two Terminal windows from the project folder.

### 1. Start the API

```bash
cd backend/SupportDesk.Api
dotnet run --urls http://localhost:5097
```

The API is available at `http://localhost:5097`, with its OpenAPI document at `http://localhost:5097/openapi/v1.json`. On first run, EF Core creates `supportdesk.db` in the API folder.

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in Terminal (normally `http://localhost:5173`). Vite forwards `/api` requests to the local API.

## Ticket API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/tickets` | List tickets |
| GET | `/api/tickets/{id}` | Get one ticket |
| POST | `/api/tickets` | Create a ticket |
| PUT | `/api/tickets/{id}` | Update a ticket |
| DELETE | `/api/tickets/{id}` | Delete a ticket |

Ticket priorities are `Low`, `Normal`, and `High`. Statuses are `Open`, `In Progress`, and `Resolved`.

## Project layout

```text
frontend/                 React + TypeScript + Vite UI
backend/SupportDesk.Api/   ASP.NET Core API and SQLite persistence
.github/workflows/        GitHub Actions build checks
```

The API uses `EnsureCreated` to keep this learning MVP easy to start. If the schema changes later, switch to EF Core migrations before relying on existing local data.
