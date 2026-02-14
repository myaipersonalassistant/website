# Apple Sign-In Setup Guide

This guide will walk you through setting up Apple Sign-In for your Firebase application.

## Prerequisites

1. **Apple Developer Account** (paid membership required - $99/year)
2. **Firebase Project** with Authentication enabled
3. **Domain** for your web application

## Step 1: Configure Apple Developer Console

### 1.1 Create a Service ID

1. Go to [Apple Developer Console](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** (Add new identifier)
4. Select **Services IDs** → **Continue**
5. Fill in:
   - **Description**: Your app name (e.g., "MAI-PA Web")
   - **Identifier**: `com.yourcompany.maipa.web` (must be unique)
6. Click **Continue** → **Register**

### 1.2 Configure Sign In with Apple

1. Select your newly created **Service ID**
2. Check **Sign In with Apple** → **Configure**
3. **Primary App ID**: Select your app's bundle ID (or create one)
4. **Website URLs**:
   - **Domains and Subdomains**: Your domain (e.g., `yourdomain.com`)
   - **Return URLs**: 
     - `https://YOUR_FIREBASE_AUTH_DOMAIN/__/auth/handler`
     - `http://localhost:3000/__/auth/handler` (for local development)
5. Click **Save** → **Continue** → **Register**

### 1.3 Create a Key for Sign In with Apple

1. Go to **Keys** → **+** (Create a new key)
2. **Key Name**: "Sign In with Apple Key"
3. Check **Sign In with Apple** → **Configure**
4. Select your **Primary App ID**
5. Click **Save** → **Continue** → **Register**
6. **Download the key file** (`.p8` file) - **You can only download this once!**
7. Note your **Key ID** (shown after creation)

### 1.4 Note Your Team ID

1. Go to **Membership** section
2. Copy your **Team ID** (10-character alphanumeric string)

## Step 2: Configure Firebase Console

### 2.1 Enable Apple Sign-In Provider

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Click **Apple** → **Enable**
5. Fill in:
   - **Services ID**: The identifier you created (e.g., `com.yourcompany.maipa.web`)
   - **Apple Team ID**: Your Team ID from Step 1.4
   - **Key ID**: The Key ID from Step 1.3
   - **Private Key**: Open the `.p8` file you downloaded and copy its contents
6. Click **Save**

### 2.2 Add Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Add your production domain
3. `localhost` should already be there for development

## Step 3: Environment Variables

Add these to your `.env.local` file (if not already present):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

You can find these values in Firebase Console → Project Settings → General → Your apps.

## Step 4: Testing

### 4.1 Local Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/auth?view=login` or `/auth?view=signup`

3. Click the **Apple** sign-in button

4. You should see Apple's sign-in popup

### 4.2 Common Issues & Solutions

#### Issue: "Popup was blocked"
**Solution**: 
- Allow popups for `localhost` in your browser
- Or use `signInWithRedirect` instead of `signInWithPopup` (requires code changes)

#### Issue: "Unauthorized domain"
**Solution**:
- Make sure your domain is added in Firebase Authorized domains
- Check that the Return URL in Apple Developer Console matches Firebase auth domain

#### Issue: "Operation not allowed"
**Solution**:
- Verify Apple Sign-In is enabled in Firebase Console
- Check that your Service ID is correctly configured

#### Issue: Email/Name not provided
**Solution**:
- This is normal! Apple only provides email/name on the **first sign-in**
- The code already handles this - it will use email if available, or prompt user during onboarding

## Step 5: Production Deployment

### 5.1 Update Apple Service ID

1. Go back to Apple Developer Console
2. Edit your Service ID
3. Update **Return URLs** to include your production domain:
   - `https://yourdomain.com/__/auth/handler`
   - `https://yourdomain.vercel.app/__/auth/handler` (if using Vercel)

### 5.2 Update Firebase Authorized Domains

1. In Firebase Console → Authentication → Settings
2. Add your production domain to **Authorized domains**

### 5.3 Deploy

1. Deploy your application
2. Test Apple Sign-In on production domain

## Important Notes

1. **Email Privacy**: Apple may hide the user's email. The code handles this by:
   - Using email if provided
   - Falling back to a generated name if email is hidden
   - Allowing users to update their profile during onboarding

2. **Name Privacy**: Apple only provides name on **first sign-in**. Subsequent sign-ins won't include name.

3. **Testing**: You can test with any Apple ID, but for production, users need a valid Apple ID.

4. **Key File**: Keep your `.p8` key file secure and never commit it to version control.

## Alternative: Using Redirect Instead of Popup

If popups are problematic, you can modify the code to use redirect:

```typescript
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';

// Instead of signInWithPopup, use:
await signInWithRedirect(auth, provider);

// Then handle the redirect result:
useEffect(() => {
  getRedirectResult(auth).then((result) => {
    if (result) {
      // Handle successful sign-in
    }
  });
}, []);
```

## Verification Checklist

- [ ] Service ID created in Apple Developer Console
- [ ] Sign In with Apple enabled for Service ID
- [ ] Return URLs configured correctly
- [ ] Key created and downloaded (.p8 file)
- [ ] Team ID noted
- [ ] Apple provider enabled in Firebase Console
- [ ] Service ID, Team ID, Key ID, and Private Key added to Firebase
- [ ] Authorized domains added in Firebase
- [ ] Environment variables set
- [ ] Tested locally
- [ ] Production domain configured
- [ ] Tested on production

## Support

If you encounter issues:
1. Check Firebase Console → Authentication → Sign-in method → Apple for error messages
2. Check browser console for detailed error codes
3. Verify all IDs and keys are correct
4. Ensure domains match exactly (including https/http)

