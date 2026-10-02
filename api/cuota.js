// api/cuota.js
// Función serverless (Vercel Functions - Node.js) que calcula la cuota mensual
// de un préstamo con el sistema de amortización francés (cuota fija).
//
// Uso:  GET /api/cuota?monto=10000000&tasa=18&meses=36
//   monto -> valor del préstamo (COP)
//   tasa  -> tasa de interés efectiva anual en % (ej: 18)
//   meses -> plazo en meses

function calcularCuota(monto, tasaEA, meses) {
  // Convertir tasa efectiva anual a tasa efectiva mensual
  const i = Math.pow(1 + tasaEA / 100, 1 / 12) - 1;

  // Caso especial: tasa 0% -> cuota = monto / meses
  const cuota = i === 0
    ? monto / meses
    : (monto * i) / (1 - Math.pow(1 + i, -meses));

  const totalPagado = cuota * meses;
  return {
    cuotaMensual: Math.round(cuota * 100) / 100,
    totalPagado: Math.round(totalPagado * 100) / 100,
    totalIntereses: Math.round((totalPagado - monto) * 100) / 100,
    tasaMensualPct: Math.round(i * 100 * 10000) / 10000,
  };
}

function validar({ monto, tasa, meses }) {
  const errores = [];
  if (!Number.isFinite(monto) || monto <= 0) errores.push("'monto' debe ser un número mayor que 0");
  if (!Number.isFinite(tasa) || tasa < 0 || tasa > 200) errores.push("'tasa' debe estar entre 0 y 200 (% efectivo anual)");
  if (!Number.isInteger(meses) || meses < 1 || meses > 480) errores.push("'meses' debe ser un entero entre 1 y 480");
  return errores;
}

// Handler que Vercel invoca en cada petición HTTP
export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método no permitido. Usa GET." });
  }

  const { monto, tasa, meses } = req.query;
  const datos = {
    monto: Number(monto),
    tasa: Number(tasa),
    meses: Number(meses),
  };

  const errores = validar(datos);
  if (errores.length > 0) {
    return res.status(400).json({ error: "Parámetros inválidos", detalles: errores });
  }

  const resultado = calcularCuota(datos.monto, datos.tasa, datos.meses);
  return res.status(200).json({
    entrada: datos,
    resultado,
    moneda: "COP",
    generadoEn: new Date().toISOString(),
  });
}

export { calcularCuota, validar };
