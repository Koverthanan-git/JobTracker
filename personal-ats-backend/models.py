from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Boolean, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

Base = declarative_base()

class Company(Base):
    __tablename__ = "companies"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    name = Column(String, nullable=False)
    industry = Column(String)
    website = Column(String)
    jobs = relationship("Job", back_populates="company")

class Job(Base):
    __tablename__ = "jobs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    salary_range = Column(String)
    company = relationship("Company", back_populates="jobs")
    application = relationship("Application", back_populates="job", uselist=False)

class Application(Base):
    __tablename__ = "applications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"))
    stage_id = Column(Integer, ForeignKey("stages.id"))
    date_applied = Column(Date, default=datetime.utcnow)
    resume_url = Column(String, nullable=True)
    cover_letter_url = Column(String, nullable=True)
    
    job = relationship("Job", back_populates="application")
    tasks = relationship("Task", back_populates="application")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id"))
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    due_date = Column(DateTime)
    is_completed = Column(Boolean, default=False)
    priority = Column(String, default="Medium")
    
    application = relationship("Application", back_populates="tasks")