const net = require('net')

const bridges = {};// 可以注册多个桥，根据key进行注册
const clients = {}
const defaultKey = "snailMacBook";// 默认注册的电脑key

net.createServer(socket => {
  socket.on('data', data => {
    const request = data.toString();
    console.log('proxy data', request);
    const urlMatch = request.match(/.+ (?<url>.+) /);
    const url = urlMatch && urlMatch.groups ? urlMatch.groups.url : null;
    if (!url) return
    const _isBridge = isBridge(url);
    console.log('isBridge', _isBridge);
    if (_isBridge) {
      regesterBridge(socket, url)
      return
    }

    const { bridge, key } = findBridge(request, url)
    if (!bridge) return
    cacheClientRequest(bridge, key, socket, request, url)
    
    sendRequestToBridgeByKey(key)
  })
}).listen(8080)

function isBridge (url) {
  return url.startsWith('/regester?')
}

function regesterBridge (socket, url) {
  const keyMatch = url.match(/(^|&|\?)key=(?<key>[^&]*)(&|$)/);
  const key = keyMatch && keyMatch.groups ? keyMatch.groups.key : null;
  bridges[key] = socket;
  // 新注册的桥，释放掉老的客户端
  clients[key] = null;
  console.log('regesterBridge',key);
  socket.removeAllListeners('data')
}

function findBridge (request, url) {
  const keyMatch = url.match(/(^|&|\?)key=(?<key>[^&]*)(&|$)/);
  let key = keyMatch && keyMatch.groups ? keyMatch.groups.key : defaultKey;
  let bridge = bridges[key]
  if (bridge) {
    console.log('findBridge', key);
    return { bridge, key }
  }

  const refererMatch = request.match(/\r\nreferer: (?<referer>.+)\r\n/i);
  const referer = refererMatch && refererMatch.groups ? refererMatch.groups.referer : null;
  if (!referer) return {}

  key = referer.split('//')[1].split('/')[1]
  bridge = bridges[key]
  if (bridge) {
    console.log('findBridge', key);
    return { bridge, key }
  }

  return {}
}

function cacheClientRequest (bridge, key, socket, request, url) {
  if (clients[key] && clients[key].requests) {
    clients[key].requests.push({bridge, key, socket, request, url})
  } else {
    clients[key] = {}
    clients[key].requests = [{bridge, key, socket, request, url}]
  }
  console.log('request clients length', key, clients[key].requests.length)
}

function sendRequestToBridgeByKey (key) {
  const client = clients[key]
  if (client.isSending) return

  const requests = client.requests
  if (requests.length <= 0) return

  client.isSending = true
  client.contentLength = 0
  client.received = 0

  const {bridge, socket, request, url} = requests.shift()

  const newUrl = url.replace(key, '')
  const newRequest = request.replace(url, newUrl)

  bridge.setEncoding = "utf8";

  bridge.write(newRequest)
  bridge.on('data', data => {
    const response = data.toString('utf8')

    const contentTypeMatch = response.match(/\r\ncontent-type: (?<contentType>.+)\r\n/i);
    // console.log('contentTypeMatch', contentTypeMatch);
    const contentType = contentTypeMatch && contentTypeMatch.groups ? contentTypeMatch.groups.contentType : null;
    const isText = contentType && contentType.indexOf('text') > -1;
    console.log('contentType', contentType);
    // console.log('bridge response data:\r\n%j', response);
    console.log('bridge response data:\r\n', isText ? response : contentType);

    const codeMatch = response.match(/^HTTP[S]*\/[1-9].[0-9] (?<code>[0-9]{3}).*\r\n/);
    let code = codeMatch && codeMatch.groups ? codeMatch.groups.code : null;
    if (code) {
      code = parseInt(code)
      if (code === 200) {
        const contentLengthMatch = response.match(/\r\ncontent-length: (?<contentLength>.+)\r\n/i);
        let contentLength = contentLengthMatch && contentLengthMatch.groups ? contentLengthMatch.groups.contentLength : null;
        if (contentLength) {
          contentLength = parseInt(contentLength)
          client.contentLength = contentLength
          client.received = Buffer.from(response.split('\r\n\r\n')[1]).length
        }
      } else {
        socket.write(data)
        client.isSending = false
        bridge.removeAllListeners('data')
        sendRequestToBridgeByKey(key)
        return
      }
    } else {
      client.received += data.length
    }

    socket.write(data)

    if (client.contentLength <= client.received) {
      client.isSending = false
      bridge.removeAllListeners('data')
      sendRequestToBridgeByKey(key)
    }
  })
}
