import PDFDocument from 'pdfkit';
import { config } from '../config';
import { formatearFechaHora, formatearFecha } from './dateHelpers';

// ─── Design Tokens ────────────────────────────────────────────────────────────

const COLORS = {
  // Brand palette
  primary:      '#0F172A', // Slate 900 — headers, heavy text
  secondary:    '#1E3A5F', // Deep navy — accent band
  accent:       '#3B82F6', // Blue 500 — highlights & links
  accentLight:  '#DBEAFE', // Blue 100 — row tint
  accentMid:    '#93C5FD', // Blue 300 — decorative rule

  // Neutrals
  white:        '#FFFFFF',
  surface:      '#F8FAFC', // Slate 50
  border:       '#E2E8F0', // Slate 200
  mutedText:    '#64748B', // Slate 500
  bodyText:     '#334155', // Slate 700

  // Status
  success:      '#10B981',
  warning:      '#F59E0B',
  danger:       '#EF4444',
};

const FONT = {
  bold:   'Helvetica-Bold',
  normal: 'Helvetica',
  oblique:'Helvetica-Oblique',
};

const LAYOUT = {
  marginLeft:   45,
  marginRight:  45,
  headerHeight: 100,
  footerY:      (pageHeight: number) => pageHeight - 38,
  contentTop:   115,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pageWidth(doc: PDFKit.PDFDocument): number {
  return doc.page.width - LAYOUT.marginLeft - LAYOUT.marginRight;
}

function drawRect(
  doc: PDFKit.PDFDocument,
  x: number, y: number,
  w: number, h: number,
  color: string,
  radius = 0
): void {
  doc.save().roundedRect(x, y, w, h, radius).fill(color).restore();
}

function drawLine(
  doc: PDFKit.PDFDocument,
  x1: number, y1: number,
  x2: number, y2: number,
  color: string,
  width = 0.5
): void {
  doc.save().moveTo(x1, y1).lineTo(x2, y2)
    .strokeColor(color).lineWidth(width).stroke().restore();
}

// ─── Header ───────────────────────────────────────────────────────────────────

function renderHeader(
  doc: PDFKit.PDFDocument,
  titulo: string,
  subtitulo?: string
): void {
  const pw = doc.page.width;

  // Deep navy background band
  drawRect(doc, 0, 0, pw, LAYOUT.headerHeight, COLORS.secondary);

  // Thin accent stripe at bottom of band
  drawRect(doc, 0, LAYOUT.headerHeight - 3, pw, 3, COLORS.accent);

  // Decorative right-side geometric element
  doc.save()
    .opacity(0.12)
    .circle(pw - 30, LAYOUT.headerHeight / 2, 75)
    .fill(COLORS.white)
    .restore();

  doc.save()
    .opacity(0.07)
    .circle(pw - 80, LAYOUT.headerHeight + 10, 55)
    .fill(COLORS.white)
    .restore();

  // Company name
  doc.font(FONT.bold)
     .fontSize(13)
     .fillColor(COLORS.white)
     .text(config.empresa.nombre.toUpperCase(), LAYOUT.marginLeft, 18, {
       characterSpacing: 1.5,
     });

  // RUC / address — muted
  doc.font(FONT.normal)
     .fontSize(8)
     .fillColor(COLORS.accentMid)
     .text(`RUC ${config.empresa.ruc}  ·  ${config.empresa.direccion}`, LAYOUT.marginLeft, 36);

  // Report title
  doc.font(FONT.bold)
     .fontSize(19)
     .fillColor(COLORS.white)
     .text(titulo, LAYOUT.marginLeft, 55);

  // Optional subtitle / date range
  if (subtitulo) {
    doc.font(FONT.normal)
       .fontSize(9)
       .fillColor(COLORS.accentMid)
       .text(subtitulo, LAYOUT.marginLeft, 80);
  }
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function renderFooter(doc: PDFKit.PDFDocument, pageNum: number, total: number): void {
  const pw = doc.page.width;
  const fy = LAYOUT.footerY(doc.page.height);

  // Hairline rule
  drawLine(doc, LAYOUT.marginLeft, fy - 6, pw - LAYOUT.marginRight, fy - 6, COLORS.border, 0.4);

  // Left: timestamp
  doc.font(FONT.normal)
     .fontSize(7.5)
     .fillColor(COLORS.mutedText)
     .text(`Generado: ${formatearFechaHora(new Date())}`, LAYOUT.marginLeft, fy, { width: 220 });

  // Right: page indicator
  doc.font(FONT.bold)
     .fontSize(7.5)
     .fillColor(COLORS.accent)
     .text(`${pageNum} / ${total}`, pw - LAYOUT.marginRight - 40, fy, {
       width: 40, align: 'right',
     });

  // Center: company brand mark
  doc.font(FONT.oblique)
     .fontSize(7)
     .fillColor(COLORS.border)
     .text('Sistema de E-Commerce', 0, fy, { width: pw, align: 'center' });
}

// ─── Section Title ────────────────────────────────────────────────────────────

export function agregarSeccion(
  doc: PDFKit.PDFDocument,
  titulo: string
): void {
  doc.moveDown(0.6);

  const y = doc.y;
  const pw = pageWidth(doc);

  drawRect(doc, LAYOUT.marginLeft, y, pw, 20, COLORS.accentLight, 3);
  drawRect(doc, LAYOUT.marginLeft, y, 3, 20, COLORS.accent, 1);

  doc.font(FONT.bold)
     .fontSize(9)
     .fillColor(COLORS.secondary)
     .text(titulo.toUpperCase(), LAYOUT.marginLeft + 10, y + 6, {
       characterSpacing: 0.8,
     });

  doc.moveDown(1.2);
}

// ─── KPI Cards row ────────────────────────────────────────────────────────────

export interface KPICard {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function agregarKPIs(
  doc: PDFKit.PDFDocument,
  kpis: KPICard[]
): void {
  const pw = pageWidth(doc);
  const cardW = (pw - (kpis.length - 1) * 8) / kpis.length;
  const cardH = 44;
  let x = LAYOUT.marginLeft;
  const y = doc.y;

  kpis.forEach((kpi) => {
    // Card background
    drawRect(doc, x, y, cardW, cardH, COLORS.surface, 4);
    // Left accent
    const accentColor = kpi.trend === 'up' ? COLORS.success
      : kpi.trend === 'down' ? COLORS.danger
      : COLORS.accent;
    drawRect(doc, x, y, 3, cardH, accentColor, 2);

    // Value
    doc.font(FONT.bold).fontSize(14).fillColor(COLORS.primary)
       .text(kpi.value, x + 10, y + 6, { width: cardW - 14 });

    // Label
    doc.font(FONT.normal).fontSize(7.5).fillColor(COLORS.mutedText)
       .text(kpi.label.toUpperCase(), x + 10, y + 27, {
         width: cardW - 14,
         characterSpacing: 0.4,
       });

    x += cardW + 8;
  });

  doc.moveDown(3.8);
}

// ─── Table ────────────────────────────────────────────────────────────────────

export interface TableColumn {
  header: string;
  width?: number;       // fraction of content width (auto-distribute if omitted)
  align?: 'left' | 'right' | 'center';
  format?: (v: any) => string;
}

export function agregarTabla(
  doc: PDFKit.PDFDocument,
  columns: TableColumn[],
  rows: any[][],
  options?: {
    showTotals?: boolean;
    totalsLabel?: string;
    alternateRows?: boolean;
    compact?: boolean;
  }
): void {
  const opts = { alternateRows: true, compact: false, ...options };
  const pw = pageWidth(doc);
  const ROW_H = opts.compact ? 14 : 17;
  const HEAD_H = 22;
  const CELL_PAD = 6;

  // Distribute column widths
  const totalFrac = columns.reduce((s, c) => s + (c.width ?? 1), 0);
  const colWidths = columns.map((c) => ((c.width ?? 1) / totalFrac) * pw);

  // ── Header row ──
  const startX = LAYOUT.marginLeft;
  let y = doc.y;

  // Check page space
  if (y + HEAD_H + ROW_H > doc.page.height - 60) {
    doc.addPage();
    y = LAYOUT.contentTop;
  }

  drawRect(doc, startX, y, pw, HEAD_H, COLORS.secondary, 3);

  let x = startX;
  columns.forEach((col, i) => {
    doc.font(FONT.bold)
       .fontSize(8)
       .fillColor(COLORS.white)
       .text(col.header.toUpperCase(), x + CELL_PAD, y + 7, {
         width: colWidths[i] - CELL_PAD * 2,
         align: col.align ?? 'left',
         characterSpacing: 0.4,
       });
    x += colWidths[i];
  });

  y += HEAD_H;

  // ── Data rows ──
  rows.forEach((row, rowIdx) => {
    if (y + ROW_H > doc.page.height - 60) {
      doc.addPage();
      y = LAYOUT.contentTop;
      // Repeat header on new page
      drawRect(doc, startX, y, pw, HEAD_H, COLORS.secondary, 0);
      let hx = startX;
      columns.forEach((col, i) => {
        doc.font(FONT.bold).fontSize(8).fillColor(COLORS.white)
           .text(col.header.toUpperCase(), hx + CELL_PAD, y + 7, {
             width: colWidths[i] - CELL_PAD * 2,
             align: col.align ?? 'left',
             characterSpacing: 0.4,
           });
        hx += colWidths[i];
      });
      y += HEAD_H;
    }

    // Row background
    if (opts.alternateRows && rowIdx % 2 === 1) {
      drawRect(doc, startX, y, pw, ROW_H, COLORS.accentLight, 0);
    }

    // Bottom border
    drawLine(doc, startX, y + ROW_H, startX + pw, y + ROW_H, COLORS.border, 0.3);

    x = startX;
    row.forEach((cell, i) => {
      const col = columns[i];
      const value = col?.format ? col.format(cell) : String(cell ?? '—');
      doc.font(FONT.normal)
         .fontSize(opts.compact ? 7.5 : 8)
         .fillColor(COLORS.bodyText)
         .text(value, x + CELL_PAD, y + (ROW_H - 8) / 2, {
           width: colWidths[i] - CELL_PAD * 2,
           align: col?.align ?? 'left',
           lineBreak: false,
         });
      x += colWidths[i];
    });

    y += ROW_H;
  });

  // ── Totals row ──
  if (opts.showTotals) {
    if (y + ROW_H + 2 > doc.page.height - 60) {
      doc.addPage();
      y = LAYOUT.contentTop;
    }
    drawRect(doc, startX, y + 2, pw, ROW_H, COLORS.primary, 3);

    x = startX;
    columns.forEach((col, i) => {
      const isFirst = i === 0;
      const value = isFirst
        ? (opts.totalsLabel ?? 'TOTAL').toUpperCase()
        : rows.reduce((sum, row) => {
            const n = parseFloat(String(row[i]).replace(/[^0-9.-]/g, ''));
            return sum + (isNaN(n) ? 0 : n);
          }, 0).toFixed(2);

      doc.font(FONT.bold)
         .fontSize(8)
         .fillColor(COLORS.white)
         .text(
           isFirst ? value : (col.format ? col.format(parseFloat(value)) : value),
           x + CELL_PAD, y + 2 + (ROW_H - 8) / 2,
           {
             width: colWidths[i] - CELL_PAD * 2,
             align: isFirst ? 'left' : (col.align ?? 'right'),
             lineBreak: false,
           }
         );
      x += colWidths[i];
    });

    y += ROW_H + 2;
  }

  // Move cursor past table
  doc.moveDown(1);
  // Manually set Y since PDFKit cursor can drift
  (doc as any).y = y + 8;
}

// ─── Divider ─────────────────────────────────────────────────────────────────

export function agregarDivisor(doc: PDFKit.PDFDocument): void {
  doc.moveDown(0.5);
  drawLine(
    doc,
    LAYOUT.marginLeft, doc.y,
    doc.page.width - LAYOUT.marginRight, doc.y,
    COLORS.border, 0.5
  );
  doc.moveDown(0.5);
}

// ─── Summary block ────────────────────────────────────────────────────────────

export function agregarResumen(
  doc: PDFKit.PDFDocument,
  items: { label: string; value: string; highlight?: boolean }[]
): void {
  const pw = pageWidth(doc);
  const y = doc.y;
  const blockH = items.length * 16 + 14;

  drawRect(doc, LAYOUT.marginLeft, y, pw, blockH, COLORS.surface, 4);
  drawRect(doc, LAYOUT.marginLeft, y, pw, 4, COLORS.accent, 2);

  items.forEach((item, idx) => {
    const rowY = y + 10 + idx * 16;
    doc.font(FONT.normal)
       .fontSize(8.5)
       .fillColor(COLORS.mutedText)
       .text(item.label, LAYOUT.marginLeft + 12, rowY, { width: pw / 2 - 12 });

    doc.font(item.highlight ? FONT.bold : FONT.normal)
       .fontSize(8.5)
       .fillColor(item.highlight ? COLORS.primary : COLORS.bodyText)
       .text(item.value, LAYOUT.marginLeft + pw / 2, rowY, {
         width: pw / 2 - 12, align: 'right',
       });
  });

  doc.moveDown(Math.ceil(blockH / 14) + 0.5);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Creates a PDF document with a modern branded header.
 *
 * @param options.titulo         Main report title shown in header
 * @param options.subtitulo      Optional subtitle / date range line
 * @param options.orientacion    'portrait' | 'landscape'
 */
export function crearDocumentoPDF(options?: {
  titulo?: string;
  subtitulo?: string;
  orientacion?: 'portrait' | 'landscape';
}): PDFKit.PDFDocument {
  const doc = new PDFDocument({
    size: 'A4',
    layout: options?.orientacion ?? 'portrait',
    margins: {
      top:    LAYOUT.headerHeight + 15,
      bottom: 55,
      left:   LAYOUT.marginLeft,
      right:  LAYOUT.marginRight,
    },
    bufferPages: true,
    info: {
      Title:   options?.titulo ?? 'Reporte',
      Author:  config.empresa.nombre,
      Creator: 'Sistema E-Commerce',
    },
  });

  // Render header on the first page immediately
  renderHeader(doc, options?.titulo ?? 'Reporte', options?.subtitulo);

  // On every new page, re-render the header automatically
  doc.on('pageAdded', () => {
    renderHeader(doc, options?.titulo ?? 'Reporte', options?.subtitulo);
  });

  return doc;
}

/**
 * Stamps footers on all buffered pages and must be called
 * just before `doc.end()`.
 */
export function agregarPiePagina(doc: PDFKit.PDFDocument): void {
  const range = doc.bufferedPageRange();
  const total = range.count;

  for (let i = range.start; i < range.start + total; i++) {
    doc.switchToPage(i);
    renderFooter(doc, i - range.start + 1, total);
  }
}