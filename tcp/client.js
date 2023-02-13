const net = require('net');
// 指定连接的tcp server ip，端口
const options = {
    host: '127.0.0.1',
    port: 6688
}
const tcp_client = net.Socket();
const encoding = 'utf8';
// 连接 tcp server
tcp_client.connect(options, function () {
    console.log('Connected to Server');
    const data = {type: 'getMachineTemperature', tab: '获取设备温度'}
    setInterval(()=>{
        tcp_client.setEncoding(encoding);
        tcp_client.write(JSON.stringify(data), encoding);
    }, 2000);
})

// 接收数据
tcp_client.on('data', function (data) {
    const dataString = data.toString(encoding);
    console.log('Received data from server: %s', dataString);
})

tcp_client.on('end', function () {
    console.log('Data end!');
})
//超时
tcp_client.on("timeout",()=>{
    console.error("tcp_client connect timeout！");
 });
 
tcp_client.on('error', function (err) {
    console.error('tcp_client error!', err.message);
})