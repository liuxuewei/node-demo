const net = require('net');


const tcp_server = net.createServer();  // 创建 tcp server
const PORT = 6688;
const encoding = 'utf8';
const ClinetSockets = {};

// 监听 端口
tcp_server.listen(PORT, function () {
    console.log('Server listening ' + PORT);
});

// 向所有客户端广播消息
const broadcast = function (msg){
    for (const key in ClinetSockets) {
        ClinetSockets[key].write(msg)
    }
}

//处理客户端连接
tcp_server.on('connection', function (clinetSocket) {
    const clientKey = clinetSocket.remoteAddress+':'+clinetSocket.remotePort;
    console.log(clientKey + ', connected to server!');
    ClinetSockets[clientKey] = clinetSocket;
    tcp_server.getConnections(function (err, count) {
        console.log("当前连接客户端个数为：" + count);
    });
    
    //广播
    broadcast(clientKey + ', connected to server!')

    //处理客户端消息
    clinetSocket.on('data', async function (data) {
        const dataString = data.toString(encoding);
        const dataJson = JSON.parse(dataString);
        
        if(dataJson.type === 'getMachineTemperature'){
            const cpuTemperature = Number(Math.random() * 100).toFixed(2);
            const result = {type: dataJson.type, data: cpuTemperature}
            const resultString = JSON.stringify(result);
            clinetSocket.setEncoding(encoding);
            clinetSocket.write(resultString)
        }
        
        console.log(`received data from client %s: %s`, clientKey, dataString);
    })
    // 客户端正常断开时执行
    clinetSocket.on('close', function () {
        ClinetSockets[clientKey] = null;
        console.log('Client %s Disconneted!', clientKey);
    })
    // 客户端正异断开时执行
    clinetSocket.on("error", function (err) {
        ClinetSockets[clientKey] = null;
        console.log(`Client %s Error And Disconneted: %s`, clientKey, err.message);
    });
});


tcp_server.on('error', function () {
    console.log('Server error!');
})

tcp_server.on('close', function () {
    console.log('Server close!');
})
