import os
import csv
import io
import uuid
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Body
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from dotenv import load_dotenv

try:
    from . import models, database, schemas
except (ImportError, ValueError):
    import models, database, schemas

load_dotenv()

app = FastAPI(title="Personal ATS API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Dependency ───────────────────────────────────────────────────────────────
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

USER_ID = "test-user-uuid"  # TODO: replace with JWT auth.uid()

# ─── Pydantic Schemas ─────────────────────────────────────────────────────────
class ApplicationCreate(BaseModel):
    job_title: str
    company: str
    location: Optional[str] = None
    salary_range: Optional[str] = None
    job_url: Optional[str] = None
    stage_id: int = 2
    notes: Optional[str] = None

class ApplicationUpdate(BaseModel):
    job_title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    job_url: Optional[str] = None
    stage_id: Optional[int] = None
    notes: Optional[str] = None

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    priority: str = "Medium"
    application_id: Optional[str] = None
    is_completed: bool = False

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None
    is_completed: Optional[bool] = None

# ─── Health ───────────────────────────────────────────────────────────────────
@app.get("/")
def health_check():
    return {"status": "Personal ATS API v2.0 running", "cors": "Enabled"}

# ─── Applications CRUD ────────────────────────────────────────────────────────
@app.get("/applications")
def get_applications(db: Session = Depends(get_db)):
    apps = db.query(models.Application).filter(models.Application.user_id == USER_ID).all()
    result = []
    for a in apps:
        result.append({
            "id": str(a.id),
            "job_title": a.job.title if a.job else "Unknown",
            "company": a.job.company.name if (a.job and a.job.company) else "Unknown",
            "location": None,
            "salary_range": a.job.salary_range if a.job else None,
            "job_url": None,
            "stage_id": a.stage_id,
            "date_applied": str(a.date_applied),
            "notes": None,
            "resume_url": a.resume_url,
        })
    return result

@app.post("/applications", status_code=201)
def create_application(data: ApplicationCreate, db: Session = Depends(get_db)):
    # Create or find company
    company = models.Company(
        id=uuid.uuid4(), user_id=USER_ID, name=data.company
    )
    db.add(company)
    db.flush()

    # Create job
    job = models.Job(
        id=uuid.uuid4(), user_id=USER_ID, company_id=company.id,
        title=data.job_title, salary_range=data.salary_range
    )
    db.add(job)
    db.flush()

    # Create application
    application = models.Application(
        id=uuid.uuid4(), user_id=USER_ID, job_id=job.id,
        stage_id=data.stage_id
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    return {
        "id": str(application.id),
        "job_title": data.job_title,
        "company": data.company,
        "location": data.location,
        "salary_range": data.salary_range,
        "job_url": data.job_url,
        "stage_id": application.stage_id,
        "date_applied": str(application.date_applied),
        "notes": data.notes,
    }

@app.put("/applications/{app_id}")
def update_application(app_id: str, data: ApplicationUpdate, db: Session = Depends(get_db)):
    application = db.query(models.Application).filter(models.Application.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    if data.stage_id is not None:
        application.stage_id = data.stage_id
    if data.job_title and application.job:
        application.job.title = data.job_title
    if data.company and application.job and application.job.company:
        application.job.company.name = data.company
    if data.salary_range and application.job:
        application.job.salary_range = data.salary_range
    db.commit()
    return {"message": "Updated successfully", "id": app_id}

@app.delete("/applications/{app_id}", status_code=204)
def delete_application(app_id: str, db: Session = Depends(get_db)):
    application = db.query(models.Application).filter(models.Application.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(application)
    db.commit()

@app.post("/applications/move")
def move_application(app_id: str, stage_id: int, db: Session = Depends(get_db)):
    application = db.query(models.Application).filter(models.Application.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    application.stage_id = stage_id
    db.commit()
    return {"message": "Moved successfully", "new_stage": stage_id}

# ─── Tasks CRUD ───────────────────────────────────────────────────────────────
@app.get("/tasks/upcoming")
def get_upcoming_tasks(db: Session = Depends(get_db)):
    tasks = db.query(models.Task).filter(
        models.Task.user_id == USER_ID,
        models.Task.is_completed == False
    ).order_by(models.Task.due_date.asc()).all()
    return [{
        "id": str(t.id),
        "application_id": str(t.application_id) if t.application_id else None,
        "title": t.title,
        "description": t.description,
        "due_date": str(t.due_date) if t.due_date else None,
        "is_completed": t.is_completed,
        "priority": t.priority,
    } for t in tasks]

@app.post("/tasks", status_code=201)
def create_task(data: TaskCreate, db: Session = Depends(get_db)):
    due = None
    if data.due_date:
        try:
            due = datetime.strptime(data.due_date, "%Y-%m-%d")
        except ValueError:
            pass
    task = models.Task(
        id=uuid.uuid4(), user_id=USER_ID,
        title=data.title, description=data.description,
        due_date=due, priority=data.priority,
        is_completed=data.is_completed,
        application_id=data.application_id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return {
        "id": str(task.id), "title": task.title,
        "description": task.description,
        "due_date": str(task.due_date) if task.due_date else None,
        "is_completed": task.is_completed, "priority": task.priority,
    }

@app.put("/tasks/{task_id}")
def update_task(task_id: str, data: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if data.title is not None: task.title = data.title
    if data.description is not None: task.description = data.description
    if data.priority is not None: task.priority = data.priority
    if data.is_completed is not None: task.is_completed = data.is_completed
    if data.due_date is not None:
        try: task.due_date = datetime.strptime(data.due_date, "%Y-%m-%d")
        except ValueError: pass
    db.commit()
    return {"message": "Task updated", "id": task_id}

@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: str, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()

# ─── Analytics ────────────────────────────────────────────────────────────────
@app.get("/analytics/summary")
def get_analytics(db: Session = Depends(get_db)):
    total = db.query(models.Application).filter(models.Application.user_id == USER_ID).count()
    responded = db.query(models.Application).filter(
        models.Application.user_id == USER_ID,
        models.Application.stage_id > 2
    ).count()
    response_rate = f"{int((responded / total) * 100)}%" if total > 0 else "0%"

    stage_counts = db.query(
        models.Application.stage_id, func.count(models.Application.id)
    ).filter(models.Application.user_id == USER_ID).group_by(models.Application.stage_id).all()

    stage_names = {1: "Wishlist", 2: "Applied", 3: "Interview", 4: "Offer", 5: "Rejected"}
    by_stage = [{"stage_id": s, "name": stage_names.get(s, f"Stage {s}"), "count": c} for s, c in stage_counts]

    # Weekly trend (last 4 weeks)
    weekly = []
    for i in range(3, -1, -1):
        week_start = datetime.utcnow() - timedelta(weeks=i+1)
        week_end = datetime.utcnow() - timedelta(weeks=i)
        count = db.query(models.Application).filter(
            models.Application.user_id == USER_ID,
            models.Application.date_applied.between(week_start.date(), week_end.date())
        ).count()
        weekly.append({"week": week_start.strftime("W%U"), "count": count})

    return {
        "total": total,
        "response_rate": response_rate,
        "by_stage": by_stage,
        "weekly": weekly,
    }

# ─── CSV Export ───────────────────────────────────────────────────────────────
@app.get("/export/csv")
def export_csv(db: Session = Depends(get_db)):
    apps = db.query(models.Application).filter(models.Application.user_id == USER_ID).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "job_title", "company", "stage_id", "date_applied"])
    for a in apps:
        writer.writerow([
            str(a.id),
            a.job.title if a.job else "",
            a.job.company.name if (a.job and a.job.company) else "",
            a.stage_id,
            str(a.date_applied),
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=applications.csv"}
    )

# ─── Signup (kept for compatibility) ─────────────────────────────────────────
@app.post("/signup")
def signup_submit(payload: dict = Body(...)):
    return {"message": "Auth is handled by Supabase on the frontend", "payload": payload}