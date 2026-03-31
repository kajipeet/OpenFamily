import { u as useAuthStore } from './auth-nXosHa-n.mjs';
import { g as defineStore, u as useRouter, b as useRuntimeConfig } from './server.mjs';

const E2EE_VERSION = "ecdh-p256-aesgcm-v1";
function toBase64(data) {
  const bytes = new Uint8Array(data);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function fromBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
async function importPeerPublicKey(publicKeyB64) {
  return await crypto.subtle.importKey(
    "raw",
    fromBase64(publicKeyB64),
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );
}
function useE2EE() {
  useAuthStore();
  async function ensureLocalKeyPair() {
    throw new Error("E2EE is only available in browser");
  }
  async function deriveChatKey(peerPublicKeyB64, chatId) {
    const { privateKey } = await ensureLocalKeyPair();
    const peerPublicKey = await importPeerPublicKey(peerPublicKeyB64);
    const sharedBits = await crypto.subtle.deriveBits(
      { name: "ECDH", public: peerPublicKey },
      privateKey,
      256
    );
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      sharedBits,
      "HKDF",
      false,
      ["deriveKey"]
    );
    const enc = new TextEncoder();
    return await crypto.subtle.deriveKey(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: enc.encode(chatId),
        info: enc.encode("openfamily-e2ee-v1")
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }
  async function ensurePublished() {
    return;
  }
  async function encryptTextForChat(plaintext, peerPublicKeyB64, chatId) {
    const key = await deriveChatKey(peerPublicKeyB64, chatId);
    const nonce = crypto.getRandomValues(new Uint8Array(12));
    const data = new TextEncoder().encode(plaintext);
    const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, data);
    return {
      ciphertext: toBase64(cipher),
      nonce: toBase64(nonce.buffer),
      version: E2EE_VERSION
    };
  }
  async function decryptTextForChat(ciphertextB64, nonceB64, peerPublicKeyB64, chatId) {
    const key = await deriveChatKey(peerPublicKeyB64, chatId);
    const nonce = new Uint8Array(fromBase64(nonceB64));
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: nonce },
      key,
      fromBase64(ciphertextB64)
    );
    return new TextDecoder().decode(plaintext);
  }
  async function encryptFileForChat(file, peerPublicKeyB64, chatId) {
    const key = await deriveChatKey(peerPublicKeyB64, chatId);
    const nonce = crypto.getRandomValues(new Uint8Array(12));
    const data = await file.arrayBuffer();
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, data);
    const encryptedBlob = new Blob([encrypted], { type: "application/octet-stream" });
    const encryptedFile = new File([encryptedBlob], `${file.name}.enc`, { type: "application/octet-stream" });
    return {
      encryptedFile,
      fileNonce: toBase64(nonce.buffer),
      version: E2EE_VERSION
    };
  }
  async function decryptFileForChat(encrypted, fileNonceB64, peerPublicKeyB64, chatId, mimeType) {
    const key = await deriveChatKey(peerPublicKeyB64, chatId);
    const nonce = new Uint8Array(fromBase64(fileNonceB64));
    const data = await encrypted.arrayBuffer();
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: nonce }, key, data);
    return new Blob([decrypted], { type: mimeType || "application/octet-stream" });
  }
  return {
    ensurePublished,
    ensureLocalKeyPair,
    encryptTextForChat,
    decryptTextForChat,
    encryptFileForChat,
    decryptFileForChat,
    version: E2EE_VERSION
  };
}
const useChatStore = defineStore("chat", {
  state: () => ({
    chats: [],
    messages: [],
    activeChatId: null,
    typingUsers: {}
  }),
  actions: {
    async loadChats() {
      var _a;
      const headers = useAuthHeaders();
      this.chats = (_a = await $fetch("/api/chats", { headers })) != null ? _a : [];
    },
    async loadMessages(chatId) {
      var _a;
      this.activeChatId = chatId;
      const headers = useAuthHeaders();
      this.messages = (_a = await $fetch(`/api/chats/${chatId}/messages`, { headers })) != null ? _a : [];
    },
    async markAllRead(chatId) {
      const headers = useAuthHeaders();
      try {
        const res = await $fetch(`/api/chats/${chatId}/read`, { method: "PUT", headers });
        if (res == null ? void 0 : res.delete_at) {
          this.messages.forEach((m) => {
            if (!m.read_at) {
              m.read_at = (/* @__PURE__ */ new Date()).toISOString();
              m.delete_at = res.delete_at;
            }
          });
        }
      } catch {
      }
    },
    pushMessage(msg) {
      var _a;
      this.messages.push(msg);
      const chat = this.chats.find((c) => c.id === msg.chat_id);
      if (chat) {
        chat.last_message = msg.type === "text" ? "[encrypted message]" : "[encrypted file]";
        chat.last_message_at = msg.created_at;
        chat.unread_count = ((_a = chat.unread_count) != null ? _a : 0) + 1;
      }
    },
    applyReadReceipt(chatId, deleteAt) {
      this.messages.forEach((m) => {
        if (m.chat_id === chatId && !m.read_at) {
          m.read_at = (/* @__PURE__ */ new Date()).toISOString();
          m.delete_at = deleteAt;
        }
      });
    },
    removeMessage(msgId) {
      this.messages = this.messages.filter((m) => m.id !== msgId);
    },
    setTyping(userId) {
      if (this.typingUsers[userId]) clearTimeout(this.typingUsers[userId]);
      this.typingUsers[userId] = setTimeout(() => {
        delete this.typingUsers[userId];
      }, 3e3);
    },
    isTyping(userId) {
      return !!this.typingUsers[userId];
    }
  }
});
const useCallStore = defineStore("call", {
  state: () => ({
    active: false,
    peerId: "",
    peerName: "",
    type: "video",
    incoming: false,
    incomingOffer: null
  }),
  actions: {
    initCall(peerId, peerName, type) {
      this.peerId = peerId;
      this.peerName = peerName;
      this.type = type;
      this.incoming = false;
      this.active = true;
    },
    receiveCall(peerId, peerName, type, offer) {
      this.peerId = peerId;
      this.peerName = peerName;
      this.type = type;
      this.incoming = true;
      this.incomingOffer = offer;
      this.active = true;
    },
    endCall() {
      this.active = false;
      this.peerId = "";
      this.peerName = "";
      this.incoming = false;
      this.incomingOffer = null;
    }
  }
});
let ws = null;
function useWebSocket() {
  useAuthStore();
  useChatStore();
  useCallStore();
  function connect() {
    return;
  }
  function disconnect() {
    ws == null ? void 0 : ws.close();
    ws = null;
  }
  function sendRaw(data) {
    if ((ws == null ? void 0 : ws.readyState) === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }
  function sendTyping(receiverId, chatId) {
    sendRaw({ type: "typing", receiver_id: receiverId, chat_id: chatId });
  }
  return { connect, disconnect, sendRaw, sendTyping };
}
function useAuth() {
  const auth = useAuthStore();
  const router = useRouter();
  const config = useRuntimeConfig();
  async function loginUser(username, password) {
    const data = await $fetch(`${config.public.apiBase}/auth/login`, {
      method: "POST",
      body: { username, password }
    });
    auth.set(data.token, data.user);
    await useE2EE().ensurePublished();
    return data;
  }
  function logout() {
    auth.logout();
    useWebSocket().disconnect();
    router.push("/garden");
  }
  return { loginUser, logout };
}
function useAuthHeaders() {
  const auth = useAuthStore();
  return auth.token ? { Authorization: `Bearer ${auth.token}` } : {};
}

export { useAuthHeaders as a, useChatStore as b, useCallStore as c, useE2EE as d, useWebSocket as e, useAuth as u };
//# sourceMappingURL=useAuth-CYq6jCny.mjs.map
