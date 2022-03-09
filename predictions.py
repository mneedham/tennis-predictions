from jinja2 import Template
import csv
import json

tournament_name = "indianwells2022"

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