from pydantic import BaseModel, HttpUrl
from uuid import UUID
from datetime import datetime, date
from typing import List, Optional

# --- Base Schemas ---
class TaskBase(BaseModel):
    title: str
    due_date: Optional[datetime] = None
    priority: str = "Medium"
    is_completed: bool = False

class ContactBase(BaseModel):
    name: str
    role: Optional[str] = None
    email: Optional[str] = None
    linkedin_url: Optional[str] = None

# --- Application & Job Schemas ---
class JobBase(BaseModel):
    title: str
    company_name: str # Simplified for logic
    description: Optional[str] = None
    salary_range: Optional[str] = None
    location: Optional[str] = None

class ApplicationCreate(BaseModel):
    job_id: UUID
    stage_id: int = 2 # Defaults to 'Applied'
    date_applied: date = date.today()

class ApplicationUpdate(BaseModel):
    stage_id: Optional[int] = None
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: UUID
    job_id: UUID
    stage_id: int
    date_applied: date
    
    class Config:
        from_attributes = True