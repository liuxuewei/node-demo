const net = require('net');
const crypto = require("crypto");

const privateKeyStr = "-----BEGIN ENCRYPTED PRIVATE KEY-----\nMIIC3TBXBgkqhkiG9w0BBQ0wSjApBgkqhkiG9w0BBQwwHAQIl1wFXFOitsACAggA\nMAwGCCqGSIb3DQIJBQAwHQYJYIZIAWUDBAEqBBA0oPbhhGLdPgtmSrVbZciIBIIC\ngArc9A6lpkDo6P+Mo75UfU5EzkJhRrR69V1+iwLodTiMYbJK5VVyO6FyqTBTvNJs\nfJG55VijUESxPcJ5I3hNwjZqhNzDXR58ZkNaMKcuIkgCR0Vt5bo8GSsx/4dLYppo\n/pvGsSQ9MYtCsGCZKy/dpwm7BgDQ2GiYWcNL382c16NT80Bt/qq6/oY0jRCp5l9q\npCg0+Mh3o1w/ozKc1HX/3zmVX9KmsJFmLfH8WcB49YJmFSNvu9hSBXypnqvGodQd\n8yNxuEN1/7AwSnBZ/LOYGzittNwxfZE+LJHakGF6MVyuPbJI0s82B8MCQvlBpTeB\n0qKXlfiXIhS7KYIXaMCt5kJPRJQpDv1dmQIhWRjgaqldHbv0E3INf/AObuAXjoN3\nBLi3TQCm4e1Cde0RP4JNCdiLTT/MJAgFSIf7WHRteS22qmF9BR9EhBPJlWJ2GqlJ\nAi8JrX16WT9lTWIMFAH4NDbpaIpn61fjtBR05XCse2ZN3HOTgVxk0nbwZpFtQ+cQ\nsl7cLTx+GFgg6nhamXGHuvSSSsWqtTHdhvmDOeP8rq0bWwz0zVUlSIazd0jBbnw7\nJHNYBTpp7OOqg6lPw3J4dTi6NvRkqJ9oCuQBwdzyaNPOmtkVRsTn4xy2L8H56G3u\nFupF+kO1BAQJEJi/lm5oqOXjtj+O6R9LtjoLwbVtxLvJMsU0/Q1qxYU4z397k8QN\ntmTGo5I6s6UKYYgZK5dSrhwTTPVheI13hZmL994H5zzmd+E8wMCQiiibRUs+qsHF\ncKmJ+lZSG0VLKMlGmvfac9o+mTv8+C7miu/mQq1akrVLGRt4GTHR4lgQDNi20YyP\nhzEWbzdsDegNCIQSLTPkIl0=\n-----END ENCRYPTED PRIVATE KEY-----\n";
const privateKey = { key: privateKeyStr, passphrase: 'yzh' };
const passwords = ["yzh"];

console.log('--start--');
// RSA 私钥解密
function privateDecrypt(priKet, enCrypted) {
    return crypto.privateDecrypt(priKet, enCrypted).toString("utf8");
}
class NatServer {
    constructor(socket) {
        this.socket = socket;
        socket.on('error', (err) => {
            console.log('NatServer error' + err);
            this.stop();
        }).on('end', this.stop.bind(this));
    }
    run(getServerCallBack) {
        let socket = this.socket
        let buffer;
        let contentLength = 128;
        let startNatRead;
        socket.on('data', (data) => {
            let newData = data;
            if (!this.info) {
                if (!buffer) {
                    buffer = data;
                } else {
                    buffer = Buffer.concat([buffer, data]);
                }
                if (buffer.length < contentLength) {
                    console.log(`bufferLength: ${buffer.length} contentLength: ${contentLength}`);
                    return;
                }
                try {
                    this.info = privateDecrypt(privateKey, buffer).trim();
                    console.log(`info: ${this.info}`);
                } catch (error) {
                    this.error('privateDecrypt error ' + error);
                    return;
                }
                let infos = this.info.split('-').map((value) => value.trim());
                if (infos.length != 2) {
                    this.error('infos error ' + infos.length);
                    return;
                }
                if (passwords.indexOf(infos[1]) == -1) {
                    this.error('passwords error ' + infos[1]);
                    return;
                }
                let address = infos[0].split(':').map((value) => value.trim());
                let port;
                try {
                    port = Number.parseInt(address[1]);
                } catch (error) {
                    this.error('port error ' + error);
                    return;
                }
                if (!port || port < 0 || port > 65535) {
                    this.error('port2 error ' + port);
                    return;
                }
                let server = getServerCallBack(address[0], port);
                if (!(server instanceof Server)) {
                    this.error(server + '=' + this.info);
                    return;
                }
                this.server = server;
                this.server.addNatServer(this);
                newData = buffer.subarray(contentLength);
            }
            if (!newData.length) {
                // console.log(`dataLength: ${newData.length}`);
                return;
            }
            if (startNatRead) {
                this.onRelData(newData);
            } else {
                let dataIndex = newData.indexOf(0);
                if (dataIndex == -1) {
                    // console.log(`mockDataLength: ${newData.length}`);
                    if (!this.startNatWrite) {
                        let array = new Uint8Array(1);
                        array[0] = 0;
                        socket.write(array);
                    } else {
                        console.log(`startNatWriting`);
                    }
                } else {
                    startNatRead = true
                    let relData = newData.subarray(dataIndex + 1);
                    if (relData.length) {
                        this.onRelData(relData);
                    } else {
                        // console.log(`relData is empty`);
                    }
                }
            }
        });
        return this;
    }
    onRelData(relData) {
        // console.log(`relData: ${relData}`);
        if (this.clentSocket) {
            this.clentSocket.write(relData);
        }
    }
    startNat(socket) {
        this.clentSocket = socket;
        socket.on('error', (err) => {
            console.log('startNat error ' + err);
            this.stop2();
        }).on('end', this.stop2.bind(this));
        this.startNatWrite = true;
        let array = new Uint8Array(1);
        array[0] = 1;
        this.socket.write(array);
        this.clentSocket.pipe(this.socket);
    }
    stop() {
        if (this.server) {
            this.server.removeNatServer(this);
        }
        if (this.clentSocket) {
            this.clentSocket.destroy();
            delete this.clentSocket;
        }
    }
    stop2() {
        this.socket.destroy();
    }
    error(error) {
        console.log(error);
        let array = new Uint8Array(1);
        array[0] = 2;
        this.socket.write(array);
        this.stop();
        this.stop2();
    }
}
class Server {
    constructor(ip, port) {
        this.natServers = [];
        this.paddingSocket = [];
        net.createServer().listen(port, ip).on('connection', (socket) => {
            console.log('--connection2--');
            let natServer = this.natServers.shift();
            if (natServer) {
                natServer.startNat(socket);
            } else {
                this.paddingSocket.push(socket);
                socket.on('error', (err) => {
                    console.log('paddingSocket error ' + err);
                    this.removePaddingSocket(socket);
                });
            }
        }).on('error', (err) => {
            console.log('createServer2 error ' + err);
        });
    }
    addNatServer(natServer) {
        if (this.paddingSocket.length == 0) {
            this.natServers.push(natServer);
        } else {
            natServer.startNat(this.paddingSocket.shift());
        }
    }
    removeNatServer(natServer) {
        let index = this.natServers.indexOf(natServer);
        if (index != -1) {
            this.natServers.splice(index, 1);
        }
    }
    removePaddingSocket(socket) {
        let index = this.paddingSocket.indexOf(socket);
        if (index != -1) {
            this.paddingSocket.splice(index, 1);
        }
    }
}
let serverMap = {};
//监听内网命令的端口
net.createServer().listen(8989).on('connection', (socket) => {
    console.log('--connection--');
    new NatServer(socket).run((ip, port) => {
        let address = ip + ':' + port;
        if (!serverMap[address]) {
            let natIps = '-' + Object.keys(serverMap).join('-') + '-';
            let reg;
            if (ip) {
                reg = '-:' + port + '-';
            } else {
                reg = ':' + port + '-';
            }
            let endIndex = natIps.indexOf(reg);
            if (endIndex != -1) {
                endIndex = endIndex + reg.length - 1;
                let startIndex = natIps.lastIndexOf('-', endIndex - 1);
                return 'has ' + natIps.substring(startIndex + 1, endIndex);
            }
            serverMap[address] = new Server(ip, port);
        }
        return serverMap[address];
    });
}).on('error', (err) => {
    console.log('createServer error ' + err);
});