import datetime
from flask import Blueprint, g

from utils.guards import authorization_guard

from utils.scaffolding import create_app

bp_name = 'api-index'
bp = Blueprint(bp_name, __name__)

@bp.route('/', defaults={'path': ''})
@bp.route('/<path:path>')
@authorization_guard
def catch_all(path):
  return {
    "currentTime": datetime.datetime.now(),
    "currentTime_": datetime.datetime.now(),
    "path": path
    #"access_token": g.access_token.sub
  }

app = create_app()
app.register_blueprint(bp)