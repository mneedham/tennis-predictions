from flask import Flask, Response, jsonify
import datetime

app = Flask(__name__)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return jsonify([{
        "name": "Australian Open 2022"
    },
        {
        "name": "French Open 2022"
    }])
