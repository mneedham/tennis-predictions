from flask import Flask
import datetime

app = Flask(__name__)


@app.route("/api/")
def home():
    return {
        "currentTime": datetime.datetime.now()
    }
