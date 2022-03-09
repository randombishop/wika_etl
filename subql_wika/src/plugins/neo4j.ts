import neo4j from "neo4j-driver";
import Driver from "neo4j-driver/lib/driver.js";

/**
 * CRUD (CREATE, READ, UPDATE, DELETE) functions
 * for the entities stored in Neo4J:
 * `URL` nodes
 * `User` nodes
 * `LIKES` relationships
 * `OWN` relationships
 */
export class PluginNeo4j {
  private isEnabled: number;
  private driver: Driver;

  /**
   * Constructor relies on env vars `NEO4J_ENABLE`, `NEO4J_HOST`, `NEO4J_USER` and `NEO4J_PASS`
   */
  constructor() {
    this.isEnabled = parseInt(process.env.NEO4J_ENABLE);
    if (this.isEnabled == 1) {
      const host = process.env.NEO4J_HOST;
      const user = process.env.NEO4J_USER;
      const password = process.env.NEO4J_PASS;
      this.driver = neo4j.driver(host, neo4j.auth.basic(user, password));
    }
  }

  /**
   * Returns the state of the plugin configured by env variable `NEO4J_ENABLE`
   * @returns true/false
   */
  isSyncEnabled(): boolean {
    return this.isEnabled == 1;
  }

  /**
   * Parses the first result from the results returned by Neo4J
   * @returns first result as javascript dictionary if available, null otherwise
   */
  getFirstRecord(result) {
    let node = null;
    if (result.records.length > 0) {
      const singleRecord = result.records[0];
      node = singleRecord.get(0).properties;
    }
    return node;
  }

  /**
   * Runs a CQL query and returns the first result
   * @param cql - CQL query, for example `MATCH (a:Url {url: $url}) RETURN a`
   * @param params - Parameters of the CQL query as a dictionary, for example `{url: 'https://example.com'}`
   * @returns first result as javascript dictionary if available, null otherwise
   */
  async runQueyAndGetFirstRecord(cql: string, params: object) {
    //console.log(cql,params) ;
    const session = this.driver.session();
    const result = await session.run(cql, params);
    const record = this.getFirstRecord(result);
    await session.close();
    return record;
  }

  /**
   * Runs a CQL query
   * @param cql - CQL query, for example `MATCH (a:Url {url: $url}) RETURN a`
   * @param params - Parameters of the CQL query as a dictionary, for example `{url: 'https://example.com'}`
   */
  async runQuey(cql: string, params: object) {
    const session = this.driver.session();
    await session.run(cql, params);
    await session.close();
  }

  /**
   * READ URL node
   */
  async fetchUrl(url: string) {
    const cql = "MATCH (a:Url {url: $url}) RETURN a";
    const params = { url: url };
    const node = await this.runQueyAndGetFirstRecord(cql, params);
    return node;
  }

  /**
   * CREATE URL node
   */
  async createUrl(url: string, numLikes: number) {
    const cql = "CREATE (a:Url {url: $url, numLikes: $numLikes}) RETURN a";
    const params = { url: url, numLikes: numLikes };
    const node = await this.runQueyAndGetFirstRecord(cql, params);
    return node;
  }

  /**
   * UPDATE URL node
   */
  async updateUrl(url: string, numLikes: number) {
    const cql =
      "MATCH (a:Url {url: $url}) SET a.numLikes=a.numLikes+$numLikes RETURN a";
    const params = { url: url, numLikes: numLikes };
    const node = await this.runQueyAndGetFirstRecord(cql, params);
    return node;
  }

  /**
   * DELETE URL node
   */
  async deleteUrl(url: string) {
    const cql = "MATCH (a:Url {url: $url}) DETACH DELETE a";
    const params = { url: url };
    await this.runQuey(cql, params);
  }

  /**
   * READ User node
   */
  async fetchUser(address: string) {
    const cql = "MATCH (a:User {address: $address}) RETURN a";
    const params = { address: address };
    const node = await this.runQueyAndGetFirstRecord(cql, params);
    return node;
  }

  /**
   * CREATE User node
   */
  async createUser(address: string, numLikes: number) {
    const cql =
      "CREATE (a:User {address: $address, numLikes: $numLikes}) RETURN a";
    const params = { address: address, numLikes: numLikes };
    const node = await this.runQueyAndGetFirstRecord(cql, params);
    return node;
  }

  /**
   * UPDATE User node
   */
  async updateUser(address: string, numLikes: number) {
    const cql =
      "MATCH (a:User {address: $address}) SET a.numLikes=a.numLikes+$numLikes RETURN a";
    const params = { address: address, numLikes: numLikes };
    const node = await this.runQueyAndGetFirstRecord(cql, params);
    return node;
  }

  /**
   * DELETE User node
   */
  async deleteUser(address: string) {
    const cql = "MATCH (a:User {address: $address}) DETACH DELETE a";
    const params = { address: address };
    await this.runQuey(cql, params);
  }

  /**
   * GET LIKES relationship
   */
  async fetchLIKES(address: string, url: string) {
    const cql =
      "MATCH (a:User {address: $address})-[r:LIKES]->(b:Url {url: $url}) RETURN r";
    const params = { address: address, url: url };
    const relation = await this.runQueyAndGetFirstRecord(cql, params);
    return relation;
  }

  /**
   * CREATE LIKES relationship
   */
  async createLIKES(address: string, url: string, numLikes: number) {
    let cql = "MATCH (a:User {address: $address}) ";
    cql += "MATCH (b:Url {url: $url}) ";
    cql += "CREATE (a)-[r:LIKES {numLikes: $numLikes}]->(b) RETURN r";
    const params = { address: address, url: url, numLikes: numLikes };
    const relation = await this.runQueyAndGetFirstRecord(cql, params);
    return relation;
  }

  /**
   * UPDATE LIKES relationship
   */
  async updateLIKES(address: string, url: string, numLikes: number) {
    let cql =
      "MATCH (a:User {address: $address})-[r:LIKES]->(b:Url {url: $url}) ";
    cql += "SET r.numLikes = r.numLikes + $numLikes ";
    cql += "return r";
    const params = { address: address, url: url, numLikes: numLikes };
    const relation = await this.runQueyAndGetFirstRecord(cql, params);
    return relation;
  }

  /**
   * DELETE LIKES relationship
   */
  async deleteLIKES(address: string, url: string) {
    const cql =
      "MATCH (a:User {address: $address})-[r:LIKES]->(b:Url {url: $url}) DELETE r";
    const params = { address: address, url: url };
    await this.runQuey(cql, params);
  }

  /**
   * GET OWNS relationship
   */
  async fetchOWNS(address: string, url: string) {
    const cql =
      "MATCH (a:User {address: $address})-[r:OWNS]->(b:Url {url: $url}) RETURN r";
    const params = { address: address, url: url };
    const relation = await this.runQueyAndGetFirstRecord(cql, params);
    return relation;
  }

  /**
   * CREATE OWNS relationship
   */
  async createOWNS(address: string, url: string) {
    let cql = "MATCH (a:User {address: $address}) ";
    cql += "MATCH (b:Url {url: $url}) ";
    cql += "CREATE (a)-[r:OWNS]->(b) RETURN r";
    const params = { address: address, url: url };
    const relation = await this.runQueyAndGetFirstRecord(cql, params);
    return relation;
  }

  /**
   * DELETE OWNS relationship
   */
  async deleteOWNS(address: string, url: string) {
    const cql =
      "MATCH (a:User {address: $address})-[r:OWNS]->(b:Url {url: $url}) DELETE r";
    const params = { address: address, url: url };
    await this.runQuey(cql, params);
  }

  /**
   * Updates the graph with a new LikeEvent:
   * - Creates or updates the User node
   * - Creates or updates the Url node
   * - Creates or updates the LIKES relationship
   * @param user - address of the user
   * @param url - website url
   * @param numLikes - number of likes
   */
  async handleLikeEvent(
    user: string,
    url: string,
    numLikes: number
  ): Promise<void> {
    // Create or update Url
    let urlNode = await this.fetchUrl(url);
    if (urlNode == null) {
      urlNode = await this.createUrl(url, numLikes);
    } else {
      urlNode = await this.updateUrl(url, numLikes);
    }

    // Create or update User
    let userNode = await this.fetchUser(user);
    if (userNode == null) {
      userNode = await this.createUser(user, numLikes);
    } else {
      userNode = await this.updateUser(user, numLikes);
    }

    // Create or update the relationship
    let relation = await this.fetchLIKES(user, url);
    if (relation == null) {
      relation = await this.createLIKES(user, url, numLikes);
    } else {
      await this.updateLIKES(user, url, numLikes);
    }
  }

  /**
   * Updates the graph with a new UrlRegisteredEvent:
   * - Creates or updates the User node
   * - Creates or updates the Url node
   * - Creates or updates the OWNS relationship
   * @param user - address of the user
   * @param url - website url
   * @param numLikes - number of likes
   */
  async handleUrlRegisteredEvent(user: string, url: string): Promise<void> {
    // Create or update Url
    let urlNode = await this.fetchUrl(url);
    if (urlNode == null) {
      urlNode = await this.createUrl(url, 0);
    }

    // Create or update User
    let userNode = await this.fetchUser(user);
    if (userNode == null) {
      userNode = await this.createUser(user, 0);
    }

    // Create the relationship if not exists
    let relation = await this.fetchOWNS(user, url);
    if (relation == null) {
      relation = await this.createOWNS(user, url);
    }
  }

  /**
   * Releases the Neo4J driver
   */
  async dispose(): Promise<void> {
    await this.driver.close();
  }
}
