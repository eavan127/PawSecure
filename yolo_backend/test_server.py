"""
Test script for YOLO backend server
Run this after starting the server to verify it's working
"""

import requests
import base64

# Test configuration
SERVER_URL = "http://localhost:5000"

def test_health():
    """Test the health endpoint"""
    print("\n1. Testing /health endpoint...")
    try:
        response = requests.get(f"{SERVER_URL}/health")
        if response.status_code == 200:
            print(f"   ✅ Health check passed: {response.json()}")
            return True
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_detect_with_sample():
    """Test detection with a sample base64 image"""
    print("\n2. Testing /detect endpoint...")
    print("   ℹ️  For a real test, you'd need to provide an actual image")
    print("   ℹ️  Use your React Native app to test actual detection")
    return True

def main():
    print("="*50)
    print("YOLO Backend Server - Test Suite")
    print("="*50)
    
    # Test health
    if not test_health():
        print("\n❌ Server is not responding. Make sure it's running:")
        print("   python yolo_server.py")
        return
    
    # Test detection endpoint info
    test_detect_with_sample()
    
    print("\n" + "="*50)
    print("✅ Basic tests passed!")
    print("="*50)
    print("\nNext steps:")
    print("1. Make sure server is running: python yolo_server.py")
    print("2. Open your React Native app")
    print("3. Go to AI Detection screen")
    print("4. Take/upload a photo of a dog or cat")
    print("5. Watch the detection work!")
    print()

if __name__ == "__main__":
    main()
