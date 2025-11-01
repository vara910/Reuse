from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, CartItem, Product

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('', methods=['GET'])
@jwt_required()
def get_cart():
    """Get user's cart items"""
    try:
        user_id = get_jwt_identity()
        cart_items = CartItem.query.filter_by(user_id=int(user_id)).all()
        
        items = [item.to_dict() for item in cart_items]
        total = sum(item['subtotal'] for item in items)
        
        return jsonify({
            'items': items,
            'total': total,
            'count': len(items)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cart_bp.route('', methods=['POST'])
@jwt_required()
def add_to_cart():
    """Add product to cart"""
    try:
        user_id = get_jwt_identity()
        user_id = int(user_id)
        data = request.get_json()
        
        if not data.get('product_id'):
            return jsonify({'error': 'Product ID is required'}), 400
        
        product = Product.query.get(data['product_id'])
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        if not product.is_active or product.stock_quantity <= 0:
            return jsonify({'error': 'Product is not available'}), 400
        
        quantity = data.get('quantity', 1)
        
        if quantity > product.stock_quantity:
            return jsonify({'error': f'Only {product.stock_quantity} items available'}), 400
        
        # Check if item already in cart
        cart_item = CartItem.query.filter_by(
            user_id=user_id,
            product_id=data['product_id']
        ).first()
        
        if cart_item:
            # Update quantity
            cart_item.quantity += quantity
            if cart_item.quantity > product.stock_quantity:
                return jsonify({'error': f'Only {product.stock_quantity} items available'}), 400
        else:
            # Create new cart item
            cart_item = CartItem(
                user_id=user_id,
                product_id=data['product_id'],
                quantity=quantity
            )
            db.session.add(cart_item)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Product added to cart',
            'cart_item': cart_item.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/<int:cart_item_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(cart_item_id):
    """Update cart item quantity"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        cart_item = CartItem.query.filter_by(id=cart_item_id, user_id=int(user_id)).first()
        
        if not cart_item:
            return jsonify({'error': 'Cart item not found'}), 404
        
        if 'quantity' not in data:
            return jsonify({'error': 'Quantity is required'}), 400
        
        quantity = data['quantity']
        
        if quantity <= 0:
            db.session.delete(cart_item)
        else:
            if quantity > cart_item.product.stock_quantity:
                return jsonify({'error': f'Only {cart_item.product.stock_quantity} items available'}), 400
            cart_item.quantity = quantity
        
        db.session.commit()
        
        return jsonify({'message': 'Cart updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/<int:cart_item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(cart_item_id):
    """Remove item from cart"""
    try:
        user_id = get_jwt_identity()
        
        cart_item = CartItem.query.filter_by(id=cart_item_id, user_id=int(user_id)).first()
        
        if not cart_item:
            return jsonify({'error': 'Cart item not found'}), 404
        
        db.session.delete(cart_item)
        db.session.commit()
        
        return jsonify({'message': 'Item removed from cart'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    """Clear all items from cart"""
    try:
        user_id = get_jwt_identity()
        
        CartItem.query.filter_by(user_id=int(user_id)).delete()
        db.session.commit()
        
        return jsonify({'message': 'Cart cleared successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
