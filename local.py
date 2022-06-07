from flask import Flask
import api.tournaments as tournaments
import api.index as index

app = Flask(__name__, instance_relative_config=True)
app.register_blueprint(tournaments.bp, url_prefix='/api/tournaments')
app.register_blueprint(index.bp, url_prefix='/api/')