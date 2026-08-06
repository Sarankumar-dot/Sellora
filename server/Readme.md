# Sellora Backend

## Docker

Create the local environment file from the template, then replace every `replace-with-...` value
with your Railway database credentials and application secrets:

```bash
cp .env.example .env
```

Run the backend container from this directory:

```bash
docker compose up --build
```

Docker passes the `DB_*` variables from `.env` directly to the backend, so both local Docker
development and Render connect to Railway MySQL. No local MySQL service or Docker database volume
is used.

The backend is available on the `PORT` configured in `.env` (port `5000` by default), and Swagger
UI is available at `http://localhost:5000/api/docs` when using the default port.

Source code is mounted into the backend container for development, and Node watches source changes.
Dependencies stay in a Docker-managed volume, so host `node_modules` is never mounted.

Stop the stack:

```bash
docker compose down
```

View service logs:

```bash
docker compose logs -f
```

View service status:

```bash
docker compose ps
```

The only Docker-managed volume is `backend_node_modules`, which keeps host dependencies out of the
container.
