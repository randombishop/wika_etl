import { expect } from 'chai';
import { fetchMetadata } from '../plugins/page_metadata';


const testDataArray = [
    {
        url: 'https://www.wika.network/',
        meta: {
            title: 'Home page | Wika Network',
            description: 'Blockchain to manage URL Ownership registry and reward authors with Wika tokens.<head />',
            image: undefined,
            icon: '/img/favicon.ico'
        }
    },
    {
        url: 'https://github.com/randombishop/wika_etl',
        meta: {
            title: 'GitHub - randombishop/wika_etl',
            description: 'Contribute to randombishop/wika_etl development by creating an account on GitHub.',
            image: 'https://opengraph.githubassets.com/1eb16d9d35b2a179a6b0c41c4fc97356852d3457a40196d1bf73dabc1717d5d8/randombishop/wika_etl',
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
                expect(meta.image).to.equal(testData.meta.image) ;
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
