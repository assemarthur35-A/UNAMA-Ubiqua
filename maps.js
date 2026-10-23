/* Mapa de hospitais próximos e rotas.
   - Sem chave: OpenStreetMap + Leaflet, mostrando as unidades do protótipo com o nível de demanda.
   - Com chave (js/config.js): Google Maps + Places API (New). Se o Google falhar, volta ao OpenStreetMap. */
'use strict';
(function () {
  var CFG = window.SAUDE_CONFIG || {};
  var CENTER = CFG.CITY_CENTER || { lat: -1.4558, lng: -48.4902 };
  var KEY = String(CFG.GOOGLE_MAPS_API_KEY || '').trim();

  function byId(id) { return document.getElementById(id); }
  var statusEl = byId('mapsStatus'), mapEl = byId('hospitalMap'), resultsEl = byId('nearbyHospitalResults');
  var destEl = byId('routeDestination'), routeBtn = byId('calculateHospitalRoute'), routeSummary = byId('routeSummary');
  var findBtn = byId('findNearbyHospitals'), openBtn = byId('openGoogleMapsSearch'), sortBox = byId('mapSort');
  if (!statusEl || !mapEl) return;

  var user = null;          // posição real do usuário (null até autorizar)
  var items = [];           // lugares exibidos
  var sortMode = 'dist';    // 'dist' | 'demand' (só unidades do protótipo)
  var provider = null;

  function setStatus(msg, isError) { statusEl.textContent = msg; statusEl.classList.toggle('is-error', !!isError); }
  function origin() { return user || CENTER; }
  function fmtKm(v) { return v.toFixed(1).replace('.', ',') + ' km'; }

  function km(a, b) {
    var R = 6371, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLo = (b.lng - a.lng) * r;
    var x = Math.pow(Math.sin(dLa / 2), 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.pow(Math.sin(dLo / 2), 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  function externalDir(it) {
    var u = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(it.lat + ',' + it.lng) + '&travelmode=driving';
    if (user) u += '&origin=' + encodeURIComponent(user.lat + ',' + user.lng);
    return u;
  }
  function getPosition() {
    return new Promise(function (resolve, reject) {
      if (!navigator.geolocation) { reject({ code: 0 }); return; }
      navigator.geolocation.getCurrentPosition(
        function (p) { resolve({ lat: p.coords.latitude, lng: p.coords.longitude }); },
        reject, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
    });
  }

  /* ---------- unidades do protótipo (dados fictícios + demanda calculada) ---------- */
  function demoItems() {
    var o = origin();
    var list = HOSPITALS.filter(function (h) { return typeof h.lat === 'number'; }).map(function (h) {
      var D = demand(h.id);
      return {
        id: h.id, name: h.nome, lat: h.lat, lng: h.lng, demo: true,
        address: h.cat + ' · ' + h.bairro + ' (local ilustrativo)',
        demand: { cls: D.lvl.cls, nome: D.lvl.nome, score: D.score, wait: D.wait },
        dist: km(o, { lat: h.lat, lng: h.lng })
      };
    });
    list.sort(function (a, b) { return sortMode === 'demand' ? a.demand.score - b.demand.score : a.dist - b.dist; });
    return list;
  }

  /* ---------- provedor: Leaflet + OpenStreetMap ---------- */
  var Leaf = {
    name: 'osm', map: null, layer: null, routeLayer: null, markers: [],
    init: function () {
      if (this.map) return Promise.resolve();
      if (!window.L) return Promise.reject(new Error('A biblioteca do mapa (Leaflet) não carregou. Verifique sua conexão.'));
      mapEl.replaceChildren(); mapEl.classList.add('is-live');
      this.map = L.map(mapEl, { center: [CENTER.lat, CENTER.lng], zoom: 12 });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(this.map);
      this.layer = L.layerGroup().addTo(this.map);
      this.routeLayer = L.layerGroup().addTo(this.map);
      return Promise.resolve();
    },
    popup: function (it, i) {
      var box = document.createElement('div'); box.className = 'map-popup';
      var h = document.createElement('strong'); h.textContent = it.name; box.appendChild(h);
      var p = document.createElement('p'); p.textContent = it.address; box.appendChild(p);
      if (it.demand) {
        var d = document.createElement('p');
        d.textContent = 'Demanda ' + it.demand.nome + ' · espera de cerca de ' + it.demand.wait + ' min';
        box.appendChild(d);
      }
      var b = document.createElement('button'); b.type = 'button'; b.className = 'btn small'; b.textContent = 'Traçar rota';
      b.addEventListener('click', function () { choose(i); });
      box.appendChild(b);
      if (it.demo) {
        var v = document.createElement('button'); v.type = 'button'; v.className = 'btn small ghost'; v.textContent = 'Ver detalhes da unidade';
        v.addEventListener('click', function () { selectHospital(it.id, true); });
        box.appendChild(v);
      }
      return box;
    },
    draw: function (list, keep) {
      var self = this, o = origin(), pts = [[o.lat, o.lng]];
      this.layer.clearLayers(); this.routeLayer.clearLayers(); this.markers = [];
      if (user) L.circleMarker([user.lat, user.lng], { radius: 8, color: '#1F5FA8', weight: 3, fillOpacity: 0.9 }).bindTooltip('Você está aqui').addTo(this.layer);
      list.forEach(function (it, i) {
        var cls = it.demand ? it.demand.cls : 'plain';
        var icon = L.divIcon({ className: 'map-pin pin-' + cls, html: '<span>' + (i + 1) + '</span>', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -14] });
        var m = L.marker([it.lat, it.lng], { icon: icon, title: it.name, alt: it.name, keyboard: true }).bindPopup(self.popup(it, i)).addTo(self.layer);
        self.markers.push(m); pts.push([it.lat, it.lng]);
      });
      this.map.invalidateSize();
      if (keep) return;
      if (pts.length > 1) this.map.fitBounds(L.latLngBounds(pts), { padding: [30, 30], maxZoom: 15 });
      else this.map.setView([o.lat, o.lng], 13);
    },
    focus: function (it, i) {
      this.map.setView([it.lat, it.lng], Math.max(this.map.getZoom(), 15));
      if (this.markers[i]) this.markers[i].openPopup();
    },
    route: function (from, it) {
      this.routeLayer.clearLayers();
      L.polyline([[from.lat, from.lng], [it.lat, it.lng]], { color: '#0A6C74', weight: 4, dashArray: '8 8' }).addTo(this.routeLayer);
      return Promise.resolve({
        title: 'Distância em linha reta: ' + fmtKm(km(from, it)),
        detail: 'O trajeto real pelas ruas costuma ser maior. Use o link abaixo para ver a rota completa.'
      });
    },
    search: function () { return Promise.resolve(demoItems()); }
  };

  /* ---------- provedor: Google Maps (Maps JavaScript API + Places API New) ---------- */
  var Goog = {
    name: 'google', loaded: false, lib: null, map: null, info: null, dirs: null, drender: null, markers: [], userMarker: null,
    load: function () {
      var self = this;
      if (this.loaded) return Promise.resolve();
      return new Promise(function (resolve, reject) {
        window.__saudeMapsInit = resolve;
        window.gm_authFailure = function () { reject(new Error('O Google recusou a chave (restrição de domínio, faturamento ou API desativada).')); };
        var s = document.createElement('script');
        s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(KEY) + '&loading=async&v=weekly&language=pt-BR&region=BR&callback=__saudeMapsInit';
        s.async = true;
        s.onerror = function () { reject(new Error('Não foi possível carregar o Google Maps.')); };
        document.head.appendChild(s);
      }).then(function () {
        return Promise.all(['maps', 'marker', 'places', 'routes'].map(function (n) { return google.maps.importLibrary(n); }));
      }).then(function (l) {
        self.lib = { maps: l[0], marker: l[1], places: l[2], routes: l[3] }; self.loaded = true;
      });
    },
    init: function () {
      var self = this;
      return this.load().then(function () {
        if (self.map) return;
        mapEl.replaceChildren(); mapEl.classList.add('is-live');
        self.map = new self.lib.maps.Map(mapEl, { center: origin(), zoom: 13, mapId: CFG.GOOGLE_MAP_ID || 'DEMO_MAP_ID', mapTypeControl: false, streetViewControl: false });
        self.info = new self.lib.maps.InfoWindow();
        self.dirs = new self.lib.routes.DirectionsService();
        self.drender = new self.lib.routes.DirectionsRenderer({ map: self.map });
      });
    },
    draw: function (list, keep) {
      var self = this, bounds = new google.maps.LatLngBounds();
      this.markers.forEach(function (m) { m.map = null; }); this.markers = [];
      if (this.userMarker) { this.userMarker.map = null; this.userMarker = null; }
      if (user) this.userMarker = new this.lib.marker.AdvancedMarkerElement({ map: this.map, position: user, title: 'Você está aqui' });
      bounds.extend(origin());
      list.forEach(function (it, i) {
        var m = new self.lib.marker.AdvancedMarkerElement({ map: self.map, position: { lat: it.lat, lng: it.lng }, title: it.name });
        m.addListener('click', function () { choose(i); });
        self.markers.push(m); bounds.extend({ lat: it.lat, lng: it.lng });
      });
      if (list.length && !keep) this.map.fitBounds(bounds);
    },
    focus: function (it, i) {
      this.map.panTo({ lat: it.lat, lng: it.lng }); this.map.setZoom(16);
      if (this.markers[i]) {
        var box = document.createElement('div'), h = document.createElement('strong'), p = document.createElement('p');
        h.textContent = it.name; p.textContent = it.address; box.appendChild(h); box.appendChild(p);
        this.info.setContent(box); this.info.open({ map: this.map, anchor: this.markers[i] });
      }
    },
    search: function (o) {
      var P = this.lib.places;
      return P.Place.searchNearby({
        fields: ['id', 'displayName', 'location', 'formattedAddress', 'rating', 'userRatingCount'],
        locationRestriction: { center: o, radius: 10000 },
        includedPrimaryTypes: ['hospital'], maxResultCount: 12,
        rankPreference: P.SearchNearbyRankPreference.DISTANCE, language: 'pt-BR', region: 'br'
      }).then(function (res) {
        return res.places.map(function (p) {
          var pos = { lat: p.location.lat(), lng: p.location.lng() };
          return { id: p.id, name: p.displayName, lat: pos.lat, lng: pos.lng, demo: false, dist: km(o, pos),
            address: p.formattedAddress || 'Endereço não informado', rating: p.rating, ratings: p.userRatingCount };
        });
      });
    },
    route: function (from, it) {
      var self = this;
      return this.dirs.route({ origin: from, destination: { lat: it.lat, lng: it.lng }, travelMode: 'DRIVING', provideRouteAlternatives: true })
        .then(function (res) {
          if (!res.routes.length) throw new Error('sem rota');
          res.routes.sort(function (a, b) { return a.legs[0].duration.value - b.legs[0].duration.value; });
          self.drender.setDirections(res); self.drender.setRouteIndex(0);
          var leg = res.routes[0].legs[0];
          return { title: 'Rota sugerida: ' + leg.duration.text, detail: leg.distance.text + ' de carro. O tempo muda conforme o trânsito.' };
        });
    }
  };

  /* ---------- interface ---------- */
  function renderResults() {
    resultsEl.replaceChildren(); destEl.replaceChildren(); routeSummary.replaceChildren();
    if (!items.length) {
      var e = document.createElement('p'); e.className = 'maps-empty'; e.textContent = 'Nenhum hospital encontrado em até 10 km.'; resultsEl.appendChild(e);
      destEl.add(new Option('Nenhum hospital encontrado', '')); destEl.disabled = true; routeBtn.disabled = true; return;
    }
    destEl.add(new Option('Escolha um hospital', ''));
    items.forEach(function (it, i) {
      var card = document.createElement('article'); card.className = 'nearby-hospital-card';
      var h = document.createElement('h4'); h.textContent = (i + 1) + '. ' + it.name;
      var a = document.createElement('p'); a.textContent = it.address;
      var m = document.createElement('p'); m.className = 'maps-place-meta';
      var meta = [fmtKm(it.dist) + (user ? '' : ' do centro')];
      if (it.rating) meta.push('Nota ' + it.rating + (it.ratings ? ' (' + it.ratings + ' avaliações)' : ''));
      m.textContent = meta.join(' · ');
      card.appendChild(h); card.appendChild(a); card.appendChild(m);
      if (it.demand) {
        var pill = document.createElement('span'); pill.className = 'pill ' + it.demand.cls;
        pill.textContent = 'Demanda ' + it.demand.nome + ' · ~' + it.demand.wait + ' min'; card.appendChild(pill);
      }
      var b = document.createElement('button'); b.type = 'button'; b.className = 'btn ghost'; b.textContent = 'Ver no mapa e traçar rota';
      b.addEventListener('click', function () { choose(i); });
      card.appendChild(b); resultsEl.appendChild(card);
      destEl.add(new Option(it.name, String(i)));
    });
    destEl.disabled = false; routeBtn.disabled = true;
  }

  function show(keep) { renderResults(); provider.draw(items, keep); }

  function choose(i) {
    destEl.value = String(i); routeBtn.disabled = false;
    provider.focus(items[i], i);
    calculateRoute();
  }

  function calculateRoute() {
    if (destEl.value === '') { routeSummary.textContent = 'Escolha um hospital antes de calcular a rota.'; return; }
    var it = items[Number(destEl.value)]; if (!it) return;
    routeBtn.disabled = true; routeSummary.textContent = 'Calculando a rota…';
    provider.route(origin(), it).catch(function () {
      return { title: 'Não foi possível traçar a rota no mapa.', detail: 'Abra a navegação pelo link abaixo.' };
    }).then(function (info) {
      routeBtn.disabled = false; routeSummary.replaceChildren();
      var t = document.createElement('strong'); t.textContent = info.title;
      var d = document.createElement('p');
      d.textContent = info.detail + (user ? '' : ' Partindo do centro de Belém; autorize a localização para partir de onde você está.');
      var l = document.createElement('a'); l.href = externalDir(it); l.target = '_blank'; l.rel = 'noopener noreferrer'; l.textContent = 'Abrir navegação no Google Maps';
      routeSummary.appendChild(t); routeSummary.appendChild(d); routeSummary.appendChild(l);
    });
  }

  function useOsm() { provider = Leaf; return Leaf.init(); }

  function findNearby() {
    findBtn.disabled = true;
    setStatus('Solicitando permissão para acessar sua localização…');
    var denied = '';
    getPosition().then(function (p) { user = p; }, function (err) {
      user = null;
      denied = (err && err.code === 1 ? 'Você não autorizou a localização.' : 'Não foi possível obter sua localização.') + ' Distâncias a partir do centro de Belém. ';
    }).then(function () {
      return provider.init().then(function () { return provider.search(origin()); });
    }).catch(function (err) {
      if (provider !== Goog) throw err;   // Google falhou: segue com OpenStreetMap
      denied += (err && err.message ? err.message + ' ' : '') + 'Usando o OpenStreetMap no lugar. ';
      return useOsm().then(function () { return Leaf.search(); });
    }).then(function (list) {
      items = list; show();
      setStatus(denied + (provider.name === 'osm'
        ? 'Unidades do protótipo no mapa. As cores mostram a demanda (dados fictícios); os locais são ilustrativos.'
        : items.length + ' hospital(is) encontrado(s) pelo Google Maps. Confirme endereço e atendimento antes de sair.'), !!denied);
    }).catch(function (err) {
      setStatus((err && err.message) || 'Não foi possível carregar o mapa.', true);
    }).then(function () { findBtn.disabled = false; });
  }

  function onSort(ev) {
    var b = ev.target.closest('button[data-sort]'); if (!b) return;
    sortMode = b.getAttribute('data-sort');
    [].forEach.call(sortBox.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    if (provider && provider.name === 'osm' && provider.map) { items = demoItems(); show(); }
  }

  function boot() {
    if (sortBox) { sortBox.hidden = !!KEY; sortBox.addEventListener('click', onSort); }
    findBtn.addEventListener('click', findNearby);
    openBtn.addEventListener('click', function () {
      var q = user ? 'hospitais perto de ' + user.lat + ',' + user.lng : 'hospitais em Belém PA';
      window.open('https://www.google.com/maps/search/' + encodeURIComponent(q), '_blank', 'noopener,noreferrer');
    });
    routeBtn.addEventListener('click', calculateRoute);
    destEl.addEventListener('change', function () { routeBtn.disabled = destEl.value === ''; routeSummary.textContent = ''; });
    window.addEventListener('resize', function () { if (provider && provider.name === 'osm' && provider.map) provider.map.invalidateSize(); });

    if (KEY) {
      provider = Goog;
      setStatus('Clique em “Encontrar hospitais próximos” para carregar o Google Maps.');
    } else {
      useOsm().then(function () {
        items = demoItems(); show();
        setStatus('Mapa do OpenStreetMap com as unidades do protótipo (dados fictícios, locais ilustrativos). Use o botão para calcular distâncias a partir de você.');
      }).catch(function (err) { setStatus(err.message, true); });
    }
  }

  /* chamado quando os números de demanda mudam (painel da equipe, atualização periódica) */
  window.SaudeMap = {
    refresh: function () {
      if (provider && provider.name === 'osm' && provider.map && items.length && items[0].demo) { items = demoItems(); show(true); }
    }
  };
  boot();
})();
