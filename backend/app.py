from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
import re

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:postgre2314@localhost:5432/postgres'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

@app.route("/")
def hello_world():
    return "Hello, World!"


# MODELS
class College(db.Model):
    code = db.Column(db.String(16), primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    # --- CHANGE HERE ---
    # Removed cascade="all, delete-orphan" to prevent deleting child programs.
    # The database's ondelete='SET NULL' rule on the ForeignKey will now take effect.
    programs = db.relationship('Program', backref='college_ref', lazy=True)

class Program(db.Model):
    code = db.Column(db.String(16), primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    college_code = db.Column(db.String(16), db.ForeignKey('college.code', onupdate='CASCADE', ondelete='SET NULL'), nullable=True)
    # --- CHANGE HERE ---
    # Removed cascade="all, delete-orphan" to prevent deleting child students.
    # The database's ondelete='SET NULL' rule on the ForeignKey will now take effect.
    students = db.relationship('Student', backref='program_ref', lazy=True)

class Student(db.Model):
    id = db.Column(db.String(12), primary_key=True)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    program_code = db.Column(db.String(16), db.ForeignKey('program.code', onupdate='CASCADE', ondelete='SET NULL'), nullable=True)
    year = db.Column(db.String(8), nullable=False)
    gender = db.Column(db.String(16), nullable=False)
    
with app.app_context():
    db.create_all()


# --- GET and INSERT routes (No changes needed here) ---

@app.route("/insert/college/<string:code>/<string:name>")
def insertCollege(code, name):
    try:
        college = College(code=code, name=name)
        db.session.add(college)
        db.session.commit()
        return jsonify([college.code, college.name]), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": f"College with code '{code}' already exists."}), 409
    except Exception as e:
        db.session.rollback()
        print(f"An error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred on the server."}), 500
 
@app.route("/get/colleges")
def getColleges():
    colleges = College.query.all()
    result = [[c.code, c.name] for c in colleges]
    return jsonify(result)

@app.route("/insert/program/<string:code>/<string:name>/<string:college>")
def insertProgram(code, name, college):
    try:
        if not College.query.get(college):
            return jsonify({"error": f"College with code '{college}' not found."}), 400
        program = Program(code=code, name=name, college_code=college)
        db.session.add(program)
        db.session.commit()
        return jsonify([program.code, program.name, program.college_code]), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": f"Program with code '{code}' already exists."}), 409
    except Exception as e:
        db.session.rollback()
        print(f"An error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred on the server."}), 500


@app.route("/get/programs")
def getPrograms():
    programs = Program.query.all()
    result = [[p.code, p.name, p.college_code] for p in programs]
    return jsonify(result)

@app.route("/insert/student/<string:sid>/<string:first>/<string:last>/<string:course>/<string:year>/<string:gender>")
def insertStudent(sid, first, last, course, year, gender):
    if not re.match(r'^\d{4}-\d{4}$', sid):
        return jsonify({"error": "Student ID must be in format YYYY-NNNN."}), 400
    if not Program.query.get(course):
        return jsonify({"error": f"Program with code '{course}' not found."}), 400
    try:
        student = Student(id=sid, first_name=first, last_name=last, program_code=course, year=year, gender=gender)
        db.session.add(student)
        db.session.commit()
        return jsonify([student.id, student.first_name, student.last_name, student.program_code, student.year, student.gender]), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": f"Student with ID '{sid}' already exists."}), 409
    except Exception as e:
        db.session.rollback()
        print(f"An error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred on the server."}), 500

@app.route("/get/students")
def getStudents():
    students = Student.query.all()
    result = [[s.id, s.first_name, s.last_name, s.program_code, s.year, s.gender] for s in students]
    return jsonify(result)

# --- DELETE routes (No changes needed here) ---

@app.route("/delete/college/<string:code>", methods=["DELETE"])
def delete_college(code):
    col = College.query.get(code)
    if not col:
        return jsonify({"error": "College not found"}), 404
    try:
        db.session.delete(col)
        db.session.commit()
        return "", 204
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/delete/program/<string:code>", methods=["DELETE"])
def delete_program(code):
    prog = Program.query.get(code)
    if not prog:
        return jsonify({"error": "Program not found"}), 404
    try:
        db.session.delete(prog)
        db.session.commit()
        return "", 204
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/delete/student/<string:sid>", methods=["DELETE"])
def delete_student(sid):
    student = Student.query.get(sid)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    try:
        db.session.delete(student)
        db.session.commit()
        return "", 204
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
        

# --- UPDATE routes (No changes needed here) ---

@app.route("/update/college/<string:original_code>", methods=["POST"])
def update_college(original_code):
    college = College.query.get(original_code)
    if not college:
        return jsonify({"error": "College not found"}), 404
    
    data = request.get_json()
    new_code = data.get('code')
    new_name = data.get('name')

    if not new_code or not new_name:
        return jsonify({"error": "Missing 'code' or 'name' in request body"}), 400
        
    try:
        college.code = new_code
        college.name = new_name
        db.session.commit()
        return jsonify({"message": "College updated successfully"}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": f"A college with code '{new_code}' already exists."}), 409
    except Exception as e:
        db.session.rollback()
        print(f"Error updating college: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500


@app.route("/update/program/<string:original_code>", methods=["POST"])
def update_program(original_code):
    program = Program.query.get(original_code)
    if not program:
        return jsonify({"error": "Program not found"}), 404
    
    data = request.get_json()
    new_code = data.get('code')
    new_name = data.get('name')
    new_college_code = data.get('college')

    if new_college_code and not College.query.get(new_college_code):
        return jsonify({"error": f"College '{new_college_code}' does not exist."}), 400

    try:
        program.code = new_code
        program.name = new_name
        program.college_code = new_college_code
        db.session.commit()
        return jsonify({"message": "Program updated successfully"}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": f"A program with code '{new_code}' already exists."}), 409
    except Exception as e:
        db.session.rollback()
        print(f"Error updating program: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500


@app.route("/update/student/<string:original_id>", methods=["POST"])
def update_student(original_id):
    student = Student.query.get(original_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404

    data = request.get_json()
    new_id = data.get('id')

    if not re.match(r'^\d{4}-\d{4}$', new_id):
        return jsonify({"error": "New student ID must be in format YYYY-NNNN."}), 400
    
    new_program_code = data.get('course')
    if new_program_code and not Program.query.get(new_program_code):
        return jsonify({"error": f"Program '{new_program_code}' does not exist."}), 400
    
    try:
        student.id = new_id
        student.first_name = data.get('first_name')
        student.last_name = data.get('last_name')
        student.program_code = new_program_code
        student.year = data.get('year')
        student.gender = data.get('gender')
        db.session.commit()
        return jsonify({"message": "Student updated successfully"}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": f"A student with ID '{new_id}' already exists."}), 409
    except Exception as e:
        db.session.rollback()
        print(f"Error updating student: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)