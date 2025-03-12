# Aley - Projeto de Rede Social

Aley é uma rede social que permite aos usuários se conectar, compartilhar conteúdo e descobrir pessoas com interesses semelhantes.

## Backend de Autenticação

Este projeto inclui um backend Python Flask para autenticação de usuários, com as seguintes funcionalidades:

- Registro de usuários com verificação de email
- Login de usuários com JWT (JSON Web Tokens)
- Redefinição de senha via email
- Proteção de rotas com middleware de autenticação

## Tecnologias Utilizadas

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python Flask
- **Banco de Dados**: MongoDB Atlas
- **Autenticação**: JWT
- **Email**: Flask-Mail

## Estrutura do Projeto

```
.
├── API/
│   ├── __init__.py
│   ├── auth.py (Rotas de autenticação)
│   ├── email_service.py (Serviço de envio de emails)
│   └── models.py (Modelos de dados)
├── templates/
│   └── email_templates/
│       ├── verification_email.html
│       └── password_reset.html
├── app.py (Aplicação principal)
├── index.html (Página de login/registro)
├── verification-success.html (Página de sucesso de verificação)
└── verification-failed.html (Página de falha de verificação)
```

## Configuração do Ambiente

1. Instale as dependências:

```bash
pip install -r requirements.txt
```

2. Configure as variáveis de ambiente no arquivo `.env`:

```
MONGO_URI=mongodb+srv://seu_usuario:senha@cluster.mongodb.net/
SECRET_KEY=chave_secreta_jwt
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=seu_email@gmail.com
MAIL_PASSWORD=senha_de_app
MAIL_DEFAULT_SENDER=seu_email@gmail.com
```

3. Execute a aplicação:

```bash
python app.py
```

## API Endpoints

### Autenticação

- **POST /api/auth/register** - Registro de novo usuário
- **POST /api/auth/login** - Login de usuário
- **POST /api/auth/forgot-password** - Solicitar redefinição de senha
- **POST /api/auth/reset-password** - Redefinir senha com token
- **GET /api/auth/verify-email/<token>** - Verificar email
- **POST /api/auth/resend-verification** - Reenviar email de verificação
- **GET /api/auth/profile** - Obter perfil do usuário (protegido)

## Segurança

- Senhas armazenadas com hash usando Werkzeug
- Verificação de email obrigatória
- Tokens JWT com expiração
- Proteção contra vazamento de informações sensíveis

## Project Structure

- **Frontend**: Angular application
- **Backend**: Python FastAPI with MongoDB
- **Docker**: Configuration for containerization

## Features

- User authentication and profiles
- Video and photo sharing
- Tree-like content organization
- Social interactions (likes, comments, shares)
- Real-time notifications

## Setup Instructions

### Prerequisites

- Node.js and npm for Angular frontend
- Python 3.8+ for backend
- MongoDB
- Docker and Docker Compose (optional)

### Frontend Setup

```bash
cd frontend
npm install
ng serve
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Development

Instructions for development will be added as the project progresses.

## License

MIT #   W e b s i t e - S o c i a l - M e d i a - A l e y 
 
 