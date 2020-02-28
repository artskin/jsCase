export interface PersonType{
  firstName:string;
  lastName:string;
}

export let Per = function() {
  
    console.log("user.firstName")
  
}


//配置好tsconfig.json在根目录运行tsc，编译所有文件
//tsc --watch/w 实时监控ts变化并编译