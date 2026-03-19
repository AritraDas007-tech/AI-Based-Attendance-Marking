try:
    import face_recognition
    print("SUCCESS: face_recognition imported")
    import cv2
    print("SUCCESS: opencv imported")
    import numpy as np
    print("SUCCESS: numpy imported")
except Exception as e:
    print(f"FAILURE: {e}")
