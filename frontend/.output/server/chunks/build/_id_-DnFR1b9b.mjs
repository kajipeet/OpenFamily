import { _ as _sfc_main$3 } from './UserAvatar-BjFy4kfy.mjs';
import { defineComponent, ref, watch, nextTick, mergeProps, unref, computed, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr } from 'vue/server-renderer';
import { b as useChatStore, c as useCallStore, d as useE2EE, a as useAuthHeaders, e as useWebSocket } from './useAuth-CYq6jCny.mjs';
import { a as useRoute, u as useRouter } from './server.mjs';
import { formatDistanceToNow } from 'date-fns';
import { u as useAuthStore } from './auth-nXosHa-n.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "MessageBubble",
  __ssrInlineRender: true,
  props: {
    message: { type: Object, required: true },
    isMine: { type: Boolean, default: false },
    peerPublicKey: { type: String, default: "" }
  },
  setup(__props) {
    const props = __props;
    const e2ee = useE2EE();
    const headers = useAuthHeaders();
    const decryptedContent = ref("");
    const decryptedFileName = ref("");
    const resolvedFileUrl = ref("");
    const now = ref(Date.now());
    let fileObjectUrl = null;
    watch(() => {
      var _a;
      return (_a = props.message) == null ? void 0 : _a.id;
    }, () => {
      loadDecryptedData();
    }, { immediate: true });
    watch(() => props.peerPublicKey, () => {
      loadDecryptedData();
    });
    async function loadDecryptedData() {
      if (!props.message) return;
      if (fileObjectUrl) {
        URL.revokeObjectURL(fileObjectUrl);
        fileObjectUrl = null;
      }
      resolvedFileUrl.value = props.message.file_url || "";
      decryptedContent.value = props.message.content || "";
      decryptedFileName.value = props.message.file_name || "";
      if (!props.peerPublicKey) return;
      if (props.message.content && props.message.nonce) {
        try {
          decryptedContent.value = await e2ee.decryptTextForChat(
            props.message.content,
            props.message.nonce,
            props.peerPublicKey,
            props.message.chat_id
          );
        } catch {
          decryptedContent.value = "[encrypted]";
        }
      }
      if (props.message.file_name && props.message.file_name_nonce) {
        try {
          decryptedFileName.value = await e2ee.decryptTextForChat(
            props.message.file_name,
            props.message.file_name_nonce,
            props.peerPublicKey,
            props.message.chat_id
          );
        } catch {
          decryptedFileName.value = "Encrypted file";
        }
      }
      if (props.message.file_url && props.message.file_nonce) {
        try {
          const response = await fetch(props.message.file_url, { headers });
          if (!response.ok) throw new Error("failed to download encrypted file");
          const encryptedBlob = await response.blob();
          const decryptedBlob = await e2ee.decryptFileForChat(
            encryptedBlob,
            props.message.file_nonce,
            props.peerPublicKey,
            props.message.chat_id,
            props.message.mime_type
          );
          fileObjectUrl = URL.createObjectURL(decryptedBlob);
          resolvedFileUrl.value = fileObjectUrl;
        } catch {
          resolvedFileUrl.value = "";
        }
      }
    }
    const countdown = computed(() => {
      var _a;
      if (!((_a = props.message) == null ? void 0 : _a.delete_at)) return "";
      const diff = Math.max(0, new Date(props.message.delete_at).getTime() - now.value);
      const totalSeconds = Math.ceil(diff / 1e3);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${String(seconds).padStart(2, "0")}`;
    });
    function formatTime(ts) {
      if (!ts) return "";
      try {
        return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } catch {
        return "";
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["flex", __props.isMine ? "justify-end" : "justify-start"]
      }, _attrs))}><div class="${ssrRenderClass(["max-w-[82%] md:max-w-[70%] px-3 py-2 shadow-sm", __props.isMine ? "chat-bubble-out" : "chat-bubble-in"])}">`);
      if (__props.message.type === "text") {
        _push(`<p class="text-sm whitespace-pre-wrap break-words">${ssrInterpolate(unref(decryptedContent))}</p>`);
      } else if (__props.message.type === "image") {
        _push(`<!--[--><img${ssrRenderAttr("src", unref(resolvedFileUrl))}${ssrRenderAttr("alt", unref(decryptedFileName) || "image")} class="rounded-xl max-h-80 w-auto mb-2">`);
        if (unref(decryptedContent)) {
          _push(`<p class="text-sm whitespace-pre-wrap break-words">${ssrInterpolate(unref(decryptedContent))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else if (__props.message.type === "video") {
        _push(`<!--[--><video${ssrRenderAttr("src", unref(resolvedFileUrl))} controls class="rounded-xl max-h-80 w-auto mb-2"></video>`);
        if (unref(decryptedContent)) {
          _push(`<p class="text-sm whitespace-pre-wrap break-words">${ssrInterpolate(unref(decryptedContent))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else if (__props.message.type === "audio" || __props.message.type === "voice") {
        _push(`<!--[--><audio${ssrRenderAttr("src", unref(resolvedFileUrl))} controls class="w-full mb-2"></audio>`);
        if (unref(decryptedContent)) {
          _push(`<p class="text-sm whitespace-pre-wrap break-words">${ssrInterpolate(unref(decryptedContent))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<a${ssrRenderAttr("href", unref(resolvedFileUrl))}${ssrRenderAttr("download", unref(decryptedFileName) || void 0)} target="_blank" rel="noreferrer" class="text-sm underline break-all">${ssrInterpolate(unref(decryptedFileName) || unref(decryptedContent) || "Attachment")}</a>`);
      }
      _push(`<div class="mt-1 flex items-center justify-end gap-2 text-[11px] text-gray-500"><span>${ssrInterpolate(formatTime(__props.message.created_at))}</span>`);
      if (__props.message.delete_at) {
        _push(`<span class="text-red-500">${ssrInterpolate(unref(countdown))}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MessageBubble.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "MessageInput",
  __ssrInlineRender: true,
  props: {
    chatId: { type: String, required: true },
    receiverId: { type: String, required: true },
    receiverPublicKey: { type: String, required: true }
  },
  emits: ["sent"],
  setup(__props, { emit: __emit }) {
    useChatStore();
    useAuthHeaders();
    useWebSocket();
    useE2EE();
    const text = ref("");
    const isRecording = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "border-t border-black/10 bg-white px-3 py-3 flex-shrink-0" }, _attrs))}><form class="flex items-end gap-2"><label class="shrink-0 cursor-pointer rounded-full p-2 hover:bg-gray-100 transition" title="Attach file"><input class="hidden" type="file"><span>\u{1F4CE}</span></label><button type="button" class="shrink-0 rounded-full p-2 hover:bg-gray-100 transition" title="Record voice note"><span>${ssrInterpolate(unref(isRecording) ? "\u23F9\uFE0F" : "\u{1F3A4}")}</span></button><textarea rows="1" placeholder="Write a message" class="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-tg-blue">${ssrInterpolate(unref(text))}</textarea><button class="shrink-0 rounded-full bg-tg-blue text-white w-11 h-11 hover:bg-tg-blue-dark transition"> \u27A4 </button></form></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MessageInput.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useRouter();
    const chatId = route.params.id;
    const auth = useAuthStore();
    const chatStore = useChatStore();
    useCallStore();
    useE2EE();
    ref();
    const bottomAnchor = ref();
    const otherUser = ref(null);
    watch(() => chatStore.messages.length, () => scrollToBottom());
    function scrollToBottom() {
      nextTick(() => {
        var _a;
        return (_a = bottomAnchor.value) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
      });
    }
    function formatLastSeen(ts) {
      if (!ts) return "offline";
      return "last seen " + formatDistanceToNow(new Date(ts), { addSuffix: true });
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UserAvatar = _sfc_main$3;
      const _component_MessageBubble = _sfc_main$2;
      const _component_MessageInput = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col h-full" }, _attrs))}>`);
      if (unref(otherUser)) {
        _push(`<div class="flex items-center gap-3 px-4 py-3 bg-tg-sidebar-darker shadow-sm flex-shrink-0"><button class="md:hidden text-white mr-1">\u2190</button>`);
        _push(ssrRenderComponent(_component_UserAvatar, {
          user: unref(otherUser),
          size: "sm"
        }, null, _parent));
        _push(`<div class="flex-1 min-w-0"><p class="text-white font-medium text-sm truncate">${ssrInterpolate(unref(otherUser).display_name)}</p><p class="text-tg-gray text-xs">${ssrInterpolate(unref(chatStore).isTyping(unref(otherUser).id) ? "typing\u2026" : unref(otherUser).is_online ? "online" : formatLastSeen(unref(otherUser).last_seen))}</p></div><div class="flex items-center gap-2"><button class="text-white/70 hover:text-white transition p-1.5" title="Voice call"> \u{1F4DE} </button><button class="text-white/70 hover:text-white transition p-1.5" title="Video call"> \u{1F4F9} </button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex-1 overflow-y-auto px-4 py-4 space-y-1"><!--[-->`);
      ssrRenderList(unref(chatStore).messages, (msg) => {
        var _a2, _b2, _c2;
        _push(ssrRenderComponent(_component_MessageBubble, {
          key: msg.id,
          message: msg,
          "is-mine": msg.sender_id === ((_a2 = unref(auth).user) == null ? void 0 : _a2.id),
          "peer-public-key": (_c2 = (_b2 = unref(otherUser)) == null ? void 0 : _b2.e2ee_public_key) != null ? _c2 : ""
        }, null, _parent));
      });
      _push(`<!--]--><div></div></div>`);
      _push(ssrRenderComponent(_component_MessageInput, {
        "chat-id": unref(chatId),
        "receiver-id": (_b = (_a = unref(otherUser)) == null ? void 0 : _a.id) != null ? _b : "",
        "receiver-public-key": (_d = (_c = unref(otherUser)) == null ? void 0 : _c.e2ee_public_key) != null ? _d : "",
        onSent: scrollToBottom
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/app/chat/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-DnFR1b9b.mjs.map
