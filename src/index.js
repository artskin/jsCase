//"use strict";
//模块引入

import _ from 'lodash';

//当前页面js
function ele(){
  var createEl = document.createElement('div');
  createEl.innerHTML = _.join(['hello','webpack4','']);
  return createEl;
}

document.body.appendChild(ele());



//case3: 数组去重
function arrDiff(){
  var items = [1,'a','b',9,3,8,5,6,7,4,2,0];
  var lists = [0,'a',1,10,20,3,40,5,60,6];
  //output:0,1,3,5
  var newArr=[];
  var diffArr=[];
  for(let i=0;i<items.length;i++){
    if(lists.indexOf(items[i]) != -1){
      //console.log(items[i]);
      newArr.push(items[i]);
    }
    if(!lists.includes(items[i])){
      diffArr.push(items[i])
    }
  }
  console.log(newArr);
  console.log(diffArr);
}


//case4: 数组快速排序
var arr = ['c',3,1,4,'v',2,5];
function quick(arr){
  if(arr.length<=1){
    return arr;
  }
  var left = [];
  var right = [];
  var base = arr[0];
  for(var i=1;i<arr.length;i++){
   // 判决条件
    if(arr[i]>base){
      right.push(arr[i]);
    }else {
      left.push(arr[i])
    }
  }
  return quick(left).concat(base,quick(right));
}
// console.log(quick(arr));
// console.log(arr)
// console.log(arr.sort());
// console.log(arr)

//case5 value-copy
function deepCopy(){
  var animal = {a:10,b:20,c:30}
  var people = animal;
  console.log("people",people);
  people.a = 100;

  console.log("people:",people)
  console.log("animal:",animal);
  console.log("----------")

  var dog = JSON.parse(JSON.stringify(animal))
  dog.b = 200
  console.log("animal:",animal);
  console.log("dog",dog)
}

//case6:斐波那契
function feibo(len) {
  var fbarr = [1,1];
  for(let n =2;n<len;n++){
    fbarr[n] = fbarr[n-1]+fbarr[n-2];
  }
  return fbarr;
}
//console.log(feibo(30));


//case7:
// var foo =1;
// function bar(){
//   foo = 10;
//   return;
//   function foo(){}
// }
// bar();
// console.log(foo);

// function bar(){
//   return foo;
//   foo = 10;
//   function foo(){}
//   var foo = 11
// }
// console.log( typeof bar())

// var x=3;
// var foo = {
//   x:2,
//   baz:{
//     x:1,
//     bar:function(){
//       return this.x;
//     }
//   }
// }
// var go = foo.baz.bar;
// console.log(foo); //1
// console.log(go); //Cannot read property 'x' of undefined
// console.log(foo.baz.bar());//1

// //case8:
// function out(){
  
//   console.log("原有的out()",this);
//   console.log(out.count);
// }
// var count = 1;
// out.count = 1;
// //out();
// console.log( typeof out);

// function out(){
//   console.log(this.count);
// }

// var obj = {
//   count:2,
//   out:out
// }
// console.log( typeof out);
// console.log( typeof obj.out);
// console.log( obj.out == out);
// obj.out();

// var myObj ={
//   out:'bar',
//   func:function(){
//     var self = this;
//     console.log(this.out);
//     console.log(self.out);
//     (function(){
//       console.log(this)
//       console.log(self.out)
//     })()
//   }
// };
// myObj.func();

// //case9:
// function mm(){
//   this.a = a;
// }
// mm.prototype.b =2;
// //var aa = new mm();
// function bar(){};
// bar.prototype = mm.prototype
// var b = new bar();
// console.log(b.a)
// console.log(b.b)

// new Promise((resolve,reject) => {
//   reject(1)
// }).catch(() => {
//   console.log(2)
// }).then(() => {
//   console.log(3);
// },() =>{
//   console.log(4);
// });


// function Foo() {
//   getName = function () {
//     alert (1);
//   }; 
//   return this;
// }
// Foo();

// var Fpp;
// function Fpp(){
//   getName = function(){
//     console.log("ligang");
//   }
//   return this;
// }
// Fpp.getName = function(){
//   console.log("hanmeimei")
// }
// Fpp.prototype.getName = function(){
//   console.log("lilei")
// }
// var getName = function(){
//   console.log("www");
// }
// function getName(){
//   console.log("ssss")
// }
// console.log(typeof Fpp)
// console.log(Fpp())
// console.log("Fpp.getName() =>")
// Fpp.getName();
// console.log("getName() =>")
// getName();
// // Fpp().getName();
// console.log("new Fpp.getName() =>")
// new Fpp.getName();
// console.log("new Fpp().getName() =>")
// new Fpp().getName();
// console.log("new new Fpp().getName() =>")
// new new Fpp().getName();

// //case10:
// function fun(n,o){
//   console.log("o",o);
//   return{
//     fun:function(m){
//       //console.log("m",m);
//       return fun(m,n);
//     }
//   };
// }
// console.log(fun().fun())
// fun(10)
// console.log("a = fun(10);")
// var a = fun(10);
// a.fun(20);

// console.log("1=====>")
// var a = fun(1000);
// a.fun(100);
// a.fun(1,0);
// a.fun(2);
// a.fun(2,0);
// a.fun(3);
// a.fun(3,0);
// console.log("<=====1")

// var b = fun(0).fun(1).fun(2).fun(3);

// console.log("2=====")
// var c = fun(0).fun(1);
// c.fun(2);
// c.fun(3);
// c.fun(4);
// console.log("3=====")

//case11:this
// var o = {
//   user:"追梦子",
//   fn:function(){
//       console.log(this.user); //追梦子
//   }
// }
// o.fn();

// var o = {
//   a:10,
//   b:{
//       a:12,
//       fn:function(){
//         console.log(this.a); //12
//       }
//   }
// }

// o.b.fn();

// var o = {
//   a:10,
//   b:{
//       a:12,
//       fn:function(){
//         //console.log(this.a); //undefined
//         console.log(this); //window
//       }
//   }
// }
// var j = o.b.fn;
// j();
