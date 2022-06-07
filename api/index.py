# from flask import Flask, jsonify
# import datetime

# app = Flask(__name__)


# @app.route('/', defaults={'path': ''})
# @app.route('/<path:path>')
# def catch_all(path):
#   return {
#     "currentTime": datetime.datetime.now(),
#     "currentTime_": datetime.datetime.now(),
#     "path": path
#   }


# @app.route('/tournaments', defaults={'path': ''})
# def tournaments(path):
#   return jsonify([{
#     "name": "Australian Open 2022"
#   },
#   {
#     "name": "French Open 2022"
#   }])

from sanic import Sanic
from sanic.response import json
app = Sanic(name=__name__)


@app.route('/')
@app.route('/<path:path>')
async def index(request, path=""):
    return json({'hello': path})

@app.route('/other_route')
async def other_route(request, path=""):
    return json({'whatever': path})