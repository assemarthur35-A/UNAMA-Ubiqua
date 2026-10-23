/* Painel da equipe e atualização periódica */
'use strict';
/* equipe */
function renderStaff(){
  var s=state.hs[state.sel];
  $('#fila').value=s.fila;$('#plant').value=s.plant;
  $('#leitos').max=s.total;$('#leitos').value=s.leitos;
  $('#leitosL').textContent='Leitos ocupados (de '+s.total+')';
  $('#filaV').textContent=s.fila;$('#plantV').textContent=s.plant;$('#leitosV').textContent=s.leitos+' de '+s.total;
  var docs=docsOf(state.sel);
  var prev=$('#absDoc').value;
  $('#absDoc').innerHTML=docs.length?docs.map(function(d){return '<option value="'+d.id+'">'+esc(d.nome)+'</option>';}).join(''):'<option value="">Sem médicos nesta unidade</option>';
  if(prev&&docs.some(function(d){return d.id===prev;}))$('#absDoc').value=prev;
  $('#absDoc').disabled=!docs.length;$('#absBtn').disabled=!docs.length;
  var ids=docs.filter(function(d){return state.absentToday[d.id];});
  $('#absList').innerHTML=ids.map(function(d){
    return '<span class="chip">'+esc(d.nome)+'<button type="button" data-rm="'+d.id+'" aria-label="Remover ausência de '+esc(d.nome)+'">×</button></span>';
  }).join('');
  $('#absBtn').textContent=state.absentToday[$('#absDoc').value]?'Remover ausência':'Marcar ausente';
}
function afterStaffChange(){
  save('an_staff2',state.hs);saveAbs();
  renderDemand();renderStaff();renderHospitals();renderDoctors();
  if(window.SaudeMap)window.SaudeMap.refresh();
  var cur=el.doc.value;fillDocs();el.doc.value=cur;renderSlots();
}

function tick(){
  var n=new Date();
  $('#upd').textContent=pad(n.getHours())+':'+pad(n.getMinutes());
  renderDoctors();
}

