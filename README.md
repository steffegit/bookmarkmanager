# bookmarkr

A self-hosted bookmark manager with AI-powered categorization.

## Stack

| Layer | Tech |
|---|---|
| Backend | Kotlin · Ktor · PostgreSQL · JWT auth |
| Frontend | React · Vite · TanStack Router · Tailwind CSS |
| AI | OpenRouter (free tier) |
| Infra | Docker Compose |

## Features

- Save and manage bookmarks with title, URL, and description
- Automatic favicon fetching
- Collections / folder organization
- AI-powered auto-categorization (groups bookmarks into meaningful folders)
- Export bookmarks
- JWT authentication with refresh tokens
- Change password
- Dark/light mode (Zed-inspired aesthetic)

## Running locally

### With Docker Compose

Copy the env example and fill in your values:

```bash
cp server/.env.example .env
```

```env
JWT_SECRET=your_secret_here
POSTGRES_URL=jdbc:postgresql://db:5432/bookmarkmanager
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
OPENROUTER_API_KEY=your_openrouter_key
```

Then start everything:

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080

### Without Docker

**Backend** (requires JDK 17+):

```bash
./gradlew run
```

**Frontend**:

```bash
cd web
npm install
npm run dev
```

## API

All routes are prefixed with `/api`. Protected routes require a `Bearer` JWT token.

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | — | Create account |
| POST | `/auth/login` | — | Login, returns access + refresh tokens |
| POST | `/auth/logout` | — | Logout |
| POST | `/auth/refresh` | — | Refresh access token |
| POST | `/auth/verify` | — | Verify token validity |
| GET | `/bookmarks` | ✓ | List all bookmarks |
| POST | `/bookmarks` | ✓ | Create bookmark |
| PUT | `/bookmarks/{id}` | ✓ | Update bookmark |
| DELETE | `/bookmarks/{id}` | ✓ | Delete bookmark |
| POST | `/bookmarks/categorize` | ✓ | AI-categorize bookmarks into folders |
| GET | `/profile` | ✓ | Get current user profile |
| POST | `/profile/change-password` | ✓ | Change password |

## Environment variables

| Variable | Description |
|---|---|
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `JDBC_URL` | JDBC connection string for PostgreSQL |
| `OPENROUTER_API_KEY` | API key from [openrouter.ai](https://openrouter.ai) for AI categorization |
