let activeEffect = null
function effect(eff){
  activeEffect = eff
  activeEffect()
  activeEffect = null
}
const targetMap = new WeakMap()
function track(target,key){
  if(activeEffect){
    //console.log('Fn.track',target,key,targetMap)
    let depsMap = targetMap.get(target);
    //console.log(depsMap)
    if(!depsMap){
      targetMap.set(target,( depsMap = new Map() ))
      //console.log(targetMap)
    }
    //console.log(targetMap)

    let dep = depsMap.get(key)
    if(!dep){
      depsMap.set(key,( dep = new Set() ))
    }
    //console.log(effect)
    dep.add(activeEffect)
    //console.log(depsMap)
  }
}
let times = 0
function trigger(target,key){

  console.log(target)
  //console.log('Fn.trigger',targetMap,target,key)
  const depsMap = targetMap.get(target)
  //console.log(depsMap)
  if(!depsMap) {return}

  let dep = depsMap.get(key)
  //console.log(dep)
  //console.log(dep)
  if(dep){
    
    
    //debugger
    dep.forEach(effect => {
      effect()
    });
  }
  //console.log(product,total)
  //render()
}

function reactive(target){
  const handler = {
    get:(target,key,proxySelf)=>{
      //console.warn('get',target,key,product)
      
      let result = Reflect.get(target,key,proxySelf)
      track(target,key)
      return result
    },
    set:(target,key,newValue,proxySelf)=>{
      console.warn('set')
      //debugger
      let oldValue = target[key];
      let result = Reflect.set(target,key,newValue,proxySelf);
      // console.log(oldValue,newValue,result,oldValue != newValue)
      if(oldValue != newValue){

        trigger(target,key)
      }
      //console.log(target,proxyProduct)
      return result
    }
  }
  return new Proxy(target,handler)
}

function ref(raw){
  const r = {
    get value(){
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
  //console.log(r)
  return r
}

function $(el){
  return document.querySelector(el);
}

$.all = (el)=> document.querySelectorAll(el)