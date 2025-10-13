// lib/email/welcome-email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendWelcomeEmailParams {
  email: string;
  password: string;
  name: string;
  organizationId: string;
}

export async function sendWelcomeEmailWithCredentials({
  email,
  password,
  name,
  organizationId,
}: SendWelcomeEmailParams) {
  // Get organization details
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { name: true },
  });
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`;
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f9fafb;
            padding: 30px;
            border-radius: 0 0 5px 5px;
          }
          .credentials {
            background-color: white;
            padding: 20px;
            border-left: 4px solid #4F46E5;
            margin: 20px 0;
          }
          .credential-item {
            margin: 10px 0;
          }
          .credential-label {
            font-weight: bold;
            color: #4F46E5;
          }
          .credential-value {
            font-family: monospace;
            background-color: #f3f4f6;
            padding: 8px 12px;
            border-radius: 4px;
            display: inline-block;
            margin-top: 5px;
          }
          .button {
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .warning {
            background-color: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${organization?.name || 'Church Management System'}!</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Your account has been created successfully. You can now access the church management system using the credentials below:</p>
            <div class="credentials">
              <div class="credential-item">
                <div class="credential-label">Email:</div>
                <div class="credential-value">${email}</div>
              </div>
              <div class="credential-item">
                <div class="credential-label">Temporary Password:</div>
                <div class="credential-value">${password}</div>
              </div>
            </div>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> Please change your password after your first login. This temporary password should only be used once.
            </div>
            <center>
              <a href="${loginUrl}" class="button">Login to Your Account</a>
            </center>
            <p>If you have any questions or need assistance, please don't hesitate to contact your church administrator.</p>
            <p>God bless you!</p>
            <div class="footer">
              <p>This is an automated message from ${organization?.name || 'Church Management System'}</p>
              <p>If you did not expect this email, please contact your church administrator.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
  await resend.emails.send({
    from:
      process.env.EMAIL_FROM ||
      'Church Management <noreply@churchmanagement.com>',
    to: email,
    subject: `Welcome to ${organization?.name || 'Church Management System'}`,
    html: emailHtml,
  });
}

// Alternative: Send SMS for users without email
// biome-ignore lint/suspicious/useAwait: ignored for now
export async function sendWelcomeSMS({
  phoneNumber,
  password,
  name,
}: {
  phoneNumber: string;
  password: string;
  name: string;
}) {
  // Use your SMS provider (e.g., Twilio, Africa's Talking)
  const message = `Hello ${name}, welcome! Your login password is: ${password}. Please change it after first login. Login at: ${process.env.NEXT_PUBLIC_APP_URL}/login`;

  // Example with Africa's Talking (popular in Kenya)
  // const AfricasTalking = require('africastalking')({
  //   apiKey: process.env.AFRICAS_TALKING_API_KEY,
  //   username: process.env.AFRICAS_TALKING_USERNAME,
  // });
  //
  // const sms = AfricasTalking.SMS;
  // await sms.send({
  //   to: [phoneNumber],
  //   message,
  // });
  console.log('SMS would be sent to:', phoneNumber);
}