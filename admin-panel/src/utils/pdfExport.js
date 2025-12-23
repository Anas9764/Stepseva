import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export data to PDF
 * @param {Object} options - Export options
 * @param {Array} options.data - Data array to export
 * @param {Array} options.columns - Column definitions
 * @param {String} options.filename - Output filename
 * @param {String} options.title - PDF title
 * @param {String} options.subtitle - PDF subtitle
 */
export const exportToPDF = ({
  data,
  columns,
  filename = 'export',
  title = 'Export Report',
  subtitle = '',
}) => {
  try {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 20);
    
    // Add subtitle if provided
    if (subtitle) {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(subtitle, 14, 28);
      doc.setTextColor(0, 0, 0);
    }
    
    // Add export date
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, subtitle ? 35 : 30);
    doc.setTextColor(0, 0, 0);
    
    // Prepare table data
    const tableColumns = columns.map(col => col.header || col.label || col.key);
    const tableRows = data.map(row => {
      return columns.map(col => {
        const accessor = col.accessor || col.key;
        let value = row[accessor];
        
        // Use custom render if available
        if (col.render) {
          // For PDF, we need to extract text from rendered content
          // This is a simplified version - you might need to enhance this
          const rendered = col.render(row);
          if (typeof rendered === 'string') {
            return rendered;
          }
          // If it's a React element or complex object, try to get text
          return String(value || '');
        }
        
        // Format value
        if (value === null || value === undefined) {
          return '';
        }
        
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        
        return String(value);
      });
    });
    
    // Add table
    doc.autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: subtitle ? 40 : 35,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [179, 123, 164], // Primary color
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 40 },
    });
    
    // Save PDF
    doc.save(`${filename}-${Date.now()}.pdf`);
    
    return true;
  } catch (error) {
    console.error('PDF export error:', error);
    throw error;
  }
};

/**
 * Export orders to PDF with detailed format
 */
export const exportOrdersToPDF = (orders) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Orders Report', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 28);
  doc.setTextColor(0, 0, 0);
  
  let yPos = 35;
  
  orders.forEach((order, index) => {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Order #${order.orderId || order._id?.slice(-6).toUpperCase()}`, 14, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    doc.text(`Customer: ${order.user?.name || 'Guest'}`, 14, yPos);
    yPos += 6;
    doc.text(`Email: ${order.user?.email || order.email || 'N/A'}`, 14, yPos);
    yPos += 6;
    doc.text(`Total: ₹${order.totalAmount?.toLocaleString('en-IN') || 0}`, 14, yPos);
    yPos += 6;
    doc.text(`Status: ${order.status || 'Pending'}`, 14, yPos);
    yPos += 6;
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, yPos);
    yPos += 10;
    
    // Add separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPos, 196, yPos);
    yPos += 8;
  });
  
  doc.save(`orders-report-${Date.now()}.pdf`);
};

/**
 * Export products to PDF
 */
export const exportProductsToPDF = (products) => {
  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Category', accessor: 'category', render: (row) => row.category?.name || 'N/A' },
    { header: 'Price', accessor: 'price', render: (row) => `₹${row.price?.toLocaleString('en-IN') || 0}` },
    { header: 'Stock', accessor: 'stock' },
    { header: 'Status', accessor: 'isActive', render: (row) => row.isActive ? 'Active' : 'Inactive' },
  ];
  
  return exportToPDF({
    data: products,
    columns,
    filename: 'products',
    title: 'Products Report',
    subtitle: `Total Products: ${products.length}`,
  });
};

/**
 * Export leads to PDF
 */
export const exportLeadsToPDF = (leads) => {
  const columns = [
    { header: 'Buyer Name', accessor: 'buyerName' },
    { header: 'Email', accessor: 'buyerEmail' },
    { header: 'Company', accessor: 'companyName' },
    { header: 'Product', accessor: 'productName' },
    { header: 'Quantity', accessor: 'quantityRequired' },
    { header: 'Status', accessor: 'status' },
    { header: 'Priority', accessor: 'priority' },
    { header: 'Date', accessor: 'createdAt', render: (row) => new Date(row.createdAt).toLocaleDateString() },
  ];
  
  return exportToPDF({
    data: leads,
    columns,
    filename: 'leads',
    title: 'B2B Leads Report',
    subtitle: `Total Leads: ${leads.length}`,
  });
};

