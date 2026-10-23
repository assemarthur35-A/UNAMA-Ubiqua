/* Tamanho da letra */
'use strict';
var SIZES=['normal','grande','enorme'];
function applySize(s){
  if(SIZES.indexOf(s)<0)s='normal';
  document.documentElement.setAttribute('data-size',s);
  [].forEach.call(document.querySelectorAll('.sizer button'),function(b){b.setAttribute('aria-pressed',b.getAttribute('data-size')===s?'true':'false');});
  save('an_size',s);
}
function cycleSize(){
  var c=document.documentElement.getAttribute('data-size')||'normal';
  applySize(SIZES[(SIZES.indexOf(c)+1)%SIZES.length]);
}

