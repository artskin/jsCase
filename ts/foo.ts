interface Person{
  firstName:string;
  lastName:string;
}

function greeter(person :Person){
  return "hello"+ person.firstName +"-"+person.lastName;
}

let user = {firstName:"Gu",lastName:'amu'};

document.body.innerHTML = greeter(user)

interface Items<T> {
  [index:number]:T
}

let dogs:Items<string> = ['阿黄']
console.log(dogs)

let Num:Items<number> = [1,2,3]
console.log(Num)

let objs:Items<object> = [{a:1},{a:2}]
console.log(objs)

class Observable<T> {
  // ... implementation left as an exercise for the reader ...
}

interface Array<T> {
  toObservable(): Observable<T>;
}

Array.prototype.toObservable = function () {
  return new Observable();
}

let colors: Array<string> = ['#fff','#000']
let list: Array<number> = [2,3,4]
console.log(colors)
console.log(list)
console.log('测试3')

//配置好tsconfig.json在根目录运行tsc，编译所有文件
//tsc --watch/w 实时监控ts变化并编译