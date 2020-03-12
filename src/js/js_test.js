  /**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
let nums = [3, 2, 4], target = 6;
var twoSum = function(nums, target) {
  let len = nums.length;
  let result = [];
  for(let i=0;i<len;i++){
    nums.map((item,index)=>{
      if((nums[i]+item) == target && i != index){
        nums.splice(i)
        result = [i,index]
      }
    }) 
  }
  return result;
};
//twoSum(nums,target)
//console.log(twoSum(nums,target))



function merge(nums1, m, nums2, n) {
  //let result = new Array(m+n);
  for(let i=0;i<n;i++){
    nums1.push(nums2[i])
  }
  
  //Object.assign(result,nums1,nums2)
  console.log(nums1)
  nums1.sort((a,b)=>a-b)
  //result.sort((a,b)=>{return a-b})
  //return result;
};

let nums1 = [1,2,3,0,0,0], m = 3,
nums2 = [2,5,6],       n = 3;

//console.log(merge(nums1, m, nums2, n));


//求一个浮点数 x 的整数部分： ~~x
//console.log(~~12132.213)
//console.log(~~-121.00213)


//判断一个整数 x 的奇偶性： x & 1 = 1  (奇数) ，  x & 1 = 0  (偶数)

//console.log('1奇数,0偶数',3 & 1) //
//console.log('1奇数,0偶数',12 & 1) //


// 字典树：trie 树

var data = [
  {   "province": "浙江",   "city": "杭州",   "name": "西湖" }, 
  {   "province": "四川",   "city": "成都",   "name": "锦里" }, 
  {   "province": "四川",   "city": "成都",   "name": "方所" }, 
  {   "province": "四川",   "city": "阿坝",   "name": "九寨沟" }
]

function transData(data){
  let len = data.length;
  let newData = [];

  for(let i=0;i<len;i++){
    let keywords = data[i].province;
    //console.log(keywords)
    let obj={
      'province':keywords,
      'children':[]
    }
    data.map((item,index)=>{
      if(item.province == keywords){
        obj.children.push(item.city)

      }
      //console.log(obj)
    })
    
  }
  
}
// console.log(data);
// console.log(transData(data));
// console.log(function(){}());

// console.log(JSON.stringify([1,undefined,3]) == JSON.stringify([1,null,3]))
// console.log(JSON.stringify([1,function(){}() ,3]) == JSON.stringify([1,null,3]))

let arr = [];

function randomNum(min,max){
  return parseInt(Math.random()*(max-min)+min)
}

function randomArr(){
  let rand = randomNum(2,32);
  if(arr.indexOf(rand) == -1){
    arr.push(rand)
  }
  if(arr.length <5){
    randomArr()
  }
}
randomArr()
console.log(arr)