class Watcher{  // 因为要获取 oldValue，所以需要“数据”和“表达式”
  constructor(vm, expr, cb) {
    this.vm = vm;
    this.expr = expr;
    this.cb = cb;

    // 先获取 oldValue 保存下来
    this.value = this.get();
  }

  getVal(vm, expr) {
    expr = expr.split('.');

    return expr.reduce((prev, next) => {
      return prev[next.trim()]
    }, vm.$data);
  }

  get() {
    // 在取值之前先将 watcher 保存到 Dep 上
    Dep.target = this;
    let value = this.getVal(this.vm, this.expr);
    Dep.target = null;
    return value;
  }

  // 对外暴露的方法，如果值改变就可以调用这个方法来更新
  update() {
    let newValue = this.getVal(this.vm, this.expr);
    let oldValue = this.value;
    if (newValue != oldValue) {
      this.cb(newValue);
    }
  }
}