// Initialize map
let map = L.map("map", {
  center: [-0.1, 36.5],
  zoom: 7
});

// 3 Tile Layers
let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap"
}).addTo(map);

let esriImagery = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles &copy; Esri"
});

let cartoLight = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap &copy; CARTO"
});

let baseMaps = {
  "OpenStreetMap": osm,
  "ESRI World Imagery": esriImagery,
  "CartoDB Light": cartoLight
};

// Symbology (Quantiles from the manual)
let breaks = [-Infinity, 34, 132, 330, 507, Infinity];
let colors = ['#fef0d9', '#fdcc8a', '#fc8d59', '#e34a33', '#b30000'];

const getColor = (d) => {
  for (let i = 0; i < breaks.length - 1; i++) {
    if (d >= breaks[i] && d < breaks[i + 1]) return colors[i];
  }
  return colors[colors.length - 1];
};

const style = (feature) => ({
  fillColor: getColor(feature.properties.density),
  color: "#333",
  weight: 0.8,
  opacity: 1,
  fillOpacity: 0.75
});

// Load data (now from root, since the file is there)
fetch("kenya-adm1-pop.geojson")
  .then(r => r.json())
  .then(data => {
    let populationLayer = L.geoJSON(data, {
      style: style,
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`
          <b>${feature.properties.NAME_1}</b><br>
          Population Density: ${feature.properties.density.toFixed(1)} /km²
        `);
      }
    }).addTo(map);

    // Layer control
    L.control.layers(baseMaps, { "Population Density": populationLayer }, { collapsed: false }).addTo(map);

    // Legend
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
      let div = L.DomUtil.create("div", "info legend");
      let grades = [0, 34, 132, 330, 507];
      div.innerHTML = "<strong>Pop. Density (people/km²)</strong><br>";
      for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
          `<i style="background:${getColor(grades[i] + 1)}; border: 1px solid #999;"></i> ` +
          `${grades[i]}${grades[i + 1] ? "–" + grades[i + 1] : "+"}<br>`;
      }
      return div;
    };
    legend.addTo(map);
  });
