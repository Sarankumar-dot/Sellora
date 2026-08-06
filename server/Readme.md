# Sellora Backend

## Docker

Run the backend and its MySQL database from this directory:

```bash
docker compose up --build
```

Docker reads the existing `.env` file. Keep the database variables (`DB_NAME`, `DB_USER`, and
`DB_PASSWORD`) set: Compose uses them to create MySQL and supplies the backend with the same
credentials. The backend overrides `DB_HOST` to the Docker service name `db` and `DB_PORT` to
`3306`. It also uses the Docker-only non-root `sellora` MySQL user, so the centralized environment
validation and database connection use the containerized database automatically even when the local
`.env` uses `DB_USER=root` for a host MySQL instance.

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

MySQL data is stored in the named `mysql_data` volume and remains available after `docker compose down`.

If the database volume was created while `MYSQL_USER=root` was configured, reset that development
volume before starting again:

```bash
docker compose down -v
docker compose up --build
```

This removes the existing MySQL data volume and should only be used when its data can be discarded.
