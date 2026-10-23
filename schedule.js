/* Regras de agenda, ausências e horários */
'use strict';
/* regras de agenda */
function absenceOn(doc,d){
  var k=key(d),t=today();
  if(doc.aus){
    var a=key(addDays(t,doc.aus.de)),b=key(addDays(t,doc.aus.ate));
    if(k>=a&&k<=b)return {motivo:doc.aus.motivo,ate:addDays(t,doc.aus.ate)};
  }
  if(k===key(t)&&state.absentToday[doc.id])return {motivo:'Ausência registrada pela recepção',ate:t};
  return null;
}
function returnDate(doc,ab){
  var d=addDays(ab.ate,1);
  for(var i=0;i<14;i++){if(doc.dias.indexOf(d.getDay())>=0)return d;d=addDays(d,1);}
  return d;
}
function slotsFor(doc,d){
  if(doc.dias.indexOf(d.getDay())<0||absenceOn(doc,d))return [];
  var k=key(d);
  var booked={};
  state.appts.forEach(function(a){if(a.doc===doc.id&&a.date===k)booked[a.time]=true;});
  var now=new Date(),isToday=k===key(today()),limit=now.getHours()*60+now.getMinutes()+30,out=[];
  doc.turnos.forEach(function(tn){
    for(var m=toMin(tn[0]);m+doc.dur<=toMin(tn[1]);m+=doc.dur){
      if(isToday&&m<limit)continue;
      var t=fromMin(m);
      var taken=hash(doc.id+k+t)%100<38||booked[t];
      out.push({t:t,free:!taken});
    }
  });
  return out;
}
function nextFree(doc,from){
  var start=from||today();
  for(var i=0;i<=60;i++){
    var d=addDays(start,i);
    var f=slotsFor(doc,d).filter(function(s){return s.free;})[0];
    if(f)return {d:d,t:f.t};
  }
  return null;
}
function altFor(doc){
  return DOCS.filter(function(x){return x.id!==doc.id&&x.esp===doc.esp;})
    .map(function(x){return {x:x,n:nextFree(x)};})
    .filter(function(o){return o.n;})
    .sort(function(a,b){return ((a.x.h===doc.h?0:1)-(b.x.h===doc.h?0:1))||(a.n.d-b.n.d);})[0];
}
function altText(doc,alt){
  return alt.x.nome+(alt.x.h!==doc.h?' ('+hosp(alt.x.h).nome+')':'');
}
function statusNow(doc){
  var t=today(),n=new Date(),m=n.getHours()*60+n.getMinutes();
  var ab=absenceOn(doc,t);
  if(ab)return {cls:'crit',label:'Ausente',ab:ab};
  if(doc.dias.indexOf(t.getDay())<0)return {cls:'off',label:'Sem atendimento hoje'};
  var inTurn=doc.turnos.some(function(tn){return m>=toMin(tn[0])&&m<toMin(tn[1]);});
  if(inTurn)return doc.cirurgia?{cls:'info',label:'Em cirurgia'}:{cls:'ok',label:'Atendendo agora'};
  var nx=doc.turnos.filter(function(tn){return toMin(tn[0])>m;})[0];
  if(nx)return {cls:'warn',label:'Atende hoje às '+nx[0]};
  return {cls:'off',label:'Expediente encerrado'};
}

