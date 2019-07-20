const uuidv4 = require('uuid/v4');

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
  console.log(userInfo)
  console.log(await SundaeStore.put(userInfo.id, userInfo))
  return new Response("Your id is" + userInfo.id,
    { status: 200 })
}