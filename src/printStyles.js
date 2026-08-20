// CSS de impressão — isola apenas a área de material, esconde o resto do app
export const PRINT_CSS = `
@media print {
  @page { margin: 1.5cm; size: A4; }
  body * { visibility: hidden !important; }
  #area-impressao, #area-impressao * { visibility: visible !important; }
  #area-impressao {
    position: absolute !important;
    left: 0; top: 0;
    width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    background: #fff !important;
    box-shadow: none !important;
    border: none !important;
  }
  .nao-imprimir { display: none !important; }
  #area-impressao .card-print {
    border: 2px solid #333 !important;
    border-radius: 12px !important;
    page-break-inside: avoid;
  }
}
`;
