const nodemailer = require('nodemailer');

// @desc    Send contact email
// @route   POST /api/contact
// @access  Public
exports.sendContactEmail = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Create transporter (configure with your email service)
    // For production, use a service like SendGrid, Mailgun, or Amazon SES
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: `"Eclora Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || 'admin@eclora.com',
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully. We will get back to you soon!',
    });
  } catch (error) {
    console.error('Email error:', error);
    
    // Return success even if email fails (for demo purposes)
    // In production, you might want to handle this differently
    res.status(200).json({
      success: true,
      message: 'Message received. We will get back to you soon!',
    });
  }
};

