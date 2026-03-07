from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from .database import SessionLocal, engine, Base
from . import models
from .models import Company, User, UserRole, Project, ProjectCompany, ProjectStatus, Task, TaskPriority, TaskStatus
from .auth import get_password_hash

def seed_data():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Create Companies
        print("Checking/Creating companies...")
        company_a = db.query(Company).filter(Company.name == "TechSolutions Corp").first()
        if not company_a:
            company_a = Company(name="TechSolutions Corp", description="Leading software development firm", status="active")
            db.add(company_a)
            db.commit()
            db.refresh(company_a)
        
        company_b = db.query(Company).filter(Company.name == "Creative Designs Ltd").first()
        if not company_b:
            company_b = Company(name="Creative Designs Ltd", description="Full-service design agency", status="active")
            db.add(company_b)
            db.commit()
            db.refresh(company_b)
        print(f"Companies: {company_a.name} (ID: {company_a.id}), {company_b.name} (ID: {company_b.id})")

        # 2. Create Users
        print("Checking/Creating users...")
        users_data = [
            {"name": "Platform Admin", "email": "admin@collab.com", "pass": "admin123", "role": UserRole.SUPER_ADMIN, "cid": None},
            {"name": "Alice Admin", "email": "company@admin.com", "pass": "company123", "role": UserRole.COMPANY_ADMIN, "cid": company_a.id},
            {"name": "Bob Developer", "email": "employee@dev.com", "pass": "employee123", "role": UserRole.EMPLOYEE, "cid": company_a.id},
            {"name": "Charlie Client", "email": "client@client.com", "pass": "client123", "role": UserRole.CLIENT, "cid": None}
        ]
        
        for u in users_data:
            db_user = db.query(User).filter(User.email == u["email"]).first()
            if not db_user:
                db_user = User(
                    name=u["name"],
                    email=u["email"],
                    password_hash=get_password_hash(u["pass"]),
                    role=u["role"],
                    company_id=u["cid"]
                )
                db.add(db_user)
                db.commit()
                db.refresh(db_user)
                print(f"User created: {u['email']}")
            else:
                print(f"User exists: {u['email']}")

        # Get refs
        client = db.query(User).filter(User.email == "client@client.com").first()
        employee = db.query(User).filter(User.email == "employee@dev.com").first()

        # 3. Create a Project
        project_title = "NextGen Mobile App"
        project = db.query(Project).filter(Project.title == project_title).first()
        if not project:
            project = Project(
                title=project_title,
                description="A joint project to build a world-class mobile experience.",
                client_id=client.id,
                deadline=datetime.now() + timedelta(days=90),
                budget=50000.0,
                status=ProjectStatus.IN_PROGRESS
            )
            db.add(project)
            db.commit()
            db.refresh(project)
            print(f"Project created: {project.title}")
        else:
            print(f"Project exists: {project.title}")

        # 4. Associate Companies with Project
        pa = ProjectCompany(project_id=project.id, company_id=company_a.id)
        pb = ProjectCompany(project_id=project.id, company_id=company_b.id)
        db.add_all([pa, pb])
        
        # 5. Create a Task
        task = db.query(Task).filter(Task.title == "Backend API Implementation").first()
        if not task:
            task = Task(
                project_id=project.id,
                assigned_user_id=employee.id,
                assigned_company_id=company_a.id,
                title="Backend API Implementation",
                description="Develop the core REST APIs using FastAPI.",
                priority=TaskPriority.HIGH,
                status=TaskStatus.IN_PROGRESS,
                due_date=datetime.now() + timedelta(days=14),
                estimated_hours=40.0
            )
            db.add(task)
            db.commit()
            db.refresh(task)

        # 6. Create Milestones
        print("Checking/Creating milestones...")
        milestone = db.query(models.Milestone).filter(models.Milestone.project_id == project.id).first()
        if not milestone:
            milestone = models.Milestone(
                project_id=project.id,
                title="Alpha Infrastructure Release",
                description="Deployment of core database and API nodes.",
                deadline=datetime.now() + timedelta(days=30),
                status="In Progress"
            )
            db.add(milestone)
            db.commit()

        # 7. Create Time Logs
        print("Checking/Creating time logs...")
        log = db.query(models.TimeLog).filter(models.TimeLog.task_id == task.id).first()
        if not log:
            log = models.TimeLog(
                task_id=task.id,
                user_id=employee.id,
                hours=4.5,
                description="Initializing FastAPI project structure and base models.",
                date=datetime.now()
            )
            db.add(log)
            db.commit()

        # 8. Create Comments
        print("Checking/Creating comments...")
        comment = db.query(models.Comment).filter(models.Comment.task_id == task.id).first()
        if not comment:
            comment = models.Comment(
                task_id=task.id,
                user_id=employee.id,
                message="Core architecture is ready for node deployment. Proceeding to auth module."
            )
            db.add(comment)
            db.commit()

        print("Database successfully seeded with collaboration data!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
