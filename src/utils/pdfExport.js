/**
 * Generates and directly triggers download of a valid single/multi-page PDF 1.4 document
 * without external binary dependencies or opening the browser print dialog.
 */
export const downloadSimplePdf = (filename, lines = []) => {
  const escPdfText = (str) =>
    String(str ?? '')
      .replace(/[^\x20-\x7E]/g, ' ')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')

  const linesPerPage = 44
  const pages = []
  for (let i = 0; i < lines.length; i += linesPerPage) {
    pages.push(lines.slice(i, i + linesPerPage))
  }
  if (pages.length === 0) pages.push([{ text: 'Empty Document', bold: true }])

  const objects = [null, null, null, null]
  const pageObjIds = []
  let nextId = 5

  pages.forEach((pageLines) => {
    const pageId = nextId++
    const contentId = nextId++
    pageObjIds.push(pageId)

    const ops = ['BT', '/F2 14 Tf', '48 792 Td', '0 0 0 rg']
    pageLines.forEach((rawLine, idx) => {
      const line = typeof rawLine === 'string' ? { text: rawLine } : rawLine
      if (idx === 0) {
        ops.push(`(${escPdfText(line.text)}) Tj`)
      } else {
        const font = line.bold ? '/F2 10 Tf' : '/F1 10 Tf'
        const gap = line.gap ?? -16
        ops.push(`0 ${gap} Td`, font, `(${escPdfText(line.text)}) Tj`)
      }
    })
    ops.push('ET')
    const stream = ops.join('\n')

    objects[pageId - 1] =
      `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`
    objects[contentId - 1] =
      `${contentId} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`
  })

  objects[0] = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`
  objects[1] = `2 0 obj\n<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjIds.length} >>\nendobj\n`
  objects[2] = `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`
  objects[3] = `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((objStr) => {
    offsets.push(pdf.length)
    pdf += objStr
  })

  const xrefStart = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((off) => {
    pdf += `${String(off).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  const blob = new Blob([pdf], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
