console.log('执行hello.js')


// const setHello = function(name){
//     return `名字叫：${name}`
// }
exports.sayHello = function(name){
    const str = setHello(name);
    console.log(`执行sayHello ${str}`);
}

const setName = {}

