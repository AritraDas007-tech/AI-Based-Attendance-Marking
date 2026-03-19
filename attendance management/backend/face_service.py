import face_recognition
import numpy as np
import json
import base64
import cv2

def get_face_encodings_from_base64(base64_string: str):
    """
    Decodes base64 image and returns face encodings.
    """
    try:
        # Remove header if present
        if "base64," in base64_string:
            base64_string = base64_string.split("base64,")[1]
            
        img_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Convert BGR to RGB
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Find face encodings
        encodings = face_recognition.face_encodings(rgb_img)
        
        # Return as list of lists (floats)
        return [enc.tolist() for enc in encodings]
    except Exception as e:
        print(f"DEBUG: Error in face encoding: {str(e)}")
        # Print the first 100 chars of base64 for debugging
        print(f"DEBUG: Base64 Sample: {base64_string[:100]}...")
        return []

def compare_faces(known_encodings, face_encoding_to_check, tolerance=0.6):
    """
    Compares a face encoding against a list of known encodings.
    """
    if not known_encodings:
        return False
        
    # known_encodings should be a list of numpy arrays
    matches = face_recognition.compare_faces(known_encodings, np.array(face_encoding_to_check), tolerance=tolerance)
    return any(matches)
