const net = require('net')

const proxyServe = '192.168.0.1'

const bridge = new net.Socket()
bridge.connect(8080, proxyServe, _ => {
  bridge.write('GET /regester?key=snailMacBook HTTP/1.1\r\n\r\n')
})

bridge.on('data', data => {
  const localServer = new net.Socket()
  localServer.connect(7001, 'localhost', _ => {
    localServer.write(data)
    localServer.on('data', data =>{
      bridge.write(data);
      console.log('localServer response');
    })
  })
})