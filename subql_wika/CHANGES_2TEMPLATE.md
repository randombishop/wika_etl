

# Change the postgres port
5432 -> 5432

# Configure project.yaml
- Set Wika Test Net endpoing and genesis hash
- Add environment variable in subquery-node docker-compose to bypass https certificate check:
  ```NODE_TLS_REJECT_UNAUTHORIZED: 0```

# Add neo4j to docker-compose
```
neo4j:
  image: neo4j
  ports:
    - 7474:7474
    - 7687:7687
  volumes:
    - .data/neo4j:/var/lib/neo4j/data
  environment:
    NEO4J_AUTH: neo4j/1234
  healthcheck:
    test: ["CMD-SHELL", "neo4j status | grep running"]
    interval: 5s
    timeout: 5s
    retries: 5
```

# Define nodejs dependencies and pin versions
```
"devDependencies": {
    "@polkadot/api": "7.5.1",
    "@subql/cli": "0.19.0",
    "@subql/types": "0.13.0",
    "typescript": "4.5.5",
    "@types/chai": "4.3.0",
    "@types/mocha": "9.1.0",
    "chai": "4.3.4",
    "cheerio": "1.0.0-rc.10",
    "mocha": "9.1.4",
    "neo4j-driver": "4.4.1",
    "node-fetch": "3.2.0"
  }
```

# Define data entities and ETL logic
- schema.graphql file
- mappings
- plugins
- tests

# Fix the sandbox permissions
- Make a copy of the file `sandbox.service.js` from the subql node docker image:
```
  docker cp template_subquery-node_1:/usr/local/lib/node_modules/@subql/node/dist/indexer/sandbox.service.js .
```

- Add this volume entry in docker-compose for subql-node:
```
- ./sandbox.override.js:/usr/local/lib/node_modules/@subql/node/dist/indexer/sandbox.service.js
```

