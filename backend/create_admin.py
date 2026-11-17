
from app import app, db, User
from werkzeug.security import generate_password_hash
from getpass import getpass

with app.app_context():

    print("===== CREATE ADMIN ACCOUNT =====")

    name = input("Enter admin name: ").strip()
    email = input("Enter admin email: ").strip().lower()
    password = getpass("Enter admin password: ")
    confirm_password = getpass("Confirm admin password: ")

    if not name or not email:
        print("Name and email are required.")

    elif len(password) < 8:
        print("Password must contain at least 8 characters.")

    elif password != confirm_password:
        print("Passwords do not match.")

    elif User.query.filter_by(email=email).first():
        print("An account with this email already exists.")

    else:
        admin = User(
            name=name,
            email=email,
            password=generate_password_hash(password),
            role="admin"
        )

        db.session.add(admin)
        db.session.commit()

        print("\nAdmin account created successfully!")
        print("Name:", admin.name)
        print("Email:", admin.email)
        print("Role:", admin.role)
