// Servidor local que emula la ruta /api/cuota para probar con curl antes de desplegar
import http from "node:http";
import handler from "../api/cuota.js";

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost:3000");
  if (url.pathname !== "/api/cuota") { res.statusCode = 404; return res.end("No encontrado"); }
  req.query = Object.fromEntries(url.searchParams);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => res.end(JSON.stringify(b, null, 2));
  handler(req, res);
});
server.listen(3000, () => console.log("Servidor local en http://localhost:3000/api/cuota"));
