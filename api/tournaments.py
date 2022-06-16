from flask import jsonify, Blueprint, g
from utils.scaffolding import create_app
from neo4j import GraphDatabase
from utils.env import safe_get_env_var
from utils.guards import authorization_guard

host = safe_get_env_var("NEO4J_HOST")
driver = GraphDatabase.driver(f"{host}", auth=("neo4j", "neo"))

bp_name = 'api-tournaments'
bp = Blueprint(bp_name, __name__)

def get_tournament(tx, id):
  result = tx.run("""
  MATCH (t:Tournament)-[:PART_OF]->(e)<-[:EVENT]-(bracket:Bracket)
  WHERE t.shortName = $tournamentId
  OPTIONAL MATCH (bracket)-[:PLAYER1]->(p1)
  OPTIONAL MATCH (bracket)-[:PLAYER2]->(p2)
  WITH t, e, bracket, p1, p2
  ORDER BY e, bracket.rank, bracket.index
  WITH t {.name, .shortName} AS t, e {.name} AS e, 
       collect({name: bracket.name, id: bracket.id, round: bracket.round, player1: p1.name, player2: p2.name}) AS brackets
  RETURN t, collect ({name: e.name, brackets: brackets}) AS events
  """, tournamentId=id)
  return [{
      "name": record["t"]["name"],
      "shortName": record["t"]["shortName"],
      "events": record["events"]
  } for record in result
  ][0]

def get_tournament_authenticated(tx, tournament_id, user_id):
  print("user_id", user_id)
  result = tx.run("""
  MATCH (t:Tournament)-[:PART_OF]->(e)<-[:EVENT]-(bracket:Bracket)
  WHERE t.shortName = $tournamentId
  OPTIONAL MATCH (bracket)-[:PLAYER1]->(p1)
  OPTIONAL MATCH (bracket)-[:PLAYER2]->(p2)
  WITH t, e, bracket, p1, p2
  ORDER BY e, bracket.rank, bracket.index
  WITH t {.name, .shortName} AS t, e {.name} AS e, 
       collect({name: bracket.name, id: bracket.id, round: bracket.round, player1: p1.name, player2: p2.name}) AS brackets
  RETURN t, collect ({name: e.name, brackets: brackets}) AS events
  """, tournamentId=tournament_id, userId=user_id)
  return [{
      "name": record["t"]["name"],
      "shortName": record["t"]["shortName"],
      "events": record["events"]
  } for record in result
  ][0]

@bp.route('/<tournament_id>')
def tournaments(tournament_id):
  with driver.session() as session:
    result = session.read_transaction(get_tournament, tournament_id)
    return jsonify(result)


@bp.route('/<tournament_id>/me')
@authorization_guard
def tournaments_me(tournament_id):
  user_id = g.access_token["sub"]
  with driver.session() as session:
    result = session.read_transaction(get_tournament_authenticated, tournament_id, user_id)
    return jsonify(result)

def get_tournaments(tx):
  result = tx.run("""
  MATCH (t:Tournament)
  RETURN t {.name, .shortName}
  """)
  return [{
      "name": record["t"]["name"],
      "shortName": record["t"]["shortName"]
  } for record in result
  ]

@bp.route('/')
def all_tournaments():
  with driver.session() as session:
    return jsonify(session.read_transaction(get_tournaments))


app = create_app()
app.register_blueprint(bp)
