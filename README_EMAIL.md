# NNSCA Contact Form Email System

This document explains the email functionality for the NNSCA website contact form.

## System Architecture

The contact form email system consists of two parts:

1. **Frontend (React)**: Contact form in `frontend/src/pages/Contact.jsx`
2. **Backend (Node.js/Express)**: Email server in `backend/server.js`

```
User fills form → Frontend sends POST request → Backend receives data → 
Nodemailer sends email via Gmail SMTP → Email delivered to inbox
```

## Quick Start

### 1. Configure Gmail

Follow the instructions in [GMAIL_SETUP.md](./GMAIL_SETUP.md) to:
- Enable 2-Factor Authentication
- Generate a Gmail App Password
- Create the `.env` file with your credentials

### 2. Install Backend Dependencies

Open a terminal and navigate to the backend folder:

```powershell
cd "d:\Nattukottai nagarathar sangam hyderabad\backend"
npm install
```

This will install:
- `express` - Web server framework
- `nodemailer` - Email sending library
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management

### 3. Start the Backend Server

In the backend folder:

```powershell
npm start
```

You should see:
```
🚀 Server running on port 5000
✅ Email server is ready to send messages
📧 Email service: Configured
🌐 API endpoint: http://localhost:5000/api/contact
```

**Keep this terminal window open** - the backend server needs to stay running.

### 4. Start the Frontend Development Server

Open a **new terminal** and navigate to the frontend folder:

```powershell
cd "d:\Nattukottai nagarathar sangam hyderabad\frontend"
npm run dev
```

The Vite development server will start (usually on http://localhost:5173).

### 5. Test the Contact Form

1. Open your browser and navigate to the contact page
2. Fill in the form with test data
3. Click "Send Message"
4. You should see a success message
5. Check the email inbox specified in `EMAIL_TO` for the message

## API Documentation

### POST /api/contact

Sends an email with the contact form data.

**Endpoint**: `http://localhost:5000/api/contact`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 9876543210",
  "subject": "Inquiry about membership",
  "message": "I would like to know more about..."
}
```

**Required Fields**:
- `name` (string)
- `email` (string, valid email format)
- `subject` (string)
- `message` (string)

**Optional Fields**:
- `phone` (string)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Your message has been sent successfully! We will get back to you soon.",
  "messageId": "<unique-message-id>"
}
```

**Error Response** (400/500):
```json
{
  "success": false,
  "message": "Error description"
}
```

## Email Template

The backend sends HTML-formatted emails with:
- Professional styling with NNSCA branding
- All form fields clearly displayed
- Clickable email and phone links
- Timestamp in Indian Standard Time
- Plain text fallback for email clients that don't support HTML

## Environment Variables

Create a `.env` file in the `backend` folder with these variables:

```env
PORT=5000                              # Server port
EMAIL_USER=your-email@gmail.com        # Gmail account to send FROM
EMAIL_PASS=your-app-password           # Gmail App Password
EMAIL_TO=nnscahyderabad@gmail.com     # Email address to receive submissions
```

See [GMAIL_SETUP.md](./GMAIL_SETUP.md) for detailed setup instructions.

## File Structure

```
backend/
├── server.js           # Express server with email functionality
├── package.json        # Dependencies and scripts
├── .env               # Environment variables (create this, not in Git)
├── .env.example       # Template for .env file
└── .gitignore         # Excludes .env from Git

frontend/
└── src/
    └── pages/
        └── Contact.jsx # Contact form component
```

## Error Handling

### Frontend Errors

The Contact.jsx component handles:
- Network errors (backend not running)
- Server errors (500 responses)
- Validation errors (400 responses)

All errors are displayed to the user via alert messages.

### Backend Errors

The server logs detailed errors to the console and returns user-friendly messages:
- Missing required fields → 400 Bad Request
- Invalid email format → 400 Bad Request
- Email sending failure → 500 Internal Server Error

## Development vs Production

### Development
- Backend runs on `localhost:5000`
- Frontend runs on Vite dev server (usually `localhost:5173`)
- CORS is enabled for all origins
- Detailed error messages are shown

### Production Considerations
- Update CORS settings to allow only your production domain
- Use environment variables for the frontend API URL
- Consider rate limiting to prevent spam
- Set up proper logging and monitoring
- Use a process manager like PM2 to keep the backend running

## Troubleshooting

### Backend server won't start
- Check if port 5000 is already in use
- Verify all dependencies are installed (`npm install`)
- Check for syntax errors in server.js

### "Email transporter configuration error"
- Verify your `.env` file exists and has correct values
- Check that EMAIL_USER and EMAIL_PASS are set
- Follow [GMAIL_SETUP.md](./GMAIL_SETUP.md) to generate App Password

### Form submission fails
- Ensure backend server is running
- Check browser console for errors
- Verify the API URL in Contact.jsx matches your backend
- Check backend console for error messages

### Emails not received
- Check spam/junk folder
- Verify EMAIL_TO address in `.env`
- Check backend console for "Email sent successfully" message
- Test Gmail credentials by logging into Gmail directly

## Security Notes

- ✅ `.env` file is excluded from Git via `.gitignore`
- ✅ App Passwords are used instead of regular Gmail passwords
- ✅ Input validation prevents malformed requests
- ⚠️ Consider adding rate limiting for production
- ⚠️ Consider adding CAPTCHA to prevent spam

## Future Enhancements

Potential improvements:
- Add rate limiting to prevent spam
- Implement CAPTCHA (reCAPTCHA)
- Add email templates for different types of inquiries
- Store submissions in a database
- Add admin dashboard to view submissions
- Implement email notifications for admins
- Add attachment support

## Support

For issues or questions:
- Check the troubleshooting sections in this document
- Review [GMAIL_SETUP.md](./GMAIL_SETUP.md) for Gmail configuration
- Check backend console logs for detailed error messages
