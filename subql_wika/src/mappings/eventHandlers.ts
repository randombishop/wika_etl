import {SubstrateExtrinsic, SubstrateEvent, SubstrateBlock} from "@subql/types";
import {PluginPostgres} from "../plugins/postgres";
import {PluginNeo4j} from "../plugins/neo4j";
import {PluginElasticSearch} from "../plugins/elastic_search";
import {fetchMetadata} from "../plugins/page_metadata";
import crypto from 'crypto';
import {PluginEmails} from '../plugins/emails' ;




export class EventHandlers {

    // Data Plugins
    private postgres: PluginPostgres ;
    private neo4j: PluginNeo4j ;
    private elastic: PluginElasticSearch ;
    private emails: PluginEmails ;

    // Logger
    private log ;

    constructor() {
        // Instantiate data plugins
        this.postgres = new PluginPostgres() ;
        this.neo4j = new PluginNeo4j() ;
        this.elastic = new PluginElasticSearch() ;
        this.emails = new PluginEmails() ;
        // If there's a global logger variable, use it,
        // otherwise, forward to console
        if (logger) {
            this.log = logger ;
        } else {
            this.log = console ;
        }
    }

    getPluginPostgres() {
        return this.postgres ;
    }

    logError(e) {
        if (this.emails.isEnabled()) {
            this.emails.sendError(e.toString()) ;
        }
        this.log.error(e);
    }

    async updateMetadata(url) {
        const metadata = await fetchMetadata(url) ;
        if (metadata) {
            if (this.postgres.isSyncEnabled()) {
                this.postgres.newMetadataRecord(url, metadata) ;
            }
            if (this.elastic.isSyncEnabled()) {
                await this.elastic.postUrl(url, metadata) ;
            }
        }
    }

    async handleLikeEvent(event) {
        const eventData = event.event.data ;
        const blockId = event.extrinsic.block.block.header.hash.toString() ;
        const blockNum = event.extrinsic.block.block.header.number.toNumber();
        const eventId = blockNum + '/' + event.idx ;
        const user = eventData[0].toString() ;
        const url = eventData[1].toHuman().toString() ;
        const numLikes = Number(eventData[2]) ;
        this.log.info('handleLikeEvent : '+eventId+' : '+user+' : '+url+' : '+numLikes) ;

        // Update metadata
        this.updateMetadata(url) ;

        // Main record
        if (this.postgres.isSyncEnabled()) {
            this.postgres.newLikeEvent(eventId, blockNum, url, user, numLikes);
        }

        // Neo4J sync
        if (this.neo4j.isSyncEnabled()) {
            await this.neo4j.handleLikeEvent(user, url, numLikes) ;
        }
    }

    async handleUrlRegisteredEvent(event) {
        const eventData = event.event.data ;
        const user = eventData[0].toString() ;
        const url = eventData[1].toHuman().toString() ;
        const blockNum = eventData[2].toNumber();
        const urlHash = crypto.createHash('md5').update(url).digest('hex');
        const eventId = blockNum+'/'+urlHash ;
        this.log.info('handleUrlRegisteredEvent : '+eventId+' : '+user+' : '+url) ;

        // Postgres records
        if (this.postgres.isSyncEnabled()) {
            // Deactivate previous records
            this.postgres.deactivatePreviousUrlRegisteredEvents(user) ;
            // Save active record
            this.postgres.newUrlRegisteredEvent(eventId, blockNum, url, user) ;
        }

        // Update metadata
        this.updateMetadata(url) ;

        // Neo4J sync
        if (this.neo4j.isSyncEnabled()) {
            await this.neo4j.handleUrlRegisteredEvent(user, url) ;
        }
    }

}


