from flask import Flask, jsonify
import datetime

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


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
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
