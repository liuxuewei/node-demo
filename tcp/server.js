const net = require('net');


const tcp_server = net.createServer();  // 创建 tcp server
const PORT = 6688;
const encoding = 'utf8';
// 缓存客户端
const ClinetSockets = {};

// 监听 端口
tcp_server.listen(PORT, function () {
    console.log('Server listening ' + PORT);
});

// 向所有客户端广播消息
const broadcast = function (msg){
    for (const key in ClinetSockets) {
        console.log('broadcast', key);
        const dataJson = JSON.stringify({data: msg})
        ClinetSockets[key] && ClinetSockets[key].write(dataJson)
    }
}

// 关闭服务器
const finishServer = function (){
    for (const key in ClinetSockets) {
        console.log('finish', key);
        ClinetSockets[key] && ClinetSockets[key].end();
        ClinetSockets[key] && ClinetSockets[key].destroy();
    }
}
// 刷新服务器并发数据
const refreshClients = function() {
    tcp_server.getConnections(function (err, count) {
        console.log("当前连接客户端个数为：" + count);
    });
}

//处理客户端连接
tcp_server.on('connection', function (clinetSocket) {
    const clientKey = clinetSocket.remoteAddress+':'+clinetSocket.remotePort;
    ClinetSockets[clientKey] = clinetSocket;
    //广播
    broadcast(clientKey + ', 连接服务器成功!')

    refreshClients();

    //处理客户端消息
    clinetSocket.on('data', async function (data) {
        const dataString = data.toString(encoding);
        const dataJson = JSON.parse(dataString);
        console.log(`客户端 %s 请求数据:%j`, clientKey, dataJson);
        if(dataJson.type === 'getMachineTemperature'){
            const cpuTemperature = Number(Math.random() * 100).toFixed(2);
            const result = {clientKey: clientKey, type: dataJson.type, data: cpuTemperature}
            const resultString = JSON.stringify(result);
            clinetSocket.setEncoding(encoding);
            clinetSocket.write(resultString)
        }
    })
    // 客户端正常断开时执行
    clinetSocket.on('close', function () {
        clinetSocket.destroy();
        ClinetSockets[clientKey] = null;
        delete ClinetSockets[clientKey];
        console.log('客户端 %s 断开连接!', clientKey);
        refreshClients();
    })
    // 客户端正异断开时执行
    clinetSocket.on("error", function (err) {
        clinetSocket.destroy();
        ClinetSockets[clientKey] = null;
        delete ClinetSockets[clientKey];
        console.log(`客户端 %s 发生错误并断开连接: %s`, clientKey, err.message);
        refreshClients();
    });
});


tcp_server.on('error', function () {
    console.log('服务端异常!');
    broadcast('服务端异常!');
    finishServer();
})

tcp_server.on('close', function () {
    console.log('服务端关闭!');
    broadcast('服务端关闭!');
    finishServer();
})
