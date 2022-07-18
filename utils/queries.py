def get_user(tx, user_id):
  result = tx.run("""
  OPTIONAL MATCH (u:User {id: $userId})
  WHERE u.editor 
  RETURN count(u) > 0 AS isEditor
  """, userId=user_id)
  return [
    {"isEditor": record["isEditor"]} 
    for record in result
  ][0]

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

def update_result(tx, bracket_id, data):
  result = tx.run("""
  MATCH (b:Bracket {id: $bracketId})
  OPTIONAL MATCH (b)-[playerRel:PLAYER1|PLAYER2]->()
  DELETE playerRel
  WITH b
  CALL apoc.do.when($data.player1 IS NOT NULL, 
    "MERGE (p1:Player {name: data.player1}) MERGE (b)-[:PLAYER1]->(p1) RETURN *", 
    "", {data: $data, b: b})
  YIELD value AS p1Action
  CALL apoc.do.when($data.player2 IS NOT NULL, 
    "MERGE (p2:Player {name: data.player2}) MERGE (b)-[:PLAYER2]->(p2) RETURN *", 
    "", {data: $data, b: b})
  YIELD value AS p2Action
  RETURN b {.id}, p1Action.p1.name AS p1Action, p2Action.p2.name AS p2Action
  """, bracketId=bracket_id, data=data)
  return [
    {"bracket": record["b"], 
     "p1Action": record["p1Action"],
     "p2Action": record["p2Action"]
     } 
    for record in result
  ][0]  

def new_tournament(tx, data):
  result = tx.run("""
  MERGE (t:Tournament {name: $data.name})
  SET t.shortName = replace(toLower($data.name), " ", "-"),
      t.startDate = date($data.startDate), 
      t.endDate = date($data.endDate)
  WITH t
  UNWIND $data.events AS event
  WITH t, $data.name + " " + event.name as eventName, event
  MERGE (e:Event {id: eventName}) SET e.name = event.name  
  MERGE (t)-[:PART_OF]->(e)    
  WITH *
  UNWIND event.rounds AS round
  CALL {
    WITH * WITH * WHERE round.name = "Champion"
    MERGE (b:Bracket {id: eventName + "-" + round.name})
    SET b.round = round.name, b.name = round.name, b.rank = 4
    MERGE (b)-[:EVENT]->(e)
    RETURN count(*) AS championCount
  }
  CALL {
    WITH * WITH * WHERE round.name <> "Champion"
    UNWIND range(0, round.entries-1) AS index
    MERGE (b:Bracket {id: eventName + "-" + round.name + "_" + index})
    SET b.round = round.name, b.name = round.name + "_" + index, b.index = index, 
        b.rank = CASE 
          WHEN round.name = "4th Round" THEN 0
          WHEN round.name = "Quarter Finals" THEN 1
          WHEN round.name = "Semi Finals" THEN 2
          WHEN round.name = "Final" THEN 3
          ELSE -1 END
    MERGE (b)-[:EVENT]->(e)
    RETURN count(*) AS otherCount
  }
  RETURN count(*) AS count
  """, data=data)
  return [record["count"] for record in result][0]

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

