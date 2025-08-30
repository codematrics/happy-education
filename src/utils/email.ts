export const emailTemplate = {
  otp: (otp: string) => `<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP Code</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="max-w-2xl mx-auto my-8 bg-white rounded-lg shadow-md overflow-hidden">
        <div class="bg-indigo-600 py-6 px-8">
            <h1 class="text-3xl font-bold text-white text-center">Your OTP Code</h1>
        </div>
        <div class="p-8">
            <p class="text-gray-700 mb-6">Hello,</p>
            <p class="text-gray-700 mb-6">Your One-Time Password (OTP) for account verification is:</p>
            <div class="bg-gray-100 rounded-lg p-4 mb-6">
                <p class="text-4xl font-bold text-center text-indigo-600">${otp}</p>
            </div>
            <p class="text-gray-700 mb-6">This OTP is valid for <span class="font-semibold">5 minutes</span>. Please do not share this code with anyone.</p>
            <p class="text-gray-700 mb-2">If you didn't request this code, please ignore this email.</p>
            <p class="text-gray-700">Thank you for using our service!</p>
        </div>
        <div class="bg-gray-100 py-4 px-8">
            <p class="text-sm text-gray-600 text-center">&copy; 2024 Happy Education. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
  sendNewPass: (email: string, password: string, courseName: string) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Happy Education</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 10px;
            }
            .title {
                color: #1f2937;
                font-size: 20px;
                margin-bottom: 20px;
            }
            .course-info {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #2563eb;
            }
            .credentials {
                background: #fef3c7;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border: 1px solid #f59e0b;
            }
            .password {
                font-family: 'Courier New', monospace;
                font-size: 18px;
                font-weight: bold;
                color: #dc2626;
                background: white;
                padding: 10px;
                border-radius: 4px;
                border: 1px solid #e5e7eb;
                text-align: center;
                margin: 10px 0;
            }
            .warning {
                background: #fef2f2;
                padding: 15px;
                border-radius: 8px;
                border: 1px solid #f87171;
                margin: 20px 0;
            }
            .button {
                display: inline-block;
                background: #2563eb;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                margin: 20px 0;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 14px;
                color: #6b7280;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🎓 Happy Education</div>
                <h1 class="title">Welcome! Your Account Has Been Created</h1>
            </div>
            
            <p>Congratulations! Your payment for the course was successful, and we've automatically created an account for you.</p>
            
            <div class="course-info">
                <h3>Course Purchased:</h3>
                <strong>${courseName}</strong>
            </div>
            
            <div class="credentials">
                <h3>Your Login Credentials:</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong></p>
                <div class="password">${password}</div>
            </div>
            
            <div class="warning">
                <strong>⚠️ Important Security Notice:</strong>
                <ul>
                    <li>Please change your password after your first login</li>
                    <li>Keep your credentials secure and don't share them</li>
                    <li>This password was generated randomly for your security</li>
                </ul>
            </div>
            
            <p>You can now access your course and start learning immediately!</p>
            
            <div style="text-align: center;">
                <a href="${
                  process.env.FRONTEND_URL || "https://yourdomain.com"
                }/signin" class="button">
                    Login to Your Account
                </a>
            </div>
            
            <div class="footer">
                <p>If you have any questions, please contact our support team.</p>
                <p>Thank you for choosing Happy Education!</p>
                <p>&copy; ${new Date().getFullYear()} Happy Education. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `,
  sendPurchaseConfirmation: (
    email: string,
    courseName: string,
    amount: number,
    currency: string,
    orderId: string
  ) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Purchase Confirmation</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 10px;
            }
            .success {
                background: #dcfce7;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #16a34a;
                text-align: center;
                margin: 20px 0;
            }
            .order-details {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .button {
                display: inline-block;
                background: #2563eb;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                margin: 20px 0;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 14px;
                color: #6b7280;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🎓 Happy Education</div>
                <h1>Purchase Successful!</h1>
            </div>
            
            <div class="success">
                <h2>✅ Payment Confirmed</h2>
                <p>Your course purchase has been processed successfully.</p>
            </div>
            
            <div class="order-details">
                <h3>Order Details:</h3>
                <p><strong>Course:</strong> ${courseName}</p>
                <p><strong>Amount:</strong> ${currency.toUpperCase()} ${amount}</p>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>You now have access to your course and can start learning immediately!</p>
            
            <div style="text-align: center;">
                <a href="${
                  process.env.FRONTEND_URL || "https://yourdomain.com"
                }/my-courses" class="button">
                    Access Your Course
                </a>
            </div>
            
            <div class="footer">
                <p>Thank you for choosing Happy Education!</p>
                <p>&copy; ${new Date().getFullYear()} Happy Education. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `,
  eventRegistrationEmailTemplate: (
    userName: string,
    eventName: string,
    eventDate: string,
    joinLink: string,
    eventDescription?: string,
    benefits?: string[]
  ) => {
    const benefitsList =
      benefits && benefits.length > 0
        ? benefits
            .map(
              (benefit) =>
                `<li style="margin-bottom: 8px; color: #4a5568;">${benefit}</li>`
            )
            .join("")
        : "";

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Registration Confirmation</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #2d3748;
          background-color: #f7fafc;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-top: 20px;
          margin-bottom: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 30px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
        }
        .event-details {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          border-left: 4px solid #667eea;
        }
        .event-name {
          font-size: 24px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 10px;
        }
        .event-date {
          font-size: 16px;
          color: #4a5568;
          margin-bottom: 15px;
        }
        .event-description {
          font-size: 16px;
          color: #4a5568;
          line-height: 1.6;
        }
        .join-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          text-align: center;
          margin: 25px 0;
          box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
        }
        .join-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
        }
        .benefits {
          margin: 20px 0;
        }
        .benefits h3 {
          color: #2d3748;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
        }
        .benefits ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .benefits li {
          position: relative;
          padding-left: 25px;
          margin-bottom: 10px;
        }
        .benefits li:before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #48bb78;
          font-weight: 700;
          font-size: 16px;
        }
        .footer {
          background-color: #edf2f7;
          padding: 20px;
          text-align: center;
          color: #4a5568;
          font-size: 14px;
        }
        .warning {
          background-color: #fef5e7;
          border: 1px solid #fbd38d;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          color: #744210;
        }
        .warning strong {
          display: block;
          margin-bottom: 5px;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .header, .content {
            padding: 20px;
          }
          .event-name {
            font-size: 20px;
          }
          .join-button {
            width: 100%;
            box-sizing: border-box;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Registration Confirmed!</h1>
          <p>You're all set for the event</p>
        </div>
        
        <div class="content">
          <p>Dear <strong>${userName}</strong>,</p>
          
          <p>Thank you for registering! Your payment has been successfully processed and you're now registered for our upcoming event.</p>
          
          <div class="event-details">
            <div class="event-name">${eventName}</div>
            <div class="event-date">📅 Event Date: ${new Date(
              eventDate
            ).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</div>
            ${
              eventDescription
                ? `<div class="event-description">${eventDescription}</div>`
                : ""
            }
          </div>

          ${
            benefitsList
              ? `
            <div class="benefits">
              <h3>What you'll get:</h3>
              <ul>
                ${benefitsList}
              </ul>
            </div>
          `
              : ""
          }

          <div style="text-align: center; margin: 30px 0;">
            <a href="${joinLink}" class="join-button">
              🚀 Join Event Now
            </a>
          </div>

          <div class="warning">
            <strong>Important:</strong>
            Please save this email and the join link. You'll need it to access the event. The link will be active on the event date.
          </div>

          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>We look forward to seeing you at the event!</p>
          
          <p>Best regards,<br>
          <strong>The Events Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply to this email.</p>
          <p>If you need help, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  },
};
