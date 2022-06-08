from flask import jsonify, Blueprint
from utils.scaffolding import create_app

bp_name = 'api-tournaments'
bp = Blueprint(bp_name, __name__)


@bp.route('/', defaults={'path': ''})
@bp.route('/<path:path>')
def tournaments(path):
  return jsonify([{
      "name": "Australian Open 2022",
      "shortName": "australian-open-2022"
  },{
      "name": "French Open 2022",
      "shortName": "french-open-2022"
  }
  ])


app = create_app()
app.register_blueprint(bp)
