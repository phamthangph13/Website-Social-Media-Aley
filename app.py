from flask import Flask, jsonify, render_template, make_response, send_from_directory, request
from flask_cors import CORS
from config import db
from API.auth import auth_bp
from API.email_service import init_mail
import traceback
import os

app = Flask(__name__, 
    static_folder='static',  # Update static folder path
    static_url_path='/static',  # Update static URL path
    template_folder='templates'  # Keep template folder path
)
CORS(app)

# Add logging for static files
@app.before_request
def log_request_info():
    app.logger.debug('Headers: %s', request.headers)
    app.logger.debug('Body: %s', request.get_data())
    app.logger.debug('Path: %s', request.path)

@app.after_request
def after_request(response):
    app.logger.debug('Response Status: %s', response.status)
    app.logger.debug('Response Headers: %s', response.headers)
    return response

# Test route to check CSS content
@app.route('/test-css')
def test_css():
    try:
        css_path = os.path.join(app.static_folder, 'css', 'style.css')
        if os.path.exists(css_path):
            with open(css_path, 'r') as f:
                content = f.read()
            return f"""
                <h1>CSS file exists!</h1>
                <p>Path: {css_path}</p>
                <p>Size: {len(content)} bytes</p>
                <pre>{content[:500]}...</pre>
            """
        else:
            return f"CSS file not found at {css_path}"
    except Exception as e:
        return f"Error reading CSS: {str(e)}"

# Initialize email service
mail = init_mail(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# Debug route to serve CSS directly
@app.route('/debug/css')
def debug_css():
    return send_from_directory('static/css', 'style.css')

# Serve the main application
@app.route('/')
def index():
    return render_template('index.html')

# Error handlers
@app.errorhandler(404)
def not_found(error):
    response = jsonify({"error": "Not found"})
    return make_response(response, 404)

@app.errorhandler(500)
def server_error(error):
    app.logger.error(f"Server error: {error}")
    app.logger.error(traceback.format_exc())
    response = jsonify({"error": "Internal server error"})
    return make_response(response, 500)

@app.errorhandler(401)
def unauthorized(error):
    response = jsonify({"error": "Unauthorized"})
    return make_response(response, 401)

@app.errorhandler(403)
def forbidden(error):
    response = jsonify({"error": "Forbidden"})
    return make_response(response, 403)

# Global exception handler
@app.errorhandler(Exception)
def handle_exception(e):
    app.logger.error(f"Unhandled exception: {e}")
    app.logger.error(traceback.format_exc())
    response = jsonify({"error": "An unexpected error occurred"})
    return make_response(response, 500)

# Ensure JSON for all responses
@app.after_request
def add_header(response):
    if not isinstance(response, tuple):
        return response
        
    if len(response) == 2 and not response[0].is_json:
        json_response = jsonify({"error": f"Error {response[1]}"})
        return make_response(json_response, response[1])
    return response

if __name__ == '__main__':
    # Verificar se os templates de email existem
    template_dir = os.path.join(app.root_path, 'templates', 'email_templates')
    verification_template = os.path.join(template_dir, 'verification_email.html')
    password_reset_template = os.path.join(template_dir, 'password_reset.html')
    
    if not os.path.exists(template_dir):
        print(f"AVISO: Diretório de templates de email não encontrado: {template_dir}")
    else:
        if not os.path.exists(verification_template):
            print(f"AVISO: Template de verificação de email não encontrado: {verification_template}")
        if not os.path.exists(password_reset_template):
            print(f"AVISO: Template de redefinição de senha não encontrado: {password_reset_template}")
    
    app.run(debug=True)