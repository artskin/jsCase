//"use strict";

user = {
  name:"art"
}
console.log(user.name);
console.time("cost");
for(var i=0;i<10;i++){
console.log(i)
}
console.timeEnd("cost");
//console.log(global);
name = "amu"
console.log(global.user.name)
console.log(global.name);
const buf = Buffer.from('hello world', 'ascii');
console.log(buf);
console.log(buf.toString('hex'));
console.log(buf.toString('base64'));