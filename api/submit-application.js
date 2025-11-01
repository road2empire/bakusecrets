// Vercel Serverless Function to store application form submissions
// Uses Vercel Blob Storage - all submissions saved to same file with complex filename

import { put } from '@vercel/blob'

// Complex filename that's hard to guess - uses environment variable or generates one
// This ensures the URL is not easily accessible randomly
function getComplexFileName() {
  // Use environment variable if set, otherwise use a hardcoded complex name
  // You can set BLOB_FILE_NAME in Vercel dashboard for extra security
  const envFileName = process.env.BLOB_FILE_NAME
  if (envFileName) {
    return `submissions/${envFileName}.json`
  }
  
  // Default complex filename - change this to your own complex string
  // Format: random characters + numbers + special chars
  // Example: a7f9b2c4d8e1f3a5b6c7d8e9f0a1b2c3
  return 'submissions/a7f9b2c4d8e1f3a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4.json'
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const formData = req.body

    // Add timestamp to submission
    const submission = {
      timestamp: new Date().toISOString(),
      ...formData
    }

    // Store in Vercel Blob Storage (append to same file)
    await storeInVercelBlob(submission)

    return res.status(200).json({ 
      success: true, 
      message: 'Application submitted successfully' 
    })
  } catch (error) {
    console.error('Error submitting application:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to submit application' 
    })
  }
}

// Store data in Vercel Blob - appends to same file
async function storeInVercelBlob(submission) {
  const filename = getComplexFileName()
  
  try {
    // Try to get existing file by fetching from stored URL or trying known pattern
    let existingSubmissions = []
    let storedUrl = process.env.BLOB_FILE_URL // Store this after first creation
    
    try {
      if (storedUrl) {
        // Fetch from previously stored URL
        const response = await fetch(storedUrl)
        if (response.ok) {
          const existingContent = await response.text()
          existingSubmissions = JSON.parse(existingContent)
          if (!Array.isArray(existingSubmissions)) {
            existingSubmissions = []
          }
        }
      }
    } catch (error) {
      // File doesn't exist yet or URL invalid - start fresh
      console.log('Creating new submissions file')
    }

    // Append new submission to existing array
    existingSubmissions.push(submission)

    // Write updated array back to blob using put
    const fileContent = JSON.stringify(existingSubmissions, null, 2)
    const blob = await put(filename, fileContent, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    })

    console.log(`Submission saved. Total submissions: ${existingSubmissions.length}`)
    console.log(`Blob URL: ${blob.url}`)
    console.log(`Store this URL in BLOB_FILE_URL env variable: ${blob.url}`)
    
    // Note: For production, you'd want to store blob.url somewhere (env var, KV store, etc.)
    // For now, the URL is logged and you can add it to Vercel env vars
  } catch (error) {
    console.error('Vercel Blob error:', error)
    throw new Error(`Failed to save to blob storage: ${error.message}`)
  }
}

