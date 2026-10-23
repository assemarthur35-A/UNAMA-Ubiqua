/* Consultas do paciente */
'use strict';
/* consultas do paciente */
function renderAppts(){
  var list=state.appts.slice().sort(function(a,b){return (a.date+a.time)<(b.date+b.time)?-1:1;});
  var nc=$('#navCount');nc.textContent=list.length;nc.hidden=!list.length;
  if(!list.length){$('#appts').innerHTML='<p class="empty">Nenhuma consulta agendada. Escolha um médico acima para marcar a primeira.</p>';return;}
  $('#appts').innerHTML=list.map(function(a){
    var doc=DOCS.filter(function(d){return d.id===a.doc;})[0],d=fromKey(a.date);
    if(!doc)return '';
    return '<article class="appt"><div class="when">'+pad(d.getDate())+'/'+pad(d.getMonth()+1)+'<small>'+DOW[d.getDay()]+' · '+a.time+'</small></div>'+
      '<div><h3>'+esc(doc.nome)+'</h3><p>'+esc(doc.esp)+' · '+esc(a.motivo)+'</p><p>'+esc(hosp(doc.h).nome)+' · '+esc(doc.sala)+'</p><p>Paciente: '+esc(a.nome)+' · protocolo <span class="mono">'+a.proto+'</span></p></div>'+
      '<div class="acts"><button type="button" class="btn ghost small" data-cancel="'+a.id+'">Cancelar</button></div></article>';
  }).join('');
}
var armTimer=null;
function onCancel(btn){
  var id=btn.getAttribute('data-cancel');
  if(btn.getAttribute('data-armed')!=='1'){
    btn.setAttribute('data-armed','1');btn.textContent='Confirmar cancelamento';btn.className='btn danger small';
    clearTimeout(armTimer);
    armTimer=setTimeout(function(){if(btn.isConnected){btn.removeAttribute('data-armed');btn.textContent='Cancelar';btn.className='btn ghost small';}},5000);
    return;
  }
  state.appts=state.appts.filter(function(a){return a.id!==id;});
  save('an_appts',state.appts);
  renderAppts();renderSlots();renderDoctors();
}

