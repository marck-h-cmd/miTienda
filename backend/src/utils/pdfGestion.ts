
import puppeteer from 'puppeteer';
import { config } from '../config';
import { formatearFecha } from './dateHelpers';
import logger from './logger';

/**
 * Genera un PDF de gestión usando Puppeteer con HTML y gráficos embebidos
 */
export async function generarPDFGestion(
  titulo: string,
  datos: any[],
  columnas: string[],
  campos: string[],
  campoGrafico?: string
): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    const html = generarHTMLReporte(titulo, datos, columnas, campos);

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size:10px; text-align:center; width:100%;">
          ${config.empresa.nombre} - ${titulo}
        </div>
      `,
      footerTemplate: `
        <div style="font-size:8px; text-align:center; width:100%;">
          Página <span class="pageNumber"></span> de <span class="totalPages"></span> | Generado: ${formatearFecha(new Date())}
        </div>
      `,
    });

    return Buffer.from(pdf);
  } catch (error) {
    logger.error('Error generando PDF de gestión:', error);
    throw new Error('Error al generar el reporte PDF');
  } finally {
    await browser.close();
  }
}

function generarHTMLReporte(
  titulo: string,
  datos: any[],
  columnas: string[],
  campos: string[]
): string {
  const filas = datos.map((dato) => {
    return `
      <tr>
        ${campos.map((campo) => `<td>${dato[campo] || '-'}</td>`).join('')}
      </tr>
    `;
  }).join('');

  // Calcular totales si hay campo numérico
  let resumenHTML = '';
  if (campos.length > 1) {
    const totales = campos.map((campo) => {
      const total = datos.reduce((sum, d) => sum + (Number(d[campo]) || 0), 0);
      return `<td><strong>${total.toFixed(2)}</strong></td>`;
    }).join('');

    resumenHTML = `
      <tfoot>
        <tr style="background-color: #e0e0e0;">
          <td><strong>TOTALES</strong></td>
          ${totales}
        </tr>
      </tfoot>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #2c3e50;
          padding-bottom: 15px;
        }
        .header h1 {
          color: #2c3e50;
          font-size: 24px;
          margin: 0 0 10px 0;
        }
        .header .empresa {
          font-size: 14px;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background-color: #2c3e50;
          color: white;
          padding: 10px;
          font-size: 11px;
          text-align: left;
        }
        td {
          padding: 8px;
          font-size: 10px;
          border-bottom: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .resumen {
          margin-top: 30px;
          padding: 15px;
          background-color: #f0f7ff;
          border-radius: 5px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 9px;
          color: #999;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${titulo}</h1>
        <div class="empresa">
          ${config.empresa.nombre} | RUC: ${config.empresa.ruc} | ${config.empresa.direccion}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            ${columnas.map((col) => `<th>${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${datos.map((dato, index) => `
            <tr>
              <td>${index + 1}</td>
              ${campos.map((campo) => {
                const valor = dato[campo];
                if (typeof valor === 'number') {
                  return `<td style="text-align: right;">${config.negocio.monedaDefecto} ${valor.toFixed(2)}</td>`;
                }
                return `<td>${valor || '-'}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="background-color: #e0e0e0; font-weight: bold;">
            <td colspan="1">TOTAL</td>
            ${campos.slice(1).map((campo) => {
              const total = datos.reduce((sum, d) => sum + (Number(d[campo]) || 0), 0);
              return `<td style="text-align: right;">${config.negocio.monedaDefecto} ${total.toFixed(2)}</td>`;
            }).join('')}
          </tr>
        </tfoot>
      </table>

      <div class="resumen">
        <strong>Resumen Ejecutivo</strong>
        <p>Total de registros: ${datos.length}</p>
        <p>Período: ${formatearFecha(new Date())}</p>
      </div>

      <div class="footer">
        Este reporte fue generado automáticamente por el Sistema de E-Commerce.
        Para cualquier consulta, contactar a ${config.empresa.email}
      </div>
    </body>
    </html>
  `;
}