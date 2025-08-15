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
};
