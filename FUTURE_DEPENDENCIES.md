# Future Dependencies for Enhanced Reports

## PDF Export Enhancement
```bash
# Add jsPDF for client-side PDF generation
bun add jspdf jspdf-autotable

# Usage example:
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const generatePDF = (data, filters) => {
  const doc = new jsPDF()
  doc.text('Asset Report', 20, 20)
  doc.autoTable({
    head: [headers],
    body: data.map(item => Object.values(item))
  })
  doc.save(`${filters.reportType}-report.pdf`)
}
```

## Excel Export Enhancement
```bash
# Add xlsx for advanced Excel features
bun add xlsx

# Usage example:
import * as XLSX from 'xlsx'

const generateExcel = (data, filters) => {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Report')
  XLSX.writeFile(wb, `${filters.reportType}-report.xlsx`)
}
```

## Charts and Analytics
```bash
# Already installed: recharts for data visualization
# Consider adding for advanced charts:
bun add chart.js react-chartjs-2
```

## Date Handling
```bash
# Already installed: date-fns for date manipulation
# Already installed: react-day-picker for date selection
```

## File Processing
```bash
# For large file handling and streaming
bun add papaparse  # CSV parsing and generation
bun add file-saver # Enhanced file download handling
```
