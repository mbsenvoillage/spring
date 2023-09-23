import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let dentifrice = {
  name: "dentifrice",
  price: 2.99,
  ean: "2453467568907",
};

let chocos = {
  name: "Chocos BN",
  price: 1.65,
  ean: "2453467534907",
};

let nutella = {
  name: "Nutella",
  price: 4.32,
  ean: "6785674563564",
};

let total;

const items = [dentifrice, chocos, nutella];

wss.on("connection", function connection(ws) {
  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });

  setInterval(() => {
    let index = Math.round(Math.random() * 2);
    items[index].price = Math.floor(Math.random() * (1000 - 100) + 100) / 100;
    total = items.reduce((acc, prev) => acc + prev.price, 0).toFixed(2);
    let props = {
      items,
      isOnline: Boolean(Math.floor(Math.random() * 2)),
      total,
    };
    ws.send(JSON.stringify(props));
  }, 3000);
});
