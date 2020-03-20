// const tmpl = document.createElement("template");
// tmpl.innerHTML = `

// `

class CButton extends HTMLElement {
  constructor(){
    super();
    const tmpl = document.getElementById('vdom-button');
    this._shadowRoot = this.attachShadow({mode:"open"});//open 可通过element.shadowRoot 访问
    this._shadowRoot.appendChild(tmpl.content.cloneNode(true));
    this.option = {
      size:["mini",'big','large'],
      arrts:["type","myclass","size","circle","wire"]
    }
  }

  //FIXME: 按钮大小设置
  
  static get observedAttributes(){
    // 指定观察的属性，这样attributeChangedCallback才会起作用
    return ["type","myclass","size","circle","wire","shadow"];
  }

  get type(){
    return this.hasAttribute('disabled');
  }
  set type(type){
    this.setAttribute["type",type]
  }

  get myclass(){
    return this.hasAttribute('class');
  }
  set myclass(val){
    this.setAttribute["myclass",val]
  }


//生命周期函数
  //当 custom element首次被插入文档DOM时，被调用
  connectedCallback(){
    //console.log("custom element首次被插入")
  }

  //当 custom element从文档DOM中删除时，被调用
  disconnectedCallback(){
    console.log("custom element从文档DOM中删除时")
  }

  //当 custom element增加、删除、修改自身属性时，被调用
  attributeChangedCallback(name,oldVal,newVal){
    //console.log(name,oldVal,newVal)
    let el = this.shadowRoot.querySelector('button');

    //el.classList.add('btn--'+newVal)

    let index = this.option.size.indexOf(newVal)

    //console.log(this.option.size[index])
    // if(newVal){
    //   this.classList.add('btn--'+newVal)
    // }
    
    if(name =='size'){
      //this.classList.add('is--'+name);//外部添加样式
      el.classList.add('btn--'+newVal)
    }
    if(name =='type'){
      //this.classList.add('is--'+name);//外部添加样式
      el.classList.add('btn--'+newVal)
    }
    
    if(name =='circle'){
      //this.classList.add('is--'+name);//外部添加样式
      el.classList.add('is--'+name)
    }
    if(name =='shadow'){
      //this.classList.add('is--'+name);//外部添加样式
      el.classList.add('is--'+name)
    }
    if(name =='wire'){
      //this.classList.add('is-'+name);//外部添加样式
      el.classList.add('is--'+name)
    }
    // switch(attr) {
    //     case 'myclass':
    //         console.log('myclass',attr)
    //     case 'type':
    //         console.log('type',attr)
    //     case 'size':
            
    // }
    this._updateRendering();
  }
  // 根据变化的属性，改变组件的UI
  _updateRendering(){
    let shadowVdom = this.shadowRoot;
    let childNodes = shadowVdom.childNodes;
    for(let i=0;i<childNodes.length;i++){
      if(childNodes[i].nodeName === 'STYLE'){
        //console.log('childNodes[i]: ', childNodes[i].textContent);
      }
      
    }
  }

  //TODO: 事件交互，内外
  
}

customElements.define("s-button",CButton);
