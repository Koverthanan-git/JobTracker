from sqlalchemy.orm import Session
from uuid import UUID
import models
import schemas

def get_applications(db: Session, user_id: str):
    return db.query(models.Application).filter(models.Application.user_id == user_id).all()

def create_job_and_application(db: Session, job_data: schemas.JobBase, user_id: str):
    # 1. Create Job
    db_job = models.Job(
        user_id=user_id,
        title=job_data.title,
        description=job_data.description,
        salary_range=job_data.salary_range
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    
    # 2. Create Application linked to job
    db_app = models.Application(
        user_id=user_id,
        job_id=db_job.id,
        stage_id=2  # Default to 'Applied'
    )
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

def update_application_stage(db: Session, app_id: UUID, stage_id: int):
    db_app = db.query(models.Application).filter(models.Application.id == app_id).first()
    if db_app:
        db_app.stage_id = stage_id
        db.commit()
        db.refresh(db_app)
    return db_app