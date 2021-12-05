

const fs = require('fs');
const request = require('request');
const { resolve } = require('path');
const { throws } = require('assert');

fs.readFile('./test.txt', (error, data) => {
    if (error) throw error;
    console.log('异步', data.toString());
})


const file = fs.readFileSync('./test.txt');
console.log('同步', file.toString());

const downloadPic = async function (url, index) {
    const paths = url.split('/');
    const filename = paths[paths.length - 1];
    const dist = `${__dirname}/img/${filename}`;
    console.log(url, 'downloading!');
    await request(url, {
        timeout: 3000,
    }).pipe(fs.createWriteStream(dist)).on('close', function () {
        console.log(filename, 'pic saved!', index);
    }).on('error', function () {
        console.log(filename, 'pic fail!');
    });
    
};
const download = async function(){
    let i = 1;
    
    while (i < 5) {
        await requestAblum(i);
        i++;
    }
};
const requestAblum = async function(i){
    return new Promise((resolve, reject)=> {
        request(
            {
                url: `http://dili.bdatu.com/jiekou/mains/p${i}.html`,
                encoding: 'utf8'
            },
            function (error, response, body) {
                if (response.statusCode == 200) {
                    const result = JSON.parse(body || '{}');
                    console.log(result);
                    const albums = result.album || [];
                    albums.forEach(async (item, index) => {
                        setTimeout(async()=> {
                            await downloadPic(item.url, index)
                        }, 1500 * index)
                    });
                    setTimeout(()=> {
                        resolve(albums);
                    }, 10 * 1000)
                } else {
                    console.log(response.statusCode);
                    // reject(response.statusCode)
                }
            }
        );
    })
    
}
download();

