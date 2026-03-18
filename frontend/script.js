let map;
let socket = io("http://localhost:3000");
let directionsService;
let directionsRenderer;

function initMap() {

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: { lat: -5.09, lng: -42.80 }
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();

  directionsRenderer.setMap(map);
}

function modoMotorista() {

  navigator.geolocation.watchPosition((pos) => {

    const data = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    };

    socket.emit("driverOnline", data);
    socket.emit("updateLocation", data);

  });
}

function desenharRota(origem, destino) {

  directionsService.route({
    origin: origem,
    destination: destino,
    travelMode: "DRIVING"
  }, (result, status) => {

    if (status === "OK") {
      directionsRenderer.setDirections(result);
    }
  });
}
