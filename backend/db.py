import psycopg2
import psycopg2.extras

DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': 'postgre2314',
    'database': 'postgres'
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