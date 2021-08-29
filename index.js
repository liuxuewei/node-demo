const say = require('./hello');
const fs = require('fs');
say.sayHello();

fs.readFile('./package.json', (error, data)=>{
    if(error) throw error;
    console.log(data.toString());
})
