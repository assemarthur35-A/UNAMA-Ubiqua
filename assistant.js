/* Assistente de ajuda */
'use strict';
var HELP_RULES=
'Você é o Assistente do Saúde Agora, um site que mostra a situação de vários hospitais e UPAs (a maioria públicos) e ajuda a achar médicos e marcar consultas. Os hospitais e médicos são fictícios, de demonstração. Quem conversa com você costuma ser uma pessoa idosa, com pouca prática em internet. Siga estas regras sempre:\n'+
'1. Responda em português do Brasil, com palavras simples e frases curtas. Use no máximo 70 palavras, a menos que a pessoa peça mais detalhes.\n'+
'2. Escreva só texto corrido. Não use asteriscos, marcadores, tabelas, emojis nem formatação. Para ensinar um caminho, use "Primeiro... Depois... Por fim..." em frases separadas.\n'+
'3. Seja caloroso e paciente. Nunca faça a pessoa se sentir lenta ou errada. Trate a pessoa por "você".\n'+
'4. Responda sobre unidades, médicos, horários, demanda e consultas usando SOMENTE os dados abaixo. Se não souber, diga que não sabe e sugira falar com a recepção da unidade. Nunca invente nomes, horários ou telefones.\n'+
'5. Não faça diagnóstico, não indique remédios nem doses. Para dúvidas de saúde, diga que quem pode orientar é o médico.\n'+
'6. Se a pessoa descrever sinais de emergência (dor forte no peito, falta de ar, rosto torto ou fala enrolada, fraqueza de um lado do corpo, desmaio, sangramento forte, confusão repentina, ou qualquer risco de vida), diga primeiro e com clareza: ligue agora para o 192 (SAMU) ou vá à unidade de saúde mais próxima. Não sugira agendar consulta nem procurar a unidade menos cheia nesse caso.\n'+
'7. Só sugira a unidade menos cheia para casos leves e sem risco. Em caso grave ou na dúvida, diga para ir à unidade mais próxima ou ligar 192. Unidade tipo UPA e pronto-socorro atende por triagem e não marca consulta.\n'+
'8. Quando ajudar, termine com UMA etiqueta de ação, sozinha em uma última linha: [[ir:hospitais]], [[ir:medicos]], [[ir:agendar]] ou [[ir:consultas]] para levar a pessoa a essa parte do site; [[hospital:ID]] (ID da unidade nos dados abaixo) para abrir os detalhes daquela unidade; ou [[agendar:ID]] (ID do médico) para abrir o agendamento já com aquele médico. Nunca mais de uma etiqueta e nunca invente IDs. Sem etiqueta se nada disso ajudar.\n'+
'9. Se a pessoa pedir para você marcar a consulta, explique que ela mesma confirma no formulário e use a etiqueta [[agendar:ID]]. Você não confirma consultas.\n\n'+
'DADOS ATUAIS DO SITE:\n';

function helpSnapshot(){
  var n=new Date(),L=[];
  L.push('Hoje é '+DOW_LONG[n.getDay()]+', '+pad(n.getDate())+'/'+pad(n.getMonth()+1)+'/'+n.getFullYear()+'. Agora são '+pad(n.getHours())+':'+pad(n.getMinutes())+'.');
  L.push('Triagem: vermelho é atendido na hora, laranja em até 10 min, amarelo até 60, verde até 120, azul até 240. Casos graves passam na frente. Emergência: SAMU 192.');
  L.push('Como marcar consulta no site: Primeiro, tocar em Ver detalhes na unidade escolhida. Depois tocar em Agendar no menu. Escolher a especialidade e o médico, o dia e um horário livre (horários riscados já estão ocupados). Por fim escrever nome e telefone e tocar em Confirmar consulta.');
  L.push('UNIDADES (da menos cheia para a mais cheia):');
  HOSPITALS.map(function(h){return {h:h,D:demand(h.id)};}).sort(function(a,b){return a.D.score-b.D.score;}).forEach(function(o){
    var h=o.h,D=o.D;
    L.push('- id '+h.id+': '+h.nome+' ('+h.tipo+', '+h.cat+', '+h.bairro+'). Demanda '+D.lvl.nome+', pontuação '+D.score+' de 100, espera estimada '+D.wait+' min, '+D.s.fila+' pacientes aguardando, '+D.s.plant+' médicos de plantão, '+D.s.leitos+' de '+D.s.total+' leitos ocupados.'+(docsOf(h.id).length?'':' Esta unidade não marca consultas; atende por triagem.'));
  });
  L.push('MÉDICOS:');
  DOCS.forEach(function(doc){
    var st=statusNow(doc),nf=nextFree(doc);
    var s='- id '+doc.id+': '+doc.nome+', '+doc.esp+', unidade '+hosp(doc.h).nome+'. Situação agora: '+st.label+'.';
    if(st.ab)s+=' Ausente até '+fmtDM(st.ab.ate)+' (motivo: '+st.ab.motivo+'); volta a atender em '+fmtShort(returnDate(doc,st.ab))+'.';
    else if(doc.aus&&doc.aus.de>0)s+=' Estará ausente de '+fmtDM(addDays(today(),doc.aus.de))+' a '+fmtDM(addDays(today(),doc.aus.ate))+' ('+doc.aus.motivo+').';
    s+=' Atende '+fmtDias(doc.dias)+', '+doc.turnos.map(function(t){return t[0]+' às '+t[1];}).join(' e ')+'. Próximo horário livre: '+(nf?fmtShort(nf.d)+' às '+nf.t:'nenhum nos próximos 60 dias')+'. Local: '+doc.sala+'.';
    L.push(s);
  });
  L.push('CONSULTAS JÁ MARCADAS PELO PACIENTE NESTE APARELHO:');
  if(!state.appts.length)L.push('nenhuma');
  state.appts.slice().sort(function(a,b){return (a.date+a.time)<(b.date+b.time)?-1:1;}).forEach(function(a){
    var doc=DOCS.filter(function(d){return d.id===a.doc;})[0];
    if(doc)L.push('- '+fmtShort(fromKey(a.date))+' às '+a.time+', '+doc.nome+' ('+doc.esp+'), '+hosp(doc.h).nome+', '+doc.sala+', protocolo '+a.proto+'.');
  });
  return L.join('\n');
}

var HELP_CHIPS=[
  {id:'demanda',q:'Qual hospital está mais vazio agora?'},
  {id:'marcar',q:'Como eu marco uma consulta?'},
  {id:'faltou',q:'Meu médico faltou. O que eu faço?'},
  {id:'hoje',q:'Quais médicos estão atendendo hoje?'},
  {id:'consultas',q:'Quando é a minha consulta?'}
];
var HELP_GREETING='Olá! Eu sou o assistente do Saúde Agora. Posso ajudar você a ver qual hospital está menos cheio, achar um médico e marcar sua consulta. Toque em uma pergunta aqui embaixo ou escreva a sua. Para deixar a letra maior, use os botões A, no alto da página.';

function helpLocal(id){
  var t='',act=null;
  if(id==='demanda'){
    var r=HOSPITALS.map(function(h){return {h:h,D:demand(h.id)};}).sort(function(a,b){return a.D.score-b.D.score;});
    var lo=r[0],hi=r[r.length-1];
    t='Agora a unidade menos cheia é '+lo.h.nome+', com demanda '+lo.D.lvl.nome+' e espera de cerca de '+lo.D.wait+' minutos. A mais cheia é '+hi.h.nome+', com demanda '+hi.D.lvl.nome+' e cerca de '+hi.D.wait+' minutos. Escolher a menos cheia vale só para casos leves. Se for grave, vá à unidade mais próxima ou ligue 192.';
    act='ir:hospitais';
  }else if(id==='marcar'){
    t='É fácil. Primeiro, escolha a unidade e toque em Ver detalhes. Depois, toque em Agendar, no menu do alto. Escolha a especialidade, o médico e o dia, e toque em um horário livre. Por fim, escreva seu nome e telefone e toque em Confirmar consulta.';act='ir:agendar';
  }else if(id==='faltou'){
    var abs=DOCS.filter(function(d){return statusNow(d).ab;});
    t=abs.length?'Hoje estão ausentes: '+abs.map(function(d){return d.nome+' ('+hosp(d.h).nome+'), volta a atender em '+fmtShort(returnDate(d,statusNow(d).ab));}).join('; ')+'. ':'Hoje nenhum médico está ausente. ';
    t+='No cartão de cada médico, o site mostra quando ele volta e outra opção da mesma especialidade.';act='ir:medicos';
  }else if(id==='hoje'){
    var on=DOCS.filter(function(d){var c=statusNow(d).cls;return c==='ok'||c==='info'||c==='warn';});
    t=on.length?'Hoje atendem: '+on.map(function(d){return d.nome+', '+d.esp+', '+hosp(d.h).nome+' ('+statusNow(d).label.toLowerCase()+')';}).join('; ')+'.':'Hoje nenhum médico atende no ambulatório.';act='ir:medicos';
  }else if(id==='consultas'){
    var l=state.appts.slice().sort(function(a,b){return (a.date+a.time)<(b.date+b.time)?-1:1;});
    t=l.length?'Suas consultas: '+l.map(function(a){var d=DOCS.filter(function(x){return x.id===a.doc;})[0];return fmtShort(fromKey(a.date))+' às '+a.time+' com '+(d?d.nome+', '+hosp(d.h).nome:'médico');}).join('; ')+'.':'Você ainda não marcou nenhuma consulta neste aparelho. Posso ajudar a marcar a primeira.';
    act=l.length?'ir:consultas':'ir:agendar';
  }
  return {text:t,act:act};
}

var H={ai:true,busy:false,ctl:null,turns:[],sample:null,samplePromise:null,auto:false,synth:null,speaking:null};
var HELP_TAG=/\[\[(ir|agendar|hospital):([a-z]+)\]\]/;
function helpClean(t){return t.replace(/\[\[[^\]]*\]\]?/g,'').replace(/\[\[?[^\]]*$/,'').replace(/\*+/g,'').replace(/\s+$/,'');}

function hMsg(role,text){
  var d=document.createElement('div');d.className='msg '+role;
  var w=document.createElement('span');w.className='who';w.textContent=role==='me'?'Você':'Assistente';
  var p=document.createElement('p');p.textContent=text;
  var a=document.createElement('div');a.className='macts';
  d.appendChild(w);d.appendChild(p);d.appendChild(a);
  H.log.appendChild(d);H.log.scrollTop=H.log.scrollHeight;
  return d;
}
function hSet(d,text){d.querySelector('p').textContent=text;H.log.scrollTop=H.log.scrollHeight;}

function hOpen(){
  H.panel.hidden=false;H.fab.hidden=true;H.fab.setAttribute('aria-expanded','true');
  $('#helpTitle').focus();
  if(window.matchMedia&&window.matchMedia('(pointer:fine)').matches)H.inEl.focus();
  H.log.scrollTop=H.log.scrollHeight;
}
function hClose(refocus){
  H.panel.hidden=true;H.fab.hidden=false;H.fab.setAttribute('aria-expanded','false');
  if(H.synth){try{H.synth.cancel();}catch(e){}}
  if(refocus!==false)H.fab.focus();
}

function hSpeak(text,b){
  try{
    var s=H.synth;
    if(H.speaking===b){s.cancel();return;}
    s.cancel();
    var u=new SpeechSynthesisUtterance(text);u.lang='pt-BR';u.rate=0.9;
    var v=s.getVoices().filter(function(x){return /^pt/i.test(x.lang);})[0];if(v)u.voice=v;
    var done=function(){if(H.speaking===b)H.speaking=null;b.textContent='Ouvir';};
    u.onend=done;u.onerror=done;
    if(H.speaking)H.speaking.textContent='Ouvir';
    H.speaking=b;b.textContent='Parar a voz';
    s.speak(u);
  }catch(e){H.speaking=null;b.textContent='Ouvir';}
}
function hListen(d,text){
  if(!H.synth)return null;
  var b=document.createElement('button');b.type='button';b.className='btn ghost small';b.textContent='Ouvir';
  b.addEventListener('click',function(){hSpeak(text,b);});
  d.querySelector('.macts').appendChild(b);
  return b;
}
function hAction(d,type,arg){
  var b=document.createElement('button');b.type='button';b.className='btn small';var go;
  if(type==='agendar'){
    var doc=DOCS.filter(function(x){return x.id===arg;})[0];if(!doc)return;
    b.textContent='Agendar com '+doc.nome;go=function(){setBooking(doc.id,true);};
  }else if(type==='hospital'){
    var hh=hosp(arg);if(!hh)return;
    b.textContent='Ver '+hh.nome;go=function(){selectHospital(hh.id,true);};
  }else{
    var map={hospitais:'Ver as unidades',medicos:'Ver os médicos',agendar:'Ir para o agendamento',consultas:'Ver minhas consultas'};
    if(!map[arg])return;
    b.textContent=map[arg];go=function(){document.getElementById(arg).scrollIntoView({behavior:'smooth',block:'start'});};
  }
  b.addEventListener('click',function(){hClose(false);go();});
  d.querySelector('.macts').appendChild(b);
}
function hFinish(d,raw){
  var clean=helpClean(raw);
  hSet(d,clean);d.classList.remove('think');
  var m=raw.match(HELP_TAG);
  if(m)hAction(d,m[1],m[2]);
  var lb=hListen(d,clean);
  if(H.auto&&lb)hSpeak(clean,lb);
}
function hLocalBody(id){
  var r=helpLocal(id),d=hMsg('bot',r.text);
  if(r.act){var p=r.act.split(':');hAction(d,p[0],p[1]);}
  var lb=hListen(d,r.text);
  if(H.auto&&lb)hSpeak(r.text,lb);
}
function hBusy(b){
  H.busy=b;
  $('#helpSend').textContent=b?'Parar':'Enviar';
  [].forEach.call(H.chips.querySelectorAll('button'),function(x){x.disabled=b;});
}
function hNoAi(){
  H.ai=false;
  H.inEl.disabled=true;H.inEl.placeholder='Use as perguntas prontas';
  $('#helpSend').disabled=true;
}

async function hAsk(text,chipId){
  text=text.trim();
  if(!text||H.busy)return;
  if(!H.ai){if(chipId){hMsg('me',text);hLocalBody(chipId);}return;}
  hMsg('me',text);
  H.turns.push({role:'user',content:text});
  var bot=hMsg('bot','Pensando…');bot.classList.add('think');
  hBusy(true);
  var ctl=new AbortController();H.ctl=ctl;
  try{
    if(!H.sample)H.sample=await H.samplePromise;
    if(!H.sample)throw {code:'not_declared'};
    var hist=H.turns.slice(-8);
    while(hist.length&&hist[0].role!=='user')hist.shift();
    var input=[{role:'user',content:HELP_RULES+helpSnapshot()}].concat(hist);
    var r=await H.sample(input,{modelTier:'quick',cache:false,signal:ctl.signal,onText:function(u){bot.classList.remove('think');hSet(bot,helpClean(u.text));}});
    H.turns.push({role:'assistant',content:helpClean(r.text)});
    hFinish(bot,r.text);
  }catch(e){
    var code=e&&e.code,partial=(e&&e.text)?helpClean(e.text):'';
    bot.classList.remove('think');
    if(code==='cancelled'){
      if(partial){hSet(bot,partial);H.turns.push({role:'assistant',content:partial});}
      else{bot.remove();H.turns.pop();}
    }else if(['not_granted','sampling_disabled','not_declared','capability_disabled','capability_removed'].indexOf(code)>=0){
      H.turns.pop();hNoAi();
      if(chipId){bot.remove();hLocalBody(chipId);}
      else hSet(bot,'Neste aparelho eu não consigo responder por escrito. Toque em uma das perguntas prontas que eu respondo.');
    }else{
      H.turns.pop();
      hSet(bot,partial||(code==='rate_limited'?'Foram muitas perguntas seguidas. Espere um minutinho e tente de novo.':'Não consegui responder agora. Tente de novo, por favor.'));
    }
  }finally{
    hBusy(false);H.ctl=null;
  }
}

function initAssistant(){
  H.fab=$('#helpOpen');H.panel=$('#helpPanel');H.log=$('#helpLog');H.inEl=$('#helpIn');H.chips=$('#helpChips');
  try{if('speechSynthesis' in window&&typeof SpeechSynthesisUtterance!=='undefined')H.synth=window.speechSynthesis;}catch(e){H.synth=null;}
  applySize(load('an_size','normal'));
  $('#helpAutoRow').hidden=!H.synth;
  H.auto=!!(H.synth&&load('an_auto',false));
  $('#helpAuto').checked=H.auto;
  $('#helpAuto').addEventListener('change',function(ev){H.auto=ev.target.checked;save('an_auto',H.auto);if(!H.auto&&H.synth){try{H.synth.cancel();}catch(e){}}});

  H.chips.innerHTML=HELP_CHIPS.map(function(c,i){return '<button type="button" class="qchip" data-i="'+i+'">'+esc(c.q)+'</button>';}).join('');
  H.chips.addEventListener('click',function(ev){
    var b=ev.target.closest('button[data-i]');if(!b)return;
    var c=HELP_CHIPS[Number(b.getAttribute('data-i'))];hAsk(c.q,c.id);
  });
  $('#helpForm').addEventListener('submit',function(ev){
    ev.preventDefault();
    if(H.busy){if(H.ctl)H.ctl.abort();return;}
    var v=H.inEl.value;H.inEl.value='';hAsk(v,null);
  });
  H.fab.addEventListener('click',hOpen);
  $('#helpClose').addEventListener('click',function(){hClose();});
  $('#helpSize').addEventListener('click',cycleSize);
  document.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&!H.panel.hidden)hClose();});
  $('.sizer').addEventListener('click',function(ev){var b=ev.target.closest('button[data-size]');if(b)applySize(b.getAttribute('data-size'));});

  var g=hMsg('bot',HELP_GREETING);hListen(g,HELP_GREETING);

  if(window.claude&&typeof window.claude.use==='function'){
    H.samplePromise=window.claude.use('sample').then(function(f){if(!f)hNoAi();return f;},function(){hNoAi();return null;});
  }else{
    H.samplePromise=Promise.resolve(null);hNoAi();
  }
}
