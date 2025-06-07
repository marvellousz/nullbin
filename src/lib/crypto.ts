// Client-side encryption utilities using Web Crypto API

export interface EncryptionResult {
  encryptedData: string
  key: string
  iv: string
  salt?: string // For password-derived keys
}

export interface DecryptionParams {
  encryptedData: string
  key: string
  iv: string
  password?: string
  salt?: string
}

/**
 * Generate a random encryption key
 */
export async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  )
}

/**
 * Convert CryptoKey to base64 string for storage/transmission
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key)
  return btoa(String.fromCharCode(...new Uint8Array(exported)))
}

/**
 * Convert base64 string back to CryptoKey
 */
export async function importKey(keyString: string): Promise<CryptoKey> {
  const keyData = new Uint8Array(
    atob(keyString)
      .split('')
      .map(char => char.charCodeAt(0))
  )
  
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  )
}

/**
 * Generate a random IV (Initialization Vector)
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12))
}

/**
 * Encrypt text data
 */
export async function encryptData(text: string, password?: string): Promise<EncryptionResult> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  
  // Generate encryption key
  let key: CryptoKey
  let salt: Uint8Array | undefined
  
  if (password) {
    // For password-protected content, we use the password directly for encryption
    // The key in the URL will be ignored during decryption
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    )
    
    salt = crypto.getRandomValues(new Uint8Array(16))
    key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )
  } else {
    key = await generateKey()
  }
  
  const iv = generateIV()
  
  // Encrypt the data
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    data
  )
  
  const result: EncryptionResult = {
    encryptedData: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    key: await exportKey(key),
    iv: btoa(String.fromCharCode(...iv)),
  }
  
  if (salt) {
    result.salt = btoa(String.fromCharCode(...salt))
  }
  
  return result
}

/**
 * Decrypt text data
 */
export async function decryptData(params: DecryptionParams): Promise<string> {
  const { encryptedData, key: keyString, iv: ivString, password, salt: saltString } = params
  
  console.log('🔓 decryptData called with:', {
    keyString: keyString.substring(0, 20) + '...',
    hasPassword: !!password,
    password: password ? password.substring(0, 5) + '...' : undefined,
    hasSalt: !!saltString,
    saltString: saltString ? saltString.substring(0, 20) + '...' : undefined
  })
  
  // Convert base64 strings back to binary data
  const encrypted = new Uint8Array(
    atob(encryptedData)
      .split('')
      .map(char => char.charCodeAt(0))
  )
  
  const iv = new Uint8Array(
    atob(ivString)
      .split('')
      .map(char => char.charCodeAt(0))
  )
  
  let key: CryptoKey;
  
  if (password && saltString) {
    console.log('🔑 Using password-based key derivation')
    
    // Validate that we're using the placeholder for password-protected content
    if (keyString !== 'password-protected') {
      console.warn('⚠️ Warning: Password provided but key is not the placeholder value')
      // For maximum security, we should enforce using the placeholder
      // This ensures we're not accidentally using the wrong key
      throw new Error('Invalid decryption parameters for password-protected content')
    }
    
    // For password-protected content, always derive key from password + salt
    // Ignore the key from URL as it's just a placeholder
    const encoder = new TextEncoder()
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    )
    
    try {
      console.log('🔍 Attempting to parse salt:', saltString ? saltString.substring(0, 10) + '...' : 'undefined')
      const salt = new Uint8Array(
        atob(saltString)
          .split('')
          .map(char => char.charCodeAt(0))
      )
      
      console.log('✅ Successfully parsed salt for decryption, length:', salt.length)
      
      key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256',
        },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      console.log('✅ Password-based key derived successfully')
    } catch (error) {
      console.error('❌ Error processing salt for password-based decryption:', error);
      throw new Error('Failed to process salt for password decryption');
    }
  } else if (keyString === 'password-protected') {
    console.log('❌ Password required but not provided')
    // This is a password-protected paste but no password was provided
    throw new Error('Password required for decryption')
  } else {
    console.log('🔑 Using direct key import')
    // Import the key directly for non-password-protected content
    key = await importKey(keyString)
  }
  // Decrypt the data
  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encrypted
    )
    
    const decoder = new TextDecoder()
    const result = decoder.decode(decrypted)
    console.log('✅ Decryption successful, content length:', result.length)
    return result
  } catch (error) {
    // If this is a password-protected paste, it's likely wrong password
    if (password && saltString) {
      console.log('❌ Decryption failed with password - likely incorrect password')
      throw new Error('Incorrect password')
    } else {
      console.error('❌ Decryption failed:', error)
      throw new Error('Failed to decrypt content')
    }
  }
}

/**
 * Generate a shareable link with encryption key in hash fragment
 */
export function generateShareableLink(pasteId: string, key: string, iv: string, salt?: string): string {
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/paste/${pasteId}`
    : `/paste/${pasteId}`
    
  const fragmentData: {
    key: string;
    iv: string;
    salt?: string;
  } = { 
    // For password-protected pastes, use a placeholder key since the real key
    // will be derived from the password during decryption
    key: salt ? 'password-protected' : key, 
    iv 
  }
  
  if (salt) {
    fragmentData.salt = salt
  }
  
  const fragment = btoa(JSON.stringify(fragmentData))
  return `${baseUrl}#${fragment}`
}

/**
 * Extract encryption data from URL hash fragment
 */
export function extractEncryptionFromHash(): { key: string; iv: string; salt?: string } | null {
  if (typeof window === 'undefined') return null
  
  const hash = window.location.hash.substring(1)
  if (!hash) {
    console.log('🔍 No hash found in URL')
    return null
  }
  
  try {
    const decoded = atob(hash)
    const data = JSON.parse(decoded)
    console.log('🔍 Extracted from hash:', {
      key: data.key === 'password-protected' ? 'password-protected' : data.key.substring(0, 10) + '...',
      hasSalt: !!data.salt,
      isPasswordProtected: data.key === 'password-protected'
    })
    return data
  } catch (err) {
    console.error('❌ Error extracting from hash:', err)
    return null
  }
}
