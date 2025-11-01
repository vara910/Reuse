from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, VendorProfile, Product, Order, OrderItem
from datetime import datetime, date
from werkzeug.utils import secure_filename
import os
import time

vendor_bp = Blueprint('vendor', __name__)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in current_app.config.get('ALLOWED_EXTENSIONS', set())

def require_vendor(f):
    """Decorator to ensure user is a vendor"""
    from functools import wraps
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user or user.role != 'vendor':
            return jsonify({'error': 'Vendor access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

@vendor_bp.route('/products', methods=['GET'])
@jwt_required()
def get_vendor_products():
    """Get all products for current vendor"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user or user.role != 'vendor' or not user.vendor_profile:
            return jsonify({'error': 'Vendor profile not found'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = Product.query.filter_by(vendor_id=user.vendor_profile.id).order_by(
            Product.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        products = [product.to_dict() for product in pagination.items]
        
        return jsonify({
            'products': products,
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@vendor_bp.route('/products', methods=['POST'])
@jwt_required()
def create_product():
    """Create new product (supports JSON or multipart form with optional image)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user or user.role != 'vendor' or not user.vendor_profile:
            return jsonify({'error': 'Vendor profile not found'}), 404
        
        is_multipart = request.content_type and 'multipart/form-data' in request.content_type
        data = request.form.to_dict() if is_multipart else (request.get_json() or {})
        
        # Validate required fields
        required_fields = ['name', 'category_id', 'original_price', 'discounted_price', 'stock_quantity', 'expiry_date']
        for field in required_fields:
            if field not in data or data[field] in (None, ''):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Coerce types
        try:
            category_id = int(str(data['category_id']).strip())
            original_price = float(str(data['original_price']).strip())
            discounted_price = float(str(data['discounted_price']).strip())
            stock_quantity = int(str(data['stock_quantity']).strip())
        except (ValueError, TypeError, KeyError):
            return jsonify({'error': 'Invalid numeric value for category_id, prices or stock_quantity'}), 400
        
        # Validate category exists
        from models import Category
        if not Category.query.get(category_id):
            return jsonify({'error': 'Selected category does not exist'}), 400
        
        # Business validations
        if stock_quantity < 0:
            return jsonify({'error': 'stock_quantity cannot be negative'}), 400
        if original_price < 0 or discounted_price < 0:
            return jsonify({'error': 'Prices must be non-negative'}), 400
        if original_price == 0:
            return jsonify({'error': 'original_price must be greater than 0'}), 400
        if discounted_price > original_price:
            return jsonify({'error': 'discounted_price cannot exceed original_price'}), 400
        
        # Calculate discount percentage
        discount_percentage = ((original_price - discounted_price) / original_price) * 100
        
        # Parse dates
        try:
            expiry_date = datetime.strptime(data['expiry_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid expiry date format. Use YYYY-MM-DD'}), 400
        if expiry_date < date.today():
            return jsonify({'error': 'expiry_date cannot be in the past'}), 400
        
        manufacturing_date = None
        if data.get('manufacturing_date'):
            try:
                manufacturing_date = datetime.strptime(data['manufacturing_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid manufacturing date format. Use YYYY-MM-DD'}), 400
        
        # Handle image upload (optional)
        image_url = data.get('image_url')
        if is_multipart and 'image' in request.files and request.files['image']:
            file = request.files['image']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                # Ensure unique filename
                name, ext = os.path.splitext(filename)
                filename = f"{user.vendor_profile.id}_{int(time.time())}_{name}{ext}"
                upload_folder = current_app.config['UPLOAD_FOLDER']
                os.makedirs(upload_folder, exist_ok=True)
                file.save(os.path.join(upload_folder, filename))
                image_url = f"/uploads/{filename}"
            else:
                return jsonify({'error': 'Invalid image file type'}), 400
        
        product = Product(
            vendor_id=user.vendor_profile.id,
            category_id=category_id,
            name=data['name'],
            description=data.get('description'),
            original_price=original_price,
            discounted_price=discounted_price,
            discount_percentage=discount_percentage,
            stock_quantity=stock_quantity,
            expiry_date=expiry_date,
            manufacturing_date=manufacturing_date,
            brand=data.get('brand'),
            unit=data.get('unit'),
            image_url=image_url,
            additional_images=data.get('additional_images')
        )
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify({'message': 'Product created successfully', 'product': product.to_dict()}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@vendor_bp.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """Update product (supports JSON or multipart form with optional image)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user or user.role != 'vendor' or not user.vendor_profile:
            return jsonify({'error': 'Vendor profile not found'}), 404
        
        product = Product.query.filter_by(id=product_id, vendor_id=user.vendor_profile.id).first()
        
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        is_multipart = request.content_type and 'multipart/form-data' in request.content_type
        data = request.form.to_dict() if is_multipart else (request.get_json() or {})
        
        # Update fields with type coercion/validation as needed
        if 'name' in data:
            product.name = data['name']
        if 'description' in data:
            product.description = data['description']
        if 'category_id' in data:
            try:
                product.category_id = int(data['category_id'])
            except ValueError:
                return jsonify({'error': 'Invalid category_id'}), 400
        if 'original_price' in data:
            try:
                product.original_price = float(data['original_price'])
            except ValueError:
                return jsonify({'error': 'Invalid original_price'}), 400
        if 'discounted_price' in data:
            try:
                product.discounted_price = float(data['discounted_price'])
            except ValueError:
                return jsonify({'error': 'Invalid discounted_price'}), 400
        if 'stock_quantity' in data:
            try:
                sq = int(data['stock_quantity'])
            except ValueError:
                return jsonify({'error': 'Invalid stock_quantity'}), 400
            if sq < 0:
                return jsonify({'error': 'stock_quantity cannot be negative'}), 400
            product.stock_quantity = sq
        if 'brand' in data:
            product.brand = data['brand']
        if 'unit' in data:
            product.unit = data['unit']
        if 'image_url' in data:
            product.image_url = data['image_url']
        if 'is_active' in data:
            product.is_active = bool(data['is_active']) if isinstance(data['is_active'], bool) else str(data['is_active']).lower() == 'true'
        
        if 'expiry_date' in data:
            try:
                new_expiry = datetime.strptime(data['expiry_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid expiry date format'}), 400
            if new_expiry < date.today():
                return jsonify({'error': 'expiry_date cannot be in the past'}), 400
            product.expiry_date = new_expiry
        
        # Optional image file in multipart update
        if is_multipart and 'image' in request.files and request.files['image']:
            file = request.files['image']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                name, ext = os.path.splitext(filename)
                filename = f"{user.vendor_profile.id}_{int(time.time())}_{name}{ext}"
                upload_folder = current_app.config['UPLOAD_FOLDER']
                os.makedirs(upload_folder, exist_ok=True)
                file.save(os.path.join(upload_folder, filename))
                product.image_url = f"/uploads/{filename}"
            else:
                return jsonify({'error': 'Invalid image file type'}), 400
        
        # Recalculate discount
        if product.original_price and product.discounted_price is not None:
            if product.original_price <= 0:
                return jsonify({'error': 'original_price must be greater than 0'}), 400
            if product.discounted_price > product.original_price:
                return jsonify({'error': 'discounted_price cannot exceed original_price'}), 400
            product.discount_percentage = ((product.original_price - product.discounted_price) / product.original_price) * 100
        
        db.session.commit()
        
        return jsonify({'message': 'Product updated successfully', 'product': product.to_dict()}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@vendor_bp.route('/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    """Delete product"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user or user.role != 'vendor' or not user.vendor_profile:
            return jsonify({'error': 'Vendor profile not found'}), 404
        
        product = Product.query.filter_by(id=product_id, vendor_id=user.vendor_profile.id).first()
        
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        db.session.delete(product)
        db.session.commit()
        
        return jsonify({'message': 'Product deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@vendor_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_vendor_orders():
    """Get all orders containing vendor's products"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user or user.role != 'vendor' or not user.vendor_profile:
            return jsonify({'error': 'Vendor profile not found'}), 404
        
        # Get order items for vendor's products
        vendor_product_ids = [p.id for p in user.vendor_profile.products]
        
        order_items = OrderItem.query.filter(
            OrderItem.product_id.in_(vendor_product_ids)
        ).all()
        
        # Get unique orders
        order_ids = list(set([item.order_id for item in order_items]))
        orders = Order.query.filter(Order.id.in_(order_ids)).order_by(Order.created_at.desc()).all()
        
        return jsonify([order.to_dict() for order in orders]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@vendor_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get vendor dashboard statistics"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user or user.role != 'vendor' or not user.vendor_profile:
            return jsonify({'error': 'Vendor profile not found'}), 404
        
        products = user.vendor_profile.products
        total_products = len(products)
        active_products = sum(1 for p in products if p.is_active)
        total_stock = sum(p.stock_quantity for p in products)
        total_sold = sum(p.sold_count for p in products)
        
        # Calculate revenue
        vendor_product_ids = [p.id for p in products]
        order_items = OrderItem.query.filter(OrderItem.product_id.in_(vendor_product_ids)).all()
        total_revenue = sum(item.total_price for item in order_items)
        
        return jsonify({
            'total_products': total_products,
            'active_products': active_products,
            'total_stock': total_stock,
            'total_sold': total_sold,
            'total_revenue': total_revenue
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
