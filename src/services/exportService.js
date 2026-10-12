import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// ============================================================
// Helper: format a date nicely
// ============================================================
const formatDate = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateOnly = () => {
  return new Date().toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// ============================================================
// Common: Convert incidents to a plain table format
// ============================================================
const incidentsToRows = (incidents) => {
  return incidents.map((incident) => ({
    ID: `#${String(incident.id).slice(-4)}`,
    Title: incident.title || '—',
    Type: incident.type || 'other',
    Location: incident.location || '—',
    'Reported By': incident.reportedBy || '—',
    Status: (incident.status || 'reported').replace('_', ' '),
    Date: formatDate(incident.createdAt),
    Description: incident.description || '—',
  }));
};

// ============================================================
// Filter incidents by parameters
// ============================================================
const applyFilters = (incidents, filters = {}) => {
  let result = [...incidents];

  // Filter by time period
  if (filters.period && filters.period !== 'all') {
    const days = parseInt(filters.period, 10);
    if (!isNaN(days)) {
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      result = result.filter(
        (i) => new Date(i.createdAt).getTime() >= cutoff
      );
    }
  }

  // Filter by type
  if (filters.type && filters.type !== 'all') {
    result = result.filter((i) => i.type === filters.type);
  }

  // Filter by status
  if (filters.status && filters.status !== 'all') {
    result = result.filter((i) => i.status === filters.status);
  }

  return result;
};

// ============================================================
// CSV Export
// ============================================================
export const exportToCSV = (incidents, filters = {}) => {
  const filtered = applyFilters(incidents, filters);
  const rows = incidentsToRows(filtered);

  // Add a summary header row
  const summary = [
    ['SafeRoute Connect — Community Safety Report'],
    [`Generated: ${formatDateOnly()}`],
    [`Total Incidents: ${filtered.length}`],
    [],
  ];

  const summaryCSV = Papa.unparse(summary, { header: false });
  const dataCSV = Papa.unparse(rows);

  const fullCSV = `${summaryCSV}\n${dataCSV}`;
  const blob = new Blob([fullCSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `saferoute-report-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return filtered.length;
};

// ============================================================
// PDF Export
// ============================================================
export const exportToPDF = (incidents, filters = {}) => {
  const filtered = applyFilters(incidents, filters);

  const doc = new jsPDF('landscape', 'mm', 'a4');

  // ----- Header -----
  doc.setFillColor(22, 163, 74); // primary green
  doc.rect(0, 0, 297, 25, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SafeRoute Connect', 15, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Community Safety Report', 15, 19);

  // Generated date (right aligned)
  doc.setFontSize(9);
  doc.text(`Generated: ${formatDateOnly()}`, 282, 12, { align: 'right' });

  // ----- Summary stats -----
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 15, 38);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Incidents: ${filtered.length}`, 15, 45);

  const resolved = filtered.filter((i) => i.status === 'resolved').length;
  const reported = filtered.filter((i) => i.status === 'reported').length;
  const underReview = filtered.filter((i) => i.status === 'under_review').length;
  const actionTaken = filtered.filter((i) => i.status === 'action_taken').length;

  doc.text(`Resolved: ${resolved}`, 80, 45);
  doc.text(`Reported: ${reported}`, 130, 45);
  doc.text(`Under Review: ${underReview}`, 180, 45);
  doc.text(`Action Taken: ${actionTaken}`, 240, 45);

  // ----- Data table -----
  const rows = incidentsToRows(filtered);

  autoTable(doc, {
    startY: 55,
    head: [['ID', 'Title', 'Type', 'Location', 'Reported By', 'Status', 'Date']],
    body: rows.map((r) => [
      r.ID,
      r.Title,
      r.Type,
      r.Location,
      r['Reported By'],
      r.Status,
      r.Date,
    ]),
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 55 },
      2: { cellWidth: 25 },
      3: { cellWidth: 45 },
      4: { cellWidth: 30 },
      5: { cellWidth: 25 },
      6: { cellWidth: 45 },
    },
    margin: { left: 15, right: 15 },
  });

  // ----- Footer -----
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${pageCount} · SafeRoute Connect © 2026`,
      148.5,
      200,
      { align: 'center' }
    );
  }

  doc.save(`saferoute-report-${Date.now()}.pdf`);
  return filtered.length;
};

// ============================================================
// Excel Export
// ============================================================
export const exportToExcel = (incidents, filters = {}) => {
  const filtered = applyFilters(incidents, filters);
  const rows = incidentsToRows(filtered);

  // ----- Summary sheet -----
  const summaryData = [
    ['SafeRoute Connect — Community Safety Report'],
    ['Generated:', formatDateOnly()],
    [],
    ['Total Incidents', filtered.length],
    ['Resolved', filtered.filter((i) => i.status === 'resolved').length],
    ['Reported', filtered.filter((i) => i.status === 'reported').length],
    ['Under Review', filtered.filter((i) => i.status === 'under_review').length],
    ['Action Taken', filtered.filter((i) => i.status === 'action_taken').length],
  ];

  // ----- Incidents sheet -----
  const incidentHeaders = [
    'ID', 'Title', 'Type', 'Location', 'Reported By', 'Status', 'Date', 'Description',
  ];
  const incidentRows = rows.map((r) => [
    r.ID, r.Title, r.Type, r.Location, r['Reported By'], r.Status, r.Date, r.Description,
  ]);

  // ----- Create workbook -----
  const wb = XLSX.utils.book_new();

  const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWS['!cols'] = [{ wch: 25 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');

  const incidentsWS = XLSX.utils.aoa_to_sheet([incidentHeaders, ...incidentRows]);
  incidentsWS['!cols'] = [
    { wch: 10 },
    { wch: 35 },
    { wch: 18 },
    { wch: 30 },
    { wch: 20 },
    { wch: 15 },
    { wch: 22 },
    { wch: 50 },
  ];
  XLSX.utils.book_append_sheet(wb, incidentsWS, 'Incidents');

  XLSX.writeFile(wb, `saferoute-report-${Date.now()}.xlsx`);
  return filtered.length;
};