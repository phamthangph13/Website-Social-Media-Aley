from flask import render_template, current_app, url_for, request
from flask_mail import Message, Mail
import os
import traceback

mail = Mail()
 
def init_mail(app):
    """Initialize the mail extension"""
    try:
        mail_server = os.getenv('MAIL_SERVER')
        mail_port = os.getenv('MAIL_PORT', '587')
        mail_username = os.getenv('MAIL_USERNAME')
        mail_password = os.getenv('MAIL_PASSWORD')
        mail_use_tls = os.getenv('MAIL_USE_TLS', 'True').lower() in ('true', '1', 't')
        mail_use_ssl = os.getenv('MAIL_USE_SSL', 'False').lower() in ('true', '1', 't')
        mail_default_sender = os.getenv('MAIL_DEFAULT_SENDER')
        
        # Validar configurações essenciais
        missing_configs = []
        if not mail_server: missing_configs.append('MAIL_SERVER')
        if not mail_port: missing_configs.append('MAIL_PORT')
        if not mail_username: missing_configs.append('MAIL_USERNAME')
        if not mail_password: missing_configs.append('MAIL_PASSWORD') 
        
        if missing_configs:
            app.logger.warning(f"Configurações de email ausentes: {', '.join(missing_configs)}")
            app.logger.warning("O serviço de email pode não funcionar corretamente.")
        
        # Configurar Flask-Mail
        app.config.update(
            MAIL_SERVER=mail_server,
            MAIL_PORT=int(mail_port),
            MAIL_USE_TLS=mail_use_tls,
            MAIL_USE_SSL=mail_use_ssl,
            MAIL_USERNAME=mail_username,
            MAIL_PASSWORD=mail_password,
            MAIL_DEFAULT_SENDER=mail_default_sender or mail_username
        )
        
        mail.init_app(app)
        app.logger.info("Serviço de email configurado com sucesso")
        
        # Verificar se os templates existem
        template_dir = os.path.join(app.root_path, '..', 'templates', 'email_templates')
        verification_template = os.path.join(template_dir, 'verification_email.html')
        password_reset_template = os.path.join(template_dir, 'password_reset.html')
        
        if not os.path.exists(template_dir):
            app.logger.warning(f"Diretório de templates não encontrado: {template_dir}")
        else:
            if not os.path.exists(verification_template):
                app.logger.warning(f"Template de verificação não encontrado: {verification_template}")
            if not os.path.exists(password_reset_template):
                app.logger.warning(f"Template de redefinição não encontrado: {password_reset_template}")
        
        return mail
    except Exception as e:
        app.logger.error(f"Erro ao inicializar serviço de email: {str(e)}")
        traceback.print_exc()
        return mail

def send_email(to, subject, template, **kwargs):
    """Send an email using the provided template"""
    try:
        print(f"Tentando enviar email para {to} usando template {template}")
        msg = Message(subject, recipients=[to])
        
        try:
            msg.html = render_template(f'email_templates/{template}', **kwargs)
        except Exception as template_error:
            print(f"Erro ao renderizar template: {str(template_error)}")
            print(f"Caminho do template: email_templates/{template}")
            print(f"Argumentos do template: {kwargs}")
            raise
        
        # Instead of using mail.connect() which is having issues, use a more direct approach
        try:
            # Get the SMTP settings from the app config
            with current_app.app_context():
                import smtplib
                from email.mime.multipart import MIMEMultipart
                from email.mime.text import MIMEText
                
                # Create a new SMTP connection
                server = smtplib.SMTP(
                    current_app.config['MAIL_SERVER'],
                    current_app.config['MAIL_PORT']
                )
                
                # Identify ourselves to the server
                server.ehlo()
                
                # If using TLS, establish the secure connection
                if current_app.config.get('MAIL_USE_TLS', False):
                    server.starttls()
                    server.ehlo()  # Re-identify after TLS
                
                # Login if credentials are provided
                if current_app.config.get('MAIL_USERNAME') and current_app.config.get('MAIL_PASSWORD'):
                    server.login(
                        current_app.config['MAIL_USERNAME'], 
                        current_app.config['MAIL_PASSWORD']
                    )
                
                # Set up the message
                email_message = MIMEMultipart('alternative')
                email_message['Subject'] = subject
                email_message['From'] = current_app.config.get('MAIL_DEFAULT_SENDER', current_app.config.get('MAIL_USERNAME', ''))
                email_message['To'] = to
                
                # Attach the HTML part
                email_message.attach(MIMEText(msg.html, 'html'))
                
                # Send the email
                server.sendmail(
                    current_app.config.get('MAIL_DEFAULT_SENDER', current_app.config.get('MAIL_USERNAME', '')),
                    [to],
                    email_message.as_string()
                )
                
                # Properly close the connection
                server.quit()
                
                print(f"Email enviado com sucesso para {to} usando conexão SMTP direta")
        except Exception as smtp_error:
            print(f"Erro com conexão SMTP direta: {str(smtp_error)}")
            # Fall back to the standard Flask-Mail approach as a last resort
            mail.send(msg)
            print(f"Email enviado com método alternativo para {to}")
        
        return True
    except Exception as e:
        print(f"Erro ao enviar email para {to}: {str(e)}")
        traceback.print_exc()
        return False

def send_verification_email(user_email, token):
    """Send verification email to user after registration"""
    try:
        print(f"Preparando email de verificação para {user_email}")
        
        # Gerar URL de verificação
        verification_url = f"{request.host_url.rstrip('/')}/api/auth/verify-email/{token}"
        print(f"URL de verificação gerada: {verification_url}")
        
        # Detalhes do email
        subject = "Aley - Confirme seu endereço de email"
        
        # Enviar email
        return send_email(
            to=user_email,
            subject=subject,
            template='verification_email.html',
            verification_url=verification_url,
            user_email=user_email
        )
    except Exception as e:
        print(f"Erro ao preparar email de verificação: {str(e)}")
        traceback.print_exc()
        return False

def send_password_reset_email(user_email, token):
    """Send password reset email to user"""
    try:
        print(f"Preparando email de redefinição de senha para {user_email}")
        
        # Gerar URL de redefinição
        reset_url = f"{request.host_url.rstrip('/')}/password-reset.html?token={token}"
        print(f"URL de redefinição gerada: {reset_url}")
        
        # Detalhes do email
        subject = "Aley - Redefinição de senha solicitada"
        
        # Enviar email
        return send_email(
            to=user_email,
            subject=subject,
            template='password_reset.html',
            reset_url=reset_url,
            user_email=user_email
        )
    except Exception as e:
        print(f"Erro ao preparar email de redefinição: {str(e)}")
        traceback.print_exc()
        return False 