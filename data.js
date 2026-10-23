/* Dados de exemplo (fictícios) e buscas simples.
   lat/lng das unidades são ILUSTRATIVAS (pontos aproximados em Belém), não endereços reais. */
'use strict';
/* dados de exemplo (todos fictícios) */
var HOSPITALS=[
 {id:'hmv',lat:-1.4558,lng:-48.5044,nome:'Hospital Municipal Vale Verde',tipo:'Público',cat:'Hospital geral',bairro:'Centro',staff:{fila:41,plant:6,leitos:118,total:130}},
 {id:'upa',lat:-1.413,lng:-48.456,nome:'UPA 24h Alvorada',tipo:'Público',cat:'UPA 24h',bairro:'Zona Leste',staff:{fila:28,plant:4,leitos:14,total:16}},
 {id:'hri',lat:-1.376,lng:-48.439,nome:'Hospital Regional Ipê',tipo:'Público',cat:'Hospital geral',bairro:'Zona Norte',staff:{fila:24,plant:6,leitos:96,total:120}},
 {id:'msa',lat:-1.469,lng:-48.478,nome:'Maternidade Santa Aurora',tipo:'Público',cat:'Maternidade',bairro:'Zona Sul',staff:{fila:6,plant:3,leitos:38,total:60}},
 {id:'psr',lat:-1.442,lng:-48.48,nome:'Pronto-Socorro Infantil Ribeirinho',tipo:'Público',cat:'Pronto-socorro infantil',bairro:'Ribeirinho',staff:{fila:14,plant:3,leitos:20,total:30}},
 {id:'hph',lat:-1.45,lng:-48.476,nome:'Hospital Particular Horizonte',tipo:'Particular',cat:'Hospital geral',bairro:'Bairro Nobre',staff:{fila:5,plant:5,leitos:44,total:90}}
];
var DOCS=[
 {id:'hm',h:'hmv',nome:'Dra. Helena Marques',esp:'Clínica geral',crm:'10482',dias:[1,2,3,4,5],turnos:[['08:00','12:00'],['14:00','17:00']],dur:30,sala:'Bloco B, sala 101',aus:null},
 {id:'ps',h:'hmv',nome:'Dr. Paulo Sampaio',esp:'Clínica geral',crm:'11937',dias:[1,3,5],turnos:[['13:00','18:00']],dur:30,sala:'Bloco B, sala 102',aus:{de:-2,ate:4,motivo:'Licença médica'}},
 {id:'rt',h:'hmv',nome:'Dr. Rafael Teixeira',esp:'Cardiologia',crm:'09874',dias:[2,4],turnos:[['08:00','12:00'],['14:00','16:00']],dur:30,sala:'Bloco C, sala 301',aus:{de:0,ate:6,motivo:'Congresso de cardiologia'}},
 {id:'eb',h:'hmv',nome:'Dr. Eduardo Brandão',esp:'Cardiologia',crm:'14021',dias:[1,3,5],turnos:[['09:00','12:00']],dur:30,sala:'Bloco C, sala 302',aus:null},
 {id:'ol',h:'hmv',nome:'Dr. Otávio Lima',esp:'Ortopedia',crm:'10033',dias:[1,3,4],turnos:[['08:00','12:00']],dur:30,sala:'Bloco B, sala 110',aus:null,cirurgia:true},
 {id:'sa',h:'hri',nome:'Dra. Sofia Almeida',esp:'Clínica geral',crm:'12011',dias:[1,2,3,4,5],turnos:[['08:00','12:00']],dur:30,sala:'Ambulatório, sala 4',aus:null},
 {id:'tr',h:'hri',nome:'Dr. Tiago Ramos',esp:'Cardiologia',crm:'13390',dias:[2,3,4],turnos:[['13:30','17:30']],dur:30,sala:'Ambulatório, sala 7',aus:null},
 {id:'lb',h:'hri',nome:'Dr. Lucas Batista',esp:'Ortopedia',crm:'11720',dias:[1,2,4],turnos:[['08:00','12:00']],dur:30,sala:'Ambulatório, sala 9',aus:{de:1,ate:5,motivo:'Férias'}},
 {id:'ac',h:'hri',nome:'Dr. André Cavalcante',esp:'Dermatologia',crm:'13577',dias:[2,3,5],turnos:[['14:00','18:00']],dur:20,sala:'Ambulatório, sala 12',aus:null},
 {id:'lp',h:'hri',nome:'Dra. Luciana Prado',esp:'Neurologia',crm:'11145',dias:[2,4],turnos:[['08:00','12:00']],dur:40,sala:'Ambulatório, sala 15',aus:{de:3,ate:10,motivo:'Férias'}},
 {id:'mv',h:'hri',nome:'Dr. Marcos Vieira',esp:'Oftalmologia',crm:'12804',dias:[1,3,5],turnos:[['08:00','11:30']],dur:30,sala:'Ambulatório, sala 18',aus:null},
 {id:'bn',h:'msa',nome:'Dra. Beatriz Nogueira',esp:'Ginecologia e obstetrícia',crm:'12290',dias:[1,2,3,4,5],turnos:[['08:00','12:00']],dur:30,sala:'Ambulatório, sala 2',aus:null},
 {id:'vc',h:'msa',nome:'Dra. Verônica Castro',esp:'Ginecologia e obstetrícia',crm:'12941',dias:[2,4],turnos:[['13:00','17:00']],dur:30,sala:'Ambulatório, sala 3',aus:{de:-1,ate:3,motivo:'Licença médica'}},
 {id:'cf',h:'psr',nome:'Dra. Camila Ferraz',esp:'Pediatria',crm:'12655',dias:[1,2,3,4,5],turnos:[['08:00','12:00']],dur:30,sala:'Consultório 1',aus:null},
 {id:'rd',h:'psr',nome:'Dra. Renata Duarte',esp:'Pediatria',crm:'13208',dias:[2,4],turnos:[['13:30','17:30']],dur:30,sala:'Consultório 2',aus:null},
 {id:'fc',h:'hph',nome:'Dr. Fernando Coelho',esp:'Clínica geral',crm:'14402',dias:[1,2,3,4,5],turnos:[['08:00','12:00'],['14:00','18:00']],dur:30,sala:'Torre A, sala 210',aus:null},
 {id:'pl',h:'hph',nome:'Dra. Patrícia Luz',esp:'Cardiologia',crm:'14118',dias:[1,3,5],turnos:[['09:00','13:00']],dur:30,sala:'Torre A, sala 305',aus:null},
 {id:'im',h:'hph',nome:'Dra. Isabela Moura',esp:'Dermatologia',crm:'14560',dias:[2,4],turnos:[['08:00','12:00']],dur:20,sala:'Torre B, sala 112',aus:{de:0,ate:2,motivo:'Congresso'}}
];
var SECTORS_BY={
 'Hospital geral':[
  {n:'Pronto-socorro adulto',base:82,k:0.9,w:30},{n:'Pronto-socorro infantil',base:62,k:0.8,w:20},
  {n:'Ortopedia e trauma',base:70,k:0.6,w:35},{n:'Exames de imagem',base:66,k:0.7,w:25},
  {n:'Maternidade',base:55,k:0.3,w:15},{n:'UTI',base:78,k:0.35,w:0}],
 'UPA 24h':[
  {n:'Sala de emergência',base:70,k:0.8,w:0},{n:'Observação adulto',base:84,k:0.9,w:40},
  {n:'Observação infantil',base:60,k:0.8,w:30},{n:'Raio-X e exames',base:66,k:0.7,w:25}],
 'Maternidade':[
  {n:'Pré-parto',base:55,k:0.5,w:15},{n:'Centro obstétrico',base:60,k:0.4,w:20},
  {n:'Alojamento conjunto',base:72,k:0.5,w:0},{n:'UTI neonatal',base:78,k:0.3,w:0},{n:'Ultrassom',base:60,k:0.6,w:25}],
 'Pronto-socorro infantil':[
  {n:'Classificação de risco',base:70,k:0.9,w:25},{n:'Consultório pediátrico',base:68,k:0.8,w:30},
  {n:'Observação',base:62,k:0.7,w:0},{n:'Raio-X e exames',base:60,k:0.6,w:30},{n:'UTI pediátrica',base:75,k:0.3,w:0}]
};
var LEVELS=[
 {id:'baixa',nome:'baixa',max:50,cls:'ok',advice:'Esta unidade está tranquila. Não há fila relevante neste momento.'},
 {id:'moderada',nome:'moderada',max:75,cls:'warn',advice:'O fluxo é normal, com alguma espera para casos pouco urgentes.'},
 {id:'alta',nome:'alta',max:90,cls:'hi',advice:'Casos leves podem esperar bastante. Se não for urgente, agende uma consulta, procure uma unidade menos cheia ou uma unidade básica de saúde.'},
 {id:'critica',nome:'crítica',max:101,cls:'crit',advice:'A capacidade está no limite. Venha apenas em caso de urgência. Casos graves continuam sendo atendidos primeiro. Em risco de vida, ligue 192.'}
];

function hosp(id){return HOSPITALS.filter(function(h){return h.id===id;})[0];}
function docsOf(hid){return DOCS.filter(function(d){return d.h===hid;});}
