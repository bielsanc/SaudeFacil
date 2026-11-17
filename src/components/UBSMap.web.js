import React from 'react';

function safeJson(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

function mapDocument(coords, unidades) {
  const center = coords || { latitude: -14.235, longitude: -51.9253 };
  const zoom = coords ? 14 : 4;
  const data = safeJson({ coords, unidades });
  return `<!doctype html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap" rel="stylesheet">
<style>
html,body,#map{height:100%;width:100%;margin:0}
body,.leaflet-container,.leaflet-popup-content,.leaflet-control{font-family:'Poppins',sans-serif}
.clinic-pin{background:#238bc4;border:2px solid white;border-radius:50% 50% 50% 0;box-shadow:0 2px 5px #555;transform:rotate(-45deg);width:25px;height:25px}
.clinic-pin span{display:block;transform:rotate(45deg);color:white;text-align:center;font:bold 16px 'Poppins',sans-serif;line-height:21px}
</style>
</head><body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
const data=${data};
const map=L.map('map').setView([${center.latitude},${center.longitude}],${zoom});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
function escapeHtml(value){return String(value||'').replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}
if(data.coords){L.circleMarker([data.coords.latitude,data.coords.longitude],{radius:8,color:'#fff',weight:3,fillColor:'#4285f4',fillOpacity:1}).addTo(map).bindPopup('Você está aqui')}
const bounds=[];
if(data.coords) bounds.push([data.coords.latitude,data.coords.longitude]);
data.unidades.forEach(function(u){const point=[u.latitude,u.longitude];bounds.push(point);const route='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(u.latitude+','+u.longitude)+'&travelmode=driving';const label=escapeHtml(u.nome);const detail=[u.endereco,u.distanciaKm!=null?u.distanciaKm+' km':'' ].filter(Boolean).map(escapeHtml).join(' · ');const icon=L.divIcon({className:'',html:'<div class="clinic-pin"><span>+</span></div>',iconSize:[29,29],iconAnchor:[14,27]});L.marker(point,{icon:icon}).addTo(map).bindPopup('<strong>'+label+'</strong><br>'+detail+'<br><a href="'+route+'" target="_blank" rel="noopener">Abrir rota</a>')});
if(bounds.length>1)map.fitBounds(bounds,{padding:[24,24],maxZoom:15});
</script></body></html>`;
}

export default function UBSMap({ coords, unidades }) {
  return React.createElement('iframe', {
    title: 'Mapa real das UBS próximas',
    srcDoc: mapDocument(coords, unidades),
    loading: 'lazy',
    referrerPolicy: 'no-referrer',
    style: { width: '100%', height: '100%', border: 0, display: 'block' },
  });
}
