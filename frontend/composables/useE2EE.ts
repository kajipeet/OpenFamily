const E2EE_PRIVATE_JWK_STORAGE_KEY = 'of_e2ee_private_jwk'
const E2EE_PUBLIC_KEY_STORAGE_KEY = 'of_e2ee_public_key'
const E2EE_VERSION = 'ecdh-p256-aesgcm-v1'

function toBase64(data: ArrayBuffer): string {
  const bytes = new Uint8Array(data)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function fromBase64(value: string): ArrayBuffer {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

async function importPeerPublicKey(publicKeyB64: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    fromBase64(publicKeyB64),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  )
}

export function useE2EE() {
  const auth = useAuthStore()
  const config = useRuntimeConfig()

  async function ensureLocalKeyPair() {
    if (!import.meta.client) throw new Error('E2EE is only available in browser')

    const savedPrivate = localStorage.getItem(E2EE_PRIVATE_JWK_STORAGE_KEY)
    const savedPublic = localStorage.getItem(E2EE_PUBLIC_KEY_STORAGE_KEY)

    if (savedPrivate && savedPublic) {
      const privateKey = await crypto.subtle.importKey(
        'jwk',
        JSON.parse(savedPrivate),
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        ['deriveBits'],
      )
      return { privateKey, publicKeyB64: savedPublic }
    }

    const pair = await crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveBits'],
    )

    const privateJwk = await crypto.subtle.exportKey('jwk', pair.privateKey)
    const publicRaw = await crypto.subtle.exportKey('raw', pair.publicKey)
    const publicKeyB64 = toBase64(publicRaw)

    localStorage.setItem(E2EE_PRIVATE_JWK_STORAGE_KEY, JSON.stringify(privateJwk))
    localStorage.setItem(E2EE_PUBLIC_KEY_STORAGE_KEY, publicKeyB64)

    return { privateKey: pair.privateKey, publicKeyB64 }
  }

  async function deriveChatKey(peerPublicKeyB64: string, chatId: string): Promise<CryptoKey> {
    const { privateKey } = await ensureLocalKeyPair()
    const peerPublicKey = await importPeerPublicKey(peerPublicKeyB64)

    const sharedBits = await crypto.subtle.deriveBits(
      { name: 'ECDH', public: peerPublicKey },
      privateKey,
      256,
    )

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      sharedBits,
      'HKDF',
      false,
      ['deriveKey'],
    )

    const enc = new TextEncoder()
    return await crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: enc.encode(chatId),
        info: enc.encode('openfamily-e2ee-v1'),
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    )
  }

  async function ensurePublished() {
    if (!import.meta.client || !auth.token) return

    const headers = useAuthHeaders()
    const { publicKeyB64 } = await ensureLocalKeyPair()

    if (auth.user?.e2ee_public_key === publicKeyB64) return

    await $fetch(`${config.public.apiBase}/users/me/e2ee-key`, {
      method: 'PUT',
      headers,
      body: { public_key: publicKeyB64 },
    })

    if (auth.user) {
      auth.user.e2ee_public_key = publicKeyB64
      localStorage.setItem('of_user', JSON.stringify(auth.user))
    }
  }

  async function encryptTextForChat(plaintext: string, peerPublicKeyB64: string, chatId: string) {
    const key = await deriveChatKey(peerPublicKeyB64, chatId)
    const nonce = crypto.getRandomValues(new Uint8Array(12))
    const data = new TextEncoder().encode(plaintext)
    const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, data)

    return {
      ciphertext: toBase64(cipher),
      nonce: toBase64(nonce.buffer),
      version: E2EE_VERSION,
    }
  }

  async function decryptTextForChat(ciphertextB64: string, nonceB64: string, peerPublicKeyB64: string, chatId: string) {
    const key = await deriveChatKey(peerPublicKeyB64, chatId)
    const nonce = new Uint8Array(fromBase64(nonceB64))
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: nonce },
      key,
      fromBase64(ciphertextB64),
    )
    return new TextDecoder().decode(plaintext)
  }

  async function encryptFileForChat(file: File, peerPublicKeyB64: string, chatId: string) {
    const key = await deriveChatKey(peerPublicKeyB64, chatId)
    const nonce = crypto.getRandomValues(new Uint8Array(12))
    const data = await file.arrayBuffer()
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, data)

    const encryptedBlob = new Blob([encrypted], { type: 'application/octet-stream' })
    const encryptedFile = new File([encryptedBlob], `${file.name}.enc`, { type: 'application/octet-stream' })

    return {
      encryptedFile,
      fileNonce: toBase64(nonce.buffer),
      version: E2EE_VERSION,
    }
  }

  async function decryptFileForChat(encrypted: Blob, fileNonceB64: string, peerPublicKeyB64: string, chatId: string, mimeType?: string) {
    const key = await deriveChatKey(peerPublicKeyB64, chatId)
    const nonce = new Uint8Array(fromBase64(fileNonceB64))
    const data = await encrypted.arrayBuffer()
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, key, data)
    return new Blob([decrypted], { type: mimeType || 'application/octet-stream' })
  }

  return {
    ensurePublished,
    ensureLocalKeyPair,
    encryptTextForChat,
    decryptTextForChat,
    encryptFileForChat,
    decryptFileForChat,
    version: E2EE_VERSION,
  }
}
