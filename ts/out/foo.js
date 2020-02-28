"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function greeter(person) {
    return "hello" + person.firstName + "-" + person.lastName;
}
exports.greeter = greeter;
console.log(1212);
let dogs = ['阿黄'];
console.log(typeof dogs, dogs);
let Num = [1, 2, 3];
console.log(Num);
let objs = [{ a: 1 }, { a: 2 }];
console.log(objs);
class Observable {
}
// Array.prototype.toObservable = function () {
//   return new Observable();
// }
// let colors: Array<string> = ['#fff','#000']
// let list: Array<number> = [2,3,4]
// console.log(colors)
// console.log(list)
// console.log('测试3')
//配置好tsconfig.json在根目录运行tsc，编译所有文件
//tsc --watch/w 实时监控ts变化并编译
//# sourceMappingURL=foo.js.map