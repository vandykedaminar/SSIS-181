from flask import Blueprint, jsonify, request, session

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/login', methods=['POST'])
def auth_login():
    try:
        data = request.get_json() or {}
        email = data.get('email')
        password = data.get('password')
        # demo credentials
        if email == 'vandykedaminar@gmail.com' and password == 'password':
            session['authenticated'] = True
            session['email'] = email
            resp = jsonify({"authenticated": True, "email": email})
            return resp, 200
        return jsonify({"authenticated": False}), 401
    except Exception as e:
        print('Auth login error:', e)
        return jsonify({"authenticated": False, "error": "server_error"}), 500

@auth_bp.route('/auth/status')
def auth_status():
    auth = bool(session.get('authenticated'))
    return jsonify({"authenticated": auth, "email": session.get('email') if auth else None})

@auth_bp.route('/auth/logout', methods=['POST'])
def auth_logout():
    session.clear()
    return jsonify({"ok": True}), 200