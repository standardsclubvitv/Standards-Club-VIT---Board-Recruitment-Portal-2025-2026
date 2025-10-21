# 🚀 Vercel Deployment Guide

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- GitHub repository with your code
- MongoDB Atlas database URL
- Admin credentials for admin panel

## Step 1: Prepare Environment Variables

You'll need to set these environment variables in Vercel:

```
MONGODB_URI=mongodb+srv://raybanpranavmahesh2023:UixrwbHoHNs5EOjF@lostperson.zgd2p.mongodb.net/standards_recruitment

ADMIN_EMAIL=standardsclub@vit.ac.in
ADMIN_PASSWORD=YourSecureProductionPassword

NODEMAILER_HOST=smtp.gmail.com
NODEMAILER_PORT=587
NODEMAILER_USER=your-email@gmail.com
NODEMAILER_PASS=your-app-specific-password

ADMIN_PHONE=+91-XXXXXXXXXX

NODE_ENV=production
```

⚠️ **Important**: Use a strong password for `ADMIN_PASSWORD` in production!

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add MONGODB_URI
   vercel env add ADMIN_EMAIL
   vercel env add ADMIN_PASSWORD
   # ... add all other variables
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Option B: Deploy via Vercel Dashboard

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Production ready deployment"
   git push origin main
   ```

2. **Import Project in Vercel**:
   - Go to https://vercel.com/dashboard
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration from `vercel.json`

3. **Configure Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all the environment variables listed above
   - Make sure to add them for "Production" environment

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete

## Step 3: Verify Deployment

After deployment, test these URLs:

1. **Main Application**: 
   - `https://your-domain.vercel.app/`

2. **API Endpoints**:
   - `https://your-domain.vercel.app/api/get-positions`
   - `https://your-domain.vercel.app/api/submit-application` (POST)
   - `https://your-domain.vercel.app/api/admin/login` (POST)
   - `https://your-domain.vercel.app/api/admin/get-applications` (GET)

3. **Admin Panel**: 
   - `https://your-domain.vercel.app/admin/`
   - Login with your `ADMIN_EMAIL` and `ADMIN_PASSWORD`

## Step 4: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `recruitment.standardsclub.com`)
3. Follow Vercel's instructions to configure DNS

## Serverless API Configuration

All API routes are configured as serverless functions:

- **api/get-positions.js** - Fetches available positions
- **api/submit-application.js** - Handles form submissions
- **api/admin/login.js** - Admin authentication
- **api/admin/get-applications.js** - Fetches all applications

Each function has:
- **Max Duration**: 10 seconds
- **Memory**: 1024 MB
- **CORS**: Enabled for all origins

## Troubleshooting

### Issue: 500 Internal Server Error
**Solution**: Check environment variables are set correctly in Vercel dashboard

### Issue: Database Connection Failed
**Solution**: 
1. Verify `MONGODB_URI` is correct
2. Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Vercel)
3. Verify database user has read/write permissions

### Issue: Email Not Sending
**Solution**:
1. Verify `NODEMAILER_USER` and `NODEMAILER_PASS`
2. For Gmail, use App-Specific Password (not regular password)
3. Enable "Less secure app access" or use OAuth2

### Issue: Admin Panel Not Loading
**Solution**: 
1. Clear browser cache
2. Check if `/admin/` route is accessible
3. Verify static files are being served correctly

## Monitoring

- **Logs**: Check Vercel dashboard → Your Project → Logs
- **Analytics**: Enable Vercel Analytics for traffic insights
- **Performance**: Monitor function execution times in dashboard

## Security Checklist

✅ Environment variables set in Vercel (not in code)  
✅ Strong admin password used  
✅ HTTPS enabled (automatic with Vercel)  
✅ CORS configured properly  
✅ MongoDB connection string secured  
✅ No console logs in production code  

## Cost Estimation

**Vercel Free Tier Includes**:
- 100 GB bandwidth
- Unlimited API requests
- 100 hours serverless function execution
- Automatic HTTPS

This should be sufficient for a recruitment portal with moderate traffic.

## Post-Deployment

1. **Test all features**:
   - Form submission
   - Email confirmation
   - Admin login
   - View applications
   - Download Excel

2. **Share URLs**:
   - Main site: `https://your-domain.vercel.app/`
   - Admin panel: `https://your-domain.vercel.app/admin/`

3. **Monitor**:
   - Check logs regularly
   - Monitor email delivery
   - Track application submissions

## Support

For issues related to:
- **Vercel Deployment**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Nodemailer**: https://nodemailer.com/about/

---

**🎉 Your Standards Club Recruitment Portal is now live!**
