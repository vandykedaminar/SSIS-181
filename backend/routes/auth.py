import os
from flask import Blueprint, jsonify, request, session

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/login', methods=['POST'])
def auth_login():
    try:
        data = request.get_json() or {}
        email = data.get('email')
        password = data.get('password')
        # demo credentials
        if email == os.getenv('ADMIN_EMAIL') and password == os.getenv('ADMIN_PASSWORD'):
            session['authenticated'] = True
            session['email'] = email
            return jsonify({"authenticated": True, "email": email}), 200
        
        return jsonify({"authenticated": False}), 401
    except Exception as e:
        return jsonify({"authenticated": False, "error": str(e)}), 500

@auth_bp.route('/auth/status')
def auth_status():
    auth = bool(session.get('authenticated'))
    return jsonify({"authenticated": auth, "email": session.get('email') if auth else None})

@auth_bp.route('/auth/logout', methods=['POST'])
def auth_logout():
    session.clear()
    return jsonify({"ok": True}), 200