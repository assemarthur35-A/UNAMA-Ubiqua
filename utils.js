/* Constantes, helpers, armazenamento e datas */
'use strict';
var DOW=['dom','seg','ter','qua','qui','sex','sáb'];
var DOW_LONG=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
function $(s,r){return (r||document).querySelector(s);}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

var mem={};
function load(k,d){try{var v=localStorage.getItem(k);if(v!==null)return JSON.parse(v);}catch(e){} return (k in mem)?mem[k]:d;}
function save(k,v){mem[k]=v;try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}

/* datas */
function pad(n){return String(n).padStart(2,'0');}
function key(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function fromKey(k){var p=k.split('-').map(Number);return new Date(p[0],p[1]-1,p[2]);}
function addDays(d,n){var x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()+n);return x;}
function today(){var n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate());}
function fmtShort(d){return DOW[d.getDay()]+', '+pad(d.getDate())+'/'+pad(d.getMonth()+1);}
function fmtDM(d){return pad(d.getDate())+'/'+pad(d.getMonth()+1);}
function toMin(t){var p=t.split(':').map(Number);return p[0]*60+p[1];}
function fromMin(n){return pad(Math.floor(n/60))+':'+pad(n%60);}
function hash(s){var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return h;}
function fmtDias(dias){
  var a=dias.slice().sort(function(x,y){return x-y;});
  var consec=a.every(function(v,i){return i===0||v===a[i-1]+1;});
  if(a.length>=3&&consec)return DOW[a[0]]+' a '+DOW[a[a.length-1]];
  var n=a.map(function(v){return DOW[v];});
  if(n.length>1){var last=n.pop();return n.join(', ')+' e '+last;}
  return n[0];
}

