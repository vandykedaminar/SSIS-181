import psycopg2

# Match your backend/app.py config
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': 'postgre2314',
    'database': 'postgres'
}

def reset_student_table():
    conn = None
    try:
        print("Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        print("Deleting all data from 'student' table...")
        # TRUNCATE is faster than DELETE and resets data cleanly
        cur.execute("TRUNCATE TABLE student CASCADE;")
        
        conn.commit()
        print("Success! Student table is now empty.")

    except psycopg2.Error as e:
        print(f"Error: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    reset_student_table()