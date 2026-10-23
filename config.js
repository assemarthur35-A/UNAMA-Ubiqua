/* Configuração do site. Este arquivo pode ir para o GitHub: NÃO coloque aqui uma chave sem restrição.
   - Sem chave: o mapa usa OpenStreetMap + Leaflet (grátis, sem cadastro).
   - Com chave do Google Maps: restrinja-a por domínio (HTTP referrer) e só às APIs
     "Maps JavaScript API" e "Places API (New)" no Google Cloud Console. */
window.SAUDE_CONFIG = {
  GOOGLE_MAPS_API_KEY: '',
  GOOGLE_MAP_ID: 'DEMO_MAP_ID',
  CITY_CENTER: { lat: -1.4558, lng: -48.4902 } // Belém (PA)
};
