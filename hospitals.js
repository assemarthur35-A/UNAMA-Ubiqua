/* Lista e seleção de unidades */
'use strict';
/* lista de unidades */
var hFilter={t:'todos',cat:''};
function renderHospitals(){
  var all=HOSPITALS.map(function(h){return {h:h,D:demand(h.id)};});
  var rows=all.filter(function(o){
    var okT=hFilter.t==='todos'||(hFilter.t==='publico'?o.h.tipo==='Público':o.h.tipo==='Particular');
    return okT&&(!hFilter.cat||o.h.cat===hFilter.cat);
  }).sort(function(a,b){return a.D.score-b.D.score;});
  var sum=$('#sumrow');
  if(!rows.length){sum.innerHTML='';$('#hlist').innerHTML='<p class="empty">Nenhuma unidade encontrada com esses filtros.</p>';return;}
  var lo=rows[0],hi=rows[rows.length-1];
  var busy=rows.filter(function(o){return o.D.lvl.cls==='hi'||o.D.lvl.cls==='crit';}).length;
  sum.innerHTML=
    '<div class="sum"><small>Menos cheia agora</small><strong>'+esc(lo.h.nome)+'</strong><span>demanda '+lo.D.lvl.nome+' · espera de cerca de '+lo.D.wait+' min</span></div>'+
    '<div class="sum"><small>Mais cheia agora</small><strong>'+esc(hi.h.nome)+'</strong><span>demanda '+hi.D.lvl.nome+' · espera de cerca de '+hi.D.wait+' min</span></div>'+
    '<div class="sum"><small>Com demanda alta ou crítica</small><strong>'+busy+' de '+rows.length+' unidades</strong><span>Para casos leves, prefira uma unidade menos cheia.</span></div>';
  $('#hlist').innerHTML=rows.map(function(o,i){
    var h=o.h,D=o.D,docs=docsOf(h.id).length;
    return '<article class="hosp'+(h.id===state.sel?' sel':'')+'">'+
      '<div class="h-main"><h3>'+esc(h.nome)+'</h3><p class="h-meta"><span class="tag'+(h.tipo==='Público'?'':' priv')+'">'+h.tipo+'</span><span>'+esc(h.cat)+' · '+esc(h.bairro)+'</span>'+(docs?'':'<span>· sem consultas marcadas</span>')+'</p></div>'+
      '<div class="h-lvl"><div class="row"><span class="pill '+D.lvl.cls+'">'+D.lvl.nome.charAt(0).toUpperCase()+D.lvl.nome.slice(1)+'</span><span class="mono" style="font-size:.85rem">'+D.score+'/100</span></div><span class="track" style="width:100%"><i class="'+D.lvl.cls+'" style="width:'+D.score+'%"></i></span>'+(i===0&&rows.length>1?'<span class="best">Menos cheia agora</span>':'')+'</div>'+
      '<div class="h-wait"><b>'+D.wait+'</b> min<small>espera estimada</small></div>'+
      '<div class="h-act"><button type="button" class="btn small'+(h.id===state.sel?'':' ghost')+'" data-sel="'+h.id+'">'+(h.id===state.sel?'Unidade aberta':'Ver detalhes')+'</button></div></article>';
  }).join('');
}
function selectHospital(id,scroll){
  if(!hosp(id))return;
  state.sel=id;save('an_sel',id);
  $('#hospSel').value=id;
  $('#fQ').value='';
  renderDemand();renderStaff();renderHospitals();
  fillEsp();renderDoctors();
  $('#done').hidden=true;
  var list=docsOf(id);
  if(!list.length){
    el.esp.innerHTML='<option value="">Sem consultas marcadas</option>';
    el.doc.innerHTML='<option value="">—</option>';
    el.date.value='';
    setFormEnabled(false);
    renderSlots();
  }else{
    setFormEnabled(true);
    var first=list.filter(function(d){return !statusNow(d).ab&&nextFree(d);})[0]||list[0];
    fillBooking(first,false);
  }
  if(scroll)document.getElementById('demanda').scrollIntoView({behavior:'smooth',block:'start'});
}

