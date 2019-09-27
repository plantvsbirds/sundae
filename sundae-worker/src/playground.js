addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

let testKey = {
  "alg": "A256GCM",
  "ext": true,
  "k": "xLhlPKnGQwugwTcWQc-2yOatvpJSrTjS5Vk0UKgjZDY",
  "key_ops": [
    "encrypt",
    "decrypt"
  ],
  "kty": "oct"
}

/**
 * Fetch and log a request
 * @param {Request} request
 */
async function handleRequest(request) {
  console.log('Got request', request)
  const response = await fetch(request)
  console.log('Got response', response)

  crypto.subtle.importKey(
    "jwk",
    testKey,
    {
      name: "AES-GCM"
    }, //algoOptions
    false,
    ["encrypt", "decrypt"]
  )
  .then(function(key){
    console.log("imported")
    console.log(key);
  })
  .catch(function(err){
      console.error(err);
  });
  return response
}