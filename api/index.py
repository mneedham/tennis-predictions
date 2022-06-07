from flask import Flask, jsonify
from flask_cors import CORS
import datetime

from os import environ
from api.auth0_service import auth0_service
from api.guards import authorization_guard

def safe_get_env_var(key):
    try:
        return environ[key]
    except KeyError:
        raise NameError(f"Missing {key} environment variable.")

client_origin_url = safe_get_env_var("CLIENT_ORIGIN_URL")
auth0_audience = safe_get_env_var("AUTH0_AUDIENCE")
auth0_domain = safe_get_env_var("AUTH0_DOMAIN")

app = Flask(__name__)


@app.after_request
def add_headers(response):
    response.headers['X-XSS-Protection'] = '0'
    response.headers['Cache-Control'] = 'no-store, max-age=0, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

CORS(
    app,
    resources={r"/api/*": {"origins": client_origin_url}},
    allow_headers=["Authorization", "Content-Type"],
    methods=["GET"],
    max_age=86400
)

auth0_service.initialize(auth0_domain, auth0_audience)

@app.route('/tournaments')
def tournaments(path):
  return jsonify([{
    "name": "Australian Open 2022"
  },
  {
    "name": "French Open 2022"
  }])


@app.route('/', defaults={'path': ''})
# @app.route('/<path:path>')
@authorization_guard
def catch_all(path):
  return {
    "currentTime": datetime.datetime.now(),
    "currentTime_": datetime.datetime.now(),
    "path": path
  }


