const locations = JSON.parse(document.getElementById("map").dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2hpdmFtMTAxMDEiLCJhIjoiY2xzMzZzZ3RxMGowaDJrbXE3OTY1bHpwayJ9.zz0iSFBG6QyTBuYTveSKWw";
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  center: [77.100281, 28.55616],
  zoom: 10,
  scrollZoom: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.map((loc) => {
  const el = document.createElement("div");
  el.className = "marker";

  new mapboxgl.Marker({
    element: el,
    anchor: "bottom",
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  new mapboxgl.Popup({
    offset: 42,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    left: 200,
    right: 200,
    bottom: 150,
  },
});
