export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYW5qdWxpb24iLCJhIjoiY2poeW1ndzNhMG00MjNrcGdja3M5cGQ5eiJ9.bas46qtu3r5us1kzna4Glw';
  let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/anjulion/ck59pg0h70sob1cmsbz9spf6w',
    scrollZoom: false,
    maxZoom: 18
    // center: [2.302817, 48.796338],
    // zoom: 10,
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();
  for (let [key, loc] of Object.entries(locations)) {
    if (key === 'coordinates') {
      let coordinates = loc;
      // Create marker
      const el = document.createElement('div');
      el.className = 'marker';

      // Add marker
      new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat(coordinates)
        .addTo(map);

      // Add popup
      new mapboxgl.Popup({
        offset: 30
      })
        .setLngLat(coordinates)
        .setHTML(`<p>${coordinates}</p>`)
        .addTo(map);
      // Extend the map bounds to include location
      bounds.extend(coordinates);
    }
  }

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 200,
      left: 100,
      right: 100
    }
  });
};
