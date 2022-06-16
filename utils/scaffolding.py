from flask import Flask, jsonify
from flask_cors import CORS
import datetime
from utils.auth0_service import auth0_service
from utils.guards import authorization_guard
from utils.env import safe_get_env_var


def create_app():
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
        methods=["GET", "POST"],
        max_age=86400
    )

    # CORS(
    #     app
    # )

    auth0_service.initialize(auth0_domain, auth0_audience)
    return app

