import nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

// Create reusable transporter object using environment variables
const createTransporter = () => {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  };

  return nodemailer.createTransporter(config);
};

/**
 * Send email using nodemailer
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: options.from || process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send password to new user created during payment
 */
export async function sendNewUserPassword(
  email: string,
  password: string,
  courseName: string
): Promise<boolean> {
  const subject = 'Welcome! Your account has been created';
  
  const html = `
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
                <a href="${process.env.FRONTEND_URL || 'https://yourdomain.com'}/signin" class="button">
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
  `;

  const text = `
    Welcome to Happy Education!
    
    Your account has been created successfully after your course purchase.
    
    Course: ${courseName}
    Email: ${email}
    Password: ${password}
    
    IMPORTANT: Please change your password after your first login for security.
    
    Login at: ${process.env.FRONTEND_URL || 'https://yourdomain.com'}/signin
    
    Thank you for choosing Happy Education!
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * Send purchase confirmation email
 */
export async function sendPurchaseConfirmation(
  email: string,
  courseName: string,
  amount: number,
  currency: string,
  orderId: string
): Promise<boolean> {
  const subject = 'Purchase Confirmation - Course Access Granted';
  
  const html = `
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
                <a href="${process.env.FRONTEND_URL || 'https://yourdomain.com'}/my-courses" class="button">
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
  `;

  const text = `
    Purchase Successful!
    
    Your course purchase has been confirmed.
    
    Course: ${courseName}
    Amount: ${currency.toUpperCase()} ${amount}
    Order ID: ${orderId}
    Date: ${new Date().toLocaleDateString()}
    
    Access your course: ${process.env.FRONTEND_URL || 'https://yourdomain.com'}/my-courses
    
    Thank you for choosing Happy Education!
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * Send OTP email
 */
export async function sendOTPEmail(
  email: string,
  otp: string,
  purpose: 'signup' | 'forgot-password' | 'verification' = 'verification'
): Promise<boolean> {
  const subjects = {
    signup: 'Complete Your Registration',
    'forgot-password': 'Reset Your Password',
    verification: 'Verify Your Account',
  };

  const subject = subjects[purpose];
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .otp { font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; color: #2563eb; text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; }
            .expiry { background: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #f59e0b; margin: 20px 0; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎓 Happy Education</h1>
            <h2>${subject}</h2>
            <p>Your verification code is:</p>
            <div class="otp">${otp}</div>
            <div class="expiry">⏰ This code expires in 5 minutes</div>
            <p>If you didn't request this code, please ignore this email.</p>
            <p>Thank you!</p>
        </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
  });
}

export default {
  sendEmail,
  sendNewUserPassword,
  sendPurchaseConfirmation,
  sendOTPEmail,
};