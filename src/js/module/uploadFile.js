//"use strict";


export function uploadFile(obj){
  var fileData = new FormData();
  fileData.append("file",obj[0].files[0]);

  $.ajax({
    url : 'http://106.14.7.135:8081/upload/image',
    type : 'POST',
    dataType:"JSON",
    processData : false, //告诉jQ不要去处理发送的数据
    contentType : false, //告诉jQ不要设置Content-Type请求头
    data : fileData,
    success:function(res){
      console.log(res.data);
      //.attr('src','http://106.14.7.135:8081/'+res.data.key)
      
    }
  })
}
export function imgPreview(dom,fileName){
  if(fileName){
    var reader = new FileReader();
    reader.readAsDataURL(fileName);
    reader.onload = function(event){
      var e = event || window.event;
      //dom.src = this.result;
      console.log(this.result);
      dom.attr('src',this.result)
    }
  }
}




