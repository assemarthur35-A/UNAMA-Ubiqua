/* Preferências opcionais de acessibilidade. O nome e os ajustes são escolhidos pela própria pessoa. */
'use strict';
(function(){
  var root=document.documentElement;
  var toggle=document.getElementById('autismToggle');
  var panel=document.getElementById('sensoryPanel');
  var reduce=document.getElementById('reduceMotion');
  var simple=document.getElementById('simpleMode');
  var large=document.getElementById('largeTargets');
  var overwhelmed=document.getElementById('overwhelmedBtn');
  var calm=document.getElementById('calmMessage');
  var close=document.getElementById('calmClose');
  if(!toggle||!panel)return;
  function setPref(key,el,cls){var value=!!load(key,false);el.checked=value;root.classList.toggle(cls,value);el.addEventListener('change',function(){root.classList.toggle(cls,el.checked);save(key,el.checked);});}
  function setEnabled(enabled){toggle.setAttribute('aria-pressed',String(enabled));toggle.textContent=enabled?'✓ Modo acolhedor ativado':'☼ Modo acolhedor';panel.hidden=!enabled;root.classList.toggle('sensory-calm',enabled&&!!load('an_reduce_motion',false));save('an_sensory_enabled',enabled);}
  setPref('an_reduce_motion',reduce,'sensory-calm');setPref('an_simple_mode',simple,'sensory-simple');setPref('an_large_targets',large,'sensory-large-targets');
  toggle.addEventListener('click',function(){setEnabled(toggle.getAttribute('aria-pressed')!=='true');});
  overwhelmed.addEventListener('click',function(){calm.hidden=false;calm.scrollIntoView({behavior:'auto',block:'nearest'});close.focus();});
  close.addEventListener('click',function(){calm.hidden=true;overwhelmed.focus();});
  setEnabled(!!load('an_sensory_enabled',false));
})();
