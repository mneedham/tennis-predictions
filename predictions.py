from jinja2 import Template
import csv
import json

tournaments = ["ausopen2022", "indianwells2022"]

for tournament_name in tournaments:
    with open("template.html", "r") as template_file, \
         open(f"output/{tournament_name}.html", "w") as predictions_output_file, \
         open(f"data/{tournament_name}.json", "r") as predictions_json_file: 
        predictions = json.load(predictions_json_file)
        print(predictions)

        template = Template(template_file.read())
        output = template.render(
            tournament=predictions["tournament"], 
            predictions=predictions["events"]
        )
        predictions_output_file.write(output)