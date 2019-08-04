/**
 * sundae proxy
 * based on jsproxy cfworker api
 * https://github.com/EtherDream/jsproxy/
 */
'use strict'

const { Request, Response, Headers } = require('node-fetch')
const fetch = require('node-fetch')
const HDR_KEY_SUNDAE_ID = "--sundae-id"
const PREFLIGHT_INIT = {
  status: 204,
  headers: new Headers({
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,TRACE,DELETE,HEAD,OPTIONS',
    'access-control-allow-headers': '--raw-info,--level,--url,--referer,--cookie,--origin,--ext,--aceh,--ver,--type,--mode,accept,accept-charset,accept-encoding,accept-language,accept-datetime,authorization,cache-control,content-length,content-type,date,if-match,if-modified-since,if-none-match,if-range,if-unmodified-since,max-forwards,pragma,range,te,upgrade,upgrade-insecure-requests,x-requested-with,chrome-proxy,purpose',
    'access-control-max-age': '1728000',
  }),
}

module.exports = {}

/**
 * @param {Request} req
 */
module.exports.handleProxyRequest = async function (req) {
  const reqHdrFromClient = req.headers
  if (reqHdrFromClient.has('x-jsproxy')) {
    return Response.error()
  }

  // preflight
  if (req.method === 'OPTIONS' &&
      reqHdrFromClient.has('access-control-request-headers')
  ) {
    return new Response(null, PREFLIGHT_INIT)
  }

  let urlObj = null
  let extHdrs = null
  let acehOld = false
  let rawSvr = ''
  let rawLen = ''
  let rawEtag = ''

  const reqHdrToRemoteResource = new Headers(reqHdrFromClient)
  reqHdrToRemoteResource.set('x-jsproxy', '1')
/*
  if (!reqHdrFromClient.has(HDR_KEY_SUNDAE_ID))
    return new Response("No Sundae Identity Found", {
      status: 401
    })
  const sundaeUserInfo = JSON.parse(await SundaeStore.get(reqHdrFromClient.get(HDR_KEY_SUNDAE_ID)))
  if (!sundaeUserInfo)
    return new Response("No Sundae Identity Found", {
      status: 401
    })
  console.log(sundaeUserInfo)
  const sundaeIdExpiry = new Date(sundaeUserInfo.expiry)
  if (!sundaeUserInfo.expiry || (new Date()) > sundaeIdExpiry) {
    return new Response("Sundae Identity Expired", {
      status: 402
    })
  }
*/
  for (const [k, v] of reqHdrFromClient.entries()) {
    if (!k.startsWith('--')) {
      continue
    }
    reqHdrToRemoteResource.delete(k)

    const k2 = k.substr(2)
    switch (k2) {
      case 'url':
        urlObj = new URL(v)
        break
      case 'aceh':
        acehOld = true
        break
      case 'raw-info':
        [rawSvr, rawLen, rawEtag] = v.split('|')
        break
      case 'ext':
        extHdrs = JSON.parse(v)
        break
      case 'level':
      case 'mode':
      case 'type':
          break
      default:
        if (v) {
          reqHdrToRemoteResource.set(k2, v)
        } else {
          reqHdrToRemoteResource.delete(k2)
        }
        break
    }
  }
  if (extHdrs) {
    for (const [k, v] of Object.entries(extHdrs)) {
      reqHdrToRemoteResource.set(k, v)
    }
  }
  const reqInit = {
    method: req.method,
    headers: reqHdrToRemoteResource,
  }

  reqHdrToRemoteResource.set('host', urlObj.host)
  reqHdrToRemoteResource.set('origin', urlObj.host)

  return requestRemoteResource(urlObj, reqInit, acehOld, rawLen, 0)
}


/**
 * 
 * @param {URL} urlObj 
 * @param {RequestInit} reqInit 
 * @param {number} retryTimes 
 */
async function requestRemoteResource(urlObj, reqInit, acehOld, rawLen, retryTimes) {
  if (!urlObj || !urlObj.href) {
    return new Response("pong", {
      status: 404,
    })
  }
  console.log(reqInit.headers.raw())
  console.log("!!!")
  const res = await fetch(urlObj.href, reqInit)
  // console.log(res)
  const resHdrFromRemoteResource = res.headers
  const resHdrToClient = new Headers(resHdrFromRemoteResource)

  let expose = '*'
  let vary = '--url'
  
  for (const [k, v] of resHdrFromRemoteResource.entries()) {
    if (k === 'access-control-allow-origin' ||
        k === 'access-control-expose-headers' ||
        k === 'location' ||
        k === 'set-cookie'
    ) {
      // todo sundae handle cookie
      // push to kv accordingly
      const x = '--' + k
      resHdrToClient.set(x, v)
      if (acehOld) {
        expose = expose + ',' + x
      }
      resHdrToClient.delete(k)
    }
    else if (k === 'vary') {
      vary = vary + ',' + v
    }
    else if (acehOld &&
      k !== 'cache-control' &&
      k !== 'content-language' &&
      k !== 'content-type' &&
      k !== 'expires' &&
      k !== 'last-modified' &&
      k !== 'pragma'
    ) {
      expose = expose + ',' + k
    }
  }

  if (acehOld) {
    expose = expose + ',--s'
    resHdrToClient.set('--t', '1')
  }

  resHdrToClient.set('access-control-expose-headers', expose)
  resHdrToClient.set('access-control-allow-origin', '*')
  resHdrToClient.set('vary', vary)
  resHdrToClient.set('--s', res.status)

  // verify
  const newLen = resHdrFromRemoteResource.get('content-length') || ''
  const badLen = (rawLen !== newLen)

  let status = 200
  let body = res.body

  if (false && badLen) {
    if (retryTimes < 1) {
      urlObj = await parseYtVideoRedir(urlObj, newLen, res)
      if (urlObj) {
        return requestRemoteResource(urlObj, reqInit, acehOld, rawLen, retryTimes + 1)
      }
    }
    status = 400
    body = `bad len (old: ${rawLen} new: ${newLen})`
    resHdrToClient.set('cache-control', 'no-cache')
  }

  resHdrToClient.set('--retry', retryTimes)
//   resHdrToClient.set('--sundae-build', __webpack_hash__)

  return new Response(body, {
    status,
    headers: resHdrToClient,
  })
}


/**
 * @param {URL} urlObj 
 */
function isYtUrl(urlObj) {
  return (
    urlObj.host.endsWith('.googlevideo.com') &&
    urlObj.pathname.startsWith('/videoplayback')
  )
}

/**
 * @param {URL} urlObj 
 * @param {number} newLen 
 * @param {Response} res 
 */
async function parseYtVideoRedir(urlObj, newLen, res) {
  if (newLen > 2000) {
    return null
  }
  if (!isYtUrl(urlObj)) {
    return null
  }
  try {
    const data = await res.text()
    urlObj = new URL(data)
  } catch (err) {
    return null
  }
  if (!isYtUrl(urlObj)) {
    return null
  }
  return urlObj
}