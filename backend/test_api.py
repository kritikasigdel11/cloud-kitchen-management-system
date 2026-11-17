import requests

url = "http://127.0.0.1:5000/api/admin/menu/18"

try:
    response = requests.delete(url)

    print("Status Code:", response.status_code)
    print("Response:", response.json())

except requests.exceptions.ConnectionError:
    print("Could not connect to Flask.")