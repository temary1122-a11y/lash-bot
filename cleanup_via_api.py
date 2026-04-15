import requests

url = "https://lashes-production-3342.up.railway.app/api/admin/cleanup-database"
headers = {"x-admin-id": "8736987138"}

response = requests.post(url, headers=headers)

print("Status:", response.status_code)
print("Response:", response.json())
