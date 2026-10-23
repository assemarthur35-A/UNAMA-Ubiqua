/* Formulário de agendamento */
'use strict';
/* agendamento */
var el={};
function currentDoc(){return DOCS.filter(function(d){return d.id===el.doc.value;})[0];}
function setFormEnabled(on){
  ['esp','doc','date','nome','tel','motivo','submit'].forEach(function(id){document.getElementById(id).disabled=!on;});
}
function fillEsp(){
  var list=docsOf(state.sel).map(function(d){return d.esp;}).filter(function(v,i,a){return a.indexOf(v)===i;});
  el.esp.innerHTML='<option value="">Selecione</option>'+list.map(function(e){return '<option>'+esc(e)+'</option>';}).join('');
  $('#fEsp').innerHTML='<option value="">Todas as especialidades</option>'+list.map(function(e){return '<option>'+esc(e)+'</option>';}).join('');
}
function fillDocs(){
  var e=el.esp.value;
  var l=docsOf(state.sel).filter(function(d){return d.esp===e;});
  el.doc.innerHTML='<option value="">Selecione</option>'+l.map(function(d){
    var ab=statusNow(d).ab;
    return '<option value="'+d.id+'">'+esc(d.nome)+(ab?' (ausente hoje)':'')+'</option>';
  }).join('');
  el.doc.disabled=!e;
}
function fillBooking(doc,preselect){
  el.esp.value=doc.esp;fillDocs();el.doc.value=doc.id;
  var nf=nextFree(doc);
  el.date.value=nf?key(nf.d):key(today());
  renderSlots();
  if(preselect&&nf){var r=document.getElementById('s-'+nf.t.replace(':',''));if(r&&!r.disabled){r.checked=true;renderSummary();}}
}
function setBooking(id,scroll){
  var doc=DOCS.filter(function(d){return d.id===id;})[0];
  if(!doc)return;
  if(doc.h!==state.sel)selectHospital(doc.h,false);
  fillBooking(doc,true);
  if(scroll)document.getElementById('agendar').scrollIntoView({behavior:'smooth',block:'start'});
}
function notice(cls,html,acts){
  return '<div class="notice '+cls+'"><p>'+html+'</p>'+(acts?'<div class="acts">'+acts+'</div>':'')+'</div>';
}
function renderSlots(){
  var doc=currentDoc(),dv=el.date.value;
  var box=el.slots;
  if(!docsOf(state.sel).length){box.innerHTML='<p class="hint">Esta unidade atende por triagem e não marca consultas. Escolha outra unidade para agendar.</p>';renderSummary();return;}
  if(!doc){box.innerHTML='<p class="hint">Escolha a especialidade e o médico para ver os horários.</p>';renderSummary();return;}
  if(!dv){box.innerHTML='<p class="hint">Escolha uma data.</p>';renderSummary();return;}
  var d=fromKey(dv);
  if(key(d)<key(today())){box.innerHTML=notice('','A data já passou. Escolha uma data a partir de hoje.');renderSummary();return;}
  var dow=d.getDay(),ab=absenceOn(doc,d),nf=nextFree(doc,d);
  var nextBtn=nf?'<button type="button" class="btn small" data-date="'+key(nf.d)+'">Ir para '+fmtShort(nf.d)+'</button>':'';
  if(ab){
    var r=returnDate(doc,ab),alt=altFor(doc),acts='';
    acts+='<button type="button" class="btn small" data-date="'+key(r)+'">Ver '+fmtShort(r)+'</button>';
    if(alt)acts+='<button type="button" class="btn small ghost" data-doc="'+alt.x.id+'">Ver agenda de '+esc(altText(doc,alt))+'</button>';
    box.innerHTML=notice('crit','<strong>'+esc(doc.nome)+' estará ausente em '+fmtShort(d)+'.</strong> Motivo: '+esc(ab.motivo)+'. Volta a atender em '+fmtShort(r)+'.',acts);
  }else if(doc.dias.indexOf(dow)<0){
    box.innerHTML=notice('',esc(doc.nome)+' não atende em '+DOW_LONG[dow]+'. Dias de atendimento: '+fmtDias(doc.dias)+'.',nextBtn);
  }else{
    var s=slotsFor(doc,d),free=s.filter(function(x){return x.free;});
    if(!free.length){
      box.innerHTML=notice('','Não há horários livres em '+fmtShort(d)+'.',nextBtn);
    }else{
      box.innerHTML=s.map(function(x){
        var id='s-'+x.t.replace(':','');
        return '<div class="slot"><input type="radio" name="slot" id="'+id+'" value="'+x.t+'"'+(x.free?'':' disabled')+'><label for="'+id+'">'+x.t+'</label></div>';
      }).join('');
    }
  }
  renderSummary();
}
function renderSummary(){
  var doc=currentDoc(),dv=el.date.value,sl=el.form.querySelector('input[name=slot]:checked');
  function set(id,v){var n=$(id);n.textContent=v||'—';n.className=v?'':'dim';}
  set('#sUni',doc&&hosp(doc.h).nome);
  set('#sMed',doc&&doc.nome);set('#sEsp',doc&&doc.esp);
  set('#sData',dv&&doc?fmtShort(fromKey(dv)):'');
  set('#sHora',sl&&sl.value);
  set('#sDur',doc&&doc.dur+' minutos');
  set('#sLocal',doc&&doc.sala);
}
function showErr(list){
  if(!list.length){el.err.hidden=true;el.err.innerHTML='';return;}
  el.err.innerHTML='<ul>'+list.map(function(m){return '<li>'+esc(m)+'</li>';}).join('')+'</ul>';
  el.err.hidden=false;
}
function submitForm(ev){
  ev.preventDefault();
  var doc=currentDoc(),dv=el.date.value,sl=el.form.querySelector('input[name=slot]:checked');
  var nome=el.nome.value.trim(),tel=el.tel.value.replace(/\D/g,'');
  var errs=[];
  if(!doc)errs.push('Escolha a especialidade e o médico.');
  else if(!dv)errs.push('Escolha a data da consulta.');
  else if(!sl)errs.push('Escolha um horário livre.');
  if(nome.length<3)errs.push('Informe o nome completo do paciente.');
  if(tel.length<10)errs.push('Informe um telefone com DDD.');
  if(errs.length){showErr(errs);return;}
  var free=slotsFor(doc,fromKey(dv)).filter(function(x){return x.free&&x.t===sl.value;})[0];
  if(!free){showErr(['Esse horário acabou de ficar indisponível. Escolha outro.']);renderSlots();return;}
  showErr([]);
  var ap={id:'a'+Date.now(),proto:'SA-'+(hash(nome+dv+sl.value+doc.id)%900000+100000),doc:doc.id,date:dv,time:sl.value,nome:nome,tel:el.tel.value,motivo:el.motivo.value};
  state.appts.push(ap);
  save('an_appts',state.appts);
  var d=fromKey(dv);
  var done=$('#done');
  done.innerHTML='<h3>Consulta confirmada</h3><p><strong>'+esc(doc.nome)+'</strong> · '+fmtShort(d)+' às '+ap.time+'</p><p>'+esc(hosp(doc.h).nome)+' · '+esc(doc.sala)+'</p><p>Protocolo <span class="mono">'+ap.proto+'</span></p><p>Chegue 15 minutos antes e leve um documento com foto.</p>';
  done.hidden=false;
  renderSlots();renderAppts();renderDoctors();
}

