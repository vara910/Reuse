from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db, Product, Category
from datetime import datetime, date
from sqlalchemy import or_, and_

products_bp = Blueprint('products', __name__)

@products_bp.route('', methods=['GET'])
def get_products():
    """Get all products with filtering, search, and pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        category_id = request.args.get('category_id', type=int)
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        sort_by = request.args.get('sort_by', 'created_at')  # created_at, price_low, price_high, expiry, popular
        days_to_expiry = request.args.get('days_to_expiry', type=int)
        
        # Base query - only active products
        query = Product.query.filter_by(is_active=True)
        
        # Search filter
        if search:
            search_filter = or_(
                Product.name.ilike(f'%{search}%'),
                Product.description.ilike(f'%{search}%'),
                Product.brand.ilike(f'%{search}%')
            )
            query = query.filter(search_filter)
        
        # Category filter
        if category_id:
            query = query.filter_by(category_id=category_id)
        
        # Price filters
        if min_price is not None:
            query = query.filter(Product.discounted_price >= min_price)
        if max_price is not None:
            query = query.filter(Product.discounted_price <= max_price)
        
        # Days to expiry filter
        if days_to_expiry is not None:
            target_date = date.today()
            from datetime import timedelta
            expiry_before = target_date + timedelta(days=days_to_expiry)
            query = query.filter(Product.expiry_date <= expiry_before)
        
        # Sorting
        if sort_by == 'price_low':
            query = query.order_by(Product.discounted_price.asc())
        elif sort_by == 'price_high':
            query = query.order_by(Product.discounted_price.desc())
        elif sort_by == 'expiry':
            query = query.order_by(Product.expiry_date.asc())
        elif sort_by == 'popular':
            query = query.order_by(Product.sold_count.desc())
        else:
            query = query.order_by(Product.created_at.desc())
        
        # Pagination
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
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

@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get single product details"""
    try:
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        # Increment view count
        product.views_count += 1
        db.session.commit()
        
        return jsonify(product.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/featured', methods=['GET'])
def get_featured_products():
    """Get featured products (most popular or expiring soon)"""
    try:
        limit = request.args.get('limit', 10, type=int)
        
        # Get products expiring in next 7 days with highest discounts
        from datetime import timedelta
        expiry_date = date.today() + timedelta(days=7)
        
        products = Product.query.filter(
            Product.is_active == True,
            Product.expiry_date <= expiry_date,
            Product.stock_quantity > 0
        ).order_by(Product.discount_percentage.desc()).limit(limit).all()
        
        return jsonify([product.to_dict() for product in products]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/trending', methods=['GET'])
def get_trending_products():
    """Get trending products (most viewed and sold recently)"""
    try:
        limit = request.args.get('limit', 10, type=int)
        
        products = Product.query.filter_by(is_active=True).order_by(
            Product.sold_count.desc(),
            Product.views_count.desc()
        ).limit(limit).all()
        
        return jsonify([product.to_dict() for product in products]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
