console.log("hello TypeScript");

class Animal {
    name:string
    meters:number

    constructor(){
        this.name = name
    }
    move(){
        console.log(this.name,'每秒钟移动',this.meters,'米')
    }
}

class Dog extends Animal {
    move(){
        console.log(this.name,'每秒钟跳跃',this.meters,'米')
    }
}

const ahuang = new Dog()
console.log(ahuang)


let colors:Array<string> =[];
console.log(colors);