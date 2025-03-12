from pymongo import MongoClient
from dotenv import load_dotenv
import os
import sys
import traceback

# Load environment variables
load_dotenv()

# Determinar o ambiente (desenvolvimento por padrão)
FLASK_ENV = os.getenv('FLASK_ENV', 'development')
print(f"Ambiente de execução: {FLASK_ENV}")

# MongoDB Connection
use_mock = False  # Flag para rastrear se estamos usando MongoDB simulado

try:
    # Verificar se devemos usar MongoDB simulado
    if FLASK_ENV == 'development' and os.getenv('USE_REAL_MONGO', '').lower() != 'true':
        # Usar MongoDB simulado em desenvolvimento por padrão
        print("Usando MongoDB simulado para ambiente de desenvolvimento...")
        from mongomock import MongoClient as MockMongoClient
        client = MockMongoClient()
        db = client.aley_social
        use_mock = True
        print("MongoDB simulado iniciado com sucesso!")
    else:
        # Tentar conexão real com MongoDB
        mongo_uri = os.getenv('MONGO_URI')
        if not mongo_uri:
            print("ERRO: Variável de ambiente MONGO_URI não configurada!")
            if FLASK_ENV == 'production':
                sys.exit(1)
            else:
                # Fallback para MongoDB simulado
                print("Variável MONGO_URI não encontrada. Usando MongoDB simulado como fallback...")
                from mongomock import MongoClient as MockMongoClient
                client = MockMongoClient()
                db = client.aley_social
                use_mock = True
        else:
            # Tentar conectar ao MongoDB real
            print(f"Tentando conectar ao MongoDB com URI fornecida...")
            
            # Configurar opções de conexão
            conn_options = {
                'serverSelectionTimeoutMS': 5000,
                'connectTimeoutMS': 10000,
                'socketTimeoutMS': 45000,
            }
            
            # Em desenvolvimento, permitir certificados inválidos
            if FLASK_ENV == 'development':
                conn_options['tlsAllowInvalidCertificates'] = True
            
            client = MongoClient(mongo_uri, **conn_options)
            
            # Verificar conexão com ping
            client.admin.command('ping')
            print("Conexão com MongoDB estabelecida com sucesso!")
            
            db = client.aley_social
            
except Exception as e:
    print(f"ERRO ao conectar ao MongoDB: {str(e)}")
    traceback.print_exc()
    
    if FLASK_ENV == 'production':
        print("Aplicação em ambiente de produção. Encerrando devido a erro crítico de banco de dados.")
        sys.exit(1)
    else:
        # Em desenvolvimento, usar MongoDB simulado como fallback
        print("Usando MongoDB simulado como fallback após erro de conexão...")
        from mongomock import MongoClient as MockMongoClient
        client = MockMongoClient()
        db = client.aley_social
        use_mock = True

# Aviso sobre banco de dados simulado
if use_mock:
    print("AVISO: Usando banco de dados simulado! Os dados serão perdidos quando a aplicação for reiniciada.")

# Secret key for JWT
SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')
if SECRET_KEY == 'default_secret_key':
    print("AVISO: Usando chave secreta padrão. Defina SECRET_KEY em seu arquivo .env para produção.")