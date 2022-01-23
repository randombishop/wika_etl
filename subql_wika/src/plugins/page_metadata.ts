import cheerio from 'cheerio' ;
import fetch from 'node-fetch' ;



async function fetchMetadata(url: string) {
    /*fetch(url)
    .then(result => result.text())
    .then(html => {
        console.log(html);
        const $ = cheerio.load(html);
        const title = $('meta[property="og:title"]').attr('content') || $('title').text() || $('meta[name="title"]').attr('content')
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content')
        const url = $('meta[property="og:url"]').attr('content')
        const site_name = $('meta[property="og:site_name"]').attr('content')
        const image = $('meta[property="og:image"]').attr('content') || $('meta[property="og:image:url"]').attr('content')
        const icon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href')
        const keywords = $('meta[property="og:keywords"]').attr('content') || $('meta[name="keywords"]').attr('content')
    }).catch(error => {
        console.log(error);
    })*/
    return {} ;
}


export {fetchMetadata}