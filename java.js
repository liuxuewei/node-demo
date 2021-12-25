const java = require('java')
const javaLangSystem = java.import('java.lang.System');
javaLangSystem.out.printlnSync('Hello World!');


const list = java.newInstanceSync('java.util.ArrayList');
list.addSync('item')
console.log(list.sizeSync(), list.toStringSync()); // ["item"]


const ArrayList = java.import('java.util.ArrayList')
const arrayList = new ArrayList()
arrayList.addSync('item')
console.log(arrayList.sizeSync(), arrayList.toStringSync()) // ["item"]