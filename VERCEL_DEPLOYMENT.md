# 🚀 Vercel Deployment Guide

## Quick Deploy Steps

### 1. Connect GitHub Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Select **"Import Git Repository"**
4. Search for: `standardsclubvitv/Standards-Club-VIT---Board-Recruitment-Portal-2025-2026`
5. Click **"Import"**

### 2. Configure Project Settings

#### Framework Preset
- Select: **"Other"** (or leave as detected)

#### Root Directory
- Leave as: `./` (root)

#### Build Settings
- **Build Command**: Leave empty (static + serverless)
- **Output Directory**: `public`
- **Install Command**: `npm install`

### 3. Add Environment Variables

Click **"Environment Variables"** and add the following:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/standards_recruitment
ADMIN_EMAIL=standardsclub@vit.ac.in
ADMIN_PASSWORD=YourSecurePassword123!
NODEMAILER_HOST=smtp.gmail.com
NODEMAILER_PORT=587
NODEMAILER_USER=your.email@gmail.com
NODEMAILER_PASS=your-app-specific-password
ADMIN_PHONE=+91-9876543210
NODE_ENV=production
```

#### 📧 Gmail Setup for Nodemailer:
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification → Enable it
3. Security → App Passwords → Generate new password
4. Copy the 16-character password → Use as `NODEMAILER_PASS`

### 4. Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Your site will be live at: `https://your-project-name.vercel.app`

---

## 🔧 Vercel Configuration Explained

Your `vercel.json` is configured for optimal serverless deployment:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    // All API routes → Single serverless function
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    // Admin panel → Static files
    {
      "src": "/admin/(.*)",
      "dest": "/public/admin/$1"
    },
    // Root → Static files
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### How It Works:

1. **Single Serverless Function**: `api/index.js` handles all API routes
   - `/api/get-positions` → Get available positions
   - `/api/submit-application` → Submit application form
   - `/api/admin/login` → Admin authentication
   - `/api/admin/get-applications` → Fetch all applications

2. **Static Files**: HTML, CSS, JS served from `/public`
   - Main site: `/public/index.html`
   - Admin panel: `/public/admin/index.html`

3. **Automatic Scaling**: Vercel handles traffic spikes automatically

---

## ✅ Post-Deployment Checklist

### Test Application Form
1. Visit: `https://your-domain.vercel.app`
2. Fill out the recruitment form
3. Submit and check for confirmation email
4. Verify application ID format: `SC25XXXX`

### Test Admin Panel
1. Visit: `https://your-domain.vercel.app/admin/`
2. Login with your `ADMIN_EMAIL` and `ADMIN_PASSWORD`
3. Check if applications appear in dashboard
4. Test search and filter functions
5. Try Excel download

### Verify Database
1. Login to MongoDB Atlas
2. Navigate to `standards_recruitment` database
3. Check `applications` collection for new entries

### Verify Email
1. Check recipient's inbox for confirmation email
2. Verify email formatting and application ID
3. Check spam folder if not received

---

## 🔄 Update Deployment

When you make changes to your code:

```bash
# Commit changes
git add .
git commit -m "Your commit message"
git push origin main

# Vercel will automatically redeploy!
```

---

## 🐛 Troubleshooting

### Issue: Build Failed
**Solution**: Check Vercel build logs for specific error
- Common: Missing dependencies → Add to `package.json`
- Common: Wrong Node version → Vercel uses Node 18+

### Issue: API Returns 500 Error
**Solution**: Check Function Logs in Vercel Dashboard
- Common: MongoDB connection timeout
- Common: Missing environment variables

### Issue: Email Not Sending
**Solution**: 
1. Verify Gmail App Password is correct
2. Check `NODEMAILER_USER` and `NODEMAILER_PASS`
3. Enable "Less secure app access" (if not using App Password)

### Issue: Admin Login Failed
**Solution**:
1. Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` in Vercel environment
2. Check browser console for errors
3. Clear browser cache and cookies

### Issue: MongoDB Connection Timeout
**Solution**:
1. Go to MongoDB Atlas → Network Access
2. Add `0.0.0.0/0` to IP Whitelist (allow all)
3. Or add Vercel's IP ranges

---

## 🔐 Security Best Practices

### 1. Admin Panel
- ✅ Hidden URL (not linked from main site)
- ✅ Password protected
- ✅ Share URL only with authorized personnel

### 2. Environment Variables
- ✅ Never commit `.env.local` to Git
- ✅ Use strong passwords
- ✅ Rotate credentials periodically

### 3. Database
- ✅ Use MongoDB Atlas (managed service)
- ✅ Enable authentication
- ✅ Whitelist only necessary IPs

### 4. Email
- ✅ Use App-specific passwords
- ✅ Never share credentials
- ✅ Monitor email usage

---

## 📊 Monitoring

### Vercel Dashboard
- **Analytics**: Track page views and user behavior
- **Function Logs**: Monitor API performance
- **Deployments**: View deployment history
- **Bandwidth**: Monitor usage

### MongoDB Atlas
- **Database Monitoring**: Track queries and performance
- **Alerts**: Set up alerts for high usage
- **Backups**: Enable automatic backups

---

## 🎯 Custom Domain (Optional)

To use your own domain:

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Click **"Add Domain"**
3. Enter your domain: `recruitment.standardsclub.com`
4. Follow DNS configuration instructions
5. Wait for DNS propagation (up to 48 hours)

---

## 📞 Support

For deployment issues:
- **Email**: standardsclub@vit.ac.in
- **GitHub Issues**: [Create an issue](https://github.com/standardsclubvitv/Standards-Club-VIT---Board-Recruitment-Portal-2025-2026/issues)

---

**🎉 Congratulations! Your recruitment portal is now live!**

**Live URLs:**
- 🌐 Main Site: `https://your-domain.vercel.app`
- 🔐 Admin Panel: `https://your-domain.vercel.app/admin/`

---

Made with ❤️ by Standards Club Tech Team
