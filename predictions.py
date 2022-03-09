from jinja2 import Template
import csv
import json

with open("template.html", "r") as template_file, \
     open("output/predictions.html", "w") as predictions_output_file, \
     open("data/indianwells2022.json", "r") as predictions_json_file: 
    predictions = json.load(predictions_json_file)
    print(predictions)

    template = Template(template_file.read())
    output = template.render(
        tournament=predictions["tournament"], 
        predictions=predictions["events"]
    )
    predictions_output_file.write(output)