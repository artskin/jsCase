"use strict";



var mathPro={
  isInteger:function(s){//是否为正整数
    var re = /^[0-9]+$/ ;
    return re.test(s)
  },
  rangeNum:function(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
  },
  
  /**
  * 获取指定个数的随机数，范围[2,32]
  * @param {number} n：需要的整数个数
  * @return {array} 返回随机数数组，个数为n
  */
  realRandom:function(n){
    if(typeof n === 'number' && this.isInteger(n)){
        var arr = [];
        for(let i=0;i < n;i++){
            var num = this.rangeNum(2,32);
            if(!arr.includes(num)){
              arr.push(num);
            }else{
              n++
            }
        }
        return arr;
    }else{
        return []
    }
  }

}

export default mathPro