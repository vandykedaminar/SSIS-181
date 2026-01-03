from db import get_db_connection
import psycopg2

def get_all():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Includes joining with program to get college_code just like original
        cur.execute("""
            SELECT s.id, s.first_name, s.last_name, s.program_code, s.year, s.gender, s.photo_url, p.college_code
            FROM student s
            LEFT JOIN program p ON s.program_code = p.code
        """)
        students = cur.fetchall()
        # Ensure format matches frontend expectations
        return [[s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7]] for s in students]
    finally:
        cur.close()
        conn.close()

def create(data):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        sid = data.get('id')
        course_code = data.get('course')

        # Optional: Check if program exists
        if course_code:
            cur.execute("SELECT 1 FROM program WHERE code = %s", (course_code,))
            if not cur.fetchone():
                return False, f"Program '{course_code}' not found."

        cur.execute("""
            INSERT INTO student (id, first_name, last_name, program_code, year, gender, photo_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (sid, data.get('first_name'), data.get('last_name'), course_code, 
              data.get('year'), data.get('gender'), data.get('photo_url')))
        conn.commit()
        return True, "Student added successfully"
    except psycopg2.IntegrityError:
        conn.rollback()
        return False, f"Student with ID '{sid}' already exists."
    except Exception as e:
        conn.rollback()
        return False, str(e)
    finally:
        cur.close()
        conn.close()

def delete(sid):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT 1 FROM student WHERE id = %s", (sid,))
        if not cur.fetchone():
            return False, "Student not found"
        cur.execute("DELETE FROM student WHERE id = %s", (sid,))
        conn.commit()
        return True, ""
    except Exception as e:
        conn.rollback()
        return False, str(e)
    finally:
        cur.close()
        conn.close()

def update(original_id, data):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT 1 FROM student WHERE id = %s", (original_id,))
        if not cur.fetchone():
            return False, "Student not found", 404

        cur.execute("""
            UPDATE student SET id = %s, first_name = %s, last_name = %s, program_code = %s, year = %s, gender = %s, photo_url = %s
            WHERE id = %s
        """, (data.get('id'), data.get('first_name'), data.get('last_name'), data.get('course'), 
              data.get('year'), data.get('gender'), data.get('photo_url'), original_id))
        conn.commit()
        return True, "Student updated successfully", 200
    except psycopg2.IntegrityError:
        conn.rollback()
        return False, "Student ID collision or DB error.", 409
    except Exception as e:
        conn.rollback()
        return False, str(e), 500
    finally:
        cur.close()
        conn.close()