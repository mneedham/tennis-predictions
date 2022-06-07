from flask import Flask, jsonify
from flask_cors import CORS
import datetime

from os import environ
from api.auth0_service import auth0_service
from api.guards import authorization_guard

app = Flask(__name__)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def tournaments(path):
  return jsonify([{
    "name": "Australian Open 2022"
  },
  {
    "name": "French Open 2022"
  }])
