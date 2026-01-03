import psycopg2
import psycopg2.extras
from faker import Faker
import random

# --- IMPORTANT ---
# This configuration MUST match your backend's DB_CONFIG
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': 'postgre2314',
    'database': 'postgres'
}

# --- Data for Random Generation ---
# This list should contain the program codes you added previously
PROGRAM_CODES = [
    'BAEL', 'BASS', 'BAF', 'BAH', 'BAP', 'PSYCH', 'BSA', 'BSBA-M', 'BSBA-E',
    'BSBA-FM', 'BSCS', 'BSIT', 'BSED-ENG', 'BSED-FIL', 'BSED-MATH', 'BSED-SCI',
    'BSED-SS', 'BEED', 'BLIS', 'BPED', 'BSCE', 'BSChE', 'BSCoE', 'BSEE',
    'BSECE', 'BSME', 'BSMET', 'BSN', 'BS BIO', 'BS CHEM', 'BS MATH', 'BS STAT',
    'BS PHYSICS', 'BSET-AT', 'BSET-CT', 'BSET-DT', 'BSET-ET', 'BSET-ELXT',
    'BSET-MT', 'BS-DEVT'
]

YEAR_LEVELS = ['1', '2', '3', '4', '5']
GENDERS = ['Male', 'Female']

def generate_students(count=50):
    """Generates a list of fake student data."""
    fake = Faker()
    students_data = []
    used_ids = set()

    print(f"Generating {count} unique student records...")
    while len(students_data) < count:
        year = random.randint(2020, 2023)
        num = random.randint(1000, 9999)
        student_id = f"{year}-{num}"

        if student_id not in used_ids:
            used_ids.add(student_id)
            gender = random.choice(GENDERS)
            first_name = fake.first_name_male() if gender == 'Male' else fake.first_name_female()
            
            student = {
                'id': student_id,
                'first_name': first_name,
                'last_name': fake.last_name(),
                'program_code': random.choice(PROGRAM_CODES),
                'year': random.choice(YEAR_LEVELS),
                'gender': gender,
                'photo_url': None  # This will be inserted as NULL
            }
            students_data.append(student)
            
    print("Student data generated.")
    return students_data

def populate_database():
    """Connects to the database and inserts student data."""
    conn = None
    try:
        students_to_insert = generate_students()
        
        print("\nConnecting to the database...")
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        # "ON CONFLICT (id) DO NOTHING" makes the script safe to run multiple times.
        print("Populating 'student' table...")
        student_insert_query = """
            INSERT INTO student (id, first_name, last_name, program_code, year, gender, photo_url) 
            VALUES (%(id)s, %(first_name)s, %(last_name)s, %(program_code)s, %(year)s, %(gender)s, %(photo_url)s)
            ON CONFLICT (id) DO NOTHING
        """
        psycopg2.extras.execute_batch(cur, student_insert_query, students_to_insert)
        print(f"-> {cur.rowcount} new students inserted.")
        
        # Commit the changes
        conn.commit()
        print("\nDatabase population for students complete!")

    except psycopg2.Error as e:
        print(f"Database error: {e}")
        print("IMPORTANT: Please ensure you have run the college/program population script first.")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()
            print("Database connection closed.")

if __name__ == "__main__":
    populate_database()