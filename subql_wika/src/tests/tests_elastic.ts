import { expect } from 'chai';
import { PluginElasticSearch } from '../plugins/elastic_search';
import Meta from '../plugins/meta';


const es = new PluginElasticSearch() ;

const testUrl = 'https://www.test.com/' ;
const testMeta = new Meta() ;
testMeta.url = testUrl ;
testMeta.title = 'Test Title' ;
testMeta.description = 'Test Description Bla bla bla ...' ;
testMeta.image = 'Test Image' ;
testMeta.icon = 'Test Icon' ;
testMeta.updatedAt = new Date() ;

describe('PluginElasticSearch', function () {


    describe('URL CRUD', function() {

        describe('deleteUrl', function () {
            it('should delete a URL node if it exists', async function () {
                const del = await es.deleteUrl(testUrl) ;
                const doc = await es.getUrl(testUrl) ;
                expect(doc).to.be.null ;
            });
        });

        describe('postUrl', function () {
            it('should create a new URL doc', async function () {
                const result = await es.postUrl(testUrl, testMeta) ;
                expect(result).to.equal('created') ;
            });
        });

        describe('getUrl', function () {
            it('should fetch the URL doc we just created', async function () {
                const doc = await es.getUrl(testUrl) ;
                expect(doc.url).to.equal(testUrl) ;
            });
        });

        describe('postUrl', function () {
            it('should update the doc', async function () {
                testMeta.icon = 'Updated icon' ;
                const result = await es.postUrl(testUrl, testMeta) ;
                expect(result).to.equal('updated') ;
                const doc = await es.getUrl(testUrl) ;
                expect(doc.icon).to.equal('Updated icon') ;
            });
        });

    }) ;

});