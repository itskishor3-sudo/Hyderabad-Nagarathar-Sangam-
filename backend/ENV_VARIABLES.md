# Environment Variables Configuration Guide

## Required Environment Variables for Production

This document outlines all environment variables required for the backend server to function correctly in production (Render deployment).

## Critical Variables

### 1. BREVO_API_KEY (Required)
**Purpose**: API key for Brevo (SendinBlue) email service  
**Current Value**: `[Get from .env file or Brevo dashboard]`  
**Where to Set**: Render Dashboard → Environment Variables  
**Used For**: 
- Contact form emails
- Guest registration emails
- Admin notification emails

### 2. EMAIL_USER (Required)
**Purpose**: Verified sender email address in Brevo  
**Current Value**: `itskishor3@gmail.com`  
**Where to Set**: Render Dashboard → Environment Variables  
**Used For**: 
- Sender address for all outgoing emails
- Must be verified in Brevo dashboard

### 3. BACKEND_URL (Optional)
**Purpose**: Production backend URL  
**Current Value**: `https://hyderabad-nagarathar-sangam-backend.onrender.com`  
**Where to Set**: Render Dashboard → Environment Variables  
**Used For**: 
- Gallery image URLs
- API endpoint references

## Additional Variables (Already Configured)

### 4. ADMIN_EMAILS
**Purpose**: Comma-separated list of admin emails for guest registration notifications  
**Current Value**: `itskishor3@gmail.com,sramadasu1974@gmail.com,Sai.cpk@gmail.com`  
**Used For**: Guest registration admin notifications

### 5. NOTIFICATION_EMAIL
**Purpose**: Sangam email for notifications  
**Current Value**: `nnscahyderabad@gmail.com`  
**Used For**: Receiving contact form submissions

### 6. NODE_ENV (Optional)
**Purpose**: Environment mode  
**Recommended Value**: `production`  
**Used For**: Error message verbosity

## How to Set Environment Variables in Render

1. Log into Render dashboard
2. Navigate to your backend service
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. Add each variable with its name and value
6. Click "Save Changes"
7. **Important**: Redeploy the service after adding/updating variables

## Verification Steps

### Step 1: Check if Variables are Set
Access the diagnostic endpoint:
```
GET https://hyderabad-nagarathar-sangam-backend.onrender.com/api/email-status
```

### Step 2: Test Email Functionality
Access the test endpoint:
```
GET https://hyderabad-nagarathar-sangam-backend.onrender.com/api/test-email
```

This will:
- Check all environment variables
- Send a test email to `nnscahyderabad@gmail.com`
- Return detailed diagnostics

### Step 3: Check Server Logs
In Render dashboard:
1. Go to "Logs" tab
2. Look for email sending attempts
3. Check for any error messages
4. Verify successful email confirmations

## Troubleshooting

### Issue: Emails not being sent
**Check**:
1. BREVO_API_KEY is correctly set in Render
2. API key is valid (not expired)
3. Sender email is verified in Brevo dashboard
4. Check Brevo account sending limits

### Issue: Emails going to spam
**Solution**:
1. Check `nnscahyderabad@gmail.com` spam folder
2. Mark Brevo emails as "Not Spam"
3. Add sender to contacts
4. Consider setting up SPF/DKIM records in Brevo

### Issue: Environment variables not taking effect
**Solution**:
1. Verify variables are saved in Render
2. Redeploy the service
3. Check logs for startup messages
4. Use `/api/email-status` to verify

## Contact Form Email Flow

```
User submits form → Frontend → Backend /api/contact endpoint
                                    ↓
                            Validates input
                                    ↓
                            Checks BREVO_API_KEY
                                    ↓
                            Sends email via Brevo API
                                    ↓
                            Email delivered to nnscahyderabad@gmail.com
```

## Quick Reference

| Variable | Required | Current Value | Purpose |
|----------|----------|---------------|---------|
| BREVO_API_KEY | ✅ Yes | `[See .env file]` | Email service API key |
| EMAIL_USER | ✅ Yes | `itskishor3@gmail.com` | Verified sender |
| BACKEND_URL | ⚠️ Optional | `https://...onrender.com` | Backend URL |
| ADMIN_EMAILS | ⚠️ Optional | `email1,email2,email3` | Admin notifications |
| NOTIFICATION_EMAIL | ⚠️ Optional | `nnscahyderabad@gmail.com` | Sangam email |
| NODE_ENV | ⚠️ Optional | `production` | Environment mode |
