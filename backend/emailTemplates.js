// Professional Email Templates for Guest Registration System

const getEmailHeader = () => {
    return `
        <div style="background: linear-gradient(135deg, #003366 0%, #004d99 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <div style="margin-bottom: 20px;">
                <img src="cid:hnnsc_logo" 
                     alt="🪔" 
                     style="width: 120px; height: 120px; margin: 0 auto; display: block; border-radius: 50%; background: white; padding: 5px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
                <div style="font-size: 64px; margin-bottom: 15px; display: none;">🪔</div>
            </div>
            <h1 style="color: white; margin: 20px 0 10px 0; font-size: 28px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; font-family: 'Cinzel', serif;">
                HYDERABAD NAGARATHAR SANGAM
            </h1>
            <p style="color: #FFA500; margin: 0; font-size: 16px; font-weight: 500; font-family: 'Poppins', sans-serif;">
                Social and Cultural Association
            </p>
        </div>
    `;
};

const getEmailFooter = () => {
    return `
        <div style="background: #f8f9fa; padding: 30px 20px; text-align: center; border-radius: 0 0 12px 12px; margin-top: 30px; border-top: 3px solid #FFA500;">
            <p style="color: #666; margin: 10px 0; font-size: 14px; font-family: 'Poppins', sans-serif;">
                <strong>Hyderabad Nattukottai Nagarathar Sangam</strong>
            </p>
            <p style="color: #888; margin: 5px 0; font-size: 13px; font-family: 'Poppins', sans-serif;">
                📧 nnscahyderabad@gmail.com | 📞 +91 7702793299
            </p>
            <p style="color: #888; margin: 5px 0; font-size: 13px; font-family: 'Poppins', sans-serif;">
                📍 East Marredpally, Hyderabad, Telangana, India
            </p>
            <p style="color: #999; margin: 15px 0 0 0; font-size: 12px; font-family: 'Poppins', sans-serif;">
                || ஓம் சரவண பவ ||
            </p>
        </div>
    `;
};

const getEmailWrapper = (content) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Cinzel:wght@400;600;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Poppins', Arial, sans-serif;">
            <div style="max-width: 650px; margin: 40px auto; background: white; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12); overflow: hidden;">
                ${getEmailHeader()}
                ${content}
                ${getEmailFooter()}
            </div>
        </body>
        </html>
    `;
};

// SCENARIO 1: Admin Notification Email (New Guest Registration)
const getAdminNotificationEmail = (guestData) => {
    const content = `
        <div style="padding: 40px 30px;">
            <h2 style="color: #003366; margin: 0 0 10px 0; font-size: 24px; font-weight: 600; font-family: 'Poppins', sans-serif;">
                New Guest Registration Request
            </h2>
            <div style="height: 4px; width: 80px; background: linear-gradient(90deg, #FFA500, #FFD700); margin-bottom: 25px; border-radius: 2px;"></div>
            
            <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 25px; font-family: 'Poppins', sans-serif;">
                A new guest has submitted a registration form with the following details:
            </p>

            <div style="background: #f8f9fa; border-left: 4px solid #FFA500; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <table style="width: 100%; border-collapse: collapse; font-family: 'Poppins', sans-serif;">
                    <tr>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; font-size: 14px; width: 35%;">Guest Name:</td>
                        <td style="padding: 12px 0; color: #555; font-size: 14px;">${guestData.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; font-size: 14px;">Email:</td>
                        <td style="padding: 12px 0; color: #555; font-size: 14px;">
                            <a href="mailto:${guestData.email}" style="color: #0066cc; text-decoration: none;">${guestData.email}</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; font-size: 14px;">Phone:</td>
                        <td style="padding: 12px 0; color: #555; font-size: 14px;">${guestData.phoneNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; font-size: 14px;">Address:</td>
                        <td style="padding: 12px 0; color: #555; font-size: 14px;">${guestData.permanentAddress}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; font-size: 14px;">Check-in:</td>
                        <td style="padding: 12px 0; color: #555; font-size: 14px;">${guestData.checkInDate} at ${guestData.checkInTime}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; font-size: 14px;">Check-out:</td>
                        <td style="padding: 12px 0; color: #555; font-size: 14px;">${guestData.expectedCheckOutDate} at ${guestData.expectedCheckOutTime}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; font-size: 14px;">Total Guests:</td>
                        <td style="padding: 12px 0; color: #555; font-size: 14px;">${guestData.totalNumberOfGuests}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; font-size: 14px;">Accommodation:</td>
                        <td style="padding: 12px 0; color: #555; font-size: 14px;">${guestData.roomHall}</td>
                    </tr>
                </table>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 25px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px; font-family: 'Poppins', sans-serif;">
                    ⚠️ <strong>Action Required:</strong> Please review and approve this guest request from the admin dashboard.
                </p>
            </div>
        </div>
    `;
    return getEmailWrapper(content);
};

// SCENARIO 1: Guest Acknowledgment Email (Registration Received)
const getGuestAcknowledgmentEmail = (guestData) => {
    const content = `
        <div style="padding: 40px 30px; text-align: center;">
            <h2 style="color: #003366; margin: 0 0 20px 0; font-size: 24px; font-weight: 600; font-family: 'Poppins', sans-serif;">
                வணக்கம் 🙏, ${guestData.name}
            </h2>
            
            <p style="color: #555; font-size: 15px; line-height: 1.8; margin-bottom: 30px; font-family: 'Poppins', sans-serif;">
                Thank you for registering your stay with us. We have successfully received your request.
            </p>

            <div style="background: #fff3cd; border-left: 4px solid #FFA500; padding: 20px; margin: 25px 0; border-radius: 8px; text-align: left;">
                <p style="color: #333; margin: 0 0 10px 0; font-weight: 600; font-size: 15px; font-family: 'Poppins', sans-serif;">
                    Status: Under Review
                </p>
                <p style="color: #666; margin: 0; font-size: 14px; line-height: 1.6; font-family: 'Poppins', sans-serif;">
                    Our association administration is currently reviewing your details. We will notify you once your request is approved.
                </p>
            </div>

            <p style="color: #555; font-size: 15px; line-height: 1.8; margin-top: 30px; font-family: 'Poppins', sans-serif;">
                We look forward to hosting you at our premises.
            </p>
        </div>
    `;
    return getEmailWrapper(content);
};

// SCENARIO 2: Guest Approval Email (Request Approved)
const getGuestApprovalEmail = (guestData) => {
    const content = `
        <div style="padding: 40px 30px;">
            <h2 style="color: #003366; margin: 0 0 10px 0; font-size: 24px; font-weight: 600; font-family: 'Poppins', sans-serif;">
                Guest Request Approved – Welcome
            </h2>
            <div style="height: 4px; width: 80px; background: linear-gradient(90deg, #4caf50, #8bc34a); margin-bottom: 25px; border-radius: 2px;"></div>
            
            <p style="color: #555; font-size: 16px; line-height: 1.8; margin-bottom: 20px; font-family: 'Poppins', sans-serif;">
                <strong style="color: #003366; font-size: 18px;">வணக்கம் ${guestData.name},</strong>
            </p>

            <div style="background: #e8f5e9; border: 2px solid #4caf50; padding: 25px; margin: 25px 0; border-radius: 12px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
                <p style="color: #2e7d32; margin: 0; font-size: 18px; font-weight: 600; font-family: 'Poppins', sans-serif;">
                    Your Guest Request Has Been Approved!
                </p>
            </div>

            <p style="color: #555; font-size: 15px; line-height: 1.8; margin-bottom: 20px; font-family: 'Poppins', sans-serif;">
                We are pleased to inform you that your guest registration request has been <strong>approved</strong> by our admin team.
            </p>

            <p style="color: #555; font-size: 15px; line-height: 1.8; margin-bottom: 20px; font-family: 'Poppins', sans-serif;">
                Our team is looking forward to your arrival and we are committed to making your stay comfortable and memorable.
            </p>

            <div style="background: #f8f9fa; border-left: 4px solid #FFA500; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <p style="color: #333; margin: 0 0 10px 0; font-weight: 600; font-size: 15px; font-family: 'Poppins', sans-serif;">
                    📅 Your Visit Details:
                </p>
                <p style="color: #555; margin: 5px 0; font-size: 14px; font-family: 'Poppins', sans-serif;">
                    <strong>Check-in:</strong> ${guestData.checkInDate} at ${guestData.checkInTime}
                </p>
                <p style="color: #555; margin: 5px 0; font-size: 14px; font-family: 'Poppins', sans-serif;">
                    <strong>Check-out:</strong> ${guestData.expectedCheckOutDate} at ${guestData.expectedCheckOutTime}
                </p>
                <p style="color: #555; margin: 5px 0; font-size: 14px; font-family: 'Poppins', sans-serif;">
                    <strong>Accommodation:</strong> ${guestData.roomHall}
                </p>
            </div>

            <p style="color: #555; font-size: 15px; line-height: 1.8; margin-bottom: 10px; font-family: 'Poppins', sans-serif;">
                Should you have any questions or require any assistance, please do not hesitate to contact us.
            </p>

            <p style="color: #555; font-size: 15px; line-height: 1.8; margin-top: 30px; font-family: 'Poppins', sans-serif;">
                We look forward to welcoming you!<br><br>
                Warm regards,<br>
                <strong>Hyderabad Nattukottai Nagarathar Sangam</strong>
            </p>
        </div>
    `;
    return getEmailWrapper(content);
};

// SCENARIO 2: Admin Copy Email (Approval Notification)
const getAdminApprovalCopyEmail = (guestData) => {
    const content = `
        <div style="padding: 40px 30px;">
            <h2 style="color: #003366; margin: 0 0 10px 0; font-size: 24px; font-weight: 600; font-family: 'Poppins', sans-serif;">
                Guest Approved – ${guestData.name}
            </h2>
            <div style="height: 4px; width: 80px; background: linear-gradient(90deg, #4caf50, #8bc34a); margin-bottom: 25px; border-radius: 2px;"></div>
            
            <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 25px; font-family: 'Poppins', sans-serif;">
                This is to inform you that the following guest request has been <strong style="color: #4caf50;">approved</strong>:
            </p>

            <div style="background: #f8f9fa; border-left: 4px solid #4caf50; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <table style="width: 100%; border-collapse: collapse; font-family: 'Poppins', sans-serif;">
                    <tr>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; font-size: 14px; width: 35%;">Guest Name:</td>
                        <td style="padding: 12px 0; color: #555; font-size: 14px;">${guestData.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; font-size: 14px;">Email:</td>
                        <td style="padding: 12px 0; color: #555; font-size: 14px;">
                            <a href="mailto:${guestData.email}" style="color: #0066cc; text-decoration: none;">${guestData.email}</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; font-size: 14px;">Phone:</td>
                        <td style="padding: 12px 0; color: #555; font-size: 14px;">${guestData.phoneNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; font-size: 14px;">Check-in:</td>
                        <td style="padding: 12px 0; color: #555; font-size: 14px;">${guestData.checkInDate} at ${guestData.checkInTime}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; font-size: 14px;">Check-out:</td>
                        <td style="padding: 12px 0; color: #555; font-size: 14px;">${guestData.expectedCheckOutDate} at ${guestData.expectedCheckOutTime}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; font-size: 14px;">Total Guests:</td>
                        <td style="padding: 12px 0; color: #555; font-size: 14px;">${guestData.totalNumberOfGuests}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; font-size: 14px;">Accommodation:</td>
                        <td style="padding: 12px 0; color: #555; font-size: 14px;">${guestData.roomHall}</td>
                    </tr>
                </table>
            </div>

            <div style="background: #e8f5e9; border: 1px solid #4caf50; padding: 15px; border-radius: 8px; margin: 25px 0;">
                <p style="color: #2e7d32; margin: 0; font-size: 14px; font-family: 'Poppins', sans-serif;">
                    ✅ <strong>Status:</strong> Approved and confirmation email sent to guest.
                </p>
            </div>

            <p style="color: #555; font-size: 14px; line-height: 1.6; margin-top: 30px; font-family: 'Poppins', sans-serif;">
                This is an automated notification for record-keeping purposes.
            </p>
        </div>
    `;
    return getEmailWrapper(content);
};

export {
    getAdminNotificationEmail,
    getGuestAcknowledgmentEmail,
    getGuestApprovalEmail,
    getAdminApprovalCopyEmail
};
