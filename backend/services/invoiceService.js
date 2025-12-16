const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate PDF Invoice for an order
 * @param {Object} order - Order object
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateInvoice = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('StepSeva', 50, 50);
      doc.fontSize(10).text('Footwear E-Commerce', 50, 75);
      doc.moveDown();

      // Invoice Title
      doc.fontSize(16).text('INVOICE', 50, 120);
      doc.moveDown();

      // Order Details
      doc.fontSize(10);
      doc.text(`Order ID: ${order.orderId || order._id}`, 50, 160);
      doc.text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 50, 175);
      doc.text(`Payment Method: ${order.paymentType === 'cod' ? 'Cash on Delivery' : 'Online Payment'}`, 50, 190);
      doc.text(`Payment Status: ${order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}`, 50, 205);

      // Customer Details
      doc.text('Bill To:', 350, 160);
      if (order.shippingAddress) {
        doc.text(`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`, 350, 175);
        doc.text(order.shippingAddress.address, 350, 190);
        doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`, 350, 205);
        doc.text(`${order.shippingAddress.zipCode}`, 350, 220);
        doc.text(order.shippingAddress.country, 350, 235);
      }
      if (order.email) {
        doc.text(`Email: ${order.email}`, 350, 250);
      }
      if (order.phone) {
        doc.text(`Phone: ${order.phone}`, 350, 265);
      }

      // Line
      doc.moveTo(50, 300).lineTo(550, 300).stroke();

      // Items Table Header
      let yPosition = 320;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Item', 50, yPosition);
      doc.text('Size', 200, yPosition);
      doc.text('Qty', 280, yPosition);
      doc.text('Price', 330, yPosition);
      doc.text('Total', 450, yPosition, { align: 'right' });

      // Items
      doc.font('Helvetica');
      yPosition = 340;
      order.products.forEach((item) => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        doc.text(item.name || 'Product', 50, yPosition, { width: 140 });
        doc.text(item.size || 'N/A', 200, yPosition, { width: 70 });
        doc.text(String(item.quantity || 1), 280, yPosition, { width: 40 });
        doc.text(`₹${(item.price || 0).toLocaleString('en-IN')}`, 330, yPosition, { width: 110 });
        doc.text(`₹${itemTotal.toLocaleString('en-IN')}`, 450, yPosition, { width: 100, align: 'right' });
        yPosition += 20;
      });

      // Total Section
      yPosition += 20;
      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 20;

      doc.font('Helvetica-Bold');
      doc.text('Subtotal:', 400, yPosition);
      doc.text(`₹${order.totalAmount.toLocaleString('en-IN')}`, 450, yPosition, { align: 'right' });
      yPosition += 20;

      doc.text('Shipping:', 400, yPosition);
      doc.text('Free', 450, yPosition, { align: 'right' });
      yPosition += 20;

      doc.moveTo(400, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 10;

      doc.fontSize(12);
      doc.text('Total Amount:', 400, yPosition);
      doc.text(`₹${order.totalAmount.toLocaleString('en-IN')}`, 450, yPosition, { align: 'right' });

      // Footer
      const footerY = 750;
      doc.fontSize(8).font('Helvetica');
      doc.text('Thank you for your purchase!', 50, footerY, { align: 'center' });
      doc.text('For any queries, please contact our support team.', 50, footerY + 15, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate invoice and save to file system
 * @param {Object} order - Order object
 * @param {String} outputPath - Optional output path
 * @returns {Promise<String>} File path
 */
const generateInvoiceFile = async (order, outputPath = null) => {
  const pdfBuffer = await generateInvoice(order);
  
  if (!outputPath) {
    const invoicesDir = path.join(__dirname, '../../invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }
    outputPath = path.join(invoicesDir, `invoice-${order.orderId || order._id}.pdf`);
  }

  fs.writeFileSync(outputPath, pdfBuffer);
  return outputPath;
};

module.exports = {
  generateInvoice,
  generateInvoiceFile,
};

