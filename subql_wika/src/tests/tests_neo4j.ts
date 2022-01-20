import { expect } from 'chai';
import { PluginNeo4j } from '../plugins/neo4j';


const neo4j = new PluginNeo4j() ;

const testUrl1 = 'test://www.test.com/test1' ;
const testUser1 = 'testUser1' ;


describe('PluginNeo4j', function () {


    describe('URL CRUD', function() {

        describe('deleteUrl', function () {
            it('should delete a URL node if it exists', async function () {
                await neo4j.deleteUrl(testUrl1) ;
                const node = await neo4j.fetchUrl(testUrl1) ;
                expect(node).to.be.null ;
            });
        });

        describe('createUrl', function () {
            it('should create a new URL node', async function () {
                const newNode = await neo4j.createUrl(testUrl1, 5) ;
                expect(newNode.url).to.equal(testUrl1);
                expect(newNode.numLikes).to.equal(5);
            });
        });

        describe('fetchUrl', function () {
            it('should fetch the URL node we just created', async function () {
                const node = await neo4j.fetchUrl(testUrl1) ;
                expect(node.url).to.equal(testUrl1);
                expect(node.numLikes).to.equal(5);
            });
        });

        describe('updateUrl', function () {
            it('should update the URL and add to numLikes', async function () {
                const updatedNode = await neo4j.updateUrl(testUrl1, 10) ;
                expect(updatedNode.url).to.equal(testUrl1);
                expect(updatedNode.numLikes).to.equal(15);
            });
        });

    }) ;


    describe('USER CRUD', function() {

        describe('deleteUser', function () {
            it('should delete a User node if it exists', async function () {
                await neo4j.deleteUser(testUser1) ;
                const node = await neo4j.fetchUser(testUser1) ;
                expect(node).to.be.null ;
            });
        });

        describe('createUser', function () {
            it('should create a new User node', async function () {
                const newNode = await neo4j.createUser(testUser1, 1) ;
                expect(newNode.address).to.equal(testUser1);
                expect(newNode.numLikes).to.equal(1);
            });
        });

        describe('fetchUser', function () {
            it('should fetch the User node we just created', async function () {
                const node = await neo4j.fetchUser(testUser1) ;
                expect(node.address).to.equal(testUser1);
                expect(node.numLikes).to.equal(1);
            });
        });

        describe('updateUser', function () {
            it('should update the User and add to numLikes', async function () {
                const updatedNode = await neo4j.updateUser(testUser1, 14) ;
                expect(updatedNode.address).to.equal(testUser1);
                expect(updatedNode.numLikes).to.equal(15);
            });
        });

    }) ;


    describe('LIKES CRUD', function() {

        describe('deleteLIKES', function () {
            it('should delete a LIKE relation if it exists', async function () {
                await neo4j.deleteLIKES(testUser1, testUrl1) ;
                const relation = await neo4j.fetchLIKES(testUser1, testUrl1) ;
                expect(relation).to.be.null ;
            });
        });

        describe('createLIKES', function () {
            it('should create a new LIKE relation', async function () {
                const newRelation = await neo4j.createLIKES(testUser1, testUrl1, 3) ;
                expect(newRelation.numLikes).to.equal(3);
            });
        });

        describe('fetchLIKES', function () {
            it('should fetch the LIKE relation we just created', async function () {
                const relation = await neo4j.fetchLIKES(testUser1, testUrl1) ;
                expect(relation.numLikes).to.equal(3);
            });
        });

        describe('updateLIKES', function () {
            it('should update the LIKES relation and add to numLikes', async function () {
                const updated = await neo4j.updateLIKES(testUser1, testUrl1, 12) ;
                expect(updated.numLikes).to.equal(15);
            });
        });

    }) ;


    describe('dispose', function () {
        it('should close the driver', async function () {
            await neo4j.dispose() ;
        });
    });

});