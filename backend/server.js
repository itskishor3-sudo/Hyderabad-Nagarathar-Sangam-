import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import {
    getAdminNotificationEmail,
    getGuestAcknowledgmentEmail,
    getGuestApprovalEmail,
    getAdminApprovalCopyEmail
} from './emailTemplates.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

// Setup __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration - allow both localhost and Vercel domain
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://hyderabad-nagarathar-sangam.vercel.app',
        'https://hyderabad-nagarathar-sangam-project.vercel.app',
        'https://hyderabad-nagarathar-sangam-kt33933um-s-kishors-projects.vercel.app'
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer for Gallery Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/gallery';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Configure Brevo (Sendinblue) API
import SibApiV3Sdk from 'sib-api-v3-sdk';

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Verify API Key on startup
if (!process.env.BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY is missing in environment variables!');
} else {
    console.log('✅ Brevo API client configured');
}

// Helper function to send emails via Brevo
// Helper function to send emails via Brevo
const sendEmail = async ({ to, subject, htmlContent, senderName, senderEmail, replyTo, attachment }) => {
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = htmlContent;

        // Sender MUST be a verified email in Brevo. Enforce strict fallback.
        const verifiedSender = process.env.EMAIL_USER || 'itskishor3@gmail.com';

        sendSmtpEmail.sender = {
            name: senderName || "Hyderabad Nagarathar Sangam",
            email: verifiedSender
        };

        // Ensure 'to' is always an array of objects
        const recipients = Array.isArray(to) ? to : [to];
        sendSmtpEmail.to = recipients.map(email => ({ email: email }));

        if (replyTo) {
            sendSmtpEmail.replyTo = { email: replyTo };
        }

        // Logging for debugging
        console.log(`📨 Sending email via Brevo to: ${JSON.stringify(sendSmtpEmail.to)}`);

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`✅ Brevo Response: Success! Message ID: ${data.messageId}`);
        return data;
    } catch (error) {
        console.error('❌ Error sending email via Brevo:', error);
        if (error.response) console.error('   API Details:', JSON.stringify(error.response.text));
        throw error;
    }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Email configuration diagnostic endpoint
app.get('/api/email-status', (req, res) => {
    const status = {
        emailConfigured: !!process.env.BREVO_API_KEY,
        emailUser: process.env.EMAIL_USER || 'Not needed for Brevo API',
        service: 'Brevo API'
    };
    res.json(status);
});

// Test email endpoint - sends a test email to verify SMTP connection
app.get('/api/test-email', async (req, res) => {
    try {
        const data = await sendEmail({
            to: process.env.EMAIL_USER || process.env.ADMIN_EMAILS.split(',')[0],
            subject: 'Brevo API Connection Test',
            htmlContent: '<p>If you receive this, Brevo API is working correctly! 🎉</p>'
        });

        res.json({
            success: true,
            message: 'Test email sent successfully via Brevo!',
            messageId: data.messageId
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message,
            details: 'Failed to send via Brevo API'
        });
    }
});

// Contact form submission endpoint - RESTRUCTURED FOR DIRECT DELIVERY
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        console.log('📬 Contact form submission received:');
        console.log(`   Name: ${name}`);
        console.log(`   Email: ${email}`);
        console.log(`   Subject: ${subject}`);

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields'
            });
        }

        // DIRECT EMAIL TO SANGAM ONLY
        const sangamEmail = 'nnscahyderabad@gmail.com';

        console.log(`\n🎯 Preparing to send email to: ${sangamEmail}`);
        console.log(`   From account: ${process.env.EMAIL_USER}`);

        console.log('\n📤 Sending email via Brevo...');
        await sendEmail({
            to: sangamEmail,
            senderName: name,
            senderEmail: process.env.EMAIL_USER, // Use verified sender to avoid blocking, user email in reply-to
            replyTo: email,
            subject: `Contact Form: ${subject}`,
            htmlContent: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                        <h2 style="color: #003366; border-bottom: 3px solid #FFA500; padding-bottom: 10px;">
                            New Contact Form Submission
                        </h2>
                        
                        <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                            <p><strong>Subject:</strong> ${subject}</p>
                        </div>
                        
                        <div style="margin: 20px 0; padding: 15px; background: #fff; border-left: 4px solid #FFA500;">
                            <p><strong>Message:</strong></p>
                            <p>${message}</p>
                        </div>
                        
                        <div style="margin-top: 20px; padding: 10px; background: #e8f4f8; border-radius: 5px;">
                            <p style="margin: 0; font-size: 14px;">
                                💡 <strong>Quick Reply:</strong> Click <a href="mailto:${email}">here</a> to reply directly to ${name}
                            </p>
                        </div>
                        
                        <div style="margin-top: 20px; padding: 10px; background: #fff3cd; border: 1px solid #ffeeba; border-radius: 5px; font-size: 12px; color: #856404;">
                            Note: This email was sent via Brevo API to ensure delivery.
                        </div>

                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                        
                        <p style="text-align: center; color: #666; font-size: 12px;">
                            Hyderabad Nattukottai Nagarathar Sangam<br>
                            📧 nnscahyderabad@gmail.com | 📞 +91 7702793299
                        </p>
                    </div>
                </body>
                </html>
            `
        });

        console.log('\n✅ EMAIL SENT SUCCESSFULLY VIA BREVO!');
        console.log(`   Recipient: ${sangamEmail}`);
        console.log(`   ⚠️  CHECK INBOX AND SPAM FOLDER at ${sangamEmail}\n`);

        res.status(200).json({
            success: true,
            message: 'Message sent successfully to nnscahyderabad@gmail.com'
        });

    } catch (error) {
        console.error('\n❌ CONTACT FORM EMAIL ERROR:');
        console.error(`   Error Type: ${error.name}`);
        console.error(`   Error Message: ${error.message}`);
        console.error(`   Full Error:`, error);

        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again or contact us directly.'
        });
    }
});

// Guest registration form submission endpoint
app.post('/api/guest/register', async (req, res) => {
    try {
        const guestData = req.body;
        const { name, email } = guestData;

        // Get admin emails from environment variable
        const adminEmails = process.env.ADMIN_EMAILS || 'itskishor3@gmail.com,sramadasu1974@gmail.com,Sai.cpk@gmail.com';

        // SCENARIO 1: Send emails on registration

        // 1. Send notification to all 3 admins
        // 1. Send notification to all 3 admins
        const adminEmailList = adminEmails.split(',').map(e => e.trim());

        const sendAdminEmail = sendEmail({
            to: adminEmailList,
            subject: 'New Guest Registration Request Received',
            htmlContent: getAdminNotificationEmail(guestData)
        });

        // 2. Send acknowledgment to guest
        const sendGuestEmail = sendEmail({
            to: email,
            subject: 'Guest Registration Received – Pending Approval',
            htmlContent: getGuestAcknowledgmentEmail(guestData)
        });

        // Send both emails
        console.log(`📧 Attempting to send guest registration emails for: ${name}`);
        console.log(`   Admin emails: ${adminEmails}`);
        console.log(`   Guest email: ${email}`);

        await Promise.all([sendAdminEmail, sendGuestEmail]);

        console.log(`✅ Guest registration emails sent successfully for: ${name}`);
        res.status(200).json({ success: true, message: 'Registration submitted and emails sent successfully.' });

    } catch (error) {
        console.error('❌ ERROR in guest registration:');
        console.error('   Error name:', error.name);
        console.error('   Error message:', error.message);
        console.error('   Full error:', error);
        console.error('   Stack:', error.stack);
        res.status(500).json({ success: false, message: 'Failed to process registration emails.' });
    }
});

// SCENARIO 2: Guest Approval Endpoint
app.post('/api/guest/approve', async (req, res) => {
    try {
        const guestData = req.body;
        const { name, email } = guestData;

        const notificationEmail = process.env.NOTIFICATION_EMAIL || 'nnscahyderabad@gmail.com';

        // Send approval email ONLY to guest (not to sangam email)
        // Send approval email ONLY to guest (not to sangam email)
        await sendEmail({
            to: email,
            subject: 'Guest Request Approved – Welcome',
            htmlContent: getGuestApprovalEmail(guestData)
        });

        console.log(`✅ Guest approval email sent to: ${email}`);
        res.status(200).json({ success: true, message: 'Approval email sent successfully.' });

    } catch (error) {
        console.error('❌ Error in guest approval:', error);
        res.status(500).json({ success: false, message: 'Failed to send approval emails.' });
    }
});

// Existing approval endpoint (keeping for backward compatibility)
app.post('/api/approve-guest', async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required for approval notification.' });
        }

        // Shared Template Styles (with hosted logo)
        const logoHtml = `<img src="https://hyderabad-nagarathar-sangam.vercel.app/image.png" alt="HNNSC Logo" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px; border: 2px solid #DAA520;">`;

        const headerHtml = `
            <div style="background-color: #0B2C4D; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                ${logoHtml}
                <h1 style="color: #ffffff; margin: 0; font-family: 'Playfair Display', serif; text-transform: uppercase; letter-spacing: 2px; font-size: 24px;">Hyderabad Nagarathar Sangam</h1>
                <p style="color: #DAA520; margin: 5px 0 0 0; font-family: Arial, sans-serif; font-size: 14px;">Social and Cultural Association</p>
            </div>
        `;
        const footerHtml = `
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #666;">
                <p style="margin: 0;">&copy; ${new Date().getFullYear()} HNNSC Association. All rights reserved.</p>
                <p style="margin: 5px 0 0 0;">Hyderabad, India</p>
            </div>
        `;

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
                ${headerHtml}
                <div style="padding: 30px; background-color: #ffffff; text-align: center;">
                    <h2 style="color: #2e7d32; margin-top: 0;">Congratulations!</h2>
                    <p style="font-size: 16px; color: #555;">Dear <strong>${name}</strong>,</p>
                    <p style="font-size: 16px; color: #555; line-height: 1.5;">We are pleased to inform you that your guest request has been <strong>ACCEPTED</strong>.</p>
                    
                    <div style="background-color: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 8px; padding: 20px; margin: 25px 0;">
                        <h3 style="color: #2e7d32; margin: 0 0 10px 0;">✔ Visit Confirmed</h3>
                        <p style="margin: 0; color: #555;">Your stay has been officially approved by the association. We are excited to welcome you.</p>
                    </div>
                    
                    <p style="color: #777; font-size: 14px;">If you have any further questions, please contact the administration office.</p>
                </div>
                ${footerHtml}
            </div>
        `;

        await sendEmail({
            to: email,
            subject: "Request Accepted - HNNSC Sangam",
            htmlContent: htmlContent
        });

        res.status(200).json({ success: true, message: 'Approval email sent successfully.' });
    } catch (error) {
        console.error('❌ Error sending approval email:', error);
        res.status(500).json({ success: false, message: 'Failed to send approval email.' });
    }
});

// --- GALLERY REPLACEMENT API ---

// Single Image Upload
app.post('/api/gallery/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const imageUrl = `${BACKEND_URL}/uploads/gallery/${req.file.filename}`;
        res.status(200).json({
            success: true,
            imageUrl: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('❌ Upload error:', error);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
});

// Bulk Image Upload
app.post('/api/gallery/bulk-upload', upload.array('images', 50), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        const uploadedImages = req.files.map(file => ({
            imageUrl: `${BACKEND_URL}/uploads/gallery/${file.filename}`,
            filename: file.filename,
            originalName: file.originalname
        }));

        res.status(200).json({
            success: true,
            images: uploadedImages
        });
    } catch (error) {
        console.error('❌ Bulk upload error:', error);
        res.status(500).json({ success: false, message: 'Bulk upload failed' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📧 Email service: ${process.env.EMAIL_USER ? 'Configured' : '⚠️  Not configured'}`);
    console.log(`🌐 Backend URL: ${BACKEND_URL}`);
    console.log(`🌐 API endpoint: ${BACKEND_URL}/api/contact\n`);
});
