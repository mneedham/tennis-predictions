from flask import Flask, request
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

inner_app = Flask("Inner Flask")
inner_app.testing = True

@inner_app.route("/foo/<id>")
def foo(id):
  return f"/foo/{id}"

@inner_app.route("/bar")
def bar():
  return {"route": "/bar"}

@inner_app.route('/')
@inner_app.route('/<first>')
@inner_app.route('/<first>/<path:rest>')
def fallback(first=None, rest=None):
    return 'This one catches everything else'

@app.route("/", defaults={'path': ''})
@app.route('/<path:path>', methods=["GET", "POST"])
@authorization_guard
def catch_all(path):
  inner_response = inner_app.test_client().open(request)
  return inner_response.get_data()
