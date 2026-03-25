Data ingestion pipline:

Cron job to run ingest.js
ingest.js fetches data from simplefin (using simplefin secret url)
    save raw json file of most recently landed api as "simplefin-latest.json)
    write transactions to data.db (private)
aggregate.js reads the sqlite database, aggregates income, expenses, etc. and write to /public/data.json
node.js fetches data.json and renders wallchart
litestream backup replicates sqlite database to ionos/aws s3 compatible storage
