from flask import jsonify, Blueprint, g, request
from utils.scaffolding import create_app
from neo4j import GraphDatabase
from utils.env import safe_get_env_var
from utils.guards import authorization_guard

host = safe_get_env_var("NEO4J_HOST")
password = safe_get_env_var("NEO4J_PASSWORD")
driver = GraphDatabase.driver(f"{host}", auth=("neo4j", password))

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
       collect({name: bracket.name, id: bracket.id, round: bracket.round, actualPlayer1: p1.name, actualPlayer2: p2.name}) AS brackets
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
  MATCH (u:User {id: $userId})
  MATCH (t:Tournament)-[:PART_OF]->(e)<-[:EVENT]-(bracket:Bracket)
  WHERE t.shortName = $tournamentId
  OPTIONAL MATCH (bracket)-[:PLAYER1]->(p1)
  OPTIONAL MATCH (bracket)-[:PLAYER2]->(p2)
  OPTIONAL MATCH (u)-[:SHADOW_BRACKET]->(sb)-[:BRACKET]->(bracket)
  OPTIONAL MATCH (sb)-[:PLAYER1]->(sbPlayer1)
  OPTIONAL MATCH (sb)-[:PLAYER2]->(sbPlayer2)
  WITH t, e, bracket, p1, p2, sbPlayer1, sbPlayer2
  ORDER BY e, bracket.rank, bracket.index
  WITH t {.name, .shortName} AS t, e {.name} AS e, 
       date() < t.endDate AS editable,
       collect({name: bracket.name, id: bracket.id, round: bracket.round, 
                player1: sbPlayer1.name, actualPlayer1: p1.name, 
                player2: sbPlayer2.name, actualPlayer2: p2.name}) AS brackets
  RETURN t, editable, collect ({name: e.name, brackets: brackets}) AS events
  
  """, tournamentId=tournament_id, userId=user_id)
  return [{
      "name": record["t"]["name"],
      "editable": record["editable"],
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

@bp.route('/')
def all_tournaments():
  with driver.session() as session:
    return jsonify(session.read_transaction(get_tournaments))

def update_bracket(tx, user_id, bracket_id, data):
  result = tx.run("""
  MATCH (u:User {id: $userId})
  MATCH (b:Bracket {id: $bracketId})
  MERGE (sb:ShadowBracket {id: b.id + "_" + $userId})
  MERGE (u)-[:SHADOW_BRACKET]->(sb)
  MERGE (sb)-[:BRACKET]->(b)
  WITH u, b, sb
  OPTIONAL MATCH (sb)-[playerRel:PLAYER1|PLAYER2]->()
  DELETE playerRel
  WITH u, b, sb
  CALL apoc.do.when($data.player1 IS NOT NULL, 
    "MERGE (p1:Player {name: data.player1}) MERGE (sb)-[:PLAYER1]->(p1) RETURN *", 
    "", {data: $data, sb: sb})
  YIELD value AS p1Action
  CALL apoc.do.when($data.player2 IS NOT NULL, 
    "MERGE (p2:Player {name: data.player2}) MERGE (sb)-[:PLAYER2]->(p2) RETURN *", 
    "", {data: $data, sb: sb})
  YIELD value AS p2Action
  RETURN u {.id}, b {.id}, p1Action.p1.name AS p1Action, p2Action.p2.name AS p2Action
  """, userId=user_id, bracketId=bracket_id, data=data)
  return [
    {"user": record["u"], "bracket": record["b"], 
     "p1Action": record["p1Action"],
     "p2Action": record["p2Action"]
     } 
    for record in result
  ][0]
  

@bp.route('/<tournament_id>/bracket/<bracket_id>', methods=["POST"])
@authorization_guard
def update_bracket_route(tournament_id, bracket_id):
  data = request.json
  user_id = g.access_token["sub"]
  print(user_id, tournament_id, bracket_id, data)
  with driver.session() as session:
    return jsonify(session.write_transaction(update_bracket, user_id, bracket_id, data))


app = create_app()
app.register_blueprint(bp)
