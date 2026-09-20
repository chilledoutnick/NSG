# NSG CRM — Network Sales & Growth

Enterprise-grade smart networking, digital business card, and relationship management platform built with **Django REST Framework** and **React**.

---

## 🚀 Key Features

* **Digital Business Cards**: Interactive customized profile pages shareable via URL, QR code, NFC, or digital wallet.
* **Apple Wallet & Google Wallet**: Native `.pkpass` and Google Wallet pass generation with QR code and dynamic profile syncing.
* **Contact & Lead Management**: Contact capture, CRM tags, notes, reminders, contact sharing, and timeline history.
* **Appointment Scheduling**: Integrated calendar availability, booking slots, CalDAV, and Google/Outlook OAuth synchronization.
* **Payments & Billing**: Stripe checkout, subscription tiers, lifetime plans, and automated invoicing.
* **Email Marketing**: Automated transactional notifications, re-engagement campaigns, and Mailchimp integration.
* **Team & Enterprise Administration**: Team advisor management, custom subdomains, branded profile themes, and company directories.

---

## 📁 Repository Structure

```text
NSG CRM/
├── frontend/                     # React 18 SPA (formerly leapon-card-profile)
│   ├── public/                   # Public assets, favicon, manifest, index.html
│   ├── src/                      # Components, Pages, Stores, SCSS styles
│   ├── .env.example              # Frontend environment template
│   └── package.json              # Frontend dependencies and build scripts
├── advisorapp/                   # Django core project configuration
│   ├── settings.py               # Environment-backed Django settings
│   ├── env_loader.py             # Lightweight .env loader
│   ├── urls.py                   # Master URL routing
│   ├── wsgi.py / asgi.py         # WSGI & ASGI entrypoints
│   └── storage_backends.py       # Cloud storage adapters (GCP / S3)
├── api/                          # Django application
│   ├── models/                   # ORM models (reconciled schema baseline)
│   ├── views/                    # DRF GenericViewSets and API endpoints
│   ├── serializers.py            # Model and API serializers
│   ├── migrations/               # Clean unified database migrations
│   ├── migrations_legacy_backup/ # Archived legacy migrations (284 files)
│   └── management/commands/      # Custom CLI tools & seed_initial_data
├── templates/                    # Transactional email and landing templates
├── nsg_crm_schema.sql            # Clean MySQL DDL baseline script (80+ tables)
├── .env.example                  # Backend environment configuration template
├── Procfile                      # Process configuration (Web, Release, Celery)
├── requirements.txt              # Python production dependencies
└── package.json                  # Root deployment scripts
```

---

## 🛠️ Getting Started (Local Development)

### Prerequisites

* **Python**: 3.10+ (Recommended: 3.11 or 3.12)
* **Node.js**: 18.x and npm 9.x+
* **MySQL**: 8.0+
* **RabbitMQ** (for Celery tasks)

---

### Step 1: Backend Configuration

1. **Create and activate a virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure your database credentials, secret key, and API URLs:
   ```env
   APP_NAME=NSG CRM
   COMPANY_NAME=Network Sales & Growth
   SECRET_KEY=your-secure-random-secret-key
   DEBUG=True
   DB_ENGINE=django.db.backends.mysql
   DB_NAME=nsg_crm
   DB_USER=root
   DB_PASSWORD=your_db_password
   DB_HOST=127.0.0.1
   DB_PORT=3306
   API_URL=http://127.0.0.1:8000
   FRONTEND_URL=http://localhost:3000
   ```

---

### Step 2: Fresh Database Initialization

1. **Create an empty MySQL database**:
   ```sql
   CREATE DATABASE nsg_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Initialize Schema**:
   You have two convenient options to provision the database:

   * **Option A: Via Direct SQL DDL (Fastest & Guaranteed Identical Schema)**:
     ```bash
     mysql -u root -p nsg_crm < nsg_crm_schema.sql
     ```
     Then mark migrations as applied:
     ```bash
     python manage.py migrate --fake
     ```

   * **Option B: Via Django Migrations**:
     ```bash
     python manage.py migrate
     ```

3. **Seed Initial System Data**:
   ```bash
   python manage.py seed_initial_data
   ```

4. **Create a Superuser**:
   ```bash
   python manage.py createsuperuser
   ```

---

### Step 3: Frontend Configuration & Build

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start React development server**:
   ```bash
   npm start
   ```
   The frontend runs on `http://localhost:3000`.

---

### Step 4: Run the Backend & Background Workers

1. **Start Django API server**:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Start Celery Worker (optional, for background jobs)**:
   ```bash
   celery -A advisorapp worker -l info
   ```

3. **Start Celery Beat (optional, for periodic tasks)**:
   ```bash
   celery -A advisorapp beat -l info
   ```

---

## 🔒 Security & Rotation Notice

> **Important**: All hardcoded secrets and service accounts from the legacy codebase have been completely removed and gitignored. If you previously cloned or forked the legacy repository, ensure that you **rotate all API keys and credentials** (Google Cloud Service Accounts, MySQL root passwords, Gmail SMTP App Passwords, and Stripe Keys) in your provider consoles.

---

## 🚢 Production Deployment

### Build Pipeline:
1. Root `package.json` contains the `heroku-postbuild` script:
   ```bash
   cd frontend && npm install --legacy-peer-deps --include=dev && CI=false npm run build
   ```
2. Frontend build artifacts are output to `frontend/build/`.
3. Django's `WhiteNoise` serves the compiled React single-page app and static files directly from the root path (`/`).
4. `Procfile` manages process execution for web and background worker processes:
   * `web`: Gunicorn WSGI server.
   * `release`: Automatic migration execution.
   * `worker`: Celery task worker.

---

## 📄 License
Proprietary — Network Sales & Growth (NSG). All rights reserved.