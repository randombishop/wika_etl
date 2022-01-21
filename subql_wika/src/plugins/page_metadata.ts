const metascraper = require('metascraper')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-logo')(),
  require('metascraper-clearbit')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])


const got = require('got') ;


async function fetchMetadata(targetUrl: string) {
    const { body: html, url } = await got(targetUrl)
    const metadata = await metascraper({ html, url })
    return metadata ;
}


export {fetchMetadata}