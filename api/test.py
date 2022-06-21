from flask import Flask, request
import jwt
from functools import wraps

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
@app.route('/<path:path>')
def catch_all(path):
  inner_response = inner_app.test_client().open(request)
  return inner_response.get_data()
