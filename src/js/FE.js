"use strict";
//模块引入
//import _ from 'lodash';
import mathPro from './module/mathPro.js';
import {uploadFile,imgPreview} from './module/case.js';


//
function ele(){
  var createEl = document.createElement('div');
  ele.innerHTML = _.join(['hello','webpack4','']);
  return createEl;
}
//document.body.appendChild(ele());


$("#file").change(function(){
  $(".file-moke [type='text']").val($(this).val());
  uploadFile($(this));
  imgPreview($('.preview img'),$(this)[0].files[0])
})


//模块导出
export default {
  mathPro
}