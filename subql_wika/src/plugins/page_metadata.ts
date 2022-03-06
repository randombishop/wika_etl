import cheerio from 'cheerio' ;
import fetch from 'node-fetch';
import Meta from './meta' ;


async function fetchMetadata(url: string): Promise<Meta> {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        const ans = new Meta() ;
        ans.url = url ;
        ans.title = $('meta[property="og:title"]').attr('content') || $('title').text() || $('meta[name="title"]').attr('content')
        ans.description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content')
        ans.image = $('meta[property="og:image"]').attr('content') || $('meta[property="og:image:url"]').attr('content')
        ans.icon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href')
        ans.updatedAt = new Date() ;
        return ans ;
    } catch(err) {
        //console.log('fetchMetadata error', err) ;
        return null ;
    }
}


export {fetchMetadata}