from flask import Flask, jsonify, Blueprint

bp_name = 'api-messages'
bp_url_prefix = '/api/messages'
bp = Blueprint(bp_name, __name__)

@bp.route('/', defaults={'path': ''})
@bp.route('/<path:path>')
def tournaments(path):
  return jsonify([{
    "name": "Australian Open 2022"
  },
  {
    "name": "French Open 2022"
  }])


app = Flask(__name__)
app.register_blueprint(bp)