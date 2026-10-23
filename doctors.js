/* Lista de médicos */
'use strict';
/* médicos */
var fState='todos';
function initials(n){return n.replace(/^(Dr\.|Dra\.)\s*/,'').split(' ').filter(Boolean).map(function(p){return p[0];}).slice(0,2).join('');}
function docCard(doc){
  var st=statusNow(doc),nf=nextFree(doc),h='';
  h+='<article class="doc" data-id="'+doc.id+'"><header><span class="av" aria-hidden="true">'+initials(doc.nome)+'</span><div><h3>'+esc(doc.nome)+'</h3><p class="esp">'+esc(doc.esp)+' · <span class="mono">CRM '+doc.crm+'</span></p></div></header>';
  h+='<div><span class="pill '+st.cls+'">'+esc(st.label)+'</span></div>';
  if(st.ab){
    var r=returnDate(doc,st.ab),alt=altFor(doc);
    h+='<div class="abs"><p><strong>Ausente até '+fmtDM(st.ab.ate)+'.</strong> Motivo: '+esc(st.ab.motivo)+'.</p><p>Volta a atender em '+fmtShort(r)+'.</p>';
    if(alt)h+='<p>Outra opção: '+esc(altText(doc,alt))+', próximo horário '+fmtShort(alt.n.d)+' às '+alt.n.t+'.</p>';
    h+='</div>';
  }else if(doc.aus&&doc.aus.de>0){
    h+='<p class="soon">Ausente de '+fmtDM(addDays(today(),doc.aus.de))+' a '+fmtDM(addDays(today(),doc.aus.ate))+' ('+esc(doc.aus.motivo.toLowerCase())+').</p>';
  }
  h+='<dl class="kv"><dt>Atende</dt><dd>'+fmtDias(doc.dias)+', '+doc.turnos.map(function(t){return t[0]+'–'+t[1];}).join(' e ')+'</dd>';
  h+='<dt>Próximo horário</dt><dd>'+(nf?fmtShort(nf.d)+' às '+nf.t:'sem vagas em 60 dias')+'</dd></dl>';
  h+='<button class="btn" type="button" data-book="'+doc.id+'"'+(nf?'':' disabled')+'>Agendar consulta</button></article>';
  return h;
}
function renderDoctors(){
  var base=docsOf(state.sel);
  if(!base.length){
    $('#docCount').textContent='';
    $('#docs').innerHTML='<div class="notice" style="grid-column:1/-1"><p><strong>'+esc(hosp(state.sel).nome)+' atende por triagem e não marca consultas.</strong> Veja o nível de demanda e, para consultas marcadas, escolha outra unidade.</p><div class="acts"><a class="btn small" href="#hospitais" style="text-decoration:none;display:inline-flex;align-items:center">Ver as unidades</a></div></div>';
    return;
  }
  var q=$('#fQ').value.trim().toLowerCase(),e=$('#fEsp').value;
  var weight={ok:0,info:0,warn:1,off:2,crit:3};
  var list=base.filter(function(d){return (!e||d.esp===e)&&(!q||(d.nome+' '+d.esp).toLowerCase().indexOf(q)>=0);})
    .filter(function(d){
      var c=statusNow(d).cls;
      if(fState==='ausentes')return c==='crit';
      if(fState==='hoje')return c==='ok'||c==='warn'||c==='info';
      return true;
    })
    .sort(function(a,b){return weight[statusNow(a).cls]-weight[statusNow(b).cls];});
  $('#docCount').textContent=list.length+' de '+base.length+' médicos';
  $('#docs').innerHTML=list.length?list.map(docCard).join(''):'<p class="empty">Nenhum médico encontrado com esses filtros.</p>';
}

