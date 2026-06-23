#!/usr/bin/env python3
import urllib.request
import json
import sys

# Test 1: Register Admin
print("=" * 60)
print("TEST 1: Register Admin User")
print("=" * 60)

url = "http://72.61.62.17:8083/api/auth/register"
data = {
    "name": "Admin Principal",
    "email": "admin@valemilk.com",
    "password": "Admin@123456",
    "role": "admin"
}

req = urllib.request.Request(
    url,
    data=json.dumps(data).encode('utf-8'),
    headers={"Content-Type": "application/json"},
    method="POST"
)

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode())
        print("✅ SUCCESS:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
except urllib.error.HTTPError as e:
    print(f"❌ HTTP Error {e.code}")
    print(e.read().decode())
except Exception as e:
    print(f"❌ Error: {type(e).__name__}: {e}")

# Test 2: Login
print("\n" + "=" * 60)
print("TEST 2: Login")
print("=" * 60)

url = "http://72.61.62.17:8083/api/auth/login"
data = {
    "email": "admin@valemilk.com",
    "password": "Admin@123456"
}

req = urllib.request.Request(
    url,
    data=json.dumps(data).encode('utf-8'),
    headers={"Content-Type": "application/json"},
    method="POST"
)

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode())
        print("✅ SUCCESS:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        if 'token' in result:
            token = result['token']
            print(f"\n🔑 Token: {token[:50]}...")
except urllib.error.HTTPError as e:
    print(f"❌ HTTP Error {e.code}")
    print(e.read().decode())
except Exception as e:
    print(f"❌ Error: {type(e).__name__}: {e}")

# Test 3: Get Frontend
print("\n" + "=" * 60)
print("TEST 3: Get Frontend (root)")
print("=" * 60)

try:
    with urllib.request.urlopen("http://72.61.62.17:8083/") as response:
        print("✅ Frontend responding")
        print(f"Status: {response.status}")
        print(f"Content-Type: {response.headers.get('Content-Type')}")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 60)
print("DIAGNÓSTICO COMPLETO")
print("=" * 60)
