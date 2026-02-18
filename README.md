# 🎯 JobTracker — Personal ATS

A full-stack **Personal Applicant Tracking System** built with Next.js, FastAPI, and Supabase.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase) ![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-red)

---

## ✨ Features

- **Kanban Board** — Drag-and-drop pipeline with 5 stages: Wishlist → Applied → Interview → Offer → Rejected
- **TanStack Query** — Optimistic UI updates with smart cache invalidation
- **Supabase Auth** — Email/password authentication with session persistence
- **Resume Parser** — Upload PDF/TXT/CSV resumes and get AI-powered task suggestions
- **Calendar View** — `react-day-picker` calendar with tasks as events
- **Analytics Dashboard** — Application success rate, weekly activity, stage distribution
- **Import/Export** — CSV import with validation, JSON & CSV export
- **Dark Mode** — Theme toggle built in
- **Responsive Design** — Mobile-friendly with collapsible sidebar

---

## 🏗️ Project Structure

```
JobTracker/
├── personal-ats-backend/     # FastAPI backend
│   ├── main.py               # API routes (full CRUD)
│   ├── models.py             # SQLAlchemy ORM models
│   ├── schemas.py            # Pydantic schemas
│   ├── database.py           # DB connection
│   ├── crud.py               # DB operations
│   └── requirements.txt      # Python dependencies
│
└── personel-ats-frontend/    # Next.js frontend
    ├── pages/
    │   ├── index.tsx         # Main app entry
    │   ├── login.tsx         # Login page
    │   ├── register.tsx      # Register page
    │   └── api/
    │       └── parse-resume.ts  # Resume parsing API route
    ├── src/
    │   ├── App.tsx           # Main layout + navigation
    │   ├── components/
    │   │   ├── KanbanBoard.tsx      # 5-stage drag-and-drop board
    │   │   ├── AnalyticsDashboard.tsx
    │   │   ├── AgendaView.tsx       # Calendar + tasks
    │   │   ├── ResumeParser.tsx     # PDF upload + suggestions
    │   │   └── DataTools.tsx        # Import/Export
    │   └── lib/
    │       ├── api.ts               # TanStack Query hooks
    │       ├── supabase.ts          # Supabase client
    │       ├── AuthContext.tsx      # Auth provider
    │       ├── QueryProvider.tsx    # TanStack Query provider
    │       └── ToastContext.tsx     # Toast notifications
    └── styles/
        └── globals.css              # Premium design system
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase account (free tier)

### 1. Clone the repo
```bash
git clone https://github.com/Koverthanan-git/JobTracker.git
cd JobTracker
```

### 2. Backend Setup
```bash
cd personal-ats-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Fill in your Supabase credentials in .env

uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd personel-ats-frontend
npm install

# Create .env.local file
cp .env.example .env.local
# Fill in your Supabase credentials

npm run dev
```

### 4. Open the app
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## 🔧 Environment Variables

### Backend (`personal-ats-backend/.env`)
```env
DATABASE_URL=postgresql://postgres:PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_KEY=your_supabase_anon_key
```

### Frontend (`personel-ats-frontend/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/applications` | List all applications |
| POST | `/applications` | Create application |
| PUT | `/applications/{id}` | Update application |
| DELETE | `/applications/{id}` | Delete application |
| POST | `/applications/move` | Move to new stage |
| GET | `/tasks/upcoming` | List upcoming tasks |
| POST | `/tasks` | Create task |
| PUT | `/tasks/{id}` | Update task |
| DELETE | `/tasks/{id}` | Delete task |
| GET | `/analytics/summary` | Analytics data |
| GET | `/export/csv` | Export as CSV |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| State | TanStack Query (React Query) |
| Auth | Supabase Auth (Email/Password) |
| Backend | FastAPI, Python |
| Database | PostgreSQL via Supabase |
| Drag & Drop | @hello-pangea/dnd |
| Charts | Recharts |
| Calendar | react-day-picker |
| Icons | Lucide React |

---

## 📄 License

MIT License — feel free to use and modify.
