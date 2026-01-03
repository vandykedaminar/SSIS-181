from flask import Blueprint, jsonify, request
from models import program as program_model

program_bp = Blueprint('program', __name__)

# Note: Preserving original URL structure
@program_bp.route("/insert/program/<string:code>/<string:name>/<string:college>")
def insert_program(code, name, college):
    success, result = program_model.create(code, name, college)
    if success:
        return jsonify(result), 201
    status = 409 if "exists" in result else (400 if "not found" in result else 500)
    return jsonify({"error": result}), status

@program_bp.route("/get/programs")
def get_programs():
    try:
        data = program_model.get_all()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching programs: {e}")
        return jsonify({"error": "Server error"}), 500

@program_bp.route("/delete/program/<string:code>", methods=["DELETE"])
def delete_program(code):
    success, msg = program_model.delete(code)
    if success:
        return "", 204
    return jsonify({"error": msg}), 404 if "not found" in msg else 500

@program_bp.route("/update/program/<string:original_code>", methods=["POST"])
def update_program(original_code):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    new_code = data.get('code')
    new_name = data.get('name')
    new_college_code = data.get('college')

    success, msg, status = program_model.update(original_code, new_code, new_name, new_college_code)
    if success:
        return jsonify({"message": msg}), status
    return jsonify({"error": msg}), status