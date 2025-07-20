// deployment guide
DEPLOYMENT CHECKLIST:

1. Environment Variables:
   ✓ DATABASE_URL
   ✓ NEXTAUTH_URL
   ✓ NEXTAUTH_SECRET
   ✓ STRIPE_PUBLISHABLE_KEY
   ✓ STRIPE_SECRET_KEY
   ✓ STRIPE_WEBHOOK_SECRET
   ✓ SENDGRID_API_KEY
   ✓ FROM_EMAIL
   ✓ CLOUDINARY_CLOUD_NAME
   ✓ CLOUDINARY_API_KEY
   ✓ CLOUDINARY_API_SECRET

2. Database Setup:
   ✓ Create production database
   ✓ Run migrations: npm run db:migrate
   ✓ Seed initial data: npm run db:seed

3. Stripe Setup:
   ✓ Configure webhook endpoint: /api/webhooks/stripe
   ✓ Add webhook events: payment_intent.succeeded, invoice.payment_succeeded

4. Domain Configuration:
   ✓ Update NEXTAUTH_URL to production domain
   ✓ Configure CORS for API endpoints
   ✓ Set up SSL certificates

5. Monitoring:
   ✓ Set up error tracking (Sentry)
   ✓ Configure logging
   ✓ Set up uptime monitoring

6. Performance:
   ✓ Enable database connection pooling
   ✓ Configure CDN for static assets
   ✓ Set up Redis for caching

7. Security:
   ✓ Review API rate limiting
   ✓ Validate all input schemas
   ✓ Set up database backups
   ✓ Configure firewall rules

8. Testing:
   ✓ Run all tests: npm run test
   ✓ Test payment flows
   ✓ Test email delivery
   ✓ Test file uploads

Ready for production! 🚀
