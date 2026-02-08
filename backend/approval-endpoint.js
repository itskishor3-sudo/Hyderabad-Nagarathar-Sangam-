// SCENARIO 2: Guest Approval Endpoint
app.post('/api/guest/approve', async (req, res) => {
    try {
        const guestData = req.body;
        const { name, email } = guestData;

        const notificationEmail = process.env.NOTIFICATION_EMAIL || 'nnscahyderabad@gmail.com';

        // 1. Send approval email to guest
        const guestApprovalMailOptions = {
            from: `"Hyderabad Nagarathar Sangam" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Guest Request Approved – Welcome',
            html: getGuestApprovalEmail(guestData)
        };

        // 2. Send notification copy to nnscahyderabad@gmail.com
        const adminCopyMailOptions = {
            from: `"NNSCA Guest System" <${process.env.EMAIL_USER}>`,
            to: notificationEmail,
            subject: `Guest Approved – ${name}`,
            html: getAdminApprovalCopyEmail(guestData)
        };

        // Send both emails
        await Promise.all([
            transporter.sendMail(guestApprovalMailOptions),
            transporter.sendMail(adminCopyMailOptions)
        ]);

        console.log(`✅ Guest approval emails sent for: ${name}`);
        res.status(200).json({ success: true, message: 'Approval emails sent successfully.' });

    } catch (error) {
        console.error('❌ Error in guest approval:', error);
        res.status(500).json({ success: false, message: 'Failed to send approval emails.' });
    }
});
