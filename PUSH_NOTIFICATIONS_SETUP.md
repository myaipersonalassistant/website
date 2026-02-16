# Push Notifications Setup Guide

This guide explains how to set up Web Push Notifications that work even when the website is closed.

## Prerequisites

1. **Install web-push library** (for backend):
```bash
npm install web-push
```

2. **Generate VAPID Keys**:
```bash
npx web-push generate-vapid-keys
```

This will output:
- Public Key (VAPID Public Key)
- Private Key (VAPID Private Key)

## Environment Variables

Add these to your `.env.local` (frontend) and Vercel environment variables:

### Frontend (.env.local):
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.vercel.app
```

### Backend (Vercel Environment Variables):
```
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_EMAIL=mailto:your-email@example.com
CRON_API_KEY=your-secure-random-key-here (optional, for cron job security)
```

## How It Works

1. **User subscribes**: When a user creates an activity, they're automatically subscribed to push notifications
2. **Subscription saved**: Push subscription is saved to Firestore (`users/{userId}/push_subscriptions`)
3. **Scheduled job**: A cron job calls `/api/notifications/send-scheduled` every minute
4. **Notifications sent**: Backend checks for upcoming activities and sends push notifications to subscribed users
5. **Browser receives**: Even if the website is closed, the browser shows the notification
6. **User clicks**: Clicking the notification opens the website to the calendar page

## Setting Up Cron Job

### Option 1: Vercel Cron Jobs (Recommended)

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/notifications/send-scheduled",
    "schedule": "* * * * *"
  }]
}
```

### Option 2: External Cron Service

Use a service like:
- **cron-job.org**
- **EasyCron**
- **GitHub Actions** (with scheduled workflows)

Call: `POST https://your-backend-url.vercel.app/api/notifications/send-scheduled`
Headers: `X-API-Key: your-cron-api-key` (if CRON_API_KEY is set)

## Testing

1. Create an activity scheduled for 1-2 minutes in the future
2. Close the browser tab
3. Wait for the scheduled time
4. You should receive a push notification even with the tab closed

## Service Worker

The service worker (`public/sw.js`) handles:
- Receiving push notifications
- Displaying notifications
- Handling notification clicks (opens calendar page)

## Firestore Security Rules

Make sure your Firestore rules allow users to read/write their push subscriptions:

```javascript
match /users/{userId}/push_subscriptions/{subscriptionId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

## Troubleshooting

1. **Notifications not working?**
   - Check browser console for errors
   - Verify VAPID keys are set correctly
   - Ensure service worker is registered (check Application > Service Workers in DevTools)

2. **Subscription not saving?**
   - Check Firestore rules
   - Verify backend URL is correct
   - Check browser console for API errors

3. **Cron job not running?**
   - Verify cron job is set up correctly
   - Check Vercel function logs
   - Test endpoint manually: `POST /api/notifications/send-scheduled`

