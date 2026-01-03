from flask import Blueprint, jsonify, request
from models import college as college_model

college_bp = Blueprint('college', __name__)

# Note: Preserving original URL structure where params are in the path
@college_bp.route("/insert/college/<string:code>/<string:name>")
def insert_college(code, name):
    success, result = college_model.create(code, name)
    if success:
        return jsonify(result), 201
    return jsonify({"error": result}), 409 if "exists" in result else 500

@college_bp.route("/get/colleges")
def get_colleges():
    try:
        data = college_model.get_all()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching colleges: {e}")
        return jsonify({"error": "Server error"}), 500

@college_bp.route("/delete/college/<string:code>", methods=["DELETE"])
def delete_college(code):
    success, msg = college_model.delete(code)
    if success:
        return "", 204
    return jsonify({"error": msg}), 404 if "not found" in msg else 500

@college_bp.route("/update/college/<string:original_code>", methods=["POST"])
def update_college(original_code):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    new_code = data.get('code')
    new_name = data.get('name')

    if not new_code or not new_name:
        return jsonify({"error": "Missing 'code' or 'name'"}), 400

    success, msg, status = college_model.update(original_code, new_code, new_name)
    if success:
        return jsonify({"message": msg}), status
    return jsonify({"error": msg}), status