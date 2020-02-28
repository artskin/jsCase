customElements.define('my-par',
    class extends HTMLElement {
        constructor(){
            super();

            const tmpl = document.getElementById('my-par');
            const tmplCon = tmpl.content;
            
            this.attachShadow({mode:'open'}).appendChild(
                tmplCon.cloneNode(true)
            );
        }
    }
)
console.log(window.customElements)
console.log(DocumentFragment)

const slottedSpan = DocumentFragment.querySelector('my-par');

console.log(slottedSpan);
// console.log(slottedSpan.slot);
// console.log(slottedSpan.assignedSlot)