const tmpl = document.createElement("template");
tmpl.innerHTML = `
<style>
:host{
    color:#333;
    display:block;
    margin:10px;
    contain: content; /* CSS containment FTW. https://developer.mozilla.org/zh-CN/docs/Web/CSS/contain*/
    background:var(--button-bg,#fff)/*外部样式传入*/
}
:host(:hover){
    background:#c00;
}
:host(.primary)  button{ /* color host when it has class="primary" */
    background-color:#409eff;
}
:host(.success)  button{
    background-color:#67c23a;
}
:host(.warning)  button{
    background-color:#e6a23c;
    color:pink
}
:host([disabled]) { /* style when host has disabled attribute. */
    background: grey;
    //pointer-events: none;
    opacity: 0.4;
}
button{
    padding:8px 16px;
    border:1px solid green;
    border-radius:2px;
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
        this._shadowRoot = this.attachShadow({mode:"open"});
        this._shadowRoot.appendChild(tmpl.content.cloneNode(true))
    }

    //TODO: 怎么获取外部元素属性集合
    static get observedAttributes(){
        //console.log(this)
        //console.log(this.getAttributeNames())
        return ["type","myclass"];

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
    set myclass(myclass){
        this.setAttribute["myclass",myclass]
    }

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
        console.log(name,oldVal,newVal)
        if(name = 'myclass'){
            console.log(this.children)
            //this.classList.add('primary')
        }
    }

    //TODO 事件交互，内外
}

customElements.define("s-button",CButton);




// const slottedSpan = document.querySelector('my-par');

// console.log(slottedSpan);
// console.log(slottedSpan.slot);
// console.log(slottedSpan.assignedSlot)