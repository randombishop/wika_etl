import cheerio from 'cheerio' ;
import fetch from 'node-fetch';


async function fetchMetadata(url: string) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        const title = $('meta[property="og:title"]').attr('content') || $('title').text() || $('meta[name="title"]').attr('content')
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content')
        const site_name = $('meta[property="og:site_name"]').attr('content')
        const image = $('meta[property="og:image"]').attr('content') || $('meta[property="og:image:url"]').attr('content')
        const icon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href')
        const keywords = $('meta[property="og:keywords"]').attr('content') || $('meta[name="keywords"]').attr('content')
        return {
            title: title
        } ;
    } catch(err) {
        console.log('fetchMetadata error', err) ;
        return null ;
    }
}


export {fetchMetadata}