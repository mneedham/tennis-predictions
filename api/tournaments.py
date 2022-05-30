from flask import Flask, Response, jsonify
import datetime

app = Flask(__name__)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return jsonify([{
        "currentTime": datetime.datetime.now(),
        "currentTime_": datetime.datetime.now(),
        "path": path
    }])
