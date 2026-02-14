// Initialize map
let map = L.map("map", {
  center: [-0.1, 36.5],
  zoom: 7
});

let populationLayer;

// === 3 Tile Layers (Base Maps) ===
let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let esriImagery = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
);

let cartoLight = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
  {
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  }
);

let baseMaps = {
  "OpenStreetMap": osm,
  "ESRI World Imagery": esriImagery,
  "CartoDB Light": cartoLight
};

// === Symbology (Quantiles - same as manual) ===
let breaks = [-Infinity, 34, 132, 330, 507, Infinity];
let colors = ['#fef0d9', '#fdcc8a', '#fc8d59', '#e34a33', '#b30000'];

const getColor = (d) => {
  for (let i = 0; i < breaks.length; i++) {
    if (d > breaks[i] && d < breaks[i + 1]) {
      return colors[i];
    }
  }
  return colors[colors.length - 1];
};

const style = (feature) => {
  return {
    fillColor: getColor(feature.properties.density),
    color: "black",
    weight: 0.5,
    opacity: 1,
    fillOpacity: 0.7
  };
};

// === Load GeoJSON + Popups + Legend ===
fetch("data/kenya-adm1-pop.geojson")
  .then(response => response.json())
  .then(data => {
    populationLayer = L.geoJSON(data, {
      style: style,
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`
          <div style="font-family: Arial; min-width: 200px;">
            <b>County:</b> ${feature.properties.NAME_1}<br>
            <b>Population Density:</b> ${feature.properties.density.toFixed(2)} people/km²
          </div>
        `);
      }
    }).addTo(map);

    // Layer control with overlays
    let overlayMaps = {
      "Population Density": populationLayer
    };
    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

    // Legend
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
      let div = L.DomUtil.create("div", "info legend");
      let grades = [0, 34, 132, 330, 507];
      div.innerHTML = "<strong>Population Density<br>(people per km²)</strong><br>";

      for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="background:' + getColor(grades[i] + 0.1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? ' – ' + grades[i + 1] : '+') + '<br>';
      }
      return div;
    };
    legend.addTo(map);
  });
