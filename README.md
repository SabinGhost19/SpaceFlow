
Trebuie să creezi o aplicație full-stack profesională cu următoarele componente:

## 1. BACKEND - FastAPI

Creează un backend FastAPI complet și profesional cu următoarea structură:

### Structura proiectului:
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── user.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── user.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       └── users.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py
│   │   └── config.py
│   └── crud/
│       ├── __init__.py
│       └── user.py
├── alembic/
├── requirements.txt
├── Dockerfile
└── .env.example
```

### Cerințe pentru backend:

1. **Configurare PostgreSQL:**
   - Conexiune la container PostgreSQL Docker
   - Utilizare SQLAlchemy 2.0+ cu async
   - Auto-creare bază de date dacă nu există
   - Auto-creare tabele dacă nu există (folosind Base.metadata.create_all())
   - Sistem flexibil care detectează și creează automat tabele noi când sunt adăugate modele noi

2. **Autentificare JWT robustă:**
   - Access token (15-30 minute expirare)
   - Refresh token (7 zile expirare)
   - Hashare parole cu bcrypt
   - Middleware pentru verificare token
   - Endpoint-uri: `/auth/signup`, `/auth/login`, `/auth/refresh`, `/auth/logout`

3. **CRUD Utilizatori:**
   - Creare user (signup)
   - Citire user (get current user, get user by id)
   - Update user (update profile)
   - Ștergere user (delete account)
   - Toate operațiunile protejate cu JWT (exceptând signup/login)

4. **Model User să conțină:**
   - id (UUID/Integer primary key)
   - email (unique, indexed)
   - username (unique, indexed)
   - hashed_password
   - full_name (optional)
   - is_active (boolean)
   - is_superuser (boolean)
   - created_at (timestamp)
   - updated_at (timestamp)

5. **Validări cu Pydantic v2:**
   - Schema pentru UserCreate (signup)
   - Schema pentru UserLogin
   - Schema pentru UserResponse
   - Schema pentru UserUpdate
   - Schema pentru Token

6. **Security best practices:**
   - CORS configurat corect pentru frontend
   - Environment variables pentru secrets
   - SQL injection prevention (prin SQLAlchemy ORM)
   - Rate limiting (opțional dar recomandat)
   - Password strength validation

## 2. DOCKER SETUP

Creează:

### docker-compose.yml:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: app_postgres
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: app_backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+asyncpg://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      SECRET_KEY: ${SECRET_KEY}
      ALGORITHM: HS256
      ACCESS_TOKEN_EXPIRE_MINUTES: 30
      REFRESH_TOKEN_EXPIRE_DAYS: 7
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

volumes:
  postgres_data:
```

### Dockerfile pentru backend:
- Python 3.11+ slim
- Multi-stage build pentru optimizare
- Non-root user pentru securitate

## 3. FRONTEND - Modificări necesare

**Analizează codul frontend existent** și modifică-l pentru a integra cu backend-ul:

### Ce trebuie implementat în frontend:

1. **Service/API Layer:**
   - Axios sau Fetch pentru requests
   - Interceptori pentru JWT (automat atașat la headers)
   - Base URL configurabil (environment variable)
   - Error handling centralizat

2. **Auth Flow:**
   - Signup form conectat la `/auth/signup`
   - Login form conectat la `/auth/login`
   - Token storage (localStorage sau secure cookies)
   - Auto-refresh token înainte de expirare
   - Logout cu invalidare token
   - Protected routes cu verificare token

3. **User Management:**
   - Fetch current user după login
   - Display user info în UI
   - Update profile form
   - Delete account cu confirmare

4. **State Management:**
   - Context API / Redux / Zustand pentru auth state
   - Loading states
   - Error states
   - Success messages

### Structura API calls din frontend:
```javascript
// Exemplu structură
const api = {
  auth: {
    signup: (data) => POST('/auth/signup', data),
    login: (data) => POST('/auth/login', data),
    refresh: () => POST('/auth/refresh'),
    logout: () => POST('/auth/logout')
  },
  users: {
    getCurrent: () => GET('/users/me'),
    update: (data) => PUT('/users/me', data),
    delete: () => DELETE('/users/me')
  }
}
```

## 4. CERINȚE GENERALE

1. **Cod profesionist:**
   - Type hints în Python
   - Docstrings pentru funcții
   - Error handling comprehensiv
   - Logging adecvat
   - Comentarii pentru logica complexă

2. **Testing ready:**
   - Structură care permite unit tests
   - Dependency injection pentru testabilitate

3. **Environment Variables:**
   - `.env.example` cu toate variabilele necesare
   - Documentație pentru setup

4. **README complet:**
   - Instrucțiuni de instalare
   - Cum să rulezi cu Docker
   - API documentation
   - Environment setup

5. **Security:**
   - Secrets în environment variables
   - HTTPS ready
   - SQL injection proof
   - XSS protection

## OUTPUT AȘTEPTAT:

Furnizează:
1. ✅ Codul complet pentru backend (toate fișierele)
2. ✅ Docker setup complet (docker-compose.yml, Dockerfiles)
3. ✅ Modificările necesare pentru frontend (cod specific pentru integrare)
4. ✅ Fișier `.env.example`
5. ✅ README cu instrucțiuni clare de setup și rulare
6. ✅ Exemple de requests (curl sau Postman collection)

**IMPORTANT:** 
- Codul trebuie să fie production-ready
- Fără placeholder-uri sau TODO-uri
- Toate dependențele specificate în requirements.txt
- Sistema să pornească cu `docker-compose up` și să funcționeze imediat

