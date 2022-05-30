from flask import Flask
import datetime

app = Flask(__name__)


@app.route("/")
def home():
    return {
        "currentTime": datetime.datetime.now(),
        "currentTime_": datetime.datetime.now()
    }