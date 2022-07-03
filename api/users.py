from flask import jsonify, Blueprint, g, request
from utils.scaffolding import create_app
from neo4j import GraphDatabase
from utils.env import safe_get_env_var
from utils.guards import authorization_guard

host = safe_get_env_var("NEO4J_HOST")
password = safe_get_env_var("NEO4J_PASSWORD")
driver = GraphDatabase.driver(f"{host}", auth=("neo4j", password))

bp_name = 'api-users'
bp = Blueprint(bp_name, __name__)

def add_user(tx, user_id, data):
  result = tx.run("""
  MERGE (u:User {id: $userId})
  SET u.name = $data.name, u.email = $data.email
  RETURN u {.id}
  """, userId=user_id, data=data)
  return [record["u"] for record in result][0]

def get_user(tx, user_id):  
  result = tx.run("""
  MATCH (u:User {id: $userId})
  RETURN u {.editor}
  """, userId=user_id)
  return [record["u"] for record in result][0]
  
@bp.route("/profile")
@authorization_guard
def profile():
  user_id = g.access_token["sub"]
  with driver.session() as session:
    return jsonify(session.read_transaction(get_user, user_id))

@bp.route('/', methods=["POST"])
@authorization_guard
def users():
  data = request.json
  user_id = g.access_token["sub"]
  with driver.session() as session:
    return jsonify(session.write_transaction(add_user, user_id, data))


app = create_app()
app.register_blueprint(bp)
