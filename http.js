const http = require('http');
const easyMonitor = require('easy-monitor');

const hostname = '127.0.0.1';
const port = 3000;

// 内存泄露分析示例
let theThing = null;
let replaceThing = function () {
    let leak = theThing;
    //断掉leak的闭包引用即可解决这种泄漏
    let unused = function (leak) {
        if (leak)
            console.log("hi")
    };

    theThing = {
        longStr: new Array(1000000),
        someMethod: function () {
            console.log('a');
        }
    };
};

const server = http.createServer((request, response) => {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html;charset=utf-8');
    /**
     * URL {
     *   href: 'http://localhost:3000/status?name=ryan',
     *   origin: 'http://localhost:3000',
     *   protocol: 'http:',
     *   username: '',
     *   password: '',
     *   host: 'localhost:3000',
     *   hostname: 'localhost',
     *   port: '3000',
     *   pathname: '/status',
     *   search: '?name=ryan',
     *   searchParams: URLSearchParams { 'name' => 'ryan' },
     *   hash: ''
     * }
     */
    const  url = new URL(request.url, `http://${request.headers.host}`)
    const pathname = url.pathname;
    
    console.log(url)
    if (pathname === '/login') {
        response.end(`<p>登录成功</p>`);
    } else {
        replaceThing();
        response.end(`<form action="/login">
            <label>登录名</label><input name="name"><br/>
            <label>密码</label><input type="password" name="password">
            <button>提交</button>
        </form>`);
    }
});

server.listen(port, hostname, () => {
    //easy-monitor 2.x http://127.0.0.1:12333
    easyMonitor('node-demo');
    console.log(`Server running at http://${hostname}:${port}/`);
});