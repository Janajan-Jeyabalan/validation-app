# Validation Backend

This folder contains a minimal Express + MySQL backend to store validation data.

Setup

1. Install dependencies

```bash
cd backend
npm install
```

2. Create a `.env` file in `backend/` with your DB credentials, for example:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=validation_app
PORT=4000
```

3. Run the migration SQL to create the database and tables:

```bash
# run from a shell with mysql client available
mysql -u root -p < migrations/init.sql
```

4. Start the server:

```bash
npm run start
# or locally with nodemon
npm run dev
```

Run MySQL locally with Docker (optional)

1. Ensure Docker is installed and running.
2. From `backend/` run:

```powershell
.
# start MySQL container using provided .env.docker
.
powershell -ExecutionPolicy Bypass -File start-mysql.ps1
```

This will start a MySQL 8 container and create the `validation_app` database (see `.env.docker` for credentials). After MySQL is running, start the backend as above.

API Endpoints

- `POST /api/auth/login` { email, name } → creates or returns a user
- `POST /api/validations` { user_id, status, steps, metadata } → create validation session
- `GET /api/validations/user/:userId` → list validations for a user

- `POST /api/validations/bulk` → accept an array of validation objects to insert in bulk. Returns per-item results with `{ success: boolean, id?: number, error?: string }`.

Example bulk request (curl):

```bash
curl -X POST http://localhost:4000/api/validations/bulk \
  -H "Content-Type: application/json" \
  -d '[{"user_id":1, "status":"complete", "metadata":{"source":"excel"}, "steps":[{"step_name":"Step1","data":{"rows":10}}]}]'
```

Example create request (curl):

```bash
curl -X POST http://localhost:4000/api/validations \
  -H "Content-Type: application/json" \
  -d '{"user_id":1, "status":"complete", "metadata":{"source":"excel"}, "steps":[{"step_name":"Step1","data":{"rows":10}}]}'
```

Frontend integration

Call the above endpoints from your frontend (for example from `frontend/src/store/validationStore.ts`) with `fetch` or `axios`.
