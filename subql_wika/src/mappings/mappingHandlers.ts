import {SubstrateExtrinsic,SubstrateEvent,SubstrateBlock} from "@subql/types";
import {BlockInfo,LikeEvent} from "../types";
import {PluginNeo4j} from "../plugins/neo4j";
import {fetchMetadata} from "../plugins/page_metadata";



export async function handleBlock(block: SubstrateBlock): Promise<void> {
    logger.debug('handleBlock'+block)
    const blockId = block.block.header.hash.toString();
    const blockNum = block.block.header.number.toNumber();
    let record = new BlockInfo(blockId);
    record.blockNum = blockNum;
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
        logger.debug('LikeEvent id',eventId) ;
        logger.debug('LikeEvent block',blockId) ;
        logger.debug('LikeEvent user',user) ;
        logger.debug('LikeEvent url',url) ;
        logger.debug('LikeEvent numLikes',numLikes) ;
        const metadata = await fetchMetadata(url) ;
        logger.debug('LikeEvent metadata', metadata) ;
        let record = new LikeEvent(eventId);
        record.blockId = blockId ;
        record.url = url ;
        record.user = user ;
        record.numLikes = numLikes ;
        await record.save();
    }
    //const {event: {data: [account, balance]}} = event;
    //Retrieve the record by its ID
    //const record = await StarterEntity.get(event.extrinsic.block.block.header.hash.toString());
    //record.field2 = account.toString();
    //Big integer type Balance of a transfer event
    //record.field3 = (balance as Balance).toBigInt();
    //await record.save();
}

export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
    //const record = await StarterEntity.get(extrinsic.block.block.header.hash.toString());
    //Date type timestamp
    //record.field4 = extrinsic.block.timestamp;
    //Boolean tyep
    //record.field5 = true;
    //await record.save();
}


