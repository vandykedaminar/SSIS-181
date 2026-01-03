from db import get_db_connection
import psycopg2

def get_all():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT code, name FROM college")
        colleges = cur.fetchall()
        return [[c[0], c[1]] for c in colleges]
    finally:
        cur.close()
        conn.close()

def create(code, name):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO college (code, name) VALUES (%s, %s)", (code, name))
        conn.commit()
        return True, [code, name]
    except psycopg2.IntegrityError:
        conn.rollback()
        return False, f"College with code '{code}' already exists."
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
        cur.execute("SELECT 1 FROM college WHERE code = %s", (code,))
        if not cur.fetchone():
            return False, "College not found"
        cur.execute("DELETE FROM college WHERE code = %s", (code,))
        conn.commit()
        return True, ""
    except Exception as e:
        conn.rollback()
        return False, str(e)
    finally:
        cur.close()
        conn.close()

def update(original_code, new_code, new_name):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT 1 FROM college WHERE code = %s", (original_code,))
        if not cur.fetchone():
            return False, "College not found", 404
            
        cur.execute("UPDATE college SET code = %s, name = %s WHERE code = %s", (new_code, new_name, original_code))
        conn.commit()
        return True, "College updated successfully", 200
    except psycopg2.IntegrityError:
        conn.rollback()
        return False, f"A college with code '{new_code}' already exists.", 409
    except Exception as e:
        conn.rollback()
        return False, str(e), 500
    finally:
        cur.close()
        conn.close()