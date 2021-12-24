console.log('执行hello.js')
exports.sayHello = function(name){
    console.log(`执行sayHello ${name || '马跃'}`);
}