from flask import jsonify, Blueprint, g
from utils.scaffolding import create_app
from neo4j import GraphDatabase
from utils.env import safe_get_env_var
from utils.guards import authorization_guard

host = safe_get_env_var("NEO4J_HOST")
driver = GraphDatabase.driver(f"{host}", auth=("neo4j", "neo"))

bp_name = 'api-users'
bp = Blueprint(bp_name, __name__)

def add_user(tx, user_id):
  result = tx.run("""
  MERGE (u:User {id: $userId})
  RETURN u
  """, userId=user_id)
  

@bp.route('/', methods=["POST"])
@authorization_guard
def users():
  user_id = g.access_token["sub"]
  with driver.session() as session:
    return jsonify(session.write_transaction(add_user, user_id))


app = create_app()
app.register_blueprint(bp)
