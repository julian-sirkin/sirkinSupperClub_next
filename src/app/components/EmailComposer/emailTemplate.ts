export const emailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sirkin Supper Club</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .content {
      margin-bottom: 30px;
    }
    .footer {
      border-top: 2px solid #D4AF37;
      padding-top: 20px;
      text-align: center;
      color: #666;
    }
    .social-links {
      margin: 15px 0;
    }
    .social-links a {
      color: #D4AF37;
      text-decoration: none;
      margin: 0 10px;
    }
    .social-links a:hover {
      text-decoration: underline;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <div class="logo">
    <img src="https://sirkinsupper.club/logo.png" alt="Sirkin Supper Club" style="max-width: 200px;">
  </div>
  
  <div class="content">
    ${content}
  </div>

  <div class="footer">
    <div class="social-links">
      <a href="https://www.tiktok.com/@sirkinsupper.club" target="_blank">TikTok</a>
      <a href="https://www.instagram.com/sirkinsupper.club" target="_blank">Supper Club Instagram</a>
      <a href="https://www.instagram.com/sirkinchef" target="_blank">Chef's Instagram</a>
    </div>
    <p>© ${new Date().getFullYear()} Sirkin Supper Club. All rights reserved.</p>
  </div>
</body>
</html>
`; 