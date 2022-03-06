import { expect } from 'chai';
import { fetchMetadata } from '../plugins/page_metadata';


const testDataArray = [
    {
        url: 'https://www.wika.network/',
        meta: {
            title: 'Home page | Wika Network',
            description: 'Blockchain to manage URL Ownership registry and reward authors with Wika tokens.<head />',
            icon: '/img/favicon.ico'
        }
    },
    {
        url: 'https://github.com/randombishop/wika_etl',
        meta: {
            title: 'GitHub - randombishop/wika_etl',
            description: 'Contribute to randombishop/wika_etl development by creating an account on GitHub.',
            icon: 'https://github.githubassets.com/favicons/favicon.svg'
        }
    }
] ;


describe('fetchMetadata', function () {

    describe('for valid urls', function () {
        function testUrl(testData) {
            it('should work for '+testData.url, async function () {
                const meta = await fetchMetadata(testData.url) ;
                //console.log('meta', meta) ;
                expect(meta.title).to.equal(testData.meta.title) ;
                expect(meta.description).to.equal(testData.meta.description) ;
                expect(meta.icon).to.equal(testData.meta.icon) ;
            });
        };
        for (let i=0;i<testDataArray.length;i++) {
            testUrl(testDataArray[i]) ;
        }
    }) ;

    describe('for invalid urls', function () {
        it('should return null', async function () {
            const meta = await fetchMetadata('123') ;
            expect(meta).to.be.null ;
        });
    });

}) ;
