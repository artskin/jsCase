function greeter(person) {
    return "hello" + person.firstName + "-" + person.lastName;
}
let user = { firstName: "Gu", lastName: 'amu' };
document.body.innerHTML = greeter(user);
let dogs = ['阿黄'];
console.log(dogs);
let Num = [1, 2, 3];
console.log(Num);
let objs = [{ a: 1 }, { a: 2 }];
console.log(objs);
class Observable {
}
Array.prototype.toObservable = function () {
    return new Observable();
};
let colors = ['#fff', '#000'];
let list = [2, 3, 4];
console.log(colors);
console.log(list);
console.log('测试3');
//配置好tsconfig.json在根目录运行tsc，编译所有文件
//tsc --watch/w 实时监控ts变化并编译
