# Vercel Blob Storage Setup for Application Form

All form submissions are saved to a single JSON file in Vercel Blob Storage with a complex filename for security.

## Quick Setup (4 Steps)

### Step 1: Create Vercel Blob Store

1. Go to your **Vercel Dashboard** → Select Your Project
2. Click on the **Storage** tab (in the top navigation)
3. Click **Create Database** button
4. Select **Blob** from the options
5. Give it a name (e.g., "form-submissions")
6. Click **Create**

### Step 2: Get Your Blob Token

After creating the Blob store:

1. In your project, go to **Settings** → **Environment Variables**
2. Look for `BLOB_READ_WRITE_TOKEN` - Vercel should auto-add it
3. **If it's NOT there:**
   - Go back to **Storage** → Click on your Blob store
   - Look for **Connection String** or **Token** section
   - Copy the token
   - Go to **Settings** → **Environment Variables**
   - Add new variable:
     - **Name**: `BLOB_READ_WRITE_TOKEN`
     - **Value**: (paste the token)
     - **Environment**: Production, Preview, Development (select all)
   - Click **Save**

### Step 3: Deploy!

1. Push your code or trigger a new deployment
2. The form will work after deployment

### Step 4: Get Your Blob File URL (After First Submission)

1. Submit a test form on your deployed site
2. Go to **Vercel Dashboard** → Your Project → **Functions** → Click on `/api/submit-application`
3. Check the **Logs** tab
4. Look for this line: `Blob URL: https://...`
5. **Copy that URL**
6. Go to **Settings** → **Environment Variables**
7. Add new variable:
   - **Name**: `BLOB_FILE_URL`
   - **Value**: (paste the URL you copied)
   - **Environment**: Production, Preview, Development (select all)
8. Click **Save**
9. **Redeploy** your project

Now all future submissions will append to the same file!

---

## How It Works

- **Single File**: All submissions are saved to ONE file (not separate files per submission)
- **Append Mode**: Each new submission is added to the existing file
- **Complex Filename**: The file has a long, random-looking name that's hard to guess:
  - Default: `submissions/a7f9b2c4d8e1f3a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4.json`
  - You can customize this by setting `BLOB_FILE_NAME` environment variable

## Accessing Your Submissions File

After the first submission, you can access the file via URL. To find the URL:

1. Go to **Vercel Dashboard** → Your Project → **Storage** → **Blob**
2. Click on your blob store
3. Look for the file named `submissions/[complex-name].json`
4. Click on it to get the public URL

The URL will look like:
```
https://[hash].public.blob.vercel-storage.com/submissions/a7f9b2c4d8e1f3a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4.json
```

## File Format

The file is a JSON array, with each submission as an object:

```json
[
  {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+994 XX XXX XX XX",
    "age": "28",
    ...
  },
  {
    "timestamp": "2024-01-15T11:00:00.000Z",
    "fullName": "Jane Smith",
    ...
  }
]
```

## Customizing the Filename (Optional)

To use your own complex filename:

1. Go to **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name**: `BLOB_FILE_NAME`
   - **Value**: Your custom complex string (e.g., `x9k2m8p4q7r1s5t3u6v2w9`)
3. Redeploy

The file will then be saved as: `submissions/x9k2m8p4q7r1s5t3u6v2w9.json`

## Security Notes

- The complex filename prevents random access, but the file is **publicly accessible** via URL
- For extra security, you can:
  - Change the filename regularly by updating `BLOB_FILE_NAME`
  - Implement password protection via a separate API endpoint
  - Use Vercel's deployment password protection (Pro plan)

## Troubleshooting

- **"Failed to save to blob storage"**: Make sure Blob storage is created in your Vercel project
- **File not appearing**: Wait a few seconds after first submission, then refresh the Blob store view
- **Token errors**: Vercel should auto-inject the token, but if issues occur, check that Blob storage is enabled

## Cost

- **Free Tier**: 1 GB storage, 1 GB bandwidth/month
- **Pro Tier**: $0.15/GB storage, $0.40/GB bandwidth
- Perfect for form submissions (very lightweight!)

---

**That's it! Your form submissions are now being saved automatically to a single file in Vercel Blob Storage.**
