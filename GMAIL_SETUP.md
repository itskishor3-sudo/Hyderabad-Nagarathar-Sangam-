# Gmail App Password Setup Guide

This guide will help you set up Gmail to work with the NNSCA contact form email functionality.

## Prerequisites

- A Gmail account
- 2-Factor Authentication (2FA) enabled on your Gmail account

## Step-by-Step Instructions

### Step 1: Enable 2-Factor Authentication

If you haven't already enabled 2FA on your Gmail account:

1. Go to your [Google Account](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google," click on **2-Step Verification**
4. Follow the prompts to set up 2FA (you can use SMS, Google Authenticator, or other methods)

### Step 2: Generate an App Password

1. Go to your [Google Account](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google," click on **2-Step Verification**
4. Scroll down to the bottom and click on **App passwords**
   - If you don't see this option, make sure 2FA is enabled 
5. You may be asked to sign in again
6. In the "Select app" dropdown, choose **Mail**
7. In the "Select device" dropdown, choose **Other (Custom name)**
8. Enter a name like "NNSCA Contact Form" or "Website Backend"
9. Click **Generate**
10. Google will display a 16-character password (format: `xxxx xxxx xxxx xxxx`)
11. **IMPORTANT**: Copy this password immediately - you won't be able to see it again!

### Step 3: Configure Your Backend

1. Navigate to the `backend` folder in your project:
   ```
   d:\Nattukottai nagarathar sangam hyderabad\backend
   ```

2. Copy the `.env.example` file and rename it to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```

3. Open the `.env` file in a text editor

4. Fill in the following values:
   ```env
   EMAIL_USER=your-gmail-address@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   EMAIL_TO=nnscahyderabad@gmail.com
   ```
   
   Replace:
   - `your-gmail-address@gmail.com` with the Gmail address you generated the App Password for
   - `xxxx xxxx xxxx xxxx` with the 16-character App Password (you can include or remove spaces)
   - `nnscahyderabad@gmail.com` with the email address where you want to receive contact form submissions

5. Save the `.env` file

### Step 4: Test the Configuration

1. Start the backend server (see README_EMAIL.md for instructions)
2. Check the console output - you should see:
   ```
   ✅ Email server is ready to send messages
   ```
3. If you see an error, double-check your credentials in the `.env` file

## Security Best Practices

### ✅ DO:
- Keep your `.env` file secure and never commit it to Git
- Use a dedicated Gmail account for sending automated emails (optional but recommended)
- Revoke App Passwords you're no longer using
- Use different App Passwords for different applications

### ❌ DON'T:
- Never use your regular Gmail password in the `.env` file
- Don't share your App Password with anyone
- Don't commit the `.env` file to version control
- Don't hardcode credentials in your source code

## Troubleshooting

### "Invalid credentials" error
- Double-check that you copied the App Password correctly
- Make sure there are no extra spaces in the `.env` file
- Verify that 2FA is enabled on your Gmail account

### "Less secure app access" message
- This is outdated - you should use App Passwords instead
- Make sure you're using an App Password, not your regular password

### Emails not being received
- Check your spam/junk folder
- Verify the `EMAIL_TO` address is correct
- Check the backend console for error messages
- Try sending a test email from Gmail directly to verify the account works

### "App passwords" option not showing
- Ensure 2-Factor Authentication is fully enabled
- Try signing out and back into your Google Account
- Some workspace/organization accounts may have this disabled by admin

## Alternative: OAuth2 (Advanced)

For production environments, you may want to use OAuth2 instead of App Passwords. This is more secure but more complex to set up. If interested, refer to the [Nodemailer OAuth2 documentation](https://nodemailer.com/smtp/oauth2/).

## Need Help?

If you're still having issues:
1. Check the backend server console for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a simple Gmail account first before using your organization account
4. Refer to [Google's App Password documentation](https://support.google.com/accounts/answer/185833)
