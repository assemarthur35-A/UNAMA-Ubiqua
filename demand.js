/* Cálculo e render do painel de demanda */
'use strict';
/* demanda */
function demand(hid){
  var s=state.hs[hid||state.sel];
  var occ=s.leitos/s.total*100;
  var press=Math.min(100,s.fila/(s.plant*5)*100);
  var score=Math.round(0.5*occ+0.5*press);
  var wait=Math.round(s.fila/s.plant*12);
  var lvl=LEVELS.filter(function(l){return score<l.max;})[0]||LEVELS[3];
  return {occ:occ,press:press,score:score,wait:wait,lvl:lvl,s:s};
}
function renderDemand(){
  var h=hosp(state.sel),D=demand(),s=D.s;
  $('#dName').textContent=h.nome;
  $('#dMeta').textContent=h.tipo+' · '+h.cat+' · '+h.bairro;
  var w=$('#lvlWord');
  w.textContent=D.lvl.nome;
  w.className='lvl '+D.lvl.cls;
  $('#lvlAdvice').textContent=D.lvl.advice;
  $('#mk').style.left=D.score+'%';
  $('#mkVal').textContent=D.score;
  var idx=LEVELS.indexOf(D.lvl);
  [].forEach.call(document.querySelectorAll('.segs i'),function(el,i){el.classList.toggle('on',i===idx);});
  $('#meterImg').setAttribute('aria-label','Pontuação de demanda '+D.score+' de 100, nível '+D.lvl.nome);
  $('#stWait').textContent=D.wait;
  $('#stFila').textContent=s.fila;
  $('#stPlant').textContent=s.plant;
  $('#stLeitos').textContent=s.leitos;
  $('#stTotal').textContent=s.total;
  $('#live').textContent='Agora: ocupação '+Math.round(D.occ)+'% · pressão da fila '+Math.round(D.press)+'% · pontuação '+D.score+' · nível '+D.lvl.nome;

  var rows=(SECTORS_BY[h.cat]||SECTORS_BY['Hospital geral']).map(function(sec){
    var occ=Math.max(20,Math.min(100,Math.round(sec.base+(D.score-70)*sec.k)));
    var cls=occ<60?'ok':occ<80?'warn':occ<92?'hi':'crit';
    var lab=occ<60?'Livre':occ<80?'Movimentado':occ<92?'Cheio':'Lotado';
    var wt=sec.w?Math.round(sec.w*(0.4+D.score/100*1.2))+' min':'—';
    return '<tr><td>'+esc(sec.n)+'</td><td><div class="occ"><span class="num">'+occ+'%</span><span class="track"><i class="'+cls+'" style="width:'+occ+'%"></i></span></div></td><td>'+wt+'</td><td><span class="pill '+cls+'">'+lab+'</span></td></tr>';
  });
  $('#sectors').innerHTML=rows.join('');
  [].forEach.call(document.querySelectorAll('.whereName'),function(n){n.textContent=h.nome;});
}

