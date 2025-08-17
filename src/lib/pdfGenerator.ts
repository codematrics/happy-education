/**
 * PDF Receipt Generator
 * Simple HTML-to-PDF solution for generating transaction receipts
 */

export interface ReceiptData {
  transactionId: string;
  orderId: string;
  date: Date;
  customerName: string;
  customerEmail: string;
  courseName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo?: string;
}

/**
 * Generate HTML receipt that can be converted to PDF
 */
export function generateReceiptHTML(
  receiptData: ReceiptData,
  companyInfo?: CompanyInfo
): string {
  const company = companyInfo || {
    name: "Happy Education",
    address: "123 Education Street, Learning City, LC 12345",
    phone: "+1 (555) 123-4567",
    email: "support@happyeducation.com",
    website: "www.happyeducation.com",
  };

  const formatCurrency = (amount: number, currency: string) => {
    const currencySymbols: Record<string, string> = {
      usd: "$",
      eur: "€",
      gbp: "£",
      inr: "₹",
      dollar: "$",
      rupee: "₹",
    };

    const symbol =
      currencySymbols[currency.toLowerCase()] || currency.toUpperCase();
    return `${symbol}${amount.toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Receipt - ${receiptData.orderId}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background: #f5f5f5;
                padding: 20px;
            }
            
            .receipt {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 40px;
                padding-bottom: 30px;
                border-bottom: 3px solid #2563eb;
            }
            
            .company-info h1 {
                color: #2563eb;
                font-size: 28px;
                margin-bottom: 10px;
            }
            
            .company-info p {
                color: #666;
                margin: 5px 0;
                font-size: 14px;
            }
            
            .receipt-info {
                text-align: right;
            }
            
            .receipt-info h2 {
                color: #333;
                font-size: 24px;
                margin-bottom: 10px;
            }
            
            .receipt-info p {
                color: #666;
                margin: 5px 0;
            }
            
            .status {
                display: inline-block;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: bold;
                text-transform: uppercase;
                font-size: 12px;
                letter-spacing: 1px;
            }
            
            .status.success {
                background: #dcfce7;
                color: #16a34a;
                border: 1px solid #16a34a;
            }
            
            .status.failed {
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #dc2626;
            }
            
            .status.pending {
                background: #fef3c7;
                color: #d97706;
                border: 1px solid #d97706;
            }
            
            .customer-section {
                margin: 30px 0;
                padding: 20px;
                background: #f8fafc;
                border-radius: 8px;
                border-left: 4px solid #2563eb;
            }
            
            .customer-section h3 {
                color: #333;
                margin-bottom: 15px;
                font-size: 18px;
            }
            
            .customer-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            
            .customer-details p {
                color: #666;
            }
            
            .customer-details strong {
                color: #333;
            }
            
            .transaction-details {
                margin: 30px 0;
            }
            
            .transaction-details h3 {
                color: #333;
                margin-bottom: 20px;
                font-size: 18px;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 10px;
            }
            
            .details-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .detail-item {
                display: flex;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .detail-item:last-child {
                border-bottom: none;
            }
            
            .detail-label {
                color: #666;
                font-weight: 500;
            }
            
            .detail-value {
                color: #333;
                font-weight: 600;
            }
            
            .course-section {
                margin: 30px 0;
                padding: 25px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 10px;
            }
            
            .course-section h3 {
                margin-bottom: 15px;
                font-size: 20px;
            }
            
            .course-name {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            
            .course-access {
                background: rgba(255,255,255,0.2);
                padding: 15px;
                border-radius: 8px;
                margin-top: 15px;
            }
            
            .amount-section {
                margin: 30px 0;
                text-align: right;
                padding: 25px;
                background: #f8fafc;
                border-radius: 8px;
                border: 2px solid #e5e7eb;
            }
            
            .amount-section h3 {
                color: #333;
                margin-bottom: 15px;
                font-size: 18px;
            }
            
            .total-amount {
                font-size: 32px;
                font-weight: bold;
                color: #2563eb;
                margin: 10px 0;
            }
            
            .footer {
                margin-top: 40px;
                padding-top: 30px;
                border-top: 2px solid #e5e7eb;
                text-align: center;
                color: #666;
            }
            
            .footer h4 {
                color: #333;
                margin-bottom: 15px;
            }
            
            .footer p {
                margin: 5px 0;
                font-size: 14px;
            }
            
            .thank-you {
                margin: 30px 0;
                text-align: center;
                padding: 20px;
                background: #dcfce7;
                border-radius: 8px;
                border: 1px solid #16a34a;
            }
            
            .thank-you h3 {
                color: #16a34a;
                margin-bottom: 10px;
            }
            
            .thank-you p {
                color: #166534;
            }
            
            @media print {
                body {
                    background: white;
                    padding: 0;
                }
                
                .receipt {
                    box-shadow: none;
                    border: 1px solid #ddd;
                }
            }
        </style>
    </head>
    <body>
        <div class="receipt">
            <div class="header">
                <div class="company-info">
                    <h1>${company.name}</h1>
                    <p>${company.address}</p>
                    <p>Phone: ${company.phone}</p>
                    <p>Email: ${company.email}</p>
                    <p>Website: ${company.website}</p>
                </div>
                <div class="receipt-info">
                    <h2>RECEIPT</h2>
                    <p><strong>Receipt ID:</strong> ${
                      receiptData.transactionId
                    }</p>
                    <p><strong>Date:</strong> ${formatDate(
                      receiptData.date
                    )}</p>
                    <p><strong>Status:</strong> <span class="status ${
                      receiptData.status
                    }">${receiptData.status}</span></p>
                </div>
            </div>
            
            <div class="customer-section">
                <h3>👤 Customer Information</h3>
                <div class="customer-details">
                    <p><strong>Name:</strong> ${receiptData.customerName}</p>
                    <p><strong>Email:</strong> ${receiptData.customerEmail}</p>
                </div>
            </div>
            
            <div class="course-section">
                <h3>📚 Course Details</h3>
                <div class="course-name">${receiptData.courseName}</div>
                <div class="course-access">
                    <strong>✅ Access Granted:</strong> You now have full access to this course and all its materials.
                </div>
            </div>
            
            <div class="transaction-details">
                <h3>💳 Transaction Details</h3>
                <div class="details-grid">
                    <div>
                        <div class="detail-item">
                            <span class="detail-label">Order ID:</span>
                            <span class="detail-value">${
                              receiptData.orderId
                            }</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Payment Method:</span>
                            <span class="detail-value">${
                              receiptData.paymentMethod
                            }</span>
                        </div>
                    </div>
                    <div>
                        <div class="detail-item">
                            <span class="detail-label">Transaction ID:</span>
                            <span class="detail-value">${
                              receiptData.transactionId
                            }</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Currency:</span>
                            <span class="detail-value">${receiptData.currency.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="amount-section">
                <h3>💰 Amount Paid</h3>
                <div class="total-amount">${formatCurrency(
                  receiptData.amount,
                  receiptData.currency
                )}</div>
                <p>Payment completed successfully</p>
            </div>
            
            <div class="thank-you">
                <h3>🎉 Thank You for Your Purchase!</h3>
                <p>We're excited to have you as a student. Start learning and achieve your goals!</p>
            </div>
            
            <div class="footer">
                <h4>Need Help?</h4>
                <p>If you have any questions about your purchase or need technical support,</p>
                <p>please contact us at ${company.email} or call ${
    company.phone
  }</p>
                <p style="margin-top: 20px; font-size: 12px;">
                    This is a computer-generated receipt. No signature required.
                </p>
                <p style="font-size: 12px;">
                    &copy; ${new Date().getFullYear()} ${
    company.name
  }. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
}

/**
 * Generate receipt for download (returns HTML that can be converted to PDF client-side)
 */
export function generateReceiptForDownload(receiptData: ReceiptData): string {
  return generateReceiptHTML(receiptData);
}

/**
 * Create receipt data from transaction
 */
export function createReceiptData(
  transaction: any,
  course: any,
  user: any
): ReceiptData {
  return {
    transactionId: transaction.paymentId || transaction._id,
    orderId: transaction.orderId,
    date: transaction.createdAt || new Date(),
    customerName: `${user.firstName} ${user.lastName}`,
    customerEmail: user.email,
    courseName: course.name,
    amount: transaction.amount,
    currency: transaction.currency,
    paymentMethod: transaction.paymentMethod || "Online Payment",
    status: transaction.status,
  };
}

/**
 * Generate simple text receipt for email
 */
export function generateTextReceipt(receiptData: ReceiptData): string {
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatCurrency = (amount: number, currency: string) => {
    const currencySymbols: Record<string, string> = {
      usd: "$",
      eur: "€",
      gbp: "£",
      inr: "₹",
      dollar: "$",
      rupee: "₹",
    };

    const symbol =
      currencySymbols[currency.toLowerCase()] || currency.toUpperCase();
    return `${symbol}${amount.toFixed(2)}`;
  };

  return `
RECEIPT - Happy Education
========================

Receipt ID: ${receiptData.transactionId}
Date: ${formatDate(receiptData.date)}
Status: ${receiptData.status.toUpperCase()}

CUSTOMER INFORMATION
--------------------
Name: ${receiptData.customerName}
Email: ${receiptData.customerEmail}

COURSE DETAILS
--------------
Course: ${receiptData.courseName}
Access: Full access granted

TRANSACTION DETAILS
-------------------
Order ID: ${receiptData.orderId}
Transaction ID: ${receiptData.transactionId}
Payment Method: ${receiptData.paymentMethod}
Currency: ${receiptData.currency.toUpperCase()}

AMOUNT PAID
-----------
Total: ${formatCurrency(receiptData.amount, receiptData.currency)}

Thank you for your purchase!

---
Happy Education
support@happyeducation.com
This is a computer-generated receipt.
  `;
}

/**
 * Save receipt HTML to Cloudinary as a raw file
 */
export async function saveReceiptToCloudinary(
  receiptHTML: string,
  orderId: string
): Promise<{ publicId: string; url: string } | null> {
  try {
    // Convert HTML string into a Blob
    const blob = new Blob([receiptHTML], { type: "text/html" });

    // Cloudinary upload API expects FormData
    const formData = new FormData();
    formData.append("file", blob, `receipt-${orderId}.html`);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!
    );
    formData.append("folder", "receipts");
    formData.append("public_id", `receipt-${orderId}`);

    // Direct upload to Cloudinary unsigned endpoint
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (result.secure_url) {
      return {
        publicId: result.public_id,
        url: result.secure_url,
      };
    }

    return null;
  } catch (error) {
    console.error("Error saving receipt to Cloudinary:", error);
    return null;
  }
}

/**
 * Get receipt from Cloudinary
 */
export async function getReceiptFromCloudinary(
  publicId: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${publicId}`
    );

    if (response.ok) {
      return await response.text();
    }

    return null;
  } catch (error) {
    console.error("Error fetching receipt from Cloudinary:", error);
    return null;
  }
}

export default {
  generateReceiptHTML,
  generateReceiptForDownload,
  createReceiptData,
  generateTextReceipt,
  saveReceiptToCloudinary,
  getReceiptFromCloudinary,
};
