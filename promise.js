

const promise = function(name){
    const callback = function(reslove, reject){
        if(name === '马跃'){
            const timeoutFunc = function(){
                reslove({
                    code: 200,
                    data: 'mayue',
                    success: true
                })
            };
            setTimeout(timeoutFunc, 3000);
        } else {
            reject({
                code: 500,
                data: null,
                success: false
            })
        }
    }
    return new Promise(callback)
}

promise('马跃').then((value) => {
    console.log(value);
});


