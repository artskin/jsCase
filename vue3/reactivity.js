const $_ =(el) => document.querySelector(el);
$_.all = (el)=> document.querySelectorAll(el)

let activeEffect = null
function effect(eff){
  activeEffect = eff
  activeEffect()
  activeEffect = null
}

const targetMap = new WeakMap()

function track(target,key){
  if(activeEffect){
    let depsMap = targetMap.get(target);
    
    if(!depsMap){
      targetMap.set(target,( depsMap = new Map() ))
    }

    let dep = depsMap.get(key)
    if(!dep){
      depsMap.set(key,( dep = new Set() ))
    }
    dep.add(activeEffect)
  }
}

function trigger(target,key){
  //console.log(target)
  const depsMap = targetMap.get(target)
  if(!depsMap) return

  let dep = depsMap.get(key)
  if(dep){
    //debugger
    dep.forEach(effect => {
      effect()
    });
  }
}

function reactive(target){
  const handler = {
    get:(target,key,proxySelf)=>{
      let result = Reflect.get(target,key,proxySelf)
      track(target,key)
      return result
    },
    set:(target,key,newValue,proxySelf)=>{
      //console.warn('set',key)
      let oldValue = target[key];
      let result = Reflect.set(target,key,newValue,proxySelf);
      // console.log(oldValue,newValue,result,oldValue != newValue)
      if(result && oldValue != newValue){
        trigger(target,key)
      }
      return result
    }
  }
  return new Proxy(target,handler)
}

function ref(raw){
  const r = {
    get value(){
      //console.log('触发get')
      track(r,'value')
      return raw
    },
    set value(newValue){
      //debugger
      if(raw != newValue){
        raw = newValue;
        trigger(r,'value')
      }
    }
  }
  return r
}
//console.log('ref',ref('0').value)
let obj = {
  value:0,
  get val(){
    console.warn("get",this)
     
    return this.value
  },
  set:()=>{
    console.warn("get")
  }
    
  
}
console.log(obj)

function computed(getter){
  let result = ref();
  effect(()=>(result.value = getter()))
  return result
}