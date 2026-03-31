import { _ as _sfc_main$3 } from "./UserAvatar-BjFy4kfy.js";
import { defineComponent, ref, watch, computed, mergeProps, unref, useSSRContext, nextTick } from "vue";
import { ssrRenderAttrs, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
import { b as useE2EE, a as useAuthHeaders, c as useChatStore, d as useWebSocket, e as useCallStore } from "./useAuth-CYq6jCny.js";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/nuxt/node_modules/hookable/dist/index.mjs";
import { a as useRoute, u as useRouter } from "../server.mjs";
import { formatDistanceToNow } from "date-fns";
import { u as useAuthStore } from "./auth-nXosHa-n.js";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/unctx/dist/index.mjs";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/h3/dist/index.mjs";
import "vue-router";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/defu/dist/defu.mjs";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/ufo/dist/index.mjs";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/klona/dist/index.mjs";
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
    watch(() => props.message?.id, () => {
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
      if (!props.message?.delete_at) return "";
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "border-t border-black/10 bg-white px-3 py-3 flex-shrink-0" }, _attrs))}><form class="flex items-end gap-2"><label class="shrink-0 cursor-pointer rounded-full p-2 hover:bg-gray-100 transition" title="Attach file"><input class="hidden" type="file"><span>📎</span></label><button type="button" class="shrink-0 rounded-full p-2 hover:bg-gray-100 transition" title="Record voice note"><span>${ssrInterpolate(unref(isRecording) ? "⏹️" : "🎤")}</span></button><textarea rows="1" placeholder="Write a message" class="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-tg-blue">${ssrInterpolate(unref(text))}</textarea><button class="shrink-0 rounded-full bg-tg-blue text-white w-11 h-11 hover:bg-tg-blue-dark transition"> ➤ </button></form></div>`);
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
      nextTick(() => bottomAnchor.value?.scrollIntoView({ behavior: "smooth" }));
    }
    function formatLastSeen(ts) {
      if (!ts) return "offline";
      return "last seen " + formatDistanceToNow(new Date(ts), { addSuffix: true });
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UserAvatar = _sfc_main$3;
      const _component_MessageBubble = _sfc_main$2;
      const _component_MessageInput = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col h-full" }, _attrs))}>`);
      if (unref(otherUser)) {
        _push(`<div class="flex items-center gap-3 px-4 py-3 bg-tg-sidebar-darker shadow-sm flex-shrink-0"><button class="md:hidden text-white mr-1">←</button>`);
        _push(ssrRenderComponent(_component_UserAvatar, {
          user: unref(otherUser),
          size: "sm"
        }, null, _parent));
        _push(`<div class="flex-1 min-w-0"><p class="text-white font-medium text-sm truncate">${ssrInterpolate(unref(otherUser).display_name)}</p><p class="text-tg-gray text-xs">${ssrInterpolate(unref(chatStore).isTyping(unref(otherUser).id) ? "typing…" : unref(otherUser).is_online ? "online" : formatLastSeen(unref(otherUser).last_seen))}</p></div><div class="flex items-center gap-2"><button class="text-white/70 hover:text-white transition p-1.5" title="Voice call"> 📞 </button><button class="text-white/70 hover:text-white transition p-1.5" title="Video call"> 📹 </button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex-1 overflow-y-auto px-4 py-4 space-y-1"><!--[-->`);
      ssrRenderList(unref(chatStore).messages, (msg) => {
        _push(ssrRenderComponent(_component_MessageBubble, {
          key: msg.id,
          message: msg,
          "is-mine": msg.sender_id === unref(auth).user?.id,
          "peer-public-key": unref(otherUser)?.e2ee_public_key ?? ""
        }, null, _parent));
      });
      _push(`<!--]--><div></div></div>`);
      _push(ssrRenderComponent(_component_MessageInput, {
        "chat-id": unref(chatId),
        "receiver-id": unref(otherUser)?.id ?? "",
        "receiver-public-key": unref(otherUser)?.e2ee_public_key ?? "",
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
export {
  _sfc_main as default
};
//# sourceMappingURL=_id_-DnFR1b9b.js.map
