import {SubstrateExtrinsic, SubstrateEvent, SubstrateBlock} from "@subql/types";
import {EventHandlers} from "./eventHandlers";


// ETL logic in EventHandlers
const eventHandlers = new EventHandlers() ;


// Event types
const LIKE_EVENT_TYPE = "0x0900" ;
const URL_REGISTERED_EVENT_TYPE = "0x0a06" ;


// Subquery block handling function
export async function handleBlock(block: SubstrateBlock): Promise<void> {
    try {
        const blockId = block.block.header.hash.toString();
        const blockNum = block.block.header.number.toNumber();
        logger.info('handleBlock: '+blockNum)
        const postgres = eventHandlers.getPluginPostgres() ;
        if (postgres.isSyncEnabled()) {
            postgres.newBlockInfo(blockId, blockNum);
        }
    } catch (e) {
        eventHandlers.logError(e) ;
    }
}

// Subquery event handling function
export async function handleEvent(event: SubstrateEvent): Promise<void> {
    try {
        const eventType = event.event.index.toHex() ;
        const eventData = event.event.data ;
        logger.info('handleEvent : '+eventType+' : '+eventData) ;
        if (eventType===LIKE_EVENT_TYPE) {
            eventHandlers.handleLikeEvent(event) ;
        } else if (eventType===URL_REGISTERED_EVENT_TYPE) {
            eventHandlers.handleUrlRegisteredEvent(event) ;
        }
    } catch (e) {
        eventHandlers.logError(e) ;
    }
}

// Subquery call handling function
export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {

}


