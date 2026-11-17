from app import app, db, MenuItem

foods = [
    {"name": "Mini Cakes", "category": "Desserts", "price": 180},
    {"name": "Cookies", "category": "Desserts", "price": 120},
    {"name": "Spring Rolls", "category": "Snacks", "price": 160},
    {"name": "Fruit Bowl", "category": "Healthy", "price": 180},
    {"name": "Green Salad", "category": "Healthy", "price": 150},
    {"name": "Bubble Tea", "category": "Drinks", "price": 220},
    {"name": "Sandwich", "category": "Snacks", "price": 180},
    {"name": "Pan Pizza", "category": "Pizza", "price": 350},
    {"name": "Mini Burger", "category": "Burgers", "price": 250},
    {"name": "Veg Momo", "category": "Nepali", "price": 150},
    {"name": "Veg Biryani", "category": "Rice", "price": 280},
    {"name": "Thupka", "category": "Nepali", "price": 220},
    {"name": "Peach Iced Tea", "category": "Drinks", "price": 160},
    {"name": "Lemonade", "category": "Drinks", "price": 130},
    {"name": "Fried Rice", "category": "Rice", "price": 200},
    {"name": "Cold Coffee", "category": "Drinks", "price": 180},
    {"name": "Chowmein", "category": "Noodles", "price": 180},
]

with app.app_context():
    existing_items = MenuItem.query.count()

    if existing_items > 0:
        print(f"Your database already has {existing_items} food items.")
    else:
        for food in foods:
            db.session.add(MenuItem(**food))

        db.session.commit()
        print(f"Success! Added {len(foods)} food items.")