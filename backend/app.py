from flask import Flask, jsonify, request, g
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from functools import wraps
import os
from dotenv import load_dotenv
load_dotenv()
app = Flask(__name__)

# =========================
# APP CONFIGURATION
# =========================

CORS(app, origins=[
    "http://localhost:5173",
    "http://localhost:5174"
])

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///cloudkitchen.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")

if not app.config["SECRET_KEY"]:
    raise RuntimeError("SECRET_KEY is not set. Please configure it in your environment.")
db = SQLAlchemy(app)

token_serializer = URLSafeTimedSerializer(app.config["SECRET_KEY"])


# =========================
# USER DATABASE MODEL
# =========================

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(30), nullable=False, default="customer")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role
        }


# =========================
# MENU DATABASE MODEL
# =========================

class MenuItem(db.Model):
    __tablename__ = "menu_items"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    image = db.Column(db.String(255), nullable=True)
    is_available = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "price": self.price,
            "image": self.image,
            "is_available": self.is_available
        }


# =========================
# AUTHENTICATION HELPERS
# =========================

# =========================
# ORDER DATABASE MODEL
# =========================

class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(30), unique=True, nullable=False)
    customer_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    payment_method = db.Column(db.String(50), nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    delivery_fee = db.Column(db.Float, default=0)
    total = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(30), default="Pending")
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    items = db.relationship(
        "OrderItem",
        backref="order",
        cascade="all, delete-orphan"
    )
    # =========================
# ORDER ITEMS DATABASE MODEL
# =========================

class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = db.Column(db.Integer, primary_key=True)

    order_id = db.Column(
        db.Integer,
        db.ForeignKey("orders.id"),
        nullable=False
    )

    menu_item_id = db.Column(
        db.Integer,
        db.ForeignKey("menu_items.id"),
        nullable=True
    )

    item_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)

def create_access_token(user):
    return token_serializer.dumps({
        "user_id": user.id
    })


def token_required(function):
    @wraps(function)
    def decorated(*args, **kwargs):

        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({
                "error": "Authentication token is required."
            }), 401

        token = auth_header.split(" ", 1)[1]

        try:
            data = token_serializer.loads(
                token,
                max_age=86400
            )

            user = db.session.get(User, data["user_id"])

            if user is None:
                return jsonify({
                    "error": "User account not found."
                }), 401

            g.current_user = user

        except SignatureExpired:
            return jsonify({
                "error": "Your session has expired. Please log in again."
            }), 401

        except (BadSignature, KeyError, TypeError):
            return jsonify({
                "error": "Invalid authentication token."
            }), 401

        return function(*args, **kwargs)

    return decorated


# =========================
# ROLE-BASED ACCESS PROTECTION
# =========================

def role_required(*required_roles):
    def decorator(function):
        @wraps(function)
        def decorated(*args, **kwargs):

            if g.current_user.role not in required_roles:
                return jsonify({
                    "error": "Access denied. You do not have permission to perform this action."
                }), 403

            return function(*args, **kwargs)

        return decorated
    return decorator

# =========================
# HOME ROUTE
# =========================

@app.route("/")
def home():
    return jsonify({
        "message": "Cloud Kitchen Management System Backend is running!",
        "status": "success"
    })


# =========================
# HEALTH CHECK
# =========================

@app.route("/api/health")
def health():
    return jsonify({
        "status": "healthy",
        "backend": "Flask"
    })


# =========================
# TEST REACT CONNECTION
# =========================

@app.route("/api/test")
def test_connection():
    return jsonify({
        "message": "React can connect to the Flask backend!",
        "connected": True
    })


# =========================
# CUSTOMER REGISTRATION
# =========================

@app.route("/api/auth/register", methods=["POST"])
def register():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Please send valid JSON data."}), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "Name is required."}), 400

    if not isinstance(email, str) or not email.strip():
        return jsonify({"error": "Email is required."}), 400

    if not isinstance(password, str) or len(password) < 8:
        return jsonify({
            "error": "Password must contain at least 8 characters."
        }), 400

    email = email.strip().lower()

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({
            "error": "An account with this email already exists."
        }), 409

    new_user = User(
        name=name.strip(),
        email=email,
        password=generate_password_hash(password),
        role="customer"
    )

    try:
        db.session.add(new_user)
        db.session.commit()

        token = create_access_token(new_user)

        return jsonify({
            "message": "Registration successful!",
            "access_token": token,
            "user": new_user.to_dict()
        }), 201

    except Exception:
        db.session.rollback()
        app.logger.exception("Registration failed")

        return jsonify({
            "error": "Could not create your account."
        }), 500
        
        
# =========================
# CREATE DELIVERY DRIVER (ADMIN ONLY)
# =========================

@app.route("/api/admin/create-driver", methods=["POST"])
@token_required
@role_required("admin")
def create_delivery_driver():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Please send valid JSON data."}), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "Driver name is required."}), 400

    if not isinstance(email, str) or not email.strip():
        return jsonify({"error": "Driver email is required."}), 400

    if not isinstance(password, str) or len(password) < 8:
        return jsonify({
            "error": "Password must contain at least 8 characters."
        }), 400

    email = email.strip().lower()

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({
            "error": "An account with this email already exists."
        }), 409

    driver = User(
        name=name.strip(),
        email=email,
        password=generate_password_hash(password),
        role="delivery_driver"
    )

    try:
        db.session.add(driver)
        db.session.commit()

        return jsonify({
            "message": "Delivery driver account created successfully!",
            "user": driver.to_dict()
        }), 201

    except Exception:
        db.session.rollback()
        app.logger.exception("Delivery driver creation failed")

        return jsonify({
            "error": "Could not create delivery driver account."
        }), 500



# =========================
# USER LOGIN
# =========================

@app.route("/api/auth/login", methods=["POST"])
def login():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Please send valid JSON data."}), 400

    email = data.get("email")
    password = data.get("password")

    if not isinstance(email, str) or not isinstance(password, str):
        return jsonify({
            "error": "Email and password are required."
        }), 400

    email = email.strip().lower()

    user = User.query.filter_by(email=email).first()

    if user is None or not check_password_hash(user.password, password):
        return jsonify({
            "error": "Invalid email or password."
        }), 401

    token = create_access_token(user)

    return jsonify({
        "message": "Login successful!",
        "access_token": token,
        "user": user.to_dict()
    })


# =========================
# GET LOGGED-IN USER
# =========================

@app.route("/api/auth/me", methods=["GET"])
@token_required
def get_current_user():

    return jsonify({
        "user": g.current_user.to_dict()
    })


# =========================
# GET ALL MENU ITEMS
# =========================

@app.route("/api/menu", methods=["GET"])
def get_menu():
    items = MenuItem.query.order_by(MenuItem.id).all()
    return jsonify([item.to_dict() for item in items])


# =========================
# ADD NEW MENU ITEM (ADMIN ONLY)
# =========================

@app.route("/api/admin/menu", methods=["POST"])
@token_required
@role_required("admin")
def add_menu_item():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Please send valid JSON data."}), 400

    name = data.get("name")
    category = data.get("category")
    price = data.get("price")
    image = data.get("image")
    is_available = data.get("is_available", True)

    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "Food name is required."}), 400

    if not isinstance(category, str) or not category.strip():
        return jsonify({"error": "Food category is required."}), 400

    try:
        price = float(price)
        if price < 0:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"error": "Please enter a valid non-negative price."}), 400

    if not isinstance(is_available, bool):
        return jsonify({"error": "Availability must be true or false."}), 400

    if image is not None and not isinstance(image, str):
        return jsonify({"error": "Image must be a text path or URL."}), 400

    new_item = MenuItem(
        name=name.strip(),
        category=category.strip(),
        price=price,
        image=image,
        is_available=is_available
    )

    try:
        db.session.add(new_item)
        db.session.commit()

        return jsonify({
            "message": "Food item added successfully!",
            "item": new_item.to_dict()
        }), 201

    except Exception:
        db.session.rollback()
        app.logger.exception("Could not add menu item")
        return jsonify({"error": "Could not add menu item."}), 500


# =========================
# UPDATE MENU ITEM (ADMIN ONLY)
# =========================

@app.route("/api/admin/menu/<int:item_id>", methods=["PUT"])
@token_required
@role_required("admin")
def update_menu_item(item_id):

    item = db.session.get(MenuItem, item_id)

    if item is None:
        return jsonify({"error": "Food item not found."}), 404

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Please send valid JSON data."}), 400

    if "name" in data:
        if not isinstance(data["name"], str) or not data["name"].strip():
            return jsonify({"error": "Food name cannot be empty."}), 400
        item.name = data["name"].strip()

    if "category" in data:
        if not isinstance(data["category"], str) or not data["category"].strip():
            return jsonify({"error": "Category cannot be empty."}), 400
        item.category = data["category"].strip()

    if "price" in data:
        try:
            price = float(data["price"])
            if price < 0:
                raise ValueError
            item.price = price
        except (TypeError, ValueError):
            return jsonify({"error": "Please enter a valid non-negative price."}), 400

    if "image" in data:
        if data["image"] is not None and not isinstance(data["image"], str):
            return jsonify({"error": "Image must be a text path or URL."}), 400
        item.image = data["image"]

    if "is_available" in data:
        if not isinstance(data["is_available"], bool):
            return jsonify({"error": "Availability must be true or false."}), 400
        item.is_available = data["is_available"]

    try:
        db.session.commit()

        return jsonify({
            "message": "Food item updated successfully!",
            "item": item.to_dict()
        })

    except Exception:
        db.session.rollback()
        app.logger.exception("Could not update menu item")
        return jsonify({"error": "Could not update menu item."}), 500


# =========================
# DELETE MENU ITEM (ADMIN ONLY)
# =========================

@app.route("/api/admin/menu/<int:item_id>", methods=["DELETE"])
@token_required
@role_required("admin")
def delete_menu_item(item_id):

    item = db.session.get(MenuItem, item_id)

    if item is None:
        return jsonify({"error": "Food item not found."}), 404

    try:
        db.session.delete(item)
        db.session.commit()

        return jsonify({
            "message": "Food item deleted successfully!"
        })

    except Exception:
        db.session.rollback()
        app.logger.exception("Could not delete menu item")
        return jsonify({"error": "Could not delete menu item."}), 500


# =========================
# CHANGE FOOD AVAILABILITY (ADMIN ONLY)
# =========================

@app.route("/api/admin/menu/<int:item_id>/availability", methods=["PATCH"])
@token_required
@role_required("admin")
def change_availability(item_id):

    item = db.session.get(MenuItem, item_id)

    if item is None:
        return jsonify({"error": "Food item not found."}), 404

    data = request.get_json(silent=True)

    if not isinstance(data, dict) or not isinstance(data.get("is_available"), bool):
        return jsonify({
            "error": "Please provide is_available as true or false."
        }), 400

    item.is_available = data["is_available"]

    try:
        db.session.commit()

        return jsonify({
            "message": "Food availability updated successfully!",
            "item": item.to_dict()
        })

    except Exception:
        db.session.rollback()
        app.logger.exception("Could not change food availability")
        return jsonify({"error": "Could not change availability."}), 500


# =========================
# ADD 17 SAMPLE FOOD ITEMS
# =========================

@app.route("/api/seed-menu", methods=["POST"])
@token_required
@role_required("admin")
def seed_menu():

    if MenuItem.query.first():
        return jsonify({
            "message": "Menu items already exist. No duplicates added."
        }), 409

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
        {"name": "Chowmein", "category": "Noodles", "price": 180}
    ]

    try:
        for food in foods:
            db.session.add(MenuItem(**food))

        db.session.commit()

        return jsonify({
            "message": "Sample menu added successfully!",
            "count": len(foods)
        }), 201

    except Exception:
        db.session.rollback()
        app.logger.exception("Could not add sample menu")

        return jsonify({
            "error": "Could not add sample menu."
        }), 500


# =========================
# CREATE DATABASE TABLES
# =========================

with app.app_context():
    db.create_all()

# =========================
# CREATE CUSTOMER ORDER API
# =========================

@app.route("/api/orders", methods=["POST"])
def create_order():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Order data is required"}), 400

        required_fields = [
            "orderId", "name", "phone", "address",
            "paymentMethod", "subtotal", "total", "items"
        ]

        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        order = Order(
            order_id=data["orderId"],
            customer_name=data["name"],
            phone=data["phone"],
            address=data["address"],
            city=data.get("city", ""),
            notes=data.get("notes", ""),
            payment_method=data["paymentMethod"],
            subtotal=float(data["subtotal"]),
            delivery_fee=float(data.get("deliveryFee", 0)),
            total=float(data["total"]),
            status="Pending"
        )

        db.session.add(order)
        db.session.flush()

        for item in data["items"]:
            order_item = OrderItem(
                order_id=order.id,
                menu_item_id=item.get("id"),
                item_name=item["name"],
                quantity=int(item["quantity"]),
                price=float(item["price"])
            )
            db.session.add(order_item)

        db.session.commit()

        return jsonify({
            "message": "Order placed successfully",
            "orderId": order.order_id,
            "status": order.status
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    # =========================
# GET ALL ORDERS
# =========================

# =========================
# GET ALL ORDERS (STAFF ONLY)
# =========================

@app.route("/api/orders", methods=["GET"])
@token_required
@role_required("admin", "kitchen_staff", "delivery_driver")
def get_orders():
    try:
        current_role = g.current_user.role

        # Admin can view all orders
        if current_role == "admin":
            orders = Order.query.order_by(
                Order.created_at.desc()
            ).all()

        # Kitchen Staff can view kitchen orders
        elif current_role == "kitchen_staff":
            orders = Order.query.filter(
                Order.status.in_(["Pending", "Preparing", "Ready"])
            ).order_by(Order.created_at.desc()).all()

        # Delivery Driver can view orders sent for delivery
        elif current_role == "delivery_driver":
            orders = Order.query.filter_by(
                status="Out for Delivery"
            ).order_by(Order.created_at.desc()).all()

        result = []

        for order in orders:
            items = OrderItem.query.filter_by(
                order_id=order.id
            ).all()

            result.append({
                "orderId": order.order_id,
                "customer": {
                    "name": order.customer_name,
                    "phone": order.phone,
                    "address": order.address,
                    "city": order.city
                },
                "paymentMethod": order.payment_method,
                "subtotal": order.subtotal,
                "deliveryFee": order.delivery_fee,
                "total": order.total,
                "status": order.status,
                "items": [
                    {
                        "name": item.item_name,
                        "quantity": item.quantity,
                        "price": item.price
                    }
                    for item in items
                ]
            })

        return jsonify(result), 200

    except Exception:
        db.session.rollback()
        app.logger.exception("Could not load orders")
        return jsonify({"error": "Could not load orders."}), 500

# =========================
# UPDATE ORDER STATUS
# =========================

# =========================
# UPDATE ORDER STATUS (STAFF ONLY)
# =========================

@app.route("/api/orders/<string:order_id>/status", methods=["PATCH"])
@token_required
@role_required("admin", "kitchen_staff", "delivery_driver")
def update_order_status(order_id):
    try:
        data = request.get_json(silent=True)

        if not isinstance(data, dict) or "status" not in data:
            return jsonify({"error": "Status is required"}), 400

        new_status = data["status"]

        allowed_statuses = [
            "Pending",
            "Preparing",
            "Ready",
            "Out for Delivery",
            "Delivered"
        ]

        if new_status not in allowed_statuses:
            return jsonify({"error": "Invalid order status"}), 400

        order = Order.query.filter_by(order_id=order_id).first()

        if not order:
            return jsonify({"error": "Order not found"}), 404

        current_role = g.current_user.role
        current_status = order.status

        # Admin can update any valid status
        if current_role == "admin":
            pass

        # Kitchen Staff can prepare and hand over orders
        elif current_role == "kitchen_staff":
            allowed_transitions = {
                "Pending": "Preparing",
                "Preparing": "Ready",
                "Ready": "Out for Delivery"
            }

            if allowed_transitions.get(current_status) != new_status:
                return jsonify({
                    "error": "Kitchen Staff cannot make this status change."
                }), 403

        # Delivery Driver can only mark delivery as completed
        elif current_role == "delivery_driver":
            if not (
                current_status == "Out for Delivery"
                and new_status == "Delivered"
            ):
                return jsonify({
                    "error": "Driver can only mark an order as Delivered."
                }), 403

        order.status = new_status
        db.session.commit()

        return jsonify({
            "message": "Order status updated successfully",
            "orderId": order.order_id,
            "status": order.status
        }), 200

    except Exception:
        db.session.rollback()
        app.logger.exception("Could not update order status")
        return jsonify({"error": "Could not update order status."}), 500


# =========================
# DELETE ORDER
# =========================

# =========================
# DELETE ORDER (ADMIN ONLY)
# =========================

@app.route("/api/orders/<string:order_id>", methods=["DELETE"])
@token_required
@role_required("admin")
def delete_order(order_id):
    try:
        order = Order.query.filter_by(order_id=order_id).first()

        if not order:
            return jsonify({"error": "Order not found"}), 404

        db.session.delete(order)
        db.session.commit()

        return jsonify({
            "message": "Order deleted successfully"
        }), 200

    except Exception:
        db.session.rollback()
        app.logger.exception("Could not delete order")
        return jsonify({"error": "Could not delete order."}), 500
# =========================
# RUN SERVER
# =========================

if __name__ == "__main__":
    app.run(debug=True, port=5000)
