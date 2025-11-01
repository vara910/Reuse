from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Address

addresses_bp = Blueprint('addresses', __name__)

@addresses_bp.route('', methods=['GET'])
@jwt_required()
def get_addresses():
    """Get user's addresses"""
    try:
        user_id = get_jwt_identity()
        addresses = Address.query.filter_by(user_id=int(user_id)).all()
        return jsonify([address.to_dict() for address in addresses]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@addresses_bp.route('', methods=['POST'])
@jwt_required()
def create_address():
    """Create new address"""
    try:
        user_id = get_jwt_identity()
        user_id = int(user_id)
        data = request.get_json()
        
        required_fields = ['full_name', 'phone', 'address_line1', 'city', 'state', 'pincode']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # If this is the first address or marked as default, set it as default
        if data.get('is_default') or not Address.query.filter_by(user_id=user_id).first():
            # Remove default from other addresses
            Address.query.filter_by(user_id=user_id, is_default=True).update({'is_default': False})
            is_default = True
        else:
            is_default = False
        
        address = Address(
            user_id=user_id,
            full_name=data['full_name'],
            phone=data['phone'],
            address_line1=data['address_line1'],
            address_line2=data.get('address_line2'),
            city=data['city'],
            state=data['state'],
            pincode=data['pincode'],
            is_default=is_default
        )
        
        db.session.add(address)
        db.session.commit()
        
        return jsonify({
            'message': 'Address created successfully',
            'address': address.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@addresses_bp.route('/<int:address_id>', methods=['PUT'])
@jwt_required()
def update_address(address_id):
    """Update address"""
    try:
        user_id = get_jwt_identity()
        address = Address.query.filter_by(id=address_id, user_id=int(user_id)).first()
        
        if not address:
            return jsonify({'error': 'Address not found'}), 404
        
        data = request.get_json()
        
        if 'full_name' in data:
            address.full_name = data['full_name']
        if 'phone' in data:
            address.phone = data['phone']
        if 'address_line1' in data:
            address.address_line1 = data['address_line1']
        if 'address_line2' in data:
            address.address_line2 = data['address_line2']
        if 'city' in data:
            address.city = data['city']
        if 'state' in data:
            address.state = data['state']
        if 'pincode' in data:
            address.pincode = data['pincode']
        
        if data.get('is_default'):
            Address.query.filter_by(user_id=user_id, is_default=True).update({'is_default': False})
            address.is_default = True
        
        db.session.commit()
        
        return jsonify({
            'message': 'Address updated successfully',
            'address': address.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@addresses_bp.route('/<int:address_id>', methods=['DELETE'])
@jwt_required()
def delete_address(address_id):
    """Delete address"""
    try:
        user_id = get_jwt_identity()
        address = Address.query.filter_by(id=address_id, user_id=int(user_id)).first()
        
        if not address:
            return jsonify({'error': 'Address not found'}), 404
        
        db.session.delete(address)
        db.session.commit()
        
        return jsonify({'message': 'Address deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
