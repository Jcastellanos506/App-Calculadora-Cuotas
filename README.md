# App Calculadora de Cuotas

Función serverless (Vercel Functions, Node.js) que calcula la cuota mensual de un préstamo con amortización francesa (cuota fija).

## Endpoint

`GET /api/cuota?monto=10000000&tasa=18&meses=36`

| Parámetro | Descripción |
|-----------|-------------|
| `monto`   | Valor del préstamo (COP) |
| `tasa`    | Tasa efectiva anual en % (0 a 200) |
| `meses`   | Plazo en meses (1 a 480) |

Respuestas: `200` con el cálculo, `400` si los parámetros son inválidos, `405` si el método no es GET.

## Pruebas

```bash
npm test          # pruebas unitarias (node:test)
npm run dev       # servidor local en http://localhost:3000/api/cuota
```

## Despliegue en Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

También se puede importar este repositorio desde el panel de Vercel (Add New > Project).
