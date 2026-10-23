/* Inicialização: liga eventos e dispara a primeira renderização */
'use strict';
function init(){
  el.form=$('#form');el.esp=$('#esp');el.doc=$('#doc');el.date=$('#date');el.slots=$('#slots');
  el.nome=$('#nome');el.tel=$('#tel');el.motivo=$('#motivo');el.err=$('#err');
  $('#hospSel').innerHTML=HOSPITALS.map(function(h){return '<option value="'+h.id+'">'+esc(h.nome)+'</option>';}).join('');
  var cats=HOSPITALS.map(function(h){return h.cat;}).filter(function(v,i,a){return a.indexOf(v)===i;});
  $('#hCat').innerHTML='<option value="">Todos os tipos</option>'+cats.map(function(c){return '<option>'+esc(c)+'</option>';}).join('');
  el.date.min=key(today());el.date.max=key(addDays(today(),60));

  el.esp.addEventListener('change',function(){fillDocs();el.date.value='';renderSlots();});
  el.doc.addEventListener('change',function(){
    var doc=currentDoc();
    if(doc&&!el.date.value){var nf=nextFree(doc);if(nf)el.date.value=key(nf.d);}
    renderSlots();
  });
  el.date.addEventListener('change',renderSlots);
  el.slots.addEventListener('change',renderSummary);
  el.slots.addEventListener('click',function(ev){
    var b=ev.target.closest('button');if(!b)return;
    if(b.dataset.date){el.date.value=b.dataset.date;renderSlots();}
    else if(b.dataset.doc){setBooking(b.dataset.doc,false);}
  });
  el.form.addEventListener('submit',submitForm);
  el.tel.addEventListener('input',function(){
    var v=el.tel.value.replace(/\D/g,'').slice(0,11),o=v,cut=v.length>10?7:6;
    if(v.length>cut)o='('+v.slice(0,2)+') '+v.slice(2,cut)+'-'+v.slice(cut);
    else if(v.length>2)o='('+v.slice(0,2)+') '+v.slice(2);
    el.tel.value=o;
  });

  $('#hType').addEventListener('click',function(ev){
    var b=ev.target.closest('button[data-t]');if(!b)return;
    hFilter.t=b.getAttribute('data-t');
    [].forEach.call($('#hType').querySelectorAll('button'),function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});
    renderHospitals();
  });
  $('#hCat').addEventListener('change',function(){hFilter.cat=$('#hCat').value;renderHospitals();});
  $('#hlist').addEventListener('click',function(ev){
    var b=ev.target.closest('button[data-sel]');if(b)selectHospital(b.getAttribute('data-sel'),true);
  });
  $('#hospSel').addEventListener('change',function(){selectHospital($('#hospSel').value,false);});

  $('#docs').addEventListener('click',function(ev){
    var b=ev.target.closest('button[data-book]');if(b)setBooking(b.getAttribute('data-book'),true);
  });
  $('#fQ').addEventListener('input',renderDoctors);
  $('#fEsp').addEventListener('change',renderDoctors);
  $('#fStatus').addEventListener('click',function(ev){
    var b=ev.target.closest('button[data-f]');if(!b)return;
    fState=b.getAttribute('data-f');
    [].forEach.call($('#fStatus').querySelectorAll('button'),function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});
    renderDoctors();
  });
  $('#appts').addEventListener('click',function(ev){
    var b=ev.target.closest('button[data-cancel]');if(b)onCancel(b);
  });

  ['fila','plant','leitos'].forEach(function(id){
    $('#'+id).addEventListener('input',function(ev){
      state.hs[state.sel][id]=Number(ev.target.value);afterStaffChange();
    });
  });
  $('#absDoc').addEventListener('change',renderStaff);
  $('#absBtn').addEventListener('click',function(){
    var id=$('#absDoc').value;if(!id)return;
    if(state.absentToday[id])delete state.absentToday[id];else state.absentToday[id]=true;
    afterStaffChange();
  });
  $('#absList').addEventListener('click',function(ev){
    var b=ev.target.closest('button[data-rm]');if(!b)return;
    delete state.absentToday[b.getAttribute('data-rm')];afterStaffChange();
  });
  $('#reset').addEventListener('click',function(){
    var h=hosp(state.sel);
    state.hs[h.id]=Object.assign({},h.staff);
    docsOf(h.id).forEach(function(d){delete state.absentToday[d.id];});
    afterStaffChange();
  });

  renderAppts();
  selectHospital(state.sel,false);
  tick();
  setInterval(tick,60000);
}

init();
initAssistant();
