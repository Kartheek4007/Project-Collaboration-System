from app.database import engine, Base
from sqlalchemy import text
from app import models

def migrate():
    print("Creating all new tables (if missing)...")
    models.Base.metadata.create_all(bind=engine)
    
    with engine.connect() as conn:
        # Add columns that may have been added incrementally
        migrations = [
            ("ALTER TABLE milestones ADD COLUMN description VARCHAR", "milestones.description"),
            ("ALTER TABLE time_logs ADD COLUMN description VARCHAR", "time_logs.description"),
            ("ALTER TABLE time_logs ADD COLUMN date TIMESTAMP WITHOUT TIME ZONE", "time_logs.date"),
            ("ALTER TABLE tasks ADD COLUMN progress INTEGER DEFAULT 0", "tasks.progress"),
            ("ALTER TABLE tasks ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now()", "tasks.created_at"),
        ]
        for sql, name in migrations:
            try:
                conn.execute(text(sql))
                conn.commit()
                print(f"  ✓ Added: {name}")
            except Exception:
                print(f"  - Skipped (already exists): {name}")

if __name__ == "__main__":
    migrate()
    print("\nMigration complete!")
