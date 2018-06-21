"use strict";

//case1
// function outPutArr(){
//   var arr = [0,1,2,3];
//   for(let i=0;i< arr.length;i++){
//     setTimeout(function(){
//       console.log("case1",i)
//     },i*1000)
//   }
// }

//case2 输出顺序
function letVar(){
  var a=1;
  var b=2;
  setTimeout(function(){
    console.log("timeout.a",a)
  },0)
  console.log("b",b);
  var c=3;
  console.log("c",c);
}

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
