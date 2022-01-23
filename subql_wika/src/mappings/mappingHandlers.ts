import {SubstrateExtrinsic,SubstrateEvent,SubstrateBlock} from "@subql/types";
import {BlockInfo,LikeEvent, UrlMetadata} from "../types";
import {PluginNeo4j} from "../plugins/neo4j";
//import {fetchMetadata} from "../plugins/page_metadata";





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
    record.author = metadata.author ;
    record.date = metadata.date ;
    record.description = metadata.description ;
    record.image = metadata.image ;
    record.logo = metadata.logo ;
    record.publisher = metadata.publisher ;
    record.title = metadata.title ;
    record.updatedAt = new Date() ;
    return record ;
}




export async function handleBlock(block: SubstrateBlock): Promise<void> {
    console.log('handleBlock'+block)
    const blockId = block.block.header.hash.toString();
    const blockNum = block.block.header.number.toNumber();
    const record = newBlockInfo(blockId, blockNum);
    await record.save();
}

export async function handleEvent(event: SubstrateEvent): Promise<void> {
    const eventType = event.event.index.toHex() ;
    const eventData = event.event.data ;
    const blockId = event.extrinsic.block.block.header.hash.toString() ;
    const blockNum = event.extrinsic.block.block.header.number.toNumber();
    const eventId = blockNum + '/' + event.idx ;
    if (eventType==="0x0900") {
        const user = eventData[0].toString() ;
        const url = eventData[1].toHuman().toString() ;
        const numLikes = Number(eventData[2]) ;

        //const metadata = await fetchMetadata(url) ;
        //let metadataRecord = newMetadataRecord(url, metadata) ;
        //await metadataRecord.save();

        let record = newLikeEvent(eventId, blockId, url, user, numLikes);
        await record.save();

        const neo4j = new PluginNeo4j() ;
        console.log('NEO4J_ENABLE: ' + process.env.NEO4J_ENABLE) ;
        console.log('NEO4j_HOST: ' + process.env.NEO4J_HOST) ;
        console.log('NEO4J_USER: ' + process.env.NEO4J_USER) ;
        console.log('handleEvent: ' + eventId + ' , ' + eventData) ;
        console.log('neo4j.isEnabled: ' + neo4j.isSyncEnabled()) ;
        if (neo4j.isSyncEnabled()) {
            logger.info('neo4j is enabled')
            await neo4j.handleLikeEvent(user, url, numLikes) ;
        }
    }
}

export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {

}


