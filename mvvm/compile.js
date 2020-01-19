// 模板编译
class Compile {
  constructor(el, vm) {
    // 判断是否为DOM，若不是，自己获取
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm;
    if (this.el) {
      // 1. 将真实DOM放进内存中
      let fragment = this.node2fragment(this.el);
      // 2. 开始编译 提取想要的元素节点 v-model 和 文本节点 {{}}
      this.compile(fragment);
      // 3. 将编译好的 fragment 重新放回页面
      this.el.appendChild(fragment);
    }
  }

  /**
   *
   * 辅助方法
   */
  isElementNode(node) {
    return node.nodeType === 1;
  }

  // 是否为指令
  isDirective(name) {
    return name.includes("v-");
  }

  /**
   *
   * 核心方法
   */
  compileElement(node) {
    // v-model  v-text
    let attrs = node.attributes; // 取出当前节点的属性
    Array.from(attrs).forEach(attr => {
      let attrName = attr.name;
      if (this.isDirective(attrName)) {
        // 判断属性名是否包含 v-model

        // 取到对应的值，放到节点中
        let expr = attr.value;
        let [, type] = attrName.split("-");  //解构赋值v-model-->model

        // 调用对应的编译方法， 编译哪个节点，用数据替换掉表达式
        CompileUtil[type](node, this.vm, expr);
      }
    });
  }

  compileText(node) {
    let expr = node.textContent; // 取出文本中的内容
    let reg = /\{\{([^]+)\}\}/g; // {{a}} {{b}} {{c}}
    if (reg.test(expr)) {
      // 调用编译文本的方法，编辑哪个节点，用数据替换掉表达式
      CompileUtil["text"](node, this.vm, expr);
    }
  }

  // 递归
  compile(fragment) {
    let childNodes = fragment.childNodes;
    Array.from(childNodes).forEach(node => {
      if (this.isElementNode(node)) {
        // 如果是元素的节点，则继续深入检查
        // 编译元素
        this.compileElement(node);
        this.compile(node);
      } else {
        // 文本节点
        // 编译文本
        this.compileText(node);
      }
    });

    // Array.from()方法就是将一个类数组对象或者可遍历对象转换成一个真正的数组
  }

  // 将el中的内容全部放进内存中
  node2fragment(el) {
    // 文档碎片 内存中的 dom 节点
    let fragment = document.createDocumentFragment();
    let firstChild;
    // 把值赋给变量 取不到后返回null，null作为条件
    while ((firstChild = el.firstChild)) {
      fragment.appendChild(firstChild);

      // 可以使用appendChild() 方法从一个元素向另一个元素中移动
    }

    return fragment; // 内存中的节点
  }
}

// 工具对象
let CompileUtil = {
  model(node, vm, expr) {
    let updateFn = this.updater["modelUpdater"];

    /**
     *
     * 这里应该加一个监控，数据变化了 应该调用watch的callback
     * (这里只是记录原始的值 watcher的update没有执行，只有属性的set执行的时候，才会执行cb回调，重新进行真实数据绑定)
     *
     */
    new Watcher(vm, expr, newValue => {
      // 当值变化后会调用cb 将新的值传递过来
      updateFn && updateFn(node, this.getVal(vm, expr));
    });

    node.addEventListener("input", e => {
      let newValue = e.target.value;

      //监听输入事件，将输入的内容设置到对应数据上
      this.setVal(vm, expr, newValue);
    });
    updateFn && updateFn(node, this.getVal(vm, expr));
  },
  text(node, vm, expr) {
    // 文本处理
    let updateFn = this.updater["textUpdater"];
    let value = this.getTextVal(vm, expr);

    expr.replace(/\{\{((?:.|\r?\n)+?)\}\}/g, (...args) => {
      new Watcher(vm, args[1], newValue => {
        // 如果数据变化了，文本节点需要重新获取依赖的属性，更新文本中的内容
        updateFn && updateFn(node, this.getTextVal(vm, expr));
      });
    });
    updateFn && updateFn(node, value);
  },
  getTextVal(vm, expr) {
    // 获取编译文本后的结果
    let value = this.parseText(expr);
    let result = '';
    value.tokens.forEach((item) => {
      if(item.hasOwnProperty('@binding')) {
        result += this.getVal(vm, item['@binding'])
      } else {
        result += item
      }
    })
    return result
  },
  parseText(text) {
    const tagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
    if (!tagRE.test(text)) {
      return;
    }
    const tokens = [];
    const rawTokens = [];
    let lastIndex = (tagRE.lastIndex = 0);
    let match, index, tokenValue;
    while ((match = tagRE.exec(text))) {
      index = match.index;
      // push text token
      if (index > lastIndex) {
        rawTokens.push((tokenValue = text.slice(lastIndex, index)));
        tokens.push(JSON.stringify(tokenValue));
      }
      // tag token 
      const exp = match[1].trim();
      tokens.push(`_s(${exp})`);
      rawTokens.push({ "@binding": exp });
      lastIndex = index + match[0].length;
    }

    if (lastIndex < text.length) {
      rawTokens.push((tokenValue = text.slice(lastIndex)));
      tokens.push(JSON.stringify(tokenValue));
    }
    return {
      expression: tokens.join("+"),
      tokens: rawTokens
    };
  },
  setVal(vm, expr, value) {
    expr = expr.split(".");
    return expr.reduce((prev, next, currentIndex) => {
      if (currentIndex === expr.length - 1) {
        return (prev[next] = value);
      }
      return prev[next];
    }, vm.$data);
  },
  getVal(vm, expr) {
    // 获取实例上对应的数据
    expr = expr.split("."); // {{message.a}} [message, a]

    // vm.$data.message => vm.$data.message.a
    return expr.reduce((prev, next) => {
      return prev[next.trim()];
    }, vm.$data);

    /**
     *  关于 reduce：
     * arr.reduce(callback,[initialValue])
     */
  },
  updater: {
    // 文本更新
    textUpdater(node, value) {
      node.textContent = value;
    },
    // 输入框更新
    modelUpdater(node, value) {
      node.value = value;
    }
  }
};
