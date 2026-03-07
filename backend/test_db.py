import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("DATABASE_URL")
if url:
    url = url.strip().strip('"').strip("'")
    print(f"Full URL: {url}")
    try:
        engine = create_engine(url)
        with engine.connect() as conn:
            print("Successfully connected!")
    except Exception as e:
        print(f"Error: {e}")
else:
    print("DATABASE_URL not found in .env")
