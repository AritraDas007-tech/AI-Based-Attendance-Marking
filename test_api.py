import requests
import base64
import json

# A tiny 1x1 black pixel base64 for initial structural test
# (though face_recognition will say "no face detected", this tests the API reachability)
tiny_img = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8f/internal_test_image"

def test_registration():
    try:
        # 1. Test encoding (should likely fail "no face", but tests API)
        print("Testing /face/encoding...")
        resp = requests.post("http://localhost:8000/face/encoding", json={"image": tiny_img})
        print(f"Status: {resp.status_code}, Response: {resp.json()}")

        # 2. Test registration with a mock encoding
        print("\nTesting /register/student with mock data...")
        mock_encoding = [0.1] * 128
        student_data = {
            "full_name": "Test Student",
            "roll_number": "TEST001",
            "department": "CS",
            "class_name": "Final Year",
            "mobile_number": "1234567890",
            "email": "test@example.com",
            "password": "password123",
            "face_encodings": [mock_encoding]
        }
        resp = requests.post("http://localhost:8000/register/student", json=student_data)
        print(f"Status: {resp.status_code}, Response: {resp.json()}")
        
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    test_registration()
