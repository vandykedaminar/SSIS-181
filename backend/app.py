import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from db import create_tables

# Import Blueprints
from routes.auth import auth_bp
from routes.college import college_bp
from routes.program import program_bp
from routes.student import student_bp

basedir = os.path.abspath(os.path.dirname(__file__))

static_folder_path = os.path.join(basedir, 'out')

app = Flask(__name__, static_folder=static_folder_path)

app.secret_key = "dev-secret-change-me"
CORS(app, supports_credentials=True)

# Initialize Database Tables
create_tables()

# Register API Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(college_bp)
app.register_blueprint(program_bp)
app.register_blueprint(student_bp)

# --- Catch-all Route for Frontend ---
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=False)