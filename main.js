// 1) Initialize map (manual suggests Kenya center like [-0.1, 36.5]) :contentReference[oaicite:3]{index=3}
let map = L.map("map", {
  center: [-0.1, 36.5],
  zoom: 7,
});

let populationLayer;

// 2) Add 3 tile layers (you need at least 3) :contentReference[oaicite:4]{index=4}
let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let esriImagery = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { attribution: "Tiles &copy; Esri" }
);

let cartoLight = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  { attribution: "&copy; CartoDB" }
);

let baseMaps = {
  "OpenStreetMap": osm,
  "ESRI World Imagery": esriImagery,
  "Carto Light": cartoLight,
};

// 3) Breakpoints + colors (from the manual example) :contentReference[oaicite:5]{index=5}
let breaks = [-Infinity, 34, 132, 330, 507, Infinity];
let colors = ["#fef0d9", "#fdcc8a", "#fc8d59", "#e34a33", "#b30000"];

// 4) Color function (manual logic) :contentReference[oaicite:6]{index=6}
const population_color = (d) => {
  for (let i = 0; i < breaks.length - 1; i++) {
    if (d > breaks[i] && d <= breaks[i + 1]) {
      return colors[i];
    }
  }
  return colors[0];
};

// 5) Style function for choropleth :contentReference[oaicite:7]{index=7}
const population_style = (feature) => {
  return {
    fillColor: population_color(feature.properties.density),
    color: "black",
    opacity: 1,
    fillOpacity: 0.7,
    weight: 0.5,
  };
};

// 6) Fetch geojson + add popups :contentReference[oaicite:8]{index=8}
fetch("data/kenya-adm1-pop.geojson")
  .then((response) => response.json())
  .then((data) => {
    populationLayer = L.geoJSON(data, {
      style: population_style,
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`
          <div>
            <b>County:</b> ${feature.properties.NAME_1}<br>
            <b>Pop. Density:</b> ${Number(feature.properties.density).toFixed(2)} per Sq. Km
          </div>
        `);
      },
    }).addTo(map);

    // Optional: layer control includes the population layer too
    L.control.layers(baseMaps, { "Population Density": populationLayer }).addTo(map);
  });

// 7) Legend (shows ranges + colors)
let legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
  let div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<b>Population Density</b><br>(per Sq. Km)<br><br>";

  for (let i = 0; i < breaks.length - 1; i++) {
    let from = breaks[i];
    let to = breaks[i + 1];

    // handle Infinity nicely
    let label =
      (from === -Infinity ? "0" : from) +
      " – " +
      (to === Infinity ? "+" : to);

    div.innerHTML +=
      `<i style="background:${colors[i]}"></i> ${label}<br>`;
  }

  return div;
};

legend.addTo(map);
