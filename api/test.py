from flask import Flask
import jwt

public_key = b"-----BEGIN PUBLIC KEY-----\nMHYwEAYHKoZIzj0CAQYFK4EEAC..."

app = Flask(__name__)

@app.route("/", defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
  value = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzb21lIjoicGF5bG9hZCJ9.4twFt5NiznN84AWoo1d7KO1T_yoc0Z6XOpOVswacPZg"
  decoded = jwt.decode(value, public_key, algorithms=["RS256"])
  return decoded
