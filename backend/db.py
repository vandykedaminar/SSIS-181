import os
from dotenv import load_dotenv
import psycopg2
import psycopg2.extras

load_dotenv()


DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'port': os.getenv('DB_PORT'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

def create_tables():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS college (
                code VARCHAR(16) PRIMARY KEY,
                name VARCHAR(80) NOT NULL
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS program (
                code VARCHAR(16) PRIMARY KEY,
                name VARCHAR(120) NOT NULL,
                college_code VARCHAR(16) REFERENCES college(code) ON UPDATE CASCADE ON DELETE SET NULL
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS student (
                id VARCHAR(12) PRIMARY KEY,
                first_name VARCHAR(80) NOT NULL,
                last_name VARCHAR(80) NOT NULL,
                program_code VARCHAR(16) REFERENCES program(code) ON UPDATE CASCADE ON DELETE SET NULL,
                year VARCHAR(8) NOT NULL,
                gender VARCHAR(16) NOT NULL,
                photo_url VARCHAR(500)
            )
        """)
        conn.commit()
        print("Tables created successfully.")
    except Exception as e:
        conn.rollback()
        print(f"Error creating tables: {e}")
    finally:
        cur.close()
        conn.close()