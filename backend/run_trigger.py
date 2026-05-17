import os
import sys

# Add backend directory to path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text

def apply_trigger():
    engine = create_engine("postgresql://postgres:bhavya@localhost:5432/lostAndFound")
    # Read the SQL file
    sql_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database', 'trigger.sql')
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql = f.read()

    # Split commands by double dollar signs or something? 
    # SQLAlchemy can run the whole string if it's properly formatted, or we can use raw connection
    with engine.connect() as conn:
        # We need to execute the drop, the create function, and the create trigger
        # SQLAlchemy connection.execute handles this fine if we pass it as text()
        # but for multiple statements it's better to use raw DBAPI connection
        raw_conn = conn.connection
        cursor = raw_conn.cursor()
        try:
            cursor.execute(sql)
            raw_conn.commit()
            print("Successfully executed trigger.sql")
        except Exception as e:
            raw_conn.rollback()
            print(f"Error executing SQL: {e}")

if __name__ == "__main__":
    apply_trigger()
