import { PluginPostgres } from "../plugins/postgres";
import { PluginNeo4j } from "../plugins/neo4j";
import { PluginElasticSearch } from "../plugins/elastic_search";
import { fetchMetadata } from "../plugins/page_metadata";
import crypto from "crypto";
import { PluginEmails } from "../plugins/emails";

/**
 * Holds instances of the data access plugins
 * and the ETL logic for the events emitted by the Wika blockchain:
 * LikeEvent
 * UrlRegisteredEvent
 * @remarks
 * Logging is directed to the global logger if available, otherwise to console.
 */
export class EventHandlers {
  // Logger
  private log;

  /**
   * Constructor relies on env vars
   * for the list of env vars, see the docs of each Plugin, or the docker-compose file
   */
  constructor(
    // Data Plugins
    private postgres: PluginPostgres = new PluginPostgres(),
    private neo4j: PluginNeo4j = new PluginNeo4j(),
    private elastic: PluginElasticSearch = new PluginElasticSearch(),
    private emails: PluginEmails = new PluginEmails()
  ) {
    // If there's a global logger variable, use it,
    // otherwise, forward to console
    try {
      this.log = logger;
    } catch (e) {
      this.log = console;
    }
  }

  /**
   * Handle to the Postgres plugin
   */
  getPluginPostgres() {
    return this.postgres;
  }

  /**
   * Sends an email if EmailsPlugin is enabled
   * Plus, logs the error
   * @param e - The error to report
   */
  logError(e) {
    if (this.emails.isEnabled()) {
      this.emails.sendError(e.toString());
    }
    this.log.error(e);
  }

  /**
   * Fetches a webpage and saves the metadata to Postgres and Elastic Search
   * (when plugins are enabled)
   * @param url - The url string
   */
  async updateMetadata(url) {
    const metadata = await fetchMetadata(url);
    if (metadata) {
      if (this.postgres.isSyncEnabled()) {
        this.postgres.newMetadataRecord(url, metadata);
      } else {
        this.log.warn("postgres is disabled");
      }
      if (this.elastic.isSyncEnabled()) {
        await this.elastic.postUrl(url, metadata);
      } else {
        this.log.warn("elastic is disabled");
      }
    }
  }

  /**
   * Processes a LikeEvent
   * Updates the metadata in Postgres and Elastic Search
   * Records the event in Postgres
   * Creates or updates the LIKE relationship in Neo4J
   * @param event - Polkadot API Event, containing user, url and numLikes in its data field
   */
  async handleLikeEvent(event) {
    const eventData = event.event.data;
    const blockNum = event.extrinsic.block.block.header.number.toNumber();
    const eventId = blockNum + "/" + event.idx;
    const user = eventData[0].toString();
    const url = eventData[1].toHuman().toString();
    const numLikes = Number(eventData[2]);
    this.log.info(
      "handleLikeEvent : ${eventId} : ${user} : ${url}: ${numLikes}"
    );

    // Update metadata
    this.updateMetadata(url);

    // Main record
    if (this.postgres.isSyncEnabled()) {
      await this.postgres.newLikeEvent(eventId, blockNum, url, user, numLikes);
    } else {
      this.log.warn("postgres is disabled");
    }

    // Neo4J sync
    if (this.neo4j.isSyncEnabled()) {
      await this.neo4j.handleLikeEvent(user, url, numLikes);
    } else {
      this.log.warn("neo4j is disabled");
    }
  }

  /**
   * Processes a UrlRegisteredEvent
   * Updates the metadata in Postgres and Elastic Search
   * Records the event in Postgres
   * Creates or updates the OWNS relationship in Neo4J
   * @param event - Polkadot API Event, containing user and url in its data field
   */
  async handleUrlRegisteredEvent(event) {
    const eventData = event.event.data;
    const user = eventData[0].toString();
    const url = eventData[1].toHuman().toString();
    const blockNum = eventData[2].toNumber();
    const urlHash = crypto.createHash("md5").update(url).digest("hex");
    const eventId = blockNum + "/" + urlHash;
    this.log.info("handleUrlRegisteredEvent : ${eventId} : ${user} : ${url}");

    // Postgres records
    if (this.postgres.isSyncEnabled()) {
      // Deactivate previous records
      this.postgres.deactivatePreviousUrlRegisteredEvents(url);
      // Save active record
      this.postgres.newUrlRegisteredEvent(eventId, blockNum, url, user);
    } else {
      this.log.warn("postgres is disabled");
    }

    // Update metadata
    this.updateMetadata(url);

    // Neo4J sync
    if (this.neo4j.isSyncEnabled()) {
      await this.neo4j.handleUrlRegisteredEvent(user, url);
    } else {
      this.log.warn("neo4j is disabled");
    }
  }
}
