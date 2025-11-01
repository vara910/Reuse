"""Initialize database with sample data"""
from app import create_app
from models import db, Category
from datetime import datetime

def init_database():
    app = create_app()
    
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created successfully!")
        
        # Check if categories exist
        if Category.query.count() == 0:
            # Add sample categories
            categories = [
                Category(name='Groceries', slug='groceries', description='Daily grocery items'),
                Category(name='Dairy Products', slug='dairy', description='Milk, cheese, yogurt, etc.'),
                Category(name='Bakery', slug='bakery', description='Bread, cakes, pastries'),
                Category(name='Fruits & Vegetables', slug='fruits-vegetables', description='Fresh produce'),
                Category(name='Beverages', slug='beverages', description='Drinks and juices'),
                Category(name='Snacks', slug='snacks', description='Chips, cookies, etc.'),
                Category(name='Personal Care', slug='personal-care', description='Toiletries and hygiene products'),
                Category(name='Household', slug='household', description='Cleaning supplies and essentials'),
            ]
            
            for category in categories:
                db.session.add(category)
            
            db.session.commit()
            print("Sample categories added successfully!")
        else:
            print("Categories already exist. Skipping category creation.")
        
        print("\nDatabase initialization complete!")
        print("You can now run the application with: python app.py")

if __name__ == '__main__':
    init_database()
