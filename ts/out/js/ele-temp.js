customElements.define('my-par', class extends HTMLElement {
    constructor() {
        super();
        const tmpl = document.getElementById('my-par');
        const tmplCon = tmpl.content;
        this.attachShadow({ mode: 'open' }).appendChild(tmplCon.cloneNode(true));
    }
});
const slottedSpan = document.querySelector('my-par span');
console.log(slottedSpan.slot);
console.log(slottedSpan.assignedSlot);
//# sourceMappingURL=ele-temp.js.map