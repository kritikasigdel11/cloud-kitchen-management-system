
import requests

BASE_URL = "http://127.0.0.1:5000"

# Test customer registration
register_data = {
    "name": "Test Customer",
    "email": "testcustomer@gmail.com",
    "password": "test12345"
}

response = requests.post(
    f"{BASE_URL}/api/auth/register",
    json=register_data
)

print("REGISTRATION:")
print(response.status_code)
print(response.json())

# Test login
login_data = {
    "email": "testcustomer@gmail.com",
    "password": "test12345"
}

response = requests.post(
    f"{BASE_URL}/api/auth/login",
    json=login_data
)

print("\nLOGIN:")
print(response.status_code)
print(response.json())

if response.status_code == 200:
    token = response.json()["access_token"]

    # Test current logged-in user
    profile_response = requests.get(
        f"{BASE_URL}/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )

    print("\nCURRENT USER:")
    print(profile_response.status_code)
    print(profile_response.json())
