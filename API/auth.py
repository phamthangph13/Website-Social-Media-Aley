from flask import Blueprint, request, jsonify, session, redirect, url_for, make_response
from werkzeug.security import generate_password_hash
import uuid
import datetime
import jwt
import os
from functools import wraps
from API.models import User
from config import db, SECRET_KEY
from API.email_service import send_verification_email, send_password_reset_email
import traceback

auth_bp = Blueprint('auth', __name__)

# Authentication middleware
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check if token is in headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                response = jsonify({'error': 'Token inválido ou formato incorreto'})
                return make_response(response, 401)
        
        if not token:
            response = jsonify({'error': 'Token não fornecido'})
            return make_response(response, 401)
        
        try:
            # Decode token
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = User.find_by_id(data['user_id'])
            
            if not current_user:
                response = jsonify({'error': 'Usuário não encontrado'})
                return make_response(response, 401)
                
            # Check if email is verified
            if not current_user.is_verified:
                response = jsonify({
                    'error': 'Email não verificado! Por favor, verifique seu email para continuar.',
                    'verified': False,
                    'email': current_user.email
                })
                return make_response(response, 403)
                
        except jwt.ExpiredSignatureError:
            response = jsonify({'error': 'Token expirado'})
            return make_response(response, 401)
        except jwt.InvalidTokenError:
            response = jsonify({'error': 'Token inválido'})
            return make_response(response, 401)
        except Exception as e:
            response = jsonify({'error': f'Erro ao processar token: {str(e)}'})
            return make_response(response, 500)
            
        return f(current_user, *args, **kwargs)
    
    return decorated

# Register route
@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        # Receber e validar dados
        try:
            data = request.get_json()
            if not data:
                response = jsonify({"error": "Dados não fornecidos ou formato inválido"})
                return make_response(response, 400)
        except Exception as e:
            print(f"Erro ao processar JSON da requisição: {str(e)}")
            response = jsonify({"error": "Formato de dados inválido"})
            return make_response(response, 400)
        
        # Validar campos obrigatórios
        required_fields = ['email', 'password', 'confirm_password']
        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            response = jsonify({"error": f"Campos obrigatórios ausentes: {', '.join(missing_fields)}"})
            return make_response(response, 400)
            
        # Verificar se as senhas coincidem
        if data['password'] != data['confirm_password']:
            response = jsonify({"error": "As senhas não coincidem"})
            return make_response(response, 400)
            
        # Verificar se o usuário já existe
        existing_user = db.users.find_one({"email": data['email']})
        if existing_user:
            response = jsonify({"error": "Email já cadastrado"})
            return make_response(response, 400)
            
        # Criar novo usuário
        try:
            hashed_password = generate_password_hash(data['password'])
            verification_token = str(uuid.uuid4())
            expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            
            new_user = {
                "email": data['email'],
                "password": hashed_password,
                "is_verified": False,
                "verification_token": verification_token,
                "token_expiration": expiration,
                "created_at": datetime.datetime.utcnow()
            }
            
            # Adicionar fullname se fornecido
            if 'fullname' in data and data['fullname']:
                new_user["fullname"] = data['fullname']
            
            result = db.users.insert_one(new_user)
            user_id = result.inserted_id
            print(f"Usuário criado com ID: {user_id}")
        except Exception as db_error:
            print(f"Erro ao criar usuário no banco de dados: {str(db_error)}")
            response = jsonify({"error": "Erro ao criar usuário no banco de dados"})
            return make_response(response, 500)
        
        # Enviar email de verificação - mas não falhar se o envio falhar
        print("Tentando enviar email de verificação...")
        email_sent = False
        try:
            email_sent = send_verification_email(data['email'], verification_token)
        except Exception as email_error:
            print(f"Erro ao enviar email de verificação: {str(email_error)}")
            # Continua mesmo se o email falhar
        
        # Montar resposta com base no sucesso do envio de email
        response_message = "Usuário registrado com sucesso!"
        if email_sent:
            response_message += " Um email de verificação foi enviado. Por favor, verifique sua caixa de entrada."
        else:
            response_message += " No entanto, não foi possível enviar o email de verificação. Você pode solicitar um novo email de verificação mais tarde."
        
        # Retornar resposta de sucesso com detalhes mínimos do usuário
        response = jsonify({
            "message": response_message,
            "user_id": str(user_id),
            "email": data['email']
        })
        return make_response(response, 201)
        
    except Exception as e:
        print(f"Erro não tratado na rota de registro: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        response = jsonify({"error": "Erro interno do servidor"})
        return make_response(response, 500)

# Email verification route
@auth_bp.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    try:
        print(f"Processando verificação de email com token: {token}")
        
        # Buscar usuário pelo token de verificação
        user = User.find_by_verification_token(token)
        print(f"Resultado da busca por usuário: {'Encontrado' if user else 'Não encontrado'}")
        
        if not user:
            print("Token de verificação inválido ou expirado")
            return redirect('/verification-failed.html')
        
        # Verificar se o token não expirou
        if hasattr(user, 'token_expiration') and user.token_expiration < datetime.datetime.utcnow():
            print("Token de verificação expirado")
            return redirect('/verification-failed.html')
            
        # Verificar se o email já foi verificado
        if user.is_verified:
            print("Email já verificado anteriormente")
            return redirect('/verification-success.html')
        
        try:
            # Atualizar o status de verificação do usuário
            db.users.update_one(
                {'_id': user._id},
                {
                    '$set': {
                        'is_verified': True,
                        'verification_token': None,
                        'token_expiration': None,
                        'updated_at': datetime.datetime.utcnow()
                    }
                }
            )
            print(f"Email verificado com sucesso para o usuário: {user.email}")
        except Exception as e:
            print(f"Erro ao atualizar status de verificação: {str(e)}")
            return redirect('/verification-failed.html')
        
        # Redirecionar para página de sucesso
        return redirect('/verification-success.html')
        
    except Exception as e:
        print(f"Erro não tratado na verificação de email: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return redirect('/verification-failed.html')

# Resend verification email
@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    data = request.get_json()
    
    # Validate input data
    if not data or not data.get('email'):
        return jsonify({'message': 'Missing email!'}), 400
    
    # Find user by email
    user = User.find_by_email(data.get('email'))
    
    if not user:
        # Don't reveal that the user doesn't exist
        return jsonify({'message': 'If the email exists and is not verified, a new verification link will be sent!'}), 200
    
    # If already verified
    if user.is_verified:
        return jsonify({'message': 'Email is already verified!'}), 400
    
    # Generate new verification token
    verification_token = str(uuid.uuid4())
    
    # Update user's verification token
    db.users.update_one(
        {'_id': user._id},
        {'$set': {
            'email_verification_token': verification_token,
            'updated_at': datetime.datetime.utcnow()
        }}
    )
    
    # Send verification email
    try:
        send_verification_email(user.email, verification_token)
    except Exception as e:
        # Log the error
        print(f"Error sending verification email: {e}")
        return jsonify({'message': 'Error sending verification email. Please try again later.'}), 500
    
    return jsonify({'message': 'If the email exists and is not verified, a new verification link has been sent!'}), 200

# Login route
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        # Validar dados de entrada
        try:
            data = request.get_json()
            if not data:
                response = jsonify({'error': 'Dados não fornecidos ou formato inválido'})
                return make_response(response, 400)
        except Exception as e:
            print(f"Erro ao processar JSON da requisição: {str(e)}")
            response = jsonify({'error': 'Formato de dados inválido'})
            return make_response(response, 400)
            
        # Verificar campos obrigatórios    
        if not data.get('email') or not data.get('password'):
            missing_fields = []
            if not data.get('email'): missing_fields.append('email')
            if not data.get('password'): missing_fields.append('password')
            response = jsonify({'error': f'Campos obrigatórios ausentes: {", ".join(missing_fields)}'})
            return make_response(response, 400)
        
        # Buscar usuário pelo email
        try:
            user = User.find_by_email(data.get('email'))
        except Exception as db_error:
            print(f"Erro ao buscar usuário no banco de dados: {str(db_error)}")
            response = jsonify({'error': 'Erro ao verificar credenciais. Tente novamente mais tarde.'})
            return make_response(response, 500)
        
        # Verificar se o usuário existe e se a senha está correta
        if not user or not user.verify_password(data.get('password')):
            response = jsonify({'error': 'Email ou senha inválidos'})
            return make_response(response, 401)
        
        # Verificar se o email foi confirmado
        if not user.is_verified:
            response = jsonify({
                'error': 'Email não verificado! Por favor, verifique seu email para continuar.',
                'verified': False,
                'email': user.email
            })
            return make_response(response, 403)
        
        # Gerar token JWT
        try:
            token = jwt.encode({
                'user_id': str(user._id),
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
            }, SECRET_KEY, algorithm="HS256")
        except Exception as jwt_error:
            print(f"Erro ao gerar token JWT: {str(jwt_error)}")
            response = jsonify({'error': 'Erro ao gerar token de autenticação'})
            return make_response(response, 500)
        
        # Montar resposta de sucesso
        user_info = {
            'id': str(user._id),
            'email': user.email,
            'is_verified': user.is_verified
        }
        
        # Adicionar nome completo se disponível
        if hasattr(user, 'fullname') and user.fullname:
            user_info['fullname'] = user.fullname
        
        response = jsonify({
            'message': 'Login realizado com sucesso!',
            'token': token,
            'user': user_info
        })
        return make_response(response, 200)
    except Exception as e:
        print(f"Erro não tratado na rota de login: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        response = jsonify({'error': 'Erro interno do servidor'})
        return make_response(response, 500)

# Forgot password route
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        # Validar dados de entrada
        try:
            data = request.get_json()
            if not data:
                response = jsonify({'error': 'Dados não fornecidos ou formato inválido'})
                return make_response(response, 400)
        except Exception as e:
            print(f"Erro ao processar JSON da requisição: {str(e)}")
            response = jsonify({'error': 'Formato de dados inválido'})
            return make_response(response, 400)
            
        # Verificar campos obrigatórios
        if not data.get('email'):
            response = jsonify({'error': 'Campo de email obrigatório ausente'})
            return make_response(response, 400)
        
        # Buscar usuário pelo email
        try:
            user = User.find_by_email(data.get('email'))
        except Exception as db_error:
            print(f"Erro ao buscar usuário no banco de dados: {str(db_error)}")
            # Por segurança, não revelamos que houve um erro no banco de dados
            response = jsonify({'message': 'Se o email existir, um link de redefinição de senha será enviado!'})
            return make_response(response, 200)
        
        # Por segurança, não revelamos se o usuário existe ou não
        if not user:
            response = jsonify({'message': 'Se o email existir, um link de redefinição de senha será enviado!'})
            return make_response(response, 200)
        
        # Gerar token de redefinição
        reset_token = str(uuid.uuid4())
        
        # Armazenar token no banco de dados com expiração
        try:
            reset_expiry = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
            db.password_resets.update_one(
                {'user_id': user._id},
                {'$set': {
                    'token': reset_token,
                    'expires_at': reset_expiry
                }},
                upsert=True
            )
        except Exception as db_error:
            print(f"Erro ao armazenar token de redefinição: {str(db_error)}")
            # Por segurança, ainda retornamos a mesma mensagem
            response = jsonify({'message': 'Se o email existir, um link de redefinição de senha será enviado!'})
            return make_response(response, 200)
        
        # Enviar email de redefinição de senha
        email_sent = False
        try:
            email_sent = send_password_reset_email(user.email, reset_token)
        except Exception as e:
            # Registrar o erro
            print(f"Erro ao enviar email de redefinição: {str(e)}")
        
        # Para segurança, sempre retornamos a mesma mensagem, independentemente do resultado
        response = jsonify({'message': 'Se o email existir, um link de redefinição de senha será enviado!'})
        return make_response(response, 200)
        
    except Exception as e:
        print(f"Erro não tratado na rota de recuperação de senha: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        # Por segurança, não revelamos detalhes do erro
        response = jsonify({'message': 'Se o email existir, um link de redefinição de senha será enviado!'})
        return make_response(response, 200)

# Reset password route
@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    
    # Validate input data
    if not data or not data.get('token') or not data.get('password') or not data.get('confirm_password'):
        return jsonify({'message': 'Missing required fields!'}), 400
    
    # Check if passwords match
    if data.get('password') != data.get('confirm_password'):
        return jsonify({'message': 'Passwords do not match!'}), 400
    
    # Find reset token
    reset_data = db.password_resets.find_one({
        'token': data.get('token'),
        'expires_at': {'$gt': datetime.datetime.utcnow()}
    })
    
    if not reset_data:
        return jsonify({'message': 'Invalid or expired reset token!'}), 400
    
    # Find user
    user = User.find_by_id(reset_data['user_id'])
    
    if not user:
        return jsonify({'message': 'User not found!'}), 404
    
    # Update user password
    user.update_password(data.get('password'))
    
    # Delete reset token
    db.password_resets.delete_one({'token': data.get('token')})
    
    return jsonify({'message': 'Password reset successful!'}), 200

# Get user profile route (protected)
@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify({
        'id': str(current_user._id),
        'fullname': current_user.fullname,
        'email': current_user.email,
        'is_verified': current_user.is_verified,
        'created_at': current_user.created_at.isoformat()
    }), 200 