from flask import Flask, jsonify
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


# COLLEGE
class College(db.Model):
    code = db.Column(db.String(16), primary_key=True)
    name = db.Column(db.String(80), nullable=False)

class Program(db.Model):
    code = db.Column(db.String(16), primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    college = db.Column(db.String(16), db.ForeignKey('college.code', ondelete='SET NULL'), nullable=True)

class Student(db.Model):
    id = db.Column(db.String(12), primary_key=True)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    course = db.Column(db.String(16), db.ForeignKey('program.code', ondelete='SET NULL'), nullable=True)
    year = db.Column(db.String(8), nullable=False)
    gender = db.Column(db.String(16), nullable=False)
    
with app.app_context():
    db.create_all()

@app.route("/insert/college/<string:code>/<string:name>")
def insertCollege(code, name):
    try:
        college = College(code=code, name=name)
        db.session.add(college)
        db.session.commit()
        # Return the newly created object with a 201 Created status
        return jsonify([college.code, college.name]), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": f"College with code '{code}' already exists."}), 409
    except Exception as e:
        db.session.rollback()
        # It's a good idea to log the error here
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
        # ensure referenced college exists
        if not College.query.get(college):
            return jsonify({"error": f"College with code '{college}' not found."}), 400

        program = Program(code=code, name=name, college=college)
        db.session.add(program)
        db.session.commit()
        return jsonify([program.code, program.name, program.college]), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": f"Program with code '{code}' already exists or foreign key constraint failed."}), 409
    except Exception as e:
        db.session.rollback()
        print(f"An error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred on the server."}), 500


@app.route("/get/programs")
def getPrograms():
    programs = Program.query.all()
    result = [[p.code, p.name, p.college] for p in programs]
    return jsonify(result)

@app.route("/insert/student/<string:sid>/<string:first>/<string:last>/<string:course>/<string:year>/<string:gender>")
def insertStudent(sid, first, last, course, year, gender):
    # validate student id format YYYY-NNNN
    if not re.match(r'^\d{4}-\d{4}$', sid):
        return jsonify({"error": "Student ID must be in format YYYY-NNNN."}), 400

    # ensure referenced program exists
    if not Program.query.get(course):
        return jsonify({"error": f"Program with code '{course}' not found."}), 400

    try:
        student = Student(id=sid, first_name=first, last_name=last, course=course, year=year, gender=gender)
        db.session.add(student)
        db.session.commit()
        return jsonify([student.id, student.first_name, student.last_name, student.course, student.year, student.gender]), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": f"Student with ID '{sid}' already exists or constraint failed."}), 409
    except Exception as e:
        db.session.rollback()
        print(f"An error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred on the server."}), 500

@app.route("/get/students")
def getStudents():
    students = Student.query.all()
    result = [[s.id, s.first_name, s.last_name, s.course, s.year, s.gender] for s in students]
    return jsonify(result)

@app.route("/delete/college/<string:code>", methods=["DELETE"])
def delete_college(code):
    col = College.query.get(code)
    if not col:
        return jsonify({"error": "College not found"}), 404
    try:
        # safe if column is nullable
        Program.query.filter_by(college=code).update({"college": None})
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
        Student.query.filter_by(course=code).update({"course": None})
        db.session.delete(prog)
        db.session.commit()
        return "", 204
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# DELETE student
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

# This part is optional but good practice to run the app
if __name__ == "__main__":
    # app.run(debug=True)
    app.run(host='0.0.0.0', port=5000, debug=True)