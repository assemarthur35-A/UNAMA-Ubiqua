/* Estado da aplicação */
'use strict';
/* estado */
var staffStore=load('an_staff2',{});
var absStore=load('an_abs',{d:'',ids:{}});
if(absStore.d!==key(today()))absStore={d:key(today()),ids:{}};
var state={
  hs:{},
  sel:load('an_sel','hmv'),
  absentToday:absStore.ids,
  appts:load('an_appts',[]).filter(function(a){return a.date>=key(today());})
};
HOSPITALS.forEach(function(h){
  state.hs[h.id]=Object.assign({},h.staff,staffStore[h.id]||{});
  state.hs[h.id].total=h.staff.total;
});
if(!hosp(state.sel))state.sel='hmv';
function saveAbs(){save('an_abs',{d:key(today()),ids:state.absentToday});}

