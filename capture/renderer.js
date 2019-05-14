const { session } = require('electron')
const sdb = document.querySelector("#sundae-browser")

sdb.addEventListener('dom-ready', () => {
  // sdb.openDevTools()
  // console.log("yooo ready")
})

sdb.addEventListener('update-target-url', (url) => {
  // console.log(sdb.src)
  // getCookies(console.log)
})

sdb.src = process.env.target