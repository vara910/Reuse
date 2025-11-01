from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Order, OrderItem, CartItem, Product
from datetime import datetime
import uuid

orders_bp = Blueprint('orders', __name__)

def generate_order_number():
    """Generate unique order number"""
    return f"ORD{datetime.now().strftime('%Y%m%d')}{uuid.uuid4().hex[:8].upper()}"

@orders_bp.route('', methods=['POST'])
@jwt_required()
def create_order():
    """Create new order from cart"""
    try:
        user_id = get_jwt_identity()
        user_id = int(user_id)
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['shipping_name', 'shipping_phone', 'shipping_address_line1', 
                          'shipping_city', 'shipping_state', 'shipping_pincode', 'payment_method']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Get cart items
        cart_items = CartItem.query.filter_by(user_id=int(user_id)).all()
        
        if not cart_items:
            return jsonify({'error': 'Cart is empty'}), 400
        
        # Calculate totals
        total_amount = 0
        order_items_data = []
        
        for cart_item in cart_items:
            product = cart_item.product
            
            # Verify product availability
            if not product.is_active or product.stock_quantity < cart_item.quantity:
                return jsonify({'error': f'Product {product.name} is not available'}), 400
            
            item_total = product.discounted_price * cart_item.quantity
            total_amount += item_total
            
            order_items_data.append({
                'product': product,
                'quantity': cart_item.quantity,
                'unit_price': product.discounted_price,
                'total_price': item_total
            })
        
        # Calculate shipping and tax
        shipping_amount = 0 if total_amount > 500 else 50  # Free shipping above 500
        tax_amount = total_amount * 0.05  # 5% tax
        final_amount = total_amount + shipping_amount + tax_amount
        
        # Create order
        order = Order(
            user_id=user_id,
            order_number=generate_order_number(),
            total_amount=total_amount,
            shipping_amount=shipping_amount,
            tax_amount=tax_amount,
            final_amount=final_amount,
            payment_method=data['payment_method'],
            shipping_name=data['shipping_name'],
            shipping_phone=data['shipping_phone'],
            shipping_address_line1=data['shipping_address_line1'],
            shipping_address_line2=data.get('shipping_address_line2'),
            shipping_city=data['shipping_city'],
            shipping_state=data['shipping_state'],
            shipping_pincode=data['shipping_pincode'],
            notes=data.get('notes')
        )
        
        db.session.add(order)
        db.session.flush()  # Get order ID
        
        # Create order items and update product stock
        for item_data in order_items_data:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data['product'].id,
                product_name=item_data['product'].name,
                product_image=item_data['product'].image_url,
                quantity=item_data['quantity'],
                unit_price=item_data['unit_price'],
                total_price=item_data['total_price']
            )
            db.session.add(order_item)
            
            # Update product stock and sold count
            item_data['product'].stock_quantity -= item_data['quantity']
            item_data['product'].sold_count += item_data['quantity']
        
        # Clear cart
        CartItem.query.filter_by(user_id=user_id).delete()
        
        # If COD, mark as confirmed
        if data['payment_method'] == 'cod':
            order.payment_status = 'pending'
            order.status = 'confirmed'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Order created successfully',
            'order': order.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('', methods=['GET'])
@jwt_required()
def get_orders():
    """Get user's orders"""
    try:
        user_id = get_jwt_identity()
        user_id = int(user_id)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        pagination = Order.query.filter_by(user_id=user_id).order_by(
            Order.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        orders = [order.to_dict() for order in pagination.items]
        
        return jsonify({
            'orders': orders,
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    """Get single order details"""
    try:
        user_id = get_jwt_identity()
        order = Order.query.filter_by(id=order_id, user_id=int(user_id)).first()
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        return jsonify(order.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<int:order_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_order(order_id):
    """Cancel an order"""
    try:
        user_id = get_jwt_identity()
        order = Order.query.filter_by(id=order_id, user_id=int(user_id)).first()
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        if order.status in ['delivered', 'cancelled']:
            return jsonify({'error': 'Order cannot be cancelled'}), 400
        
        order.status = 'cancelled'
        
        # Restore product stock
        for item in order.order_items:
            product = Product.query.get(item.product_id)
            if product:
                product.stock_quantity += item.quantity
                product.sold_count -= item.quantity
        
        db.session.commit()
        
        return jsonify({
            'message': 'Order cancelled successfully',
            'order': order.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
