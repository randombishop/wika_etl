
# Changed the postgres port
5432 -> 5432

# Configured project.yaml
- Set Wika Test Net endpoing and genesis hash
- Add environment variable in subquery-node docker-compose to bypass https certificate check:
  ```NODE_TLS_REJECT_UNAUTHORIZED: 0```

# Added neo4j to docker-compose
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

# Defineed nodejs dependencies and pinned versions
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

# Defined data entities and ETL logic
- schema.graphql file
- mappings
- plugins
- tests


# Fixed the sandbox permissions
- Made a copy of the file `sandbox.service.js` from the subql node docker image:
```
  docker cp template_subquery-node_1:/usr/local/lib/node_modules/@subql/node/dist/indexer/sandbox.service.js .
```

- Renamed to sandbox.override.js

- Made following changes:
```
const DEFAULT_OPTION = {
    console: 'redirect',
    wasm: argv.unsafe,
    sandbox: {},
    require: {
        builtin: argv.unsafe
            ? ['*']
            : whitelist,
        external: true,
        context: 'sandbox',
    },
    wrapper: 'commonjs',
    sourceExtensions: ['js', 'cjs'],
    env: process.env
};
```

- Added this volume entry in docker-compose for subql-node:
```
- ./sandbox.override.js:/usr/local/lib/node_modules/@subql/node/dist/indexer/sandbox.service.js
```


# Added Elastic Search and Kibana to docker-compose
```
  es:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.16.3
    environment:
      - node.name=es01
      - cluster.name=es-docker-cluster
      - discovery.type=single-node
      - bootstrap.memory_lock=true
      - logger.level=WARN
      - xpack.security.enabled=true
      - ELASTIC_USERNAME=elastic
      - ELASTIC_PASSWORD=abcd
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - .data/es:/usr/share/elasticsearch/data
    ports:
      - 9200:9200

  kibana:
    image: docker.elastic.co/kibana/kibana:7.16.3
    ports:
      - 5601:5601
    volumes:
      - ./kibana.yml:/usr/share/kibana/config/kibana.yml
    environment:
      - ELASTICSEARCH_URL=http://es:9200
      - ELASTICSEARCH_USERNAME=elastic
      - ELASTICSEARCH_PASSWORD=abcd
```
