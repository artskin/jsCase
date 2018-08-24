"use strict";
//模块引入
//import _ from 'lodash';
import mathPro from './module/mathPro.js';


//
function ele(){
  var createEl = document.createElement('div');
  ele.innerHTML = _.join(['hello','webpack4','']);
  return createEl;
}
//document.body.appendChild(ele());


//模块导出
export default {
  mathPro
}