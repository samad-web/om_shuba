# Exotel Integration - Deployment Guide

## Prerequisites

Before deploying, you need:

1. **Exotel Account** - Sign up at https://exotel.com
2. **Supabase CLI** - Install if you haven't: `npm install -g supabase`
3. **Exotel Credentials** from your dashboard:
   - API Key
   - API Token
   - Account SID
   - Virtual Phone Number (Caller ID)

---

## Step 1: Set Up Exotel Account

### Sign Up for Exotel

1. Go to https://exotel.com and click "Start Free Trial"
2. Complete business verification (may take 1-2 business days)
3. Once approved, log in to your Exotel dashboard

### Get Your Credentials

1. Navigate to **Settings** → **API Settings**
2. Copy the following:
   - **API Key**
   - **API Token**
   - **Account SID** (also called Exotel SID)
3. Navigate to **Phone Numbers**
4. Copy your **Virtual Number** (this will be your Caller ID)

### Pricing to Consider

- **Per-minute charges** for calls (varies by plan)
- **Recording storage** (usually included)
- Check current pricing at https://exotel.com/pricing

---

## Step 2: Run Database Migration

Apply the Exotel schema to your Supabase database:

```bash
# Navigate to your project
cd "c:\Users\monis\OneDrive\Desktop\om shuba\om_shuba"

# Apply the migration
supabase db push
```

This will create:
- `call_logs` table
- Add `phone` column to `users` table
- Add call statistics to `enquiries` table
- Set up RLS policies

---

## Step 3: Deploy Supabase Edge Functions

### Deploy the Functions

```bash
# Deploy call initiation function
supabase functions deploy initiate-call

# Deploy webhook handler
supabase functions deploy exotel-webhook
```

### Set Environment Variables

```bash
# Set Exotel credentials as secrets
supabase secrets set EXOTEL_API_KEY=your_api_key_here
supabase secrets set EXOTEL_API_TOKEN=your_api_token_here
supabase secrets set EXOTEL_SID=your_account_sid_here
supabase secrets set EXOTEL_CALLER_ID=your_virtual_number_here
```

**Example:**
```bash
supabase secrets set EXOTEL_API_KEY=abc123xyz
supabase secrets set EXOTEL_API_TOKEN=def456uvw
supabase secrets set EXOTEL_SID=exotel123
supabase secrets set EXOTEL_CALLER_ID=+919876543210
```

### Verify Deployment

```bash
# List deployed functions
supabase functions list

# Check function logs
supabase functions logs initiate-call
supabase functions logs exotel-webhook
```

---

## Step 4: Configure Exotel Webhook

### Get Your Webhook URL

After deploying, your webhook URL will be:
```
https://your-project-ref.supabase.co/functions/v1/exotel-webhook
```

**To find your project ref:**
1. Go to your Supabase dashboard
2. Look at the URL: `https://app.supabase.com/project/YOUR-PROJECT-REF`
3. Or check Settings → API → Project URL

### Set Up in Exotel Dashboard

1. Log in to Exotel dashboard
2. Go to **Settings** → **Webhooks** or **API Settings**
3. Find **Call Status Callback URL** or **Passthru AppURL**
4. Enter your webhook URL:
   ```
   https://your-project-ref.supabase.co/functions/v1/exotel-webhook
   ```
5. Enable webhooks for these events:
   - ✅ Call Initiated
   - ✅ Call In Progress
   - ✅ Call Completed
   - ✅ Call Failed
   - ✅ Call Busy
   - ✅ No Answer
6. Save settings

---

## Step 5: Add Phone Numbers to Staff Profiles

### Option A: Manually via Supabase Dashboard

1. Go to Supabase Dashboard → Table Editor
2. Open the `users` table
3. For each telecaller/staff, add their phone number in the `phone` column
4. Format: `+919876543210` (E.164 format with country code)

### Option B: Via SQL

```sql
-- Update phone numbers for your staff
UPDATE users 
SET phone = '+919876543210' 
WHERE username = 'telecaller1';

UPDATE users 
SET phone = '+919123456789' 
WHERE username = 'admin';

-- Verify
SELECT id, name, username, phone, role FROM users;
```

---

## Step 6: Test the Integration

### Test with Exotel Sandbox (Recommended First)

Exotel provides a sandbox mode for testing without charges:

1. In Exotel dashboard, enable **Sandbox Mode**
2. Use test numbers provided by Exotel
3. Make a test call from your CRM
4. Verify webhook receives updates

### Test in Production

1. Log in to your CRM as a telecaller
2. Go to an enquiry with a valid phone number
3. Click the **📞 Call** button
4. You should receive a call on your registered phone
5. Answer and complete the call
6. Check:
   - Call log appears in database
   - Call status updates correctly
   - Recording URL is captured (after call ends)
   - Enquiry stats are updated

### Verify Database

```sql
-- Check call logs
SELECT * FROM call_logs ORDER BY created_at DESC LIMIT 5;

-- Check enquiry stats
SELECT 
    id, 
    customer_name, 
    total_calls, 
    last_call_date, 
    last_call_duration 
FROM enquiries 
WHERE total_calls > 0;
```

---

## Step 7: Monitor and Debug

### Check Function Logs

```bash
# Real-time logs for call initiation
supabase functions logs initiate-call --follow

# Real-time logs for webhook
supabase functions logs exotel-webhook --follow
```

### Common Issues

#### ❌ "Failed to initiate call"
- **Check:** Exotel credentials are correct
- **Check:** Phone numbers are in E.164 format (+country code)
- **Check:** Exotel account has sufficient balance

#### ❌ "Webhook not receiving updates"
- **Check:** Webhook URL is correctly configured in Exotel
- **Check:** URL is accessible (test with curl or Postman)
- **Check:** Function logs for errors

#### ❌ "Call connects but no recording"
- **Check:** Recording is enabled in Exotel settings
- **Check:** Wait a few minutes after call ends (processing time)
- **Check:** Webhook receives `RecordingUrl` parameter

### Enable Debug Logging

The functions already have console.log statements. View them with:

```bash
supabase functions logs exotel-webhook --follow
```

---

## Next Steps

Once Exotel is working:

1. **Add UI for Call History** - Show call logs in enquiry details
2. **Add Click-to-Call Button** - Update EnquiryLog.tsx with call button
3. **Display Call Statistics** - Show total calls, last call date in enquiry cards
4. **Add Call Recording Player** - Play recordings directly in CRM
5. **Set Up Call Analytics** - Track call duration, success rate, etc.

---

## Cost Estimation

**Example Pricing (varies by plan):**
- Outbound calls: ₹0.30 - ₹1.00 per minute
- Recording storage: Usually included
- Virtual number rental: ₹500 - ₹1000 per month

**For 100 calls/day averaging 3 minutes each:**
- Daily: 100 calls × 3 min × ₹0.50 = ₹150
- Monthly: ₹150 × 30 = ₹4,500

💡 **Tip:** Start with Exotel's free trial to test before committing to a paid plan.

---

## Security Checklist

- ✅ Exotel credentials stored as Supabase secrets (not in code)
- ✅ Webhook endpoint uses HTTPS
- ✅ RLS policies restrict call log access by role
- ✅ Phone numbers validated before calling
- ✅ Consider adding IP whitelisting for webhook (optional)

---

## Support

- **Exotel Support:** support@exotel.com
- **Exotel Docs:** https://developer.exotel.com
- **Supabase Docs:** https://supabase.com/docs/guides/functions
