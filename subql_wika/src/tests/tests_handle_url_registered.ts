import { expect } from 'chai';
import { PluginNeo4j } from '../plugins/neo4j';
import { EventHandlers } from '../mappings/eventHandlers';


const eventHandlers = new EventHandlers() ;
const neo4j = new PluginNeo4j() ;


const testUser = 'aaaaaaaaaaaaaaa' ;
const testUrl = 'https://www.wika.network/' ;


// Mocking a Like Event as it would come from Polkadot API
const URL_REGISTERED_EVENT = {
    event: {
        data:[
            {toString: () => {return testUser} },
            {
                toString: () => {return  testUser} ,
                toHuman: () => {toString: () => {return testUrl} }
            },
            1
        ]
    },
    extrinsic: {
        block:{
            block:{
                header: {
                    hash: {
                        toString: () => {return "test_hash_id"} ,
                        toNumber: () => {return 123}
                    }
                }
            }
        }
    }
}



describe('handleUrlRegisteredEvent', function () {

    it('should process the event with no errors and save the ownership', async function () {
        await eventHandlers.handleUrlRegisteredEvent(URL_REGISTERED_EVENT) ;
        const owns = await neo4j.fetchOWNS(testUser, testUrl) ;
        expect(owns).to.be.not.null ;
    }) ;

});

