from flask import Blueprint, jsonify, request
import re
from models import student as student_model

student_bp = Blueprint('student', __name__)

@student_bp.route("/insert/student", methods=["POST"])
def insert_student():
    data = request.get_json()
    sid = data.get('id')
    
    # Input validation matches original app.py
    if not re.match(r'^\d{4}-\d{4}$', sid):
        return jsonify({"error": "Student ID must be in format YYYY-NNNN."}), 400

    success, msg = student_model.create(data)
    if success:
        return jsonify({"message": msg}), 201
    
    status = 409 if "exists" in msg else 500
    return jsonify({"error": msg}), status

@student_bp.route("/get/students")
def get_students():
    try:
        data = student_model.get_all()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching students: {e}")
        return jsonify({"error": "Server error"}), 500

@student_bp.route("/delete/student/<string:sid>", methods=["DELETE"])
def delete_student(sid):
    success, msg = student_model.delete(sid)
    if success:
        return "", 204
    return jsonify({"error": msg}), 404 if "not found" in msg else 500

@student_bp.route("/update/student/<string:original_id>", methods=["POST"])
def update_student(original_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data"}), 400
        
    success, msg, status = student_model.update(original_id, data)
    if success:
        return jsonify({"message": msg}), status
    return jsonify({"error": msg}), status