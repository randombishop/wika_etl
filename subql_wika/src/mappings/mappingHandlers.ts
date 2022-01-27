import {SubstrateExtrinsic,SubstrateEvent,SubstrateBlock} from "@subql/types";
import {BlockInfo,LikeEvent, UrlMetadata} from "../types";
import {PluginNeo4j} from "../plugins/neo4j";
import {PluginElasticSearch} from "../plugins/elastic_search";
import {fetchMetadata} from "../plugins/page_metadata";
import crypto from 'crypto';


// Data Plugins
// ---------------------

const neo4j = new PluginNeo4j() ;
const elastic = new PluginElasticSearch() ;


// Utils
// ---------------------

const LIKE_EVENT_TYPE = "0x0900" ;
const URL_REGISTERED_EVENT_TYPE = "0x0a06" ;

function newBlockInfo(blockId, blockNum) {
    const record = new BlockInfo(blockId);
    record.blockNum = blockNum;
    return record ;
}

function newLikeEvent(eventId, blockId, url, user, numLikes) {
    const record = new LikeEvent(eventId);
    record.blockId = blockId ;
    record.url = url ;
    record.user = user ;
    record.numLikes = numLikes ;
    return record ;
}

function newMetadataRecord(url, metadata) {
    const record = new UrlMetadata(url);
    record.title = metadata.title ;
    record.description = metadata.description ;
    record.image = metadata.image ;
    record.icon = metadata.icon ;
    record.updatedAt = metadata.updatedAt ;
    return record ;
}




// Event Handlers
// ---------------------

async function handleLikeEvent(event) {
    const eventData = event.event.data ;
    const blockId = event.extrinsic.block.block.header.hash.toString() ;
    const blockNum = event.extrinsic.block.block.header.number.toNumber();
    const eventId = blockNum + '/' + event.idx ;
    const user = eventData[0].toString() ;
    const url = eventData[1].toHuman().toString() ;
    const numLikes = Number(eventData[2]) ;

    // Metadata
    const metadata = await fetchMetadata(url) ;
    if (metadata) {
        let metadataRecord = newMetadataRecord(url, metadata) ;
        await metadataRecord.save();
        if (elastic.isSyncEnabled()) {
            logger.info('elastic search is enabled')
            await elastic.postUrl(url, metadata) ;
        }
    }

    // Main record
    let record = newLikeEvent(eventId, blockId, url, user, numLikes);
    await record.save();

    // Neo4J sync
    if (neo4j.isSyncEnabled()) {
        logger.info('neo4j is enabled')
        await neo4j.handleLikeEvent(user, url, numLikes) ;
    }
}

async function handleUrlRegisteredEvent(event) {
    const eventData = event.event.data ;
    const user = eventData[0].toString() ;
    const url = eventData[1].toHuman().toString() ;
    const blockNum = eventData[2].toNumber();
    const urlHash = crypto.createHash('md5').update(url).digest('hex');
    const eventId = blockNum+'/'+urlHash ;
    logger.info('handleUrlRegisteredEvent : '+eventId+' : '+user+' : '+url) ;
}








// Subquery Main Handlers
// --------------------------

export async function handleBlock(block: SubstrateBlock): Promise<void> {
    const blockId = block.block.header.hash.toString();
    const blockNum = block.block.header.number.toNumber();
    logger.info('handleBlock: '+blockNum)
    const record = newBlockInfo(blockId, blockNum);
    await record.save();
}

export async function handleEvent(event: SubstrateEvent): Promise<void> {
    const eventType = event.event.index.toHex() ;
    const eventData = event.event.data ;
    logger.info('handleEvent : '+eventType+' : '+eventData) ;
    if (eventType===LIKE_EVENT_TYPE) {
        handleLikeEvent(event) ;
    } else if (eventType===URL_REGISTERED_EVENT_TYPE) {
        handleUrlRegisteredEvent(event) ;
    }
}

export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {

}


