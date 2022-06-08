from flask import Flask
import jwt

public_key = b"-----BEGIN PUBLIC KEY-----\nMHYwEAYHKoZIzj0CAQYFK4EEAC..."

app = Flask(__name__)

@app.route("/<value>")
def catch_all(value):
  decoded = jwt.decode(value, public_key, algorithms=["RS256"])
  return decoded
