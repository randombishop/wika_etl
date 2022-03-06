import {BlockInfo, LikeEvent, UrlRegisteredEvent, UrlMetadata} from "../types";


export class PluginPostgres {

    private isEnabled: number;

    constructor() {
        this.isEnabled = parseInt(process.env.DB_ENABLE) ;
    }

    isSyncEnabled(): boolean {
        return (this.isEnabled==1) ;
    }

    async newBlockInfo(blockId, blockNum) {
        const record = new BlockInfo(blockId);
        record.blockNum = blockNum;
        record.syncDate = new Date() ;
        await record.save() ;
        return record ;
    }

    async newLikeEvent(eventId, blockNum, url, user, numLikes) {
        const record = new LikeEvent(eventId);
        record.url = url ;
        record.user = user ;
        record.numLikes = numLikes ;
        record.blockNum = blockNum ;
        await record.save() ;
        return record ;
    }

    async newMetadataRecord(url, metadata) {
        const record = new UrlMetadata(url);
        record.title = metadata.title ;
        record.description = metadata.description ;
        record.image = metadata.image ;
        record.icon = metadata.icon ;
        record.updatedAt = metadata.updatedAt ;
        await record.save() ;
        return record ;
    }

    async newUrlRegisteredEvent(eventId, blockNum, url, owner) {
        const record = new UrlRegisteredEvent(eventId);
        record.url = url ;
        record.owner = owner ;
        record.active = true ;
        record.blockNum = blockNum ;
        await record.save() ;
        return record ;
    }

    async deactivatePreviousUrlRegisteredEvents(user) {
        const previousRecords = await UrlRegisteredEvent.getByOwner(user) ;
        if (previousRecords!=null) {
            for (let i=0;i<previousRecords.length;i++) {
                let previousRecord = previousRecords[i] ;
                previousRecord.active=false ;
                await previousRecord.save() ;
            }
        }
    }

}

