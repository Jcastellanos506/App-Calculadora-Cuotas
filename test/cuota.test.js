import { test } from "node:test";
import assert from "node:assert/strict";
import handler, { calcularCuota, validar } from "../api/cuota.js";

// Simulacion minima de req/res de Vercel para probar el handler sin desplegar
function mockRes() {
  return {
    statusCode: 200, headers: {}, body: null,
    setHeader(k, v) { this.headers[k] = v; },
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

test("T1: cuota correcta con interes (10.000.000, 18% EA, 36 meses)", () => {
  const r = calcularCuota(10_000_000, 18, 36);
  // Valor de referencia verificado de forma independiente (Python + simulacion mes a mes, saldo final = 0)
  assert.equal(r.cuotaMensual, 354_867.81);
  assert.ok(Math.abs(r.totalPagado - r.cuotaMensual * 36) < 1);
  assert.ok(Math.abs(r.totalIntereses - (r.totalPagado - 10_000_000)) < 0.01);
});

test("T2: tasa 0% divide el monto en partes iguales", () => {
  const r = calcularCuota(1_200_000, 0, 12);
  assert.equal(r.cuotaMensual, 100_000);
  assert.equal(r.totalIntereses, 0);
});

test("T3: handler responde 200 con parametros validos", () => {
  const res = mockRes();
  handler({ method: "GET", query: { monto: "5000000", tasa: "20", meses: "24" } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.moneda, "COP");
  assert.ok(res.body.resultado.cuotaMensual > 0);
});

test("T4: handler responde 400 con parametros invalidos", () => {
  const res = mockRes();
  handler({ method: "GET", query: { monto: "-1", tasa: "abc", meses: "0" } }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.detalles.length, 3);
});

test("T5: handler responde 405 si el metodo no es GET", () => {
  const res = mockRes();
  handler({ method: "POST", query: {} }, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.Allow, "GET");
});

test("T6: validar acepta entrada correcta", () => {
  assert.deepEqual(validar({ monto: 1000, tasa: 10, meses: 12 }), []);
});
