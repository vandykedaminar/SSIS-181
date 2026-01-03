from db import get_db_connection
import psycopg2

def get_all():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT code, name, college_code FROM program")
        programs = cur.fetchall()
        return [[p[0], p[1], p[2]] for p in programs]
    finally:
        cur.close()
        conn.close()

def create(code, name, college_code):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Validate College exists
        cur.execute("SELECT 1 FROM college WHERE code = %s", (college_code,))
        if not cur.fetchone():
            return False, f"College with code '{college_code}' not found."

        cur.execute("INSERT INTO program (code, name, college_code) VALUES (%s, %s, %s)", (code, name, college_code))
        conn.commit()
        return True, [code, name, college_code]
    except psycopg2.IntegrityError:
        conn.rollback()
        return False, f"Program with code '{code}' already exists."
    except Exception as e:
        conn.rollback()
        return False, str(e)
    finally:
        cur.close()
        conn.close()

def delete(code):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT 1 FROM program WHERE code = %s", (code,))
        if not cur.fetchone():
            return False, "Program not found"
        cur.execute("DELETE FROM program WHERE code = %s", (code,))
        conn.commit()
        return True, ""
    except Exception as e:
        conn.rollback()
        return False, str(e)
    finally:
        cur.close()
        conn.close()

def update(original_code, new_code, new_name, new_college_code):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT 1 FROM program WHERE code = %s", (original_code,))
        if not cur.fetchone():
            return False, "Program not found", 404

        if new_college_code:
            cur.execute("SELECT 1 FROM college WHERE code = %s", (new_college_code,))
            if not cur.fetchone():
                return False, f"College '{new_college_code}' does not exist.", 400

        cur.execute("UPDATE program SET code = %s, name = %s, college_code = %s WHERE code = %s", 
                    (new_code, new_name, new_college_code, original_code))
        conn.commit()
        return True, "Program updated successfully", 200
    except psycopg2.IntegrityError:
        conn.rollback()
        return False, f"A program with code '{new_code}' already exists.", 409
    except Exception as e:
        conn.rollback()
        return False, str(e), 500
    finally:
        cur.close()
        conn.close()