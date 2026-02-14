let map = L.map("map", {
  center: [-0.1, 36.5],
  zoom: 7,
});

let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap",
}).addTo(map);

let esriImagery = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { attribution: "Tiles © Esri" }
);

let cartoLight = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  { attribution: "&copy; Carto" }
);

let baseMaps = {
  OpenStreetMap: osm,
  "ESRI World Imagery": esriImagery,
  "Carto Light": cartoLight,
};

// Manual break values + colors :contentReference[oaicite:12]{index=12}
let breaks = [-Infinity, 34, 132, 330, 507, Infinity];
let colors = ["#fef0d9", "#fdcc8a", "#fc8d59", "#e34a33", "#b30000"];

// Read density even if field name differs
function getDensity(props) {
  return (
    props?.density ??
    props?.Density ??
    props?.pop_density ??
    props?.popDensity ??
    props?.POP_DENS ??
    null
  );
}

const population_color = (d) => {
  if (d === null || d === undefined || isNaN(d)) return "#cccccc";
  for (let i = 0; i < breaks.length - 1; i++) {
    if (d > breaks[i] && d <= breaks[i + 1]) return colors[i];
  }
  return colors[0];
};

const population_style = (feature) => {
  const d = Number(getDensity(feature.properties));
  return {
    fillColor: population_color(d),
    color: "black",
    opacity: 1,
    fillOpacity: 0.7,
    weight: 0.5,
  };
};

fetch("data/kenya-adm1-pop.geojson") // manual path :contentReference[oaicite:13]{index=13}
  .then((r) => r.json())
  .then((data) => {
    const layer = L.geoJSON(data, {
      style: population_style,
      onEachFeature: (feature, lyr) => {
        const county =
          feature.properties?.NAME_1 ??
          feature.properties?.name ??
          "County";

        const dens = getDensity(feature.properties);
        lyr.bindPopup(`
          <div>
            <b>County:</b> ${county}<br>
            <b>Pop. Density:</b> ${dens !== null ? Number(dens).toFixed(2) : "N/A"} per Sq. Km
          </div>
        `);
      },
    }).addTo(map);

    map.fitBounds(layer.getBounds());
    L.control.layers(baseMaps, { "Population Density": layer }).addTo(map);
  })
  .catch((e) => console.error("Choropleth load error:", e));
