import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from config import config
from models import db
from routes.auth import auth_bp
from routes.products import products_bp
from routes.cart import cart_bp
from routes.orders import orders_bp
from routes.vendor import vendor_bp
from routes.categories import categories_bp
from routes.addresses import addresses_bp
from routes.reviews import reviews_bp
    


def create_app(config_name='production'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)
    jwt = JWTManager(app)
    
    # ✅ Universal CORS configuration (covers all Vercel subdomains + localhost)
    CORS(app, resources={
        r"/*": {
            "origins": [
                "http://localhost:5173",
                "https://*.vercel.app"
            ],
            "supports_credentials": True
        }
    })
    
    # Create upload folder if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(vendor_bp, url_prefix='/api/vendor')
    app.register_blueprint(categories_bp, url_prefix='/api/categories')
    app.register_blueprint(addresses_bp, url_prefix='/api/addresses')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Surplus E-commerce API is running'}, 200
    
    @app.route('/')
    def root():
        return {'message': 'Surplus E-commerce API', 'health': '/api/health'}, 200
    
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    return app

if __name__ == '__main__':
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=False)
