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