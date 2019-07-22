const fetch = require('electron-fetch').default
const conf = require('./config.json')[process.env.env || 'dev']
const { logCookies } = require('./hookCapture')

let urlMaker = (cookie) => {
  let url = '';
  // get prefix, like https://www.
  url += cookie.secure ? 'https://' : 'http://';
  url += cookie.domain.charAt(0) === '.' ? 'www' : '';
  // append domain and path
  url += cookie.domain;
  url += cookie.path;
  return url
}
module.exports = ({ app, session }) => {
  app.on('ready', () => {
    if (process.env.scoop == 'true') {
      console.log("adding cookies")
      fetch(conf.apiRoot + conf.cookieEndPoint + '/' + process.env.ID)
        .then(r => r.json())
        .then(d => {
          let cks = session.defaultSession.cookies
            Object.values(d).map(c => cks.set({...c, url: urlMaker(c)}, () => {}))
        })
        .catch(e => {
          console.log(e)
        })
    }
  })
}