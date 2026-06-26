// Exportación del plan a PDF usando html2canvas + jsPDF.
// Se importan dinámicamente para que no entren en el bundle del servidor.

export async function exportarElementoPDF(
  elementId: string,
  nombreArchivo: string
): Promise<void> {
  const el = document.getElementById(elementId);
  if (!el) throw new Error('No se encontró el contenido a exportar.');

  const [{ default: html2canvas }, jsPDFModule] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);
  const { jsPDF } = jsPDFModule;

  // Fondo crema para que el PDF no salga transparente.
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#F7F3EE',
    logging: false,
  });

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;
  const imgData = canvas.toDataURL('image/jpeg', 0.92);

  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(nombreArchivo);
}
