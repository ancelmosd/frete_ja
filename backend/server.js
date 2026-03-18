const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

let drivers = {};

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) *
    Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

io.on("connection", (socket) => {

  socket.on("driverOnline", (data) => {
    drivers[socket.id] = { ...data };
  });

  socket.on("updateLocation", (data) => {
    if (drivers[socket.id]) {
      drivers[socket.id] = data;
    }
  });

  socket.on("requestRide", (data) => {

    let closestDriver = null;
    let minDistance = Infinity;

    for (let id in drivers) {
      const d = calcularDistancia(
        data.origem.lat,
        data.origem.lng,
        drivers[id].lat,
        drivers[id].lng
      );

      if (d < minDistance) {
        minDistance = d;
        closestDriver = id;
      }
    }

    if (closestDriver) {
      const preco = 5 + minDistance * 2.5;

      io.to(closestDriver).emit("newRequest", {
        origem: data.origem,
        distancia: minDistance,
        preco
      });
    }
  });

  socket.on("disconnect", () => {
    delete drivers[socket.id];
  });

});

server.listen(process.env.PORT || 3000, () => console.log("Rodando"));
