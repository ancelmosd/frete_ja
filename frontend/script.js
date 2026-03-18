let map;
let socket = io("freteja-production.up.railway.app");
let directionsService;
let directionsRenderer;

let autocompleteOrigem;
let autocompleteDestino;

let precoAtual = 0;

function initMap() {

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: { lat: -5.09, lng: -42.80 }
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();

  directionsRenderer.setMap(map);

  initAutocomplete();
}

function initAutocomplete() {
  autocompleteOrigem = new google.maps.places.Autocomplete(
    document.getElementById("origem")
  );

  autocompleteDestino = new google.maps.places.Autocomplete(
    document.getElementById("destino")
  );
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

function modoCliente() {
  alert("Modo cliente ativo");
}

function calcularRota() {

  const origem = document.getElementById("origem").value;
  const destino = document.getElementById("destino").value;

  directionsService.route({
    origin: origem,
    destination: destino,
    travelMode: "DRIVING"
  }, (result, status) => {

    if (status === "OK") {

      directionsRenderer.setDirections(result);

      const distanciaMetros = result.routes[0].legs[0].distance.value;
      const distanciaKm = distanciaMetros / 1000;

      calcularPreco(distanciaKm);

    }
  });
}

function calcularPreco(distancia) {

  const base = 5;
  const porKm = 2.5;

  precoAtual = base + distancia * porKm;

  document.getElementById("preco").innerHTML =
    "Preço estimado: R$ " + precoAtual.toFixed(2);
}

function chamarMotorista() {

  socket.emit("requestRide", {
    origem: autocompleteOrigem.getPlace().geometry.location.toJSON(),
    destino: autocompleteDestino.getPlace().geometry.location.toJSON(),
    preco: precoAtual
  });

  alert("Procurando motorista...");
}

socket.on("newRequest", (data) => {

  if (confirm("Nova corrida R$ " + data.preco.toFixed(2))) {
    alert("Corrida aceita (simulação)");
  }

});
