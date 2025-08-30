interface EventRegistrationEmailData {
  userName: string;
  eventName: string;
  eventDate: string;
  joinLink: string;
  eventDescription?: string;
  benefits?: string[];
}

export const eventRegistrationEmailTemplate = (data: EventRegistrationEmailData): string => {
  const { userName, eventName, eventDate, joinLink, eventDescription, benefits } = data;
  
  const benefitsList = benefits && benefits.length > 0 
    ? benefits.map(benefit => `<li style="margin-bottom: 8px; color: #4a5568;">${benefit}</li>`).join('')
    : '';

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
            <div class="event-date">📅 Event Date: ${new Date(eventDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
            ${eventDescription ? `<div class="event-description">${eventDescription}</div>` : ''}
          </div>

          ${benefitsList ? `
            <div class="benefits">
              <h3>What you'll get:</h3>
              <ul>
                ${benefitsList}
              </ul>
            </div>
          ` : ''}

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
};