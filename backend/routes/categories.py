from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Category, User
import re

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('', methods=['GET'])
def get_categories():
    """Get all categories"""
    try:
        categories = Category.query.filter_by(is_active=True).all()
        return jsonify([category.to_dict() for category in categories]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@categories_bp.route('', methods=['POST'])
@jwt_required()
def create_category():
    """Create a new category (vendor role required)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user or user.role != 'vendor':
            return jsonify({'error': 'Vendor access required'}), 403
        # Accept JSON or form-encoded
        data = request.get_json(silent=True) or request.form.to_dict() or {}
        if not data.get('name'):
            return jsonify({'error': 'name is required'}), 400
        name = data['name'].strip()
        # Generate slug if not provided
        if data.get('slug'):
            slug = data['slug'].strip().lower()
        else:
            slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
        # Check uniqueness
        if Category.query.filter((Category.name == name) | (Category.slug == slug)).first():
            return jsonify({'error': 'Category with same name or slug already exists'}), 400
        category = Category(
            name=name,
            slug=slug,
            description=data.get('description'),
            is_active=True
        )
        db.session.add(category)
        db.session.commit()
        return jsonify({'message': 'Category created', 'category': category.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/<int:category_id>', methods=['GET'])
def get_category(category_id):
    """Get single category"""
    try:
        category = Category.query.get(category_id)
        if not category:
            return jsonify({'error': 'Category not found'}), 404
        return jsonify(category.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
