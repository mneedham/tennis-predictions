from flask import Flask
import jwt
from functools import wraps

def authorization_guard(function):
    @wraps(function)
    def decorator(*args, **kwargs):
        public_key = b"-----BEGIN PUBLIC KEY-----\nMHYwEAYHKoZIzj0CAQYFK4EEAC..."
        value = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzb21lIjoicGF5bG9hZCJ9.4twFt5NiznN84AWoo1d7KO1T_yoc0Z6XOpOVswacPZg"
        
        try:
          jwt.decode(value, public_key, algorithms=["RS256"])
        except Exception as error:
          print(error)

        return function(*args, **kwargs)

    return decorator

app = Flask(__name__)

@app.route("/", defaults={'path': ''})
@app.route('/<path:path>')
@authorization_guard
def catch_all(path):
  
  return {"decoded": True}
