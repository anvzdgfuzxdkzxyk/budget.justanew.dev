# Data ingestion pipline:

#### simplefin-fetch.js fetches the json object and saves it to simplefin-latest.json in ./private
#### simplefin-ingest.js takes simplefin-latest.json and puts the data into simplefin.db in ./private
#### simplefin-output.js takes the data from simplefin.db, anonymizes it and put it into a json file in ./public
#### web app reads from json file in ./public in order to generate the public facing webpage

## todo:
    - refactor simplefin-ingest: the code quality and comments (or lack thereof) is terrible here, this is definitely a priority after making sure everything works at a basic level
    - simplefin-output.js code the output file in order to generate a well documented json object, this is pretty much for sure the next step, though i need to figure out how to organize the json
    - web app everything...we're still so far from this that it isn't even funny

### public json file organization:
    - income (dot on chart, hover for exact value tooltip, shown in green, monthly)
    - expenses (dot on chart, hover for exact value tooltip, shown in red, monthly)
    - savings goals (by category, amnt saved towards goal as % filled slider on the right of screen)

### dependencies for node.js
    - axios
    - dotenv
    - fs
    - sqlite3
