from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError

# 2. Create an instance of the Flask class
app = Flask(__name__)
CORS(app)
# Configure the PostgreSQL database URI
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

# This part is optional but good practice to run the app
if __name__ == "__main__":
    # app.run(debug=True)
    app.run(host='0.0.0.0', port=5000, debug=True)