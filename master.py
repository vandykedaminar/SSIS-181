import psycopg2
import psycopg2.extras
from faker import Faker
import random

# Database Configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': 'postgre2314',
    'database': 'postgres'
}

# --- 1. DATA DEFINITIONS ---
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
    {'code': 'BAEL', 'name': 'Bachelor of Arts in English Language', 'college_code': 'CASS'},
    {'code': 'BASS', 'name': 'Bachelor of Arts in Sociology', 'college_code': 'CASS'},
    {'code': 'BAF', 'name': 'Bachelor of Arts in Filipino', 'college_code': 'CASS'},
    {'code': 'BAH', 'name': 'Bachelor of Arts in History', 'college_code': 'CASS'},
    {'code': 'BAP', 'name': 'Bachelor of Arts in Political Science', 'college_code': 'CASS'},
    {'code': 'PSYCH', 'name': 'Bachelor of Science in Psychology', 'college_code': 'CASS'},
    {'code': 'BSA', 'name': 'Bachelor of Science in Accountancy', 'college_code': 'CBAA'},
    {'code': 'BSBA-M', 'name': 'BS in Business Administration major in Marketing Management', 'college_code': 'CBAA'},
    {'code': 'BSBA-E', 'name': 'BS in Business Administration major in Economics', 'college_code': 'CBAA'},
    {'code': 'BSBA-FM', 'name': 'BS in Business Administration major in Financial Management', 'college_code': 'CBAA'},
    {'code': 'BSCS', 'name': 'Bachelor of Science in Computer Science', 'college_code': 'CCS'},
    {'code': 'BSIT', 'name': 'Bachelor of Science in Information Technology', 'college_code': 'CCS'},
    {'code': 'BSED-ENG', 'name': 'Bachelor of Secondary Education major in English', 'college_code': 'CED'},
    {'code': 'BSED-FIL', 'name': 'Bachelor of Secondary Education major in Filipino', 'college_code': 'CED'},
    {'code': 'BSED-MATH', 'name': 'Bachelor of Secondary Education major in Mathematics', 'college_code': 'CED'},
    {'code': 'BSED-SCI', 'name': 'Bachelor of Secondary Education major in Science', 'college_code': 'CED'},
    {'code': 'BSED-SS', 'name': 'Bachelor of Secondary Education major in Social Studies', 'college_code': 'CED'},
    {'code': 'BEED', 'name': 'Bachelor of Elementary Education', 'college_code': 'CED'},
    {'code': 'BLIS', 'name': 'Bachelor of Library and Information Science', 'college_code': 'CED'},
    {'code': 'BPED', 'name': 'Bachelor of Physical Education', 'college_code': 'CED'},
    {'code': 'BSCE', 'name': 'Bachelor of Science in Civil Engineering', 'college_code': 'COE'},
    {'code': 'BSChE', 'name': 'Bachelor of Science in Chemical Engineering', 'college_code': 'COE'},
    {'code': 'BSCoE', 'name': 'Bachelor of Science in Computer Engineering', 'college_code': 'COE'},
    {'code': 'BSEE', 'name': 'Bachelor of Science in Electrical Engineering', 'college_code': 'COE'},
    {'code': 'BSECE', 'name': 'Bachelor of Science in Electronics Engineering', 'college_code': 'COE'},
    {'code': 'BSME', 'name': 'Bachelor of Science in Mechanical Engineering', 'college_code': 'COE'},
    {'code': 'BSMET', 'name': 'Bachelor of Science in Metallurgical Engineering', 'college_code': 'COE'},
    {'code': 'BSN', 'name': 'Bachelor of Science in Nursing', 'college_code': 'CON'},
    {'code': 'BS BIO', 'name': 'Bachelor of Science in Biology', 'college_code': 'CSM'},
    {'code': 'BS CHEM', 'name': 'Bachelor of Science in Chemistry', 'college_code': 'CSM'},
    {'code': 'BS MATH', 'name': 'Bachelor of Science in Mathematics', 'college_code': 'CSM'},
    {'code': 'BS STAT', 'name': 'Bachelor of Science in Statistics', 'college_code': 'CSM'},
    {'code': 'BS PHYSICS', 'name': 'Bachelor of Science in Physics', 'college_code': 'CSM'},
    {'code': 'BSET-AT', 'name': 'BS in Engineering Technology - Automotive Technology', 'college_code': 'SEd'},
    {'code': 'BSET-CT', 'name': 'BS in Engineering Technology - Civil Technology', 'college_code': 'SEd'},
    {'code': 'BSET-DT', 'name': 'BS in Engineering Technology - Drafting Technology', 'college_code': 'SEd'},
    {'code': 'BSET-ET', 'name': 'BS in Engineering Technology - Electrical Technology', 'college_code': 'SEd'},
    {'code': 'BSET-ELXT', 'name': 'BS in Engineering Technology - Electronics Technology', 'college_code': 'SEd'},
    {'code': 'BSET-MT', 'name': 'BS in Engineering Technology - Mechanical Technology', 'college_code': 'SEd'},
    {'code': 'BS-DEVT', 'name': 'Bachelor of Science in Development Communication', 'college_code': 'CIDS'},
]

YEAR_LEVELS = ['1', '2', '3', '4', '5']
GENDERS = ['Male', 'Female']

def run_master_script(count=100):
    conn = None
    try:
        print("Connecting to the database...")
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        # 1. Clear Students (to prevent duplicates or old data)
        print("1. Clearing existing student data...")
        cur.execute("TRUNCATE TABLE student CASCADE;")
        
        # 2. Ensure Colleges Exist
        print("2. Re-verifying Colleges...")
        college_query = "INSERT INTO college (code, name) VALUES (%(code)s, %(name)s) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name"
        psycopg2.extras.execute_batch(cur, college_query, colleges_data)

        # 3. Ensure Programs Exist
        print("3. Re-verifying Programs...")
        program_query = "INSERT INTO program (code, name, college_code) VALUES (%(code)s, %(name)s, %(college_code)s) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, college_code = EXCLUDED.college_code"
        psycopg2.extras.execute_batch(cur, program_query, programs_data)

        # 4. Fetch valid programs from DB (Crucial step for your issue)
        print("4. Fetching valid program codes from DB...")
        cur.execute("SELECT code FROM program")
        valid_programs = [row[0] for row in cur.fetchall()]
        
        if not valid_programs:
            print("Error: No programs found in database!")
            return

        # 5. Generate and Insert Students
        print(f"5. Generating {count} new students...")
        fake = Faker()
        students_data = []
        used_ids = set()

        while len(students_data) < count:
            year = random.randint(2018, 2024)
            num = random.randint(1000, 9999)
            student_id = f"{year}-{num}"

            if student_id not in used_ids:
                used_ids.add(student_id)
                gender = random.choice(GENDERS)
                first_name = fake.first_name_male() if gender == 'Male' else fake.first_name_female()
                
                # Pick a program code that we KNOW exists in the DB
                chosen_program = random.choice(valid_programs)

                student = {
                    'id': student_id,
                    'first_name': first_name,
                    'last_name': fake.last_name(),
                    'program_code': chosen_program,
                    'year': random.choice(YEAR_LEVELS),
                    'gender': gender,
                    'photo_url': None 
                }
                students_data.append(student)

        student_query = """
            INSERT INTO student (id, first_name, last_name, program_code, year, gender, photo_url) 
            VALUES (%(id)s, %(first_name)s, %(last_name)s, %(program_code)s, %(year)s, %(gender)s, %(photo_url)s)
        """
        psycopg2.extras.execute_batch(cur, student_query, students_data)
        print(f"-> Successfully inserted {len(students_data)} students.")

        conn.commit()
        print("\nAll done! Database is fixed and populated.")

    except psycopg2.Error as e:
        print(f"Database error: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    run_master_script(100)