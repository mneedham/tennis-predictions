from flask import jsonify, Blueprint, g, request
from utils.scaffolding import create_app
from neo4j import GraphDatabase
from utils.env import safe_get_env_var
from utils.guards import authorization_guard

import utils.queries as queries

host = safe_get_env_var("NEO4J_HOST")
password = safe_get_env_var("NEO4J_PASSWORD")
driver = GraphDatabase.driver(f"{host}", auth=("neo4j", password))

bp_name = 'api-tournaments'
bp = Blueprint(bp_name, __name__)

database = safe_get_env_var("NEO4J_DATABASE")

@bp.route('/<tournament_id>')
def tournaments(tournament_id):
  with driver.session(database=database) as session:
    result = session.read_transaction(queries.get_tournament, tournament_id)
    return jsonify(result)


@bp.route('/<tournament_id>/me')
@authorization_guard
def tournaments_me(tournament_id):
  user_id = g.access_token["sub"]
  with driver.session(database=database) as session:
    result = session.read_transaction(queries.get_tournament_authenticated, tournament_id, user_id)
    return jsonify(result)



@bp.route('/')
def all_tournaments():
  with driver.session(database=database) as session:
    return jsonify(session.read_transaction(queries.get_tournaments))

def get_latest_tournaments(tx):
  result = tx.run("""
  MATCH (t:Tournament)
  WHERE t.endDate > date()
  RETURN t {.name, .shortName, .startDate, .endDate}
  ORDER BY t.startDate DESC
  """)
  return [{
      "name": record["t"]["name"],
      "shortName": record["t"]["shortName"],
      "startDate": record["t"]["startDate"].to_native().strftime("%d %b %Y"),
      "endDate": record["t"]["endDate"].to_native().strftime("%d %b %Y")
  } for record in result
  ]


round_mapping = {
    "R4": [
        {"name": "4th Round", "entries": 8},
        {"name": "Quarter Finals", "entries": 4},
        {"name": "Semi Finals", "entries": 2},
        {"name": "Final", "entries": 1},
        {"name": "Champion", "entries": 1}
    ],
    "QF": [
        {"name": "Quarter Finals", "entries": 4},
        {"name": "Semi Finals", "entries": 2},
        {"name": "Final", "entries": 1},
        {"name": "Champion", "entries": 1}
    ]
}

@bp.route('/new', methods=["POST"])
@authorization_guard
def new_tournament_route():
  with driver.session(database=database) as session:
    user_id = g.access_token["sub"]
    result = session.read_transaction(queries.get_user, user_id)
    print("result", result)

    if result["isEditor"] != True:
      return {"message": "User is not an editor"}, 401

    request_json = request.json

    data = {
      "name": request_json["name"],
      "startDate": request_json["startDate"],
      "endDate": request_json["endDate"]
    }

    selected_events = [value for value in request_json["events"].values() if value["selected"]]
    if len(selected_events) == 0:
      return {"error": "No events selected"}, 500
    
    data["events"] = [{"name": event["name"], "rounds": round_mapping[event["round"]]} for event in selected_events]
    
 
    try: 
      result = session.write_transaction(queries.new_tournament, data)
      return jsonify(result)
    except Exception as e:
      return {"error": str(e)}, 500

@bp.route('/latest')
def latest_tournaments():
  with driver.session(database=database) as session:
    return jsonify(session.read_transaction(get_latest_tournaments))    

@bp.route('/<tournament_id>/bracket/<bracket_id>', methods=["POST"])
@authorization_guard
def update_bracket_route(tournament_id, bracket_id):
  data = request.json
  user_id = g.access_token["sub"]
  print(user_id, tournament_id, bracket_id, data)
  with driver.session(database=database) as session:
    return jsonify(session.write_transaction(queries.update_bracket, user_id, bracket_id, data))


@bp.route('/<tournament_id>/result/<bracket_id>', methods=["POST"])
@authorization_guard
def update_result_route(tournament_id, bracket_id):
  with driver.session(database=database) as session:
    user_id = g.access_token["sub"]
    result = session.read_transaction(queries.get_user, user_id)
    print("result", result)

    if result["isEditor"] != True:
      return {"message": "User is not an editor"}, 401

    data = request.json  
    return jsonify(session.write_transaction(queries.update_result, bracket_id, data))


app = create_app()
app.register_blueprint(bp)
