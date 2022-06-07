from flask import Flask, jsonify
import datetime

app = Flask(__name__)


@app.route('/', defaults={'path': ''})
def home(path):
  return {
    "currentTime": datetime.datetime.now(),
    "currentTime_": datetime.datetime.now(),
    "path": path
  }


@app.route('/tournaments', defaults={'path': ''})
def tournaments(path):
  return jsonify([{
    "name": "Australian Open 2022"
  },
  {
    "name": "French Open 2022"
  }])
