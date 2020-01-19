class MVVM {
  constructor(options) {
    // 挂载实例
    this.$el = options.el;
    this.$data = options.data;

    // 编译模板
    if(this.$el) {
      // 数据劫持 把对象的所有属性 改成带set 和 get 方法的
      new Observer(this.$data)
      
      // 将数据代理到实例上，直接操作实例即可，不需要通过vm.$data来进行操作
      this.proxyData(this.$data)
      // 用数据和元素进行编译
      new Compile(this.$el, this)
    }
  }

  proxyData(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        get() {
          return data[key]
        },
        set(newValue) {
          data[key] = newValue
        }
      })
    })
  }
} 
