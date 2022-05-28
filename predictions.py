from jinja2 import Template
import csv
import json
import datetime
import glob

now = datetime.datetime.utcnow()

tournaments = ["ausopen2022", "indianwells2022", "miami2022", "charleston2022", "montecarlo2022", 
               "barcelona2022", "serbiaopen2022", "stuttgart2022", "munich2022", "estoril2022",
               "madridopen2022", "rome2022", "frenchopen2022"
              ]

tournaments = glob.glob("data/*.json")

for tournament_file_path in tournaments:
    tournament_name = tournament_file_path.split("/")[-1].replace(".json", "")
    with open("template.html", "r") as template_file, \
         open(f"output/{tournament_name}.html", "w") as predictions_output_file, \
         open(f"{tournament_file_path}", "r") as predictions_json_file: 
        predictions = json.load(predictions_json_file)
        print(predictions)

        template = Template(template_file.read())
        output = template.render(
            tournament=predictions["tournament"], 
            predictions=predictions["events"],
            tournament_name=tournament_name,
            now=now
        )
        predictions_output_file.write(output)
