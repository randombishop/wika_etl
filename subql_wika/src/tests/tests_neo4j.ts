import { expect } from 'chai';
import { PluginNeo4j } from '../plugins/neo4j';


const neo4j = new PluginNeo4j() ;

const testUrl = 'test://www.test.com/test123' ;

describe('PluginNeo4j', function () {

    describe('createUrlNode', function () {
        it('should create a new node', async function () {
            const newNode = await neo4j.createUrlNode(testUrl, 5) ;
            expect(newNode.url).to.equal(testUrl);
            expect(newNode.numLikes).to.equal(5);
        });
    });

    describe('dispose', function () {
        it('should close the driver', async function () {
            await neo4j.dispose() ;
        });
    });

});