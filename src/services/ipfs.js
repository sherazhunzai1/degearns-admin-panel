import axios from 'axios'

// IPFS Upload Service using Pinata
// Get your API keys from https://app.pinata.cloud/keys

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || ''
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || ''
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || ''

// Preferred IPFS gateways
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/'
]

// Get the preferred gateway URL
const getGatewayUrl = (hash) => {
  const preferredGateway = import.meta.env.VITE_IPFS_GATEWAY || IPFS_GATEWAYS[0]
  return `${preferredGateway}${hash}`
}

// Upload file to IPFS via Pinata
export const uploadToIPFS = async (file, options = {}) => {
  if (!file) {
    throw new Error('No file provided')
  }

  // Validate file type
  const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`)
  }

  // Validate file size (default 10MB)
  const maxSize = options.maxSize || 10 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`)
  }

  const formData = new FormData()
  formData.append('file', file)

  // Add metadata
  const metadata = JSON.stringify({
    name: options.name || file.name,
    keyvalues: {
      app: 'degearns-admin',
      type: options.type || 'banner',
      uploadedAt: new Date().toISOString(),
      ...options.metadata
    }
  })
  formData.append('pinataMetadata', metadata)

  // Pin options
  const pinataOptions = JSON.stringify({
    cidVersion: 1,
    wrapWithDirectory: false
  })
  formData.append('pinataOptions', pinataOptions)

  try {
    // Prefer JWT authentication if available
    const headers = {
      'Content-Type': 'multipart/form-data'
    }

    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`
    } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
      headers['pinata_api_key'] = PINATA_API_KEY
      headers['pinata_secret_api_key'] = PINATA_SECRET_KEY
    } else {
      throw new Error('Pinata API credentials not configured. Please set VITE_PINATA_JWT or VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY environment variables.')
    }

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers,
        maxBodyLength: Infinity,
        onUploadProgress: options.onProgress ? (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          options.onProgress(percentCompleted)
        } : undefined
      }
    )

    const { IpfsHash, PinSize, Timestamp } = response.data

    return {
      success: true,
      hash: IpfsHash,
      url: getGatewayUrl(IpfsHash),
      size: PinSize,
      timestamp: Timestamp,
      gateway: IPFS_GATEWAYS[0]
    }
  } catch (error) {
    console.error('IPFS upload error:', error)

    if (error.response) {
      const message = error.response.data?.error?.message || error.response.data?.message || 'Upload failed'
      throw new Error(`IPFS upload failed: ${message}`)
    }

    throw new Error(error.message || 'Failed to upload to IPFS')
  }
}

// Upload multiple files
export const uploadMultipleToIPFS = async (files, options = {}) => {
  const results = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    try {
      const result = await uploadToIPFS(file, {
        ...options,
        onProgress: options.onProgress ? (progress) => {
          // Calculate overall progress
          const fileProgress = (i * 100 + progress) / files.length
          options.onProgress(Math.round(fileProgress), i, files.length)
        } : undefined
      })
      results.push({ file: file.name, ...result })
    } catch (error) {
      results.push({ file: file.name, success: false, error: error.message })
    }
  }

  return results
}

// Check if IPFS is configured
export const isIPFSConfigured = () => {
  return !!(PINATA_JWT || (PINATA_API_KEY && PINATA_SECRET_KEY))
}

// Validate IPFS URL
export const isValidIPFSUrl = (url) => {
  if (!url) return false

  // Check if it's an IPFS gateway URL
  const isGatewayUrl = IPFS_GATEWAYS.some(gateway => url.startsWith(gateway))
  if (isGatewayUrl) return true

  // Check if it's an ipfs:// protocol URL
  if (url.startsWith('ipfs://')) return true

  // Check if it's a raw CID
  const cidPattern = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[A-Za-z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|f[0-9A-Fa-f]{50,})$/
  if (cidPattern.test(url)) return true

  return false
}

// Convert IPFS hash or URL to gateway URL
export const toGatewayUrl = (hashOrUrl) => {
  if (!hashOrUrl) return null

  // Already a full gateway URL
  if (IPFS_GATEWAYS.some(gateway => hashOrUrl.startsWith(gateway))) {
    return hashOrUrl
  }

  // IPFS protocol URL
  if (hashOrUrl.startsWith('ipfs://')) {
    const hash = hashOrUrl.replace('ipfs://', '')
    return getGatewayUrl(hash)
  }

  // Raw CID
  const cidPattern = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[A-Za-z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|f[0-9A-Fa-f]{50,})$/
  if (cidPattern.test(hashOrUrl)) {
    return getGatewayUrl(hashOrUrl)
  }

  // Return as is (might be a regular URL)
  return hashOrUrl
}

export default {
  uploadToIPFS,
  uploadMultipleToIPFS,
  isIPFSConfigured,
  isValidIPFSUrl,
  toGatewayUrl
}
