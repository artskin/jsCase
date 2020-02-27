interface Person{
  firstName:string;
  lastName:string;
}

export default function greeter(person :Person){
  return "hello"+ person.firstName +"-"+person.lastName;
}

//配置好tsconfig.json在根目录运行tsc，编译所有文件
//tsc --watch/w 实时监控ts变化并编译