const tmpl = document.createElement("template");
tmpl.innerHTML = `
<style>
  :host{
    display:inline-block;
    contain: content; /* CSS containment FTW. https://developer.mozilla.org/zh-CN/docs/Web/CSS/contain*/
    /*background:var(--button-bg,#fff);外部样式传入*/
    padding:1px 3px 5px 1px;
  }
  /* :host(:hover) button{
    background:#c00;
  } */
  :host button.btn-primary,
  :host(.success) button,
  :host(.warning) button,
  :host(.danger) button{
    color: #fff;
  }
  :host button.btn-primary{ /* color host when it has class="primary" */
    background-color:var(--primary,royalblue);
    border-color:var(--primary,royalblue);
    /* color: var(--wireColor); */
  }
  :host button.btn-primary:hover{
    background-color:var(--primary-hover,royalblue);
    border-color:var(--primary-hover,royalblue);
  }
  :host button.btn-primary:active{
    background-color:var(--primary-active,royalblue);
    border-color:var(---primary-active,royalblue);
  }
  :host(.success) button{
    background-color:var(--success,seagreen);
    border-color:var(--success,seagreen);
  }
  :host(.success) button:hover{
    background-color:var(--success-hover,seagreen);
    border-color:var(--success-hover,seagreen);
  }
  :host(.success) button:active{
    background-color:var(--success-active,seagreen);
    border-color:var(---success-active,seagreen);
  }
  :host(.warning) button{
    background-color:var(--warning,coral);
    border-color:var(--warning,coral);
  }
  :host(.warning) button:hover{
    background-color:var(--warning-hover,coral);
    border-color:var(--warning-hover,coral);
  }
  :host(.danger) button{
    background-color:var(--danger,crimson);
    border-color:var(--danger,crimson);
  }
  :host(.danger) button:hover{
    background-color:var(--danger-hover,crimson);
    border-color:var(--danger-hover,crimson);
  }
  :host([disabled]) { /* style when host has disabled attribute. */
    /* background: grey; */
    pointer-events: none;
    opacity: 0.4;
  }
  button{
    padding:0.8em 1.4em;
    border-width: 1px;
    border-style: solid;
    border-radius:var(--borderRadius,0.24em);
    cursor: pointer;
    /* font-size: 14px; */
    font-size: var(--fontSize,14px);
    line-height:1;
    /* transform: scale(var(--ggs,1)); */
    box-shadow: 1px 2px 3px rgba(0,0,0,.15);
    outline: none;
  }
  
  ::slotted{
    color:red
  }
</style>
<button>
  <slot name="icon-left"></slot>
  <slot></slot>
  <slot name="text"></slot>
</button>
`
class CButton extends HTMLElement {
  constructor(){
    super();
    //const tmpl = document.getElementById('vdom-button')
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
    return ["type","myclass","size","circle","wire"];
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
    //console.log(name,oldVal,newVal,this.option.size)
    let el = this.shadowRoot.querySelector('button');

    el.classList.add('btn-'+newVal)

    let index = this.option.size.indexOf(newVal)

    //console.log(this.option.size[index])
    if(newVal){
      this.classList.add('btn--'+newVal)
    }
    
    if(name =='circle'){
      this.classList.add('is-'+name)
    }
    if(name =='wire'){
      this.classList.add('is-'+name)
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
