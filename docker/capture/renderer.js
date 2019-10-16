const { session } = require('electron')
const sdb = document.querySelector("#sundae-browser")
const ld = document.querySelector("#loading-indicator")

const displayLd = (status) =>
  ld.style.display = !!status ? 'block' : 'none'

const bindBrowserEventToLdSwitch = (st) => (ev) =>
  sdb.addEventListener(ev, () => { displayLd(st) })

;['did-start-loading'].forEach(bindBrowserEventToLdSwitch(true))
;['did-stop-loading', 'dom-ready'].forEach(bindBrowserEventToLdSwitch(false))

sdb.addEventListener('dom-ready', () => {
  // sdb.openDevTools()
  // console.log("yooo ready")
})

sdb.addEventListener('update-target-url', (url) => {
  // console.log(sdb.src)
  // getCookies(console.log)
})


sdb.src = process.env.target || 'https://www.google.com'
console.log(`loading ${sdb.src}`)
