const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  orderConfirmation: (order) => {
    const itemsList = order.products.map(item => 
      `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong><br>
          <small>Size: ${item.size || 'N/A'} | Qty: ${item.quantity} × ₹${item.price}</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ₹${(item.price * item.quantity).toLocaleString('en-IN')}
        </td>
      </tr>`
    ).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for your purchase!</p>
          </div>
          <div class="content">
            <p>Dear ${order.shippingAddress?.firstName || 'Customer'},</p>
            <p>Your order has been confirmed and we're preparing it for shipment.</p>
            
            <div class="order-details">
              <h2>Order Details</h2>
              <p><strong>Order ID:</strong> ${order.orderId || order._id}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
              <p><strong>Payment Method:</strong> ${order.paymentType === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
              <p><strong>Payment Status:</strong> ${order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</p>
              
              <h3>Order Items</h3>
              <table>
                ${itemsList}
                <tr>
                  <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #333;">
                    Total Amount
                  </td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #333;">
                    ₹${order.totalAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </table>
              
              <h3>Shipping Address</h3>
              <p>
                ${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}<br>
                ${order.shippingAddress?.address}<br>
                ${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.zipCode}<br>
                ${order.shippingAddress?.country}
              </p>
            </div>
            
            ${order.paymentType === 'cod' ? 
              `<p><strong>Important:</strong> Please keep ₹${order.totalAmount.toLocaleString('en-IN')} ready for cash payment when the delivery person arrives.</p>` 
              : ''}
            
            <p>You can track your order status by visiting your account or using the order ID.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/my-orders" class="button">View My Orders</a>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for shopping with StepSeva!</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  orderStatusUpdate: (order, newStatus) => {
    const statusMessages = {
      confirmed: 'Your order has been confirmed and is being processed.',
      processing: 'Your order is being prepared for shipment.',
      shipped: 'Your order has been shipped!',
      delivered: 'Your order has been delivered successfully!',
      cancelled: 'Your order has been cancelled.',
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-box { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #667eea; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Status Update</h1>
          </div>
          <div class="content">
            <p>Dear ${order.shippingAddress?.firstName || 'Customer'},</p>
            
            <div class="status-box">
              <h2>Order #${order.orderId || order._id}</h2>
              <p><strong>New Status:</strong> ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</p>
              <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
            </div>
            
            ${order.trackingNumber ? 
              `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
               <p>You can track your shipment using the tracking number above.</p>` 
              : ''}
            
            <p>Thank you for your patience!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  adminNewOrder: (order) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 30px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .order-box { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Order Received!</h1>
          </div>
          <div class="content">
            <div class="order-box">
              <h2>Order #${order.orderId || order._id}</h2>
              <p><strong>Customer:</strong> ${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}</p>
              <p><strong>Email:</strong> ${order.email}</p>
              <p><strong>Phone:</strong> ${order.phone || 'N/A'}</p>
              <p><strong>Amount:</strong> ₹${order.totalAmount.toLocaleString('en-IN')}</p>
              <p><strong>Payment Type:</strong> ${order.paymentType === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
              <p><strong>Items:</strong> ${order.products.length} item(s)</p>
            </div>
            <p>Please process this order as soon as possible.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },
};

// Email service functions
const emailService = {
  // Send order confirmation to customer
  sendOrderConfirmation: async (order) => {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Email not configured, skipping order confirmation email');
        return { success: false, message: 'Email not configured' };
      }

      const transporter = createTransporter();
      const mailOptions = {
        from: `"StepSeva" <${process.env.EMAIL_USER}>`,
        to: order.email,
        subject: `Order Confirmation - ${order.orderId || order._id}`,
        html: emailTemplates.orderConfirmation(order),
      };

      await transporter.sendMail(mailOptions);
      console.log(`Order confirmation email sent to ${order.email}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      return { success: false, error: error.message };
    }
  },

  // Send order status update to customer
  sendOrderStatusUpdate: async (order, newStatus) => {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Email not configured, skipping status update email');
        return { success: false, message: 'Email not configured' };
      }

      const transporter = createTransporter();
      const mailOptions = {
        from: `"StepSeva" <${process.env.EMAIL_USER}>`,
        to: order.email,
        subject: `Order Status Update - ${order.orderId || order._id}`,
        html: emailTemplates.orderStatusUpdate(order, newStatus),
      };

      await transporter.sendMail(mailOptions);
      console.log(`Order status update email sent to ${order.email}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending status update email:', error);
      return { success: false, error: error.message };
    }
  },

  // Send new order notification to admin
  sendAdminNewOrderNotification: async (order) => {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ADMIN_EMAIL) {
        console.log('Email not configured, skipping admin notification');
        return { success: false, message: 'Email not configured' };
      }

      const transporter = createTransporter();
      const mailOptions = {
        from: `"StepSeva Orders" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `New Order Received - ${order.orderId || order._id}`,
        html: emailTemplates.adminNewOrder(order),
      };

      await transporter.sendMail(mailOptions);
      console.log(`Admin notification email sent for order ${order.orderId || order._id}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending admin notification email:', error);
      return { success: false, error: error.message };
    }
  },
};

module.exports = emailService;

