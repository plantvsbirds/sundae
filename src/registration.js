const uuidv4 = require('uuid/v4');
const API_RESP_HEADER = new Headers({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
})

/**
 * Fetch and log a request
 * @param {Request} request
 */

const FIVE_MIN = 1000 * 60 * 5
// SundaeStore
export async function handleRegistrationRequest(request) {
  console.log('Got request', request)
  let userInfo = {
    id: uuidv4(),
    expiry: (new Date()).getTime() + FIVE_MIN
  }
  console.log(await SundaeStore.put(userInfo.id, JSON.stringify(userInfo)))
  return new Response(
    JSON.stringify(userInfo),
    {
      status: 200,
      headers: API_RESP_HEADER,
    }
  )
}