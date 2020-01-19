class Observer {
  constructor(data) {
    this.observe(data)
  }

  observe(data) {
    // 要对这个data数据，将原有的属性改成set和get的形式

    // defineProperty针对的是对象
    if(!data || typeof data !== 'object') {
      return
    }

    // 将数据一一劫持，先获取到data的key和value
    Object.keys(data).forEach(key => {
      // 定义响应式变化
      this.defineReactive(data, key, data[key])
      this.observe(data[key]) //深度递归劫持
    })

    // 关于Object.keys() 返回一个包含对象的属性名称的数组
  }

  // 定义响应式
  defineReactive(obj, key, value) {
    let that = this;
    let dep = new Dep(); // 每个变化的数据 都会对应一个数组，这个数组是存放所有更新的操作

    Object.defineProperty(obj, key, {
      enumerable: true,     // 是否能在for...in循环中遍历出来或在Object.keys中列举出来
      configurable: true,   // false，不可修改、删除目标属性或修改属性性以下特性
      get() {
        Dep.target && dep.addSub(Dep.target)
        return value;
      },
      set(newValue) {
        if(newValue != value) {
          that.observe(newValue);  // 如果设置的是对象，继续劫持
          value = newValue;
          dep.notify(); //通知所有人 数据更新了
        }
      }
    })
  }
}