# Wika Network ETL

The Wika Network ETL repo provides an easy way to index the Wika blockchain data into 3 databases:
* As tables: Postgres.
* As a graph: Neo4J.
* As documents: Elastic Search.

It relies on [Subquery](https://subquery.network/) and was developed by starting from the default Subquery scaffolding.

This repo follows the same structure provided by the standard subquery starter code, with the main components being:

- The Manifest in `project.yaml`
- The GraphQL Schema in `schema.graphql`
- The Mapping functions in `src/mappings/` directory
- Plugin functions in `src/plugins` (The subquery engine syncs the blockchain data with Postgres database by default, so we added Neo4j and Elastic Search as plugins that can be enabled by configuration.)

More details on how the starter code was modified can be found in [template_change_log.md](template_change_log.md). 

For a high level overview, check out our [medium article](medium.com/) about this project.


## Building and running the ETL 

### 0. Prerequisites

- Node Js.  
- Yarn.
- Docker and docker-compose.
- git clone this repo and enter the `subql_wika` directory.     

### 1. Install the dependencies
```
yarn install
```

### 2. Generate model classes
The schema of the data managed by Subquery is defined in `schema.graphql`
This step converts the entities defined in that file into JS classes and writes them into `src/types/`.
Note that these auto-generated files are not to be modified manually.
```
yarn codegen
```

### 3. Compile TypeScript code into JS
This step compiles TS code in `src/` into JS code located in `dist` folder.
```
yarn build
```

### 4. Modify `project.yaml` file
Make sure to point to a Wika Blockchain node.
```
network:
  endpoint: wss://testnode3.wika.network:443
  genesisHash: '0x59732b25bb635769e91a71f818c6d845b9bdcd371bb93d1512b1eacedb53d4be'
```

And that you start the ETL at a recent block number.
(For example `testnode3.wika.network:443` only archives the last 100 blocks)
```
startBlock: 12345678
```

### 5. Start the Data indexing
(Do a `docker-compose pull` the first time)
And let's Go!
```
docker-compose up
```




## Using the graphql service

Open your browser and head to `http://localhost:3000`.

You should see a GraphQL playground and can try to query with the following code to check if a block was indexed in the database.

Note that GraphQL is only connected to the data in Postgres.

````graphql
{
  query{
    blockInfo(id:"0x390ad69c942407ca1b4fea0a1b95691ced4b0021d9d8de61074226fee84563c8"){
      id,
      blockNum,
      syncDate
    }
  }
}
````


## Postgres, Neo4j and Elastic Search databases
If your docker-compose is normally up and running, you should be able to access the 3 databases directly:

### Postgres:
Connect to the host `localhost:5433` using your favorite Postgres client.

(User: postgres, password: postgres, defined in docker-compose file.)

The following tables should be available:

* `block_infos`: Block numbers and time of sync.
* `like_events`: Log of LikeEvents (who liked which url, number of likes and when.)
* `url_registered_events`: Log of UrlRegisteredEvents (who registered which url, when.)
* `url_metadata`: Title, description, image and icon associated with the url.

### Neo4J:
Connect to `http://localhost:7474/browser/` in your browser.

(User: neo4j, password: 1234, defined in docker-compose file.)

The following data should be available:

* Each user is represented by a node (User class.) and includes the total number of likes sent.
* Each url is represented by a node (Url class.) and includes the total number of likes received.
* Likes are represented by the relationship LIKES, storing the number of likes as well.
* Ownerships are represented by the relationship OWNS.



### Elastic Search (Kibana frontend):
Connect to `http://localhost:5601` in your browser.

(User: elastic, password: abcd, defined in docker-compose file.)

ES should have documents in index `Url`, with `title`, `description`, `image` and `icon` fields.




## Configuration options

All configuration options are read from environment variables.
For dockerized users, they are all defined in the docker-compose file.
When not using docker, you can write a file to set the environment variables, or define them in .profile file.


### Configuring the Neo4J Sync
The Neo4j database sync can be configured using the following env vars:
```
NEO4J_ENABLE: 1
NEO4J_HOST: bolt://your_neo4j_host:port
NEO4J_USER: bob
NEO4J_PASS: xxx
```
You can set the `NEO_4J_ENABLE` to 0 in docker-compose file to disable this part. 
Also, the first time you start your neo4j instance, you will need to add the indices by using the script
in `neo4j_init.cql`


### Configuring the Elastic Search Sync
The Elastic Search database sync can be configured using the following env vars:
```
ES_ENABLE: 1
ES_HOST: http://your_es_host:port
ES_USER: alice
ES_PASS: xxx
```
You can set the `ES_ENABLE` to 0 in docker-compose file to disable this part. 


### Configuring the email alerts
The ETL can send email alerts upon error when enabled, and is configured using the following env vars:
```
EMAIL_ALERT_ENABLE: 0
EMAIL_ALERT_HOST: http://your_email_rest_api:port
EMAIL_ALERT_FROM: etl@wika.network
EMAIL_ALERT_TO: admin@wika.network
EMAIL_ALERT_KEY: api_key_goes_here
```
To enable, set `EMAIL_ALERT_ENABLE` to 1 and customize `src/plugins/emails.ts` to fit the format of your email api.



## Running the test suite

With the docker images up and running, connect to the `subquery-node` service in another terminal:
```
docker exec -it subql_wika_subquery-node_1 sh
```

Then head into the app folder and run `yarn test`
```
cd app
yarn test
```



## Logs and debugging

The provided docker-compose file spins up 6 services:
- postgres
- neo4j
- es (elastic search)
- kibana (elastic search frontend)
- graphql-engine
- subquery-node

The first 5 are images used as-is and should not require any debugging.

You can focus on `subquery-node` logs by running `docker logs subql_wika_subquery-node_1 -f` on a separate terminal.

Also, note that the ETL logic runs in a sandbox and `console.log` doesn't work in that context.

You must use the `logger` global object (see examples in `mappingHandlers.ts`)

Log level can be set in the `subquery-node` section of docker-compose.yml at:
```--log-level=info```


