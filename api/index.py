# from flask import Flask
# import datetime

# app = Flask(__name__)


# @app.route("/")
# def home():
#     return {
#         "currentTime": datetime.datetime.now(),
#         "currentTime_": datetime.datetime.now()
#     }


from flask import Flask, Response
import datetime

app = Flask(__name__)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
        return {
        "currentTime": datetime.datetime.now(),
        "currentTime_": datetime.datetime.now()
    }