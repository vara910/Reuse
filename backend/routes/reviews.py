from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Review, Product, Order, OrderItem

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/product/<int:product_id>', methods=['GET'])
def get_product_reviews(product_id):
    """Get all reviews for a product"""
    try:
        reviews = Review.query.filter_by(product_id=product_id).order_by(
            Review.created_at.desc()
        ).all()
        return jsonify([review.to_dict() for review in reviews]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reviews_bp.route('', methods=['POST'])
@jwt_required()
def create_review():
    """Create new review"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('product_id') or not data.get('rating'):
            return jsonify({'error': 'Product ID and rating are required'}), 400
        
        if data['rating'] < 1 or data['rating'] > 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        
        # Check if user already reviewed this product
        existing_review = Review.query.filter_by(
            user_id=user_id,
            product_id=data['product_id']
        ).first()
        
        if existing_review:
            return jsonify({'error': 'You have already reviewed this product'}), 400
        
        # Check if user purchased this product
        is_verified = False
        user_orders = Order.query.filter_by(user_id=user_id).all()
        for order in user_orders:
            for item in order.order_items:
                if item.product_id == data['product_id']:
                    is_verified = True
                    break
            if is_verified:
                break
        
        review = Review(
            user_id=user_id,
            product_id=data['product_id'],
            rating=data['rating'],
            title=data.get('title'),
            comment=data.get('comment'),
            is_verified_purchase=is_verified
        )
        
        db.session.add(review)
        db.session.commit()
        
        return jsonify({
            'message': 'Review created successfully',
            'review': review.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@reviews_bp.route('/<int:review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(review_id):
    """Delete review"""
    try:
        user_id = get_jwt_identity()
        review = Review.query.filter_by(id=review_id, user_id=user_id).first()
        
        if not review:
            return jsonify({'error': 'Review not found'}), 404
        
        db.session.delete(review)
        db.session.commit()
        
        return jsonify({'message': 'Review deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
