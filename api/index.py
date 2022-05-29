from flask import Flask
import datetime

app = Flask(__name__, static_folder='../build', static_url_path='/')


@app.route("/api/")
def home():
    return {
        "currentTime": datetime.datetime.now(),
        "currentTime2": datetime.datetime.now()
    }

@app.route('/')
def index():
    return app.send_static_file('index.html')