import { buildCustomElementConstructor } from 'lwc';

console.log(window);

import MyApp from 'my/app';

console.log(buildCustomElementConstructor(MyApp));

customElements.define('my-app', buildCustomElementConstructor(MyApp));
