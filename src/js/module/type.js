"use strict";

var jsType= function(obj){
  if(obj == null){
    return String( obj )
  }else{
    let str = Object.prototype.toString.call(obj).split(" ").pop();
    return str.substring(0,str.length -1).toLowerCase();
  }
}

//export default jsType
module.exports = jsType;