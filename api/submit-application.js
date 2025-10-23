const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');

let cachedClient = null;

// Check if in development mode without database
const isDevMode = process.env.DEV_MODE === 'true';

// Connect to MongoDB
async function connectToDatabase() {
  if (isDevMode) {
    return null;
  }

  if (cachedClient) {
    return cachedClient;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  await client.connect();
  cachedClient = client;
  return client;
}

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.NODEMAILER_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

// Generate unique application ID
function generateApplicationId() {
  const year = new Date().getFullYear();
  const yearSuffix = year.toString().slice(-2); // Get last 2 digits (e.g., 25 for 2025)
  const random = Math.floor(Math.random() * 9999) + 1; // Random number 1-9999
  const applicationNumber = random.toString().padStart(4, '0'); // Pad to 4 digits
  return `SC${yearSuffix}${applicationNumber}`;
}

// Sanitize input to prevent XSS
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '')
    .trim();
}

// Validate email format (VIT email)
function isValidVITEmail(email) {
  // Accept @vitstudent.ac.in or @vit.ac.in domains
  const vitEmailRegex = /^[a-zA-Z0-9._-]+@(vitstudent\.ac\.in|vit\.ac\.in)$/i;
  return vitEmailRegex.test(email);
}

// Validate phone number (10 digits)
function isValidPhone(phone) {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
}

// Validate registration number
function isValidRegNumber(regNum) {
  const regNumRegex = /^[0-9]{2}[A-Z]{3}[0-9]{4,5}$/i;
  return regNumRegex.test(regNum);
}

// Validate URL
function isValidURL(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// Validate word count
function getWordCount(text) {
  return text.trim().split(/\s+/).length;
}

// Send confirmation email
async function sendConfirmationEmail(application) {
  const positionsHtml = application.positions.map((pos, index) => {
    return `🎯 <strong>${pos.positionName}</strong> (Preference: ${pos.preference})`;
  }).join('<br>');

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ffc700 0%, #ffb700 100%); padding: 40px 30px; text-align: center; color: white; }
    .header-logo { width: 120px; height: 120px; margin: 0 auto 20px; border-radius: 12px; background: white; padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: block; }
    .header h1 { margin: 10px 0 0 0; font-size: 24px; font-weight: 700; }
    .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.95; }
    .content { padding: 30px; }
    .detail-box { background: #f9f9f9; border-left: 4px solid #ffc700; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .detail-box h3 { margin-top: 0; color: #ffc700; font-size: 16px; }
    .detail-item { margin: 8px 0; }
    .detail-item strong { color: #555; }
    .positions-list { background: #fff9e6; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .next-steps { background: #e6f7ff; border-left: 4px solid #1890ff; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .footer { background: #0f0f1e; color: #e0e0e0; padding: 25px 20px; text-align: center; font-size: 14px; }
    .footer a { color: #ffc700; text-decoration: none; }
    .support-link { display: inline-block; margin-top: 10px; padding: 8px 16px; background: #ffc700; color: #0f0f1e; text-decoration: none; border-radius: 4px; font-weight: 600; }
    .divider { border: none; border-top: 2px solid #ffc700; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://standardsclubvitv.github.io/image-api/images/logo_club.png" alt="Standards Club Logo" class="header-logo">
      <h1>✓ Application Received Successfully</h1>
      <p>Standards Club Board Recruitment 2025-2026</p>
    </div>
    
    <div class="content">
      <p>Dear <strong>${application.name}</strong>,</p>
      
      <p>Thank you for applying to join the <strong>Standards Club Board</strong> for 2025-2026!</p>
      
      <p>We have successfully received your application. Here are your submission details:</p>
      
      <div class="detail-box">
        <h3>📋 APPLICATION DETAILS</h3>
        <div class="detail-item"><strong>Application ID:</strong> ${application.applicationId}</div>
        <div class="detail-item"><strong>Email:</strong> ${application.email}</div>
        <div class="detail-item"><strong>Registration Number:</strong> ${application.regNumber}</div>
        <div class="detail-item"><strong>Submitted On:</strong> ${new Date(application.submittedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
      </div>
      
      <div class="positions-list">
        <strong>POSITIONS APPLIED:</strong><br><br>
        ${positionsHtml}
      </div>
      
      <hr class="divider">
      
      <div class="next-steps">
        <h3 style="margin-top: 0; color: #1890ff;">📅 WHAT'S NEXT?</h3>
        <p>We will carefully review all applications and shortlisted candidates will be contacted for interviews within <strong>2-3 weeks</strong>. Keep an eye on your inbox (and spam folder!) for interview notifications.</p>
      </div>
      
      <div class="detail-box">
        <h3>❓ QUESTIONS?</h3>
        <p style="margin: 5px 0;">If you have any queries regarding your application, feel free to contact us:</p>
        <div class="detail-item">📧 Email: <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #ffc700;">${process.env.ADMIN_EMAIL}</a></div>
        <div class="detail-item">📱 Phone: ${process.env.ADMIN_PHONE}</div>
        <div class="detail-item">💬 Support: <a href="mailto:support@standardsvit.live" style="color: #ffc700;">support@standardsvit.live</a></div>
      </div>
      
      <p style="margin-top: 30px;">Best Regards,<br><strong>Standards Club VIT Vellore</strong></p>
      
      <div style="text-align: center; margin-top: 20px;">
        <a href="https://www.standardsvit.live/" class="support-link">Visit Our Website</a>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Standards Club VIT Vellore</strong><br>
      Building Excellence, Setting Standards</p>
      <p style="margin-top: 15px;">
        <a href="https://www.standardsvit.live/" style="color: #ffc700;">www.standardsvit.live</a> | 
        <a href="mailto:support@standardsvit.live" style="color: #ffc700;">support@standardsvit.live</a>
      </p>
      <p style="margin-top: 10px; font-size: 12px; color: #888;">
        This is an automated email. Please do not reply directly to this message.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const mailOptions = {
    from: `"Standards Club VIT" <${process.env.NODEMAILER_USER}>`,
    to: application.email,
    cc: 'support@standardsvit.live',
    subject: 'Standards Club Board Recruitment 2025-2026 - Application Received ✓',
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    // Don't throw error - application should still be saved even if email fails
  }
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { name, email, mobile, regNumber, positions, resumeLink, agreedToTerms, portfolioLink, githubLink, linkedinLink } = req.body;

    // Validation: Required fields
    if (!name || !email || !mobile || !regNumber || !positions || !resumeLink || !agreedToTerms) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled',
        error: 'MISSING_FIELDS'
      });
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email.toLowerCase()),
      mobile: sanitizeInput(mobile),
      regNumber: sanitizeInput(regNumber.toUpperCase()),
      resumeLink: sanitizeInput(resumeLink),
    };

    // Sanitize optional fields if provided
    if (portfolioLink) sanitizedData.portfolioLink = sanitizeInput(portfolioLink);
    if (githubLink) sanitizedData.githubLink = sanitizeInput(githubLink);
    if (linkedinLink) sanitizedData.linkedinLink = sanitizeInput(linkedinLink);

    // Validation: Name length
    if (sanitizedData.name.length < 3 || sanitizedData.name.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 3 and 100 characters',
        error: 'INVALID_NAME'
      });
    }

    // Validation: VIT Email
    if (!isValidVITEmail(sanitizedData.email)) {
      return res.status(400).json({
        success: false,
        message: 'Please use a valid VIT email address (@vitstudent.ac.in)',
        error: 'INVALID_EMAIL'
      });
    }

    // Validation: Phone number
    if (!isValidPhone(sanitizedData.mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number',
        error: 'INVALID_PHONE'
      });
    }

    // Validation: Registration number
    if (!isValidRegNumber(sanitizedData.regNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid registration number (e.g., 20BCE1234)',
        error: 'INVALID_REG_NUMBER'
      });
    }

    // Validation: Resume link
    if (!isValidURL(sanitizedData.resumeLink)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid URL for your resume/portfolio',
        error: 'INVALID_RESUME_LINK'
      });
    }

    // Validation: Positions (1-3 positions)
    if (!Array.isArray(positions) || positions.length < 1 || positions.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'Please select between 1 and 3 positions',
        error: 'INVALID_POSITION_COUNT'
      });
    }

    // Validation: Position data
    for (const pos of positions) {
      if (!pos.positionName || !pos.preference || !pos.motivation || !pos.domainAnswers) {
        return res.status(400).json({
          success: false,
          message: 'All position fields are required',
          error: 'INCOMPLETE_POSITION_DATA'
        });
      }

      // Validate motivation word count (200-500 words)
      const motivationWordCount = getWordCount(pos.motivation);
      if (motivationWordCount < 200 || motivationWordCount > 500) {
        return res.status(400).json({
          success: false,
          message: `Motivation for ${pos.positionName} must be between 200-500 words (currently ${motivationWordCount} words)`,
          error: 'INVALID_MOTIVATION_LENGTH'
        });
      }

      // Validate domain answers (minimum 50 words)
      // Handle both array format (new) and string format (old/backup)
      let domainAnswersWordCount = 0;
      if (Array.isArray(pos.domainAnswers)) {
        // New format: array of {question, answer} objects
        domainAnswersWordCount = pos.domainAnswers.reduce((total, qa) => {
          return total + getWordCount(qa.answer);
        }, 0);
      } else if (typeof pos.domainAnswers === 'string') {
        // Old format or backup text format
        domainAnswersWordCount = getWordCount(pos.domainAnswers);
      } else if (pos.domainAnswersText) {
        // Fallback to text version if available
        domainAnswersWordCount = getWordCount(pos.domainAnswersText);
      }
      
      if (domainAnswersWordCount < 50) {
        return res.status(400).json({
          success: false,
          message: `Domain answers for ${pos.positionName} must be at least 50 words (currently ${domainAnswersWordCount} words)`,
          error: 'INVALID_DOMAIN_ANSWERS_LENGTH'
        });
      }
    }

    // Validation: Terms agreement
    if (agreedToTerms !== true) {
      return res.status(400).json({
        success: false,
        message: 'You must agree to the terms and conditions',
        error: 'TERMS_NOT_AGREED'
      });
    }

    // Connect to database
    const client = await connectToDatabase();
    
    // In dev mode, simulate success without database
    if (isDevMode) {
      const applicationId = generateApplicationId();
      
      return res.status(200).json({
        success: true,
        message: 'Application submitted successfully (Development Mode)',
        applicationId: applicationId,
        note: 'Running in development mode - application not saved to database'
      });
    }
    
    const db = client.db('standards_recruitment');
    const applicationsCollection = db.collection('applications');

    // Check for duplicate email
    const existingApplication = await applicationsCollection.findOne({ email: sanitizedData.email });
    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'An application with this email already exists',
        error: 'DUPLICATE_EMAIL'
      });
    }

    // Generate application ID
    const applicationId = generateApplicationId();

    // Create application document
    const application = {
      applicationId,
      name: sanitizedData.name,
      email: sanitizedData.email,
      mobile: sanitizedData.mobile,
      regNumber: sanitizedData.regNumber,
      positions: positions.map(pos => ({
        positionName: sanitizeInput(pos.positionName),
        preference: parseInt(pos.preference),
        motivation: sanitizeInput(pos.motivation),
        domainAnswers: sanitizeInput(pos.domainAnswers)
      })),
      resumeLink: sanitizedData.resumeLink,
      agreedToTerms: true,
      submittedAt: new Date(),
      status: 'pending',
      lastUpdated: new Date()
    };

    // Add optional fields if provided
    if (sanitizedData.portfolioLink) application.portfolioLink = sanitizedData.portfolioLink;
    if (sanitizedData.githubLink) application.githubLink = sanitizedData.githubLink;
    if (sanitizedData.linkedinLink) application.linkedinLink = sanitizedData.linkedinLink;

    // Insert into database
    await applicationsCollection.insertOne(application);

    // Send confirmation email (async, don't wait)
    sendConfirmationEmail(application).catch(err => {
      // Email failed silently
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: applicationId,
      timestamp: application.submittedAt.toISOString()
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to submit application. Please try again.',
      error: error.message
    });
  }
};
