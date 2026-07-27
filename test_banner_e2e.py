import urllib.request, urllib.parse, http.cookiejar, re
import uuid, os, mimetypes

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

def get_token(url):
    res = opener.open(url)
    html = res.read().decode("utf-8")
    match = re.search(r"name=\"__RequestVerificationToken\" type=\"hidden\" value=\"([^\"]+)\"", html)
    return match.group(1) if match else ""

print("1. Logging in as admin...")
token = get_token("http://localhost:8080/login")
data = urllib.parse.urlencode({
    "__RequestVerificationToken": token,
    "Email": "admin",
    "password": "123456"
}).encode("utf-8")
opener.open("http://localhost:8080/login", data=data)

print("2. Fetching Admin Banners page to get token...")
token = get_token("http://localhost:8080/admin/banners")

print("3. Uploading a new Banner...")
boundary = uuid.uuid4().hex
headers = {'Content-Type': f'multipart/form-data; boundary={boundary}'}

# Create a dummy image file
with open("dummy.jpg", "wb") as f:
    f.write(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xd2\xcf \xff\xd9")

fields = {
    "__RequestVerificationToken": token,
    "title": "TEST BANNER UPLOAD 2026",
    "description": "This is a test banner description",
    "linkUrl": "/test-link",
    "sortOrder": "10",
    "isActive": "true"
}

body = bytearray()
for k, v in fields.items():
    body.extend(f"--{boundary}\r\n".encode('utf-8'))
    body.extend(f"Content-Disposition: form-data; name=\"{k}\"\r\n\r\n".encode('utf-8'))
    body.extend(f"{v}\r\n".encode('utf-8'))

body.extend(f"--{boundary}\r\n".encode('utf-8'))
body.extend(b"Content-Disposition: form-data; name=\"image\"; filename=\"dummy.jpg\"\r\n")
body.extend(b"Content-Type: image/jpeg\r\n\r\n")
with open("dummy.jpg", "rb") as f:
    body.extend(f.read())
body.extend(b"\r\n")
body.extend(f"--{boundary}--\r\n".encode('utf-8'))

req = urllib.request.Request("http://localhost:8080/admin/banners", data=body, headers=headers)
try:
    res = opener.open(req)
    print("Upload successful!")
except Exception as e:
    print("Upload failed:", e)

print("4. Checking Frontend Homepage for the new banner...")
res = opener.open("http://localhost:8080/")
html = res.read().decode("utf-8")
if "TEST BANNER UPLOAD 2026" in html:
    print("✅ SUCCESS: The new banner 'TEST BANNER UPLOAD 2026' is visible on the frontend homepage!")
    
    # Extract the uploaded image URL from the HTML
    match = re.search(r'img src="(/uploads/banners/[^"]+)"', html)
    if match:
        print(f"✅ SUCCESS: Uploaded image URL found: {match.group(1)}")
    else:
        print("❌ FAILED: Could not find the uploaded image URL in the HTML")
else:
    print("❌ FAILED: The new banner is NOT visible on the frontend homepage.")

print("5. Getting Banner ID to delete...")
res = opener.open("http://localhost:8080/admin/banners")
admin_html = res.read().decode("utf-8")
# Find the banner ID
match = re.search(r'#deleteBannerModal-(\d+).*?TEST BANNER UPLOAD 2026', admin_html, re.DOTALL)
if match:
    banner_id = match.group(1)
    print(f"Found Banner ID: {banner_id}, deleting...")
    token = get_token("http://localhost:8080/admin/banners")
    data = urllib.parse.urlencode({
        "__RequestVerificationToken": token,
        "id": banner_id
    }).encode("utf-8")
    opener.open("http://localhost:8080/admin/banners/delete", data=data)
    print("Delete request sent.")
    
    res = opener.open("http://localhost:8080/")
    html = res.read().decode("utf-8")
    if "TEST BANNER UPLOAD 2026" not in html:
        print("✅ SUCCESS: Banner was successfully deleted and removed from FE.")
    else:
        print("❌ FAILED: Banner still exists on FE after deletion.")
else:
    print("Could not find banner ID to delete.")

