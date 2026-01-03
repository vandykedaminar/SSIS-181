import psycopg2
import psycopg2.extras

# --- IMPORTANT ---
# This configuration MUST match the DB_CONFIG in your backend/app.py
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': 'postgre2314',
    'database': 'postgres'
}

# --- MSU-IIT Data ---
colleges_data = [
    {'code': 'CASS', 'name': 'College of Arts and Social Sciences'},
    {'code': 'CBAA', 'name': 'College of Business Administration and Accountancy'},
    {'code': 'CCS', 'name': 'College of Computer Studies'},
    {'code': 'CED', 'name': 'College of Education'},
    {'code': 'COE', 'name': 'College of Engineering and Technology'},
    {'code': 'CON', 'name': 'College of Nursing'},
    {'code': 'CSM', 'name': 'College of Science and Mathematics'},
    {'code': 'SEd', 'name': 'School of Engineering Technology'},
    {'code': 'CIDS', 'name': 'Center for Integrated Devolved Studies'},
]

programs_data = [
    # CASS Programs
    {'code': 'BAEL', 'name': 'Bachelor of Arts in English Language', 'college_code': 'CASS'},
    {'code': 'BASS', 'name': 'Bachelor of Arts in Sociology', 'college_code': 'CASS'},
    {'code': 'BAF', 'name': 'Bachelor of Arts in Filipino', 'college_code': 'CASS'},
    {'code': 'BAH', 'name': 'Bachelor of Arts in History', 'college_code': 'CASS'},
    {'code': 'BAP', 'name': 'Bachelor of Arts in Political Science', 'college_code': 'CASS'},
    {'code': 'PSYCH', 'name': 'Bachelor of Science in Psychology', 'college_code': 'CASS'},
    # CBAA Programs
    {'code': 'BSA', 'name': 'Bachelor of Science in Accountancy', 'college_code': 'CBAA'},
    {'code': 'BSBA-M', 'name': 'BS in Business Administration major in Marketing Management', 'college_code': 'CBAA'},
    {'code': 'BSBA-E', 'name': 'BS in Business Administration major in Economics', 'college_code': 'CBAA'},
    {'code': 'BSBA-FM', 'name': 'BS in Business Administration major in Financial Management', 'college_code': 'CBAA'},
    # CCS Programs
    {'code': 'BSCS', 'name': 'Bachelor of Science in Computer Science', 'college_code': 'CCS'},
    {'code': 'BSIT', 'name': 'Bachelor of Science in Information Technology', 'college_code': 'CCS'},
    # CED Programs
    {'code': 'BSED-ENG', 'name': 'Bachelor of Secondary Education major in English', 'college_code': 'CED'},
    {'code': 'BSED-FIL', 'name': 'Bachelor of Secondary Education major in Filipino', 'college_code': 'CED'},
    {'code': 'BSED-MATH', 'name': 'Bachelor of Secondary Education major in Mathematics', 'college_code': 'CED'},
    {'code': 'BSED-SCI', 'name': 'Bachelor of Secondary Education major in Science', 'college_code': 'CED'},
    {'code': 'BSED-SS', 'name': 'Bachelor of Secondary Education major in Social Studies', 'college_code': 'CED'},
    {'code': 'BEED', 'name': 'Bachelor of Elementary Education', 'college_code': 'CED'},
    {'code': 'BLIS', 'name': 'Bachelor of Library and Information Science', 'college_code': 'CED'},
    {'code': 'BPED', 'name': 'Bachelor of Physical Education', 'college_code': 'CED'},
    # COE Programs
    {'code': 'BSCE', 'name': 'Bachelor of Science in Civil Engineering', 'college_code': 'COE'},
    {'code': 'BSChE', 'name': 'Bachelor of Science in Chemical Engineering', 'college_code': 'COE'},
    {'code': 'BSCoE', 'name': 'Bachelor of Science in Computer Engineering', 'college_code': 'COE'},
    {'code': 'BSEE', 'name': 'Bachelor of Science in Electrical Engineering', 'college_code': 'COE'},
    {'code': 'BSECE', 'name': 'Bachelor of Science in Electronics Engineering', 'college_code': 'COE'},
    {'code': 'BSME', 'name': 'Bachelor of Science in Mechanical Engineering', 'college_code': 'COE'},
    {'code': 'BSMET', 'name': 'Bachelor of Science in Metallurgical Engineering', 'college_code': 'COE'},
    # CON Programs
    {'code': 'BSN', 'name': 'Bachelor of Science in Nursing', 'college_code': 'CON'},
    # CSM Programs
    {'code': 'BS BIO', 'name': 'Bachelor of Science in Biology', 'college_code': 'CSM'},
    {'code': 'BS CHEM', 'name': 'Bachelor of Science in Chemistry', 'college_code': 'CSM'},
    {'code': 'BS MATH', 'name': 'Bachelor of Science in Mathematics', 'college_code': 'CSM'},
    {'code': 'BS STAT', 'name': 'Bachelor of Science in Statistics', 'college_code': 'CSM'},
    {'code': 'BS PHYSICS', 'name': 'Bachelor of Science in Physics', 'college_code': 'CSM'},
    # SEd Programs
    {'code': 'BSET-AT', 'name': 'BS in Engineering Technology - Automotive Technology', 'college_code': 'SEd'},
    {'code': 'BSET-CT', 'name': 'BS in Engineering Technology - Civil Technology', 'college_code': 'SEd'},
    {'code': 'BSET-DT', 'name': 'BS in Engineering Technology - Drafting Technology', 'college_code': 'SEd'},
    {'code': 'BSET-ET', 'name': 'BS in Engineering Technology - Electrical Technology', 'college_code': 'SEd'},
    {'code': 'BSET-ELXT', 'name': 'BS in Engineering Technology - Electronics Technology', 'college_code': 'SEd'},
    {'code': 'BSET-MT', 'name': 'BS in Engineering Technology - Mechanical Technology', 'college_code': 'SEd'},
    # CIDS Programs
    {'code': 'BS-DEVT', 'name': 'Bachelor of Science in Development Communication', 'college_code': 'CIDS'},
]

def populate_database():
    """Connects to the database and inserts data."""
    conn = None
    try:
        print("Connecting to the database...")
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        # --- Populate Colleges ---
        # "ON CONFLICT (code) DO NOTHING" makes the script safe to run multiple times.
        # If a college with the same code already exists, it will be skipped.
        print("Populating 'college' table...")
        college_insert_query = "INSERT INTO college (code, name) VALUES (%(code)s, %(name)s) ON CONFLICT (code) DO NOTHING"
        psycopg2.extras.execute_batch(cur, college_insert_query, colleges_data)
        print(f"-> {cur.rowcount} new colleges inserted.")

        # --- Populate Programs ---
        print("Populating 'program' table...")
        program_insert_query = "INSERT INTO program (code, name, college_code) VALUES (%(code)s, %(name)s, %(college_code)s) ON CONFLICT (code) DO NOTHING"
        psycopg2.extras.execute_batch(cur, program_insert_query, programs_data)
        print(f"-> {cur.rowcount} new programs inserted.")
        
        # Commit the changes
        conn.commit()
        print("\nDatabase population complete!")

    except psycopg2.Error as e:
        print(f"Database error: {e}")
        if conn:
            conn.rollback() # Roll back the transaction on error
    finally:
        if conn:
            conn.close()
            print("Database connection closed.")

if __name__ == "__main__":
    populate_database()