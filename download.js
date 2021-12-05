var downloadPic = function (url) {
    const paths = url.split('/');
    const filename = paths[paths.length - 1];
    // const dist = `${__dirname}/img/${filename}`;
    // console.log(url, 'downloading!');
    // request(url, {
    //     timeout: 20000,
    // }).pipe(fs.createWriteStream(dist)).on('close', function () {
    //     console.log(filename, 'pic saved!');
    // }).on('error', function () {
    //     console.log(filename, 'pic fail!');
    // });
    var a = document.createElement('a');          // 创建一个a节点插入的document
    var event = new MouseEvent('click')           // 模拟鼠标click点击事件
    a.download = filename;                // 设置a节点的download属性值
    a.href = url;                                 // 将图片的src赋值给a节点的href
    a.dispatchEvent(event)    
    
};
var download = async function(){
    let i = 53;
    
    while (i < 60) {
        await requestAblum(i);
        i++;
    }
};
var requestAblum = async function(i){
    return new Promise(async(resolve, reject)=> {
        const res = await fetch(`http://dili.bdatu.com/jiekou/mains/p${i}.html`);
        const result = await res.json();
        console.log(result);
        const albums = result.album || [];
        albums.forEach(async item => {
            setTimeout(()=> {
                downloadPic(item.url);
            }, 2000)
        });
        setTimeout(()=> {
            resolve(albums);
        }, 5000)
    })
    
}
download();