import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportElementAsPDF(elementId, filename = 'report.pdf') {
  const el = document.getElementById(elementId);
  if (!el) return;

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW  = pageW - 20;
  const imgH  = (canvas.height * imgW) / canvas.width;

  let y = 10;
  let remaining = imgH;

  while (remaining > 0) {
    const sliceH = Math.min(remaining, pageH - 20);
    const srcY   = (imgH - remaining) * (canvas.height / imgH);
    const srcH   = sliceH * (canvas.height / imgH);

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width  = canvas.width;
    sliceCanvas.height = srcH;
    const ctx = sliceCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

    pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 10, y, imgW, sliceH);
    remaining -= sliceH;
    if (remaining > 0) { pdf.addPage(); y = 10; }
  }

  pdf.save(filename);
}
