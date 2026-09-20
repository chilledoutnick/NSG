# AGENTS.md — Development Guidelines & Agent Instructions

This document defines the architecture, operational rules, and development best practices for the **NSG CRM (Network Sales & Growth)** codebase. Any AI agent or developer working on this project must strictly adhere to these instructions.

---

## 1. Strict Execution & Testing Rules (IMPORTANT)

- **Do NOT proactively run test suites, pip installations, or server executions.**
  - Never automatically run `pip install`, `npm install`, test suites, background servers, or try to test/execute runtime commands in a loop.
  - Do NOT test or run commands that require dependencies unless explicitly asked by the user.
  - When testing or verification is required, **only prepare a test script or provide the exact command string** and wait for the user to execute it themselves.
- **Do NOT execute database mutations or migrations against unapproved databases.**
  - Never run `python manage.py migrate` or alter database tables unless explicitly pointed to a fresh, user-confirmed database instance.
  - The baseline schema is consolidated in `api/migrations/0001_initial.py`. Legacy fragmented migrations are archived in `api/migrations_legacy_backup/`.
- **Keep everything local:**
  - Do NOT make automated git commits, git pushes, or branch switches. All work is kept in the local workspace.

---

## 2. Project Architecture

The application is a full-stack white-labeled CRM platform:

```text
advisorapp/
├── advisorapp/             # Django root configuration (settings.py, urls.py, env_loader.py)
├── api/                    # Core Django backend app
│   ├── models/             # Business models (User, Contact, Appointment, SmartCard, etc.)
│   ├── views/              # REST Framework viewsets and API endpoints
│   ├── migrations/         # 0001_initial.py (consolidated fresh migration)
│   └── management/         # Management commands (seed_initial_data.py)
├── frontend/               # React 18 SPA (formerly leapon-card-profile)
│   ├── public/             # Static HTML, manifest, favicons, logos
│   ├── src/                # React source (Pages, Components, config.js)
│   ├── build/              # Production build output
│   └── package.json        # Frontend dependencies
├── templates/              # Clean branded HTML email templates
├── .env                    # Backend environment variables (NEVER COMMIT)
├── .env.example            # Backend environment template
├── nsg_crm_schema.sql      # Reference SQL schema dump
└── requirements.txt        # Backend Python dependencies
```

---

## 3. Environment & Configuration Standards

- **Backend Configuration**:
  - Always read configurations via `os.getenv` or `advisorapp.env_loader.get_env`.
  - Database is configured for **PostgreSQL** via `DATABASE_URL` (or fallback discrete `DB_*` variables).
  - Secrets, API keys, email credentials, and passwords must **never** be hardcoded in Python files.
- **Frontend Configuration**:
  - Centralized URLs and brand constants reside in `frontend/src/config.js`.
  - Build and runtime variables use the `REACT_APP_` prefix in `frontend/.env`.

---

## 4. White-Labeling & Tracking Standards

- **Brand Identity**:
  - Application Name: **NSG CRM**
  - Company Name: **Network Sales & Growth**
  - Short Brand: **NSG**
  - Old brand names (`Leapon`, `leapon`, `leapon.me`, `leaponapi-test`) must never be reintroduced.
- **Zero Third-Party User Tracking**:
  - The application is stripped of all third-party behavioral analytics, session recording, and marketing pixels.
  - Do NOT add Google Tag Manager (GTM), Google Analytics, Microsoft Clarity, Trackdesk, Facebook/Meta Pixel, TikTok Pixel, LinkedIn Insight Tag, Hotjar, or similar trackers.
  - Do NOT add hardcoded scenario webhooks (such as Make.com/Integromat or Zapier webhooks) into frontend event handlers.
  - Legitimate business observability (server error logging, Django security logs, profile card tap counts via `ProfileVisit`) is preserved for CRM functionality.

---

## 5. Coding & Model Best Practices

- **Model Relationships**:
  - Always use quoted string names in `ForeignKey`, `ManyToManyField`, and `OneToOneField` relations (e.g. `models.ForeignKey("User", ...)` instead of `models.ForeignKey(User, ...)`). This avoids circular import and module resolution issues.
- **Django Compatibility**:
  - Target Django 4.2 LTS. Use `check=` for model `CheckConstraint` definitions.
- **Asset Integrity**:
  - NSG brand logos and favicons are stored in `frontend/public/` (`favicon.ico`, `logo.png`, `nsg-logo-192.png`, `nsg-logo-512.png`) and relevant component `img/` folders.

---

## 6. How the User Runs and Verifies the Project

When the user asks to run or test the project, provide them with these standard commands:

### Backend Setup
```bash
# 1. Activate virtual environment
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Check system configuration
python manage.py check --tag models

# 4. Apply migrations to fresh PostgreSQL database
python manage.py migrate

# 5. Seed initial system data (Site object, subscription tiers)
python manage.py seed_initial_data

# 6. Create superuser
python manage.py createsuperuser

# 7. Start Django development server
python manage.py runserver 8000
```

### Frontend Setup
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Start development server
npm start

# 4. Or build for production
npm run build
```

