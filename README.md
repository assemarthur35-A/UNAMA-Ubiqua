# Saúde Agora

Protótipo de site acessível que mostra **qual hospital está menos cheio**, a **agenda dos médicos** (inclusive ausências), um **mapa com rotas** e o **agendamento de consultas**. Feito com HTML, CSS e JavaScript puro, sem build.

> ⚠️ **Projeto acadêmico de demonstração.** Hospitais, médicos, horários, lotação e os pontos do mapa são **fictícios**. Não use para decisões de saúde. Em emergência, ligue **192 (SAMU)**.

**Autor:** [Seu nome] · [Curso/Disciplina] · UNAMA · [Professor(a)] · 2026

## Demonstração

Após publicar no GitHub Pages: `https://SEU-USUARIO.github.io/saude-agora/`

## Funcionalidades

- **Demanda por unidade** calculada em tempo real (50% ocupação de leitos + 50% pressão da fila), com nível baixa/moderada/alta/crítica e espera estimada.
- **Mapa** (OpenStreetMap, sem chave) com marcadores coloridos pela demanda, ordenação por "mais perto" ou "menos cheia" e rota/distância até a unidade. Com chave, usa **Google Maps + Places API (New)** para hospitais reais por perto.
- **Médicos**: situação agora (atendendo, ausente, em cirurgia), próximo horário livre e sugestão de outro médico quando há ausência.
- **Agendamento** só com horários livres, validação de formulário e protocolo.
- **Minhas consultas** com cancelamento em dois passos.
- **Painel da equipe** para simular fila, plantão, leitos e ausências.
- **Acessibilidade**: letra em 3 tamanhos, *Modo acolhedor* (menos estímulos, botões maiores, página simplificada), tema claro/escuro automático, link "pular para o conteúdo", navegação por teclado, leitura em voz alta no assistente.
- **Assistente** de ajuda com perguntas prontas (a conversa livre com IA só funciona dentro do ambiente Claude; fora dele, as perguntas prontas continuam funcionando).

## Como rodar

Não precisa instalar nada além de um servidor estático:

```bash
# opção 1 (Node 18+)
npm start

# opção 2 (Python)
python3 -m http.server 8000   # e abra http://localhost:8000
```

Abrir o `index.html` com duplo clique também funciona para quase tudo, mas a geolocalização exige `http://localhost` ou `https`.

## Testes

```bash
npm test
```

Cobrem o cálculo de demanda, os limites dos níveis, a integridade dos dados, a agenda com ausências e a proteção contra HTML injetado (`node:test`, sem dependências).

## Configurar o Google Maps (opcional)

O site funciona **sem chave**. Para usar o Google:

1. No [Google Cloud Console](https://console.cloud.google.com/), crie um projeto e ative o faturamento.
2. Ative **Maps JavaScript API** e **Places API (New)**. A *Places API* antiga (legacy) não pode mais ser ativada em projetos novos.
3. Crie uma chave de API e **restrinja**: por *HTTP referrer* (`https://SEU-USUARIO.github.io/*` e `http://localhost:*`) e apenas às duas APIs acima.
4. Cole a chave em `js/config.js` (`GOOGLE_MAPS_API_KEY`).

Chaves de navegador ficam visíveis a quem abre o site; por isso a **restrição por domínio é obrigatória**, e não o "esconder" a chave. Se o Google recusar a chave, o site volta sozinho ao OpenStreetMap.

## Publicar no GitHub Pages

O workflow `.github/workflows/pages.yml` roda os testes e publica a cada `push` na `main`. Ative uma vez em **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Estrutura

```
index.html          página única
css/                estilos por seção (tokens.css define cores e temas)
js/config.js        configuração (chave opcional do Google, centro do mapa)
js/data.js          dados fictícios (unidades, médicos, setores, níveis)
js/state.js         estado e persistência local
js/demand.js        regra de cálculo da demanda
js/schedule.js      regras de agenda e ausências
js/maps.js          mapa: Leaflet/OSM e Google Maps com fallback
js/*.js             demais módulos (médicos, agendamento, consultas, equipe, acessibilidade, assistente)
tests/run.js        testes automatizados
```

## Limitações conhecidas

- Dados fictícios e salvos só no navegador (`localStorage`); não há backend nem login.
- O painel da equipe é público (demonstração); num sistema real ficaria atrás de autenticação.
- Nome e telefone digitados no agendamento ficam no navegador da pessoa. Num sistema real seria preciso atender à LGPD (consentimento, finalidade, retenção).
- O caminho "Google Maps" depende de chave e faturamento do próprio autor.

## Tecnologias

HTML5, CSS3, JavaScript (ES5/ES6), [Leaflet](https://leafletjs.com/) 1.9, [OpenStreetMap](https://www.openstreetmap.org/copyright), Google Maps JavaScript API (opcional), GitHub Actions.

## Licença

[MIT](LICENSE)
