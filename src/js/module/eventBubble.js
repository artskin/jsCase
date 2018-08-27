"use strict";


function addEvent(el, evnt, fun){
  return el.attachEvent ? el.attachEvent('on'+evnt, fun) : el.addEventListener(evnt, fun, false);
}

export default addEvent