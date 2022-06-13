import api.tournaments as tournaments
import api.index as index
from utils.scaffolding import create_app

app = create_app()

app.register_blueprint(tournaments.bp, url_prefix='/api/tournaments')
app.register_blueprint(index.bp, url_prefix='/api/')

print(app.url_map)