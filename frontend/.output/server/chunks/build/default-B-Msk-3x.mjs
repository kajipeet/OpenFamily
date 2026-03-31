import { _ as _sfc_main$4 } from './UserAvatar-BjFy4kfy.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-FLrwJPI1.mjs';
import { defineComponent, mergeProps, unref, ref, withCtx, createTextVNode, watch, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
import { format } from 'date-fns';
import { u as useAuthStore } from './auth-nXosHa-n.mjs';
import { c as useCallStore, b as useChatStore, a as useAuthHeaders, u as useAuth, e as useWebSocket } from './useAuth-CYq6jCny.mjs';
import { u as useRouter, b as useRuntimeConfig } from './server.mjs';
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

const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "ChatListItem",
  __ssrInlineRender: true,
  props: {
    chat: { type: Object, required: true }
  },
  setup(__props) {
    function formatTime(ts) {
      if (!ts) return "";
      try {
        return format(new Date(ts), "HH:mm");
      } catch {
        return "";
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UserAvatar = _sfc_main$4;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center gap-3 px-4 py-3 hover:bg-white/5 border-b border-white/5 transition cursor-pointer" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UserAvatar, {
        user: __props.chat.other_user,
        size: "md"
      }, null, _parent));
      _push(`<div class="min-w-0 flex-1"><div class="flex items-center justify-between gap-2"><p class="text-white text-sm font-medium truncate">${ssrInterpolate((_a = __props.chat.other_user) == null ? void 0 : _a.display_name)}</p><span class="text-[11px] text-tg-gray whitespace-nowrap">${ssrInterpolate(formatTime(__props.chat.last_message_at))}</span></div><div class="flex items-center justify-between gap-2 mt-0.5"><p class="text-tg-gray text-xs truncate">${ssrInterpolate(__props.chat.last_message || "No messages yet")}</p>`);
      if (__props.chat.unread_count) {
        _push(`<span class="min-w-5 h-5 px-1 rounded-full bg-tg-green text-white text-[11px] grid place-items-center">${ssrInterpolate(__props.chat.unread_count)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ChatListItem.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "AppSidebar",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    const chatStore = useChatStore();
    const router = useRouter();
    useAuthHeaders();
    useAuth();
    const searchTag = ref("");
    const searchResults = ref([]);
    function openChat(chat) {
      router.push(`/app/chat/${chat.id}`);
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_UserAvatar = _sfc_main$4;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ChatListItem = _sfc_main$3;
      _push(`<aside${ssrRenderAttrs(mergeProps({ class: "w-full md:w-72 lg:w-80 flex-shrink-0 bg-tg-sidebar flex flex-col h-full border-r border-tg-sidebar-darker" }, _attrs))}><div class="flex items-center justify-between px-4 py-3 bg-tg-sidebar-darker flex-shrink-0"><div class="flex items-center gap-3 min-w-0">`);
      _push(ssrRenderComponent(_component_UserAvatar, {
        user: unref(auth).user,
        size: "sm"
      }, null, _parent));
      _push(`<div class="min-w-0"><p class="text-white text-sm font-medium leading-tight truncate">${ssrInterpolate((_a = unref(auth).user) == null ? void 0 : _a.display_name)}</p><p class="text-tg-gray text-xs truncate">${ssrInterpolate((_b = unref(auth).user) == null ? void 0 : _b.tag)}</p></div></div><div class="flex items-center gap-1">`);
      if (unref(auth).isAdmin) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/app/admin",
          class: "text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition text-lg",
          title: "Admin panel"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u2699\uFE0F`);
            } else {
              return [
                createTextVNode("\u2699\uFE0F")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition text-sm"> Exit </button></div></div><div class="px-3 py-2 flex-shrink-0"><div class="flex items-center gap-2 bg-tg-sidebar-darker rounded-xl px-3 py-2"><span class="text-gray-400 text-sm">\u{1F50D}</span><input${ssrRenderAttr("value", unref(searchTag))} type="text" placeholder="Search by @tag" class="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"></div></div>`);
      if (unref(searchResults).length > 0) {
        _push(`<div class="px-3 pb-2 flex-shrink-0"><div class="bg-tg-sidebar-darker rounded-xl overflow-hidden"><!--[-->`);
        ssrRenderList(unref(searchResults), (u) => {
          _push(`<div class="flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 cursor-pointer transition">`);
          _push(ssrRenderComponent(_component_UserAvatar, {
            user: u,
            size: "sm"
          }, null, _parent));
          _push(`<div class="min-w-0"><p class="text-white text-sm truncate">${ssrInterpolate(u.display_name)}</p><p class="text-tg-gray text-xs truncate">${ssrInterpolate(u.tag)}</p></div></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex-1 overflow-y-auto">`);
      if (unref(chatStore).chats.length === 0) {
        _push(`<div class="text-center text-tg-gray text-xs mt-8 px-4"> No chats yet.<br>Search for a member by @tag to start. </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(chatStore).chats, (chat) => {
        _push(ssrRenderComponent(_component_ChatListItem, {
          key: chat.id,
          chat,
          onClick: ($event) => openChat(chat)
        }, null, _parent));
      });
      _push(`<!--]--></div></aside>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AppSidebar.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
function useWebRTC() {
  var _a, _b;
  const callStore = useCallStore();
  const auth = useAuthStore();
  const { sendRaw } = useWebSocket();
  const config = useRuntimeConfig();
  let pc = null;
  let localStream = null;
  const localVideo = ref(null);
  const remoteVideo = ref(null);
  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    // Add TURN here if coturn is configured.
    ...config.public.turnServer ? [{
      urls: `turn:${config.public.turnServer}:3478`,
      username: (_b = (_a = auth.user) == null ? void 0 : _a.id) != null ? _b : "user",
      credential: config.public.turnSecret
    }] : []
  ];
  async function startCall(peerId, type) {
    var _a2;
    await setupPC();
    const stream = await getLocalMedia(type);
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendRaw({
      type: "call_ring",
      receiver_id: peerId,
      data: JSON.stringify({
        sdp: offer,
        type,
        display_name: (_a2 = auth.user) == null ? void 0 : _a2.display_name
      })
    });
  }
  async function acceptCall(offer, peerId, type) {
    await setupPC();
    const stream = await getLocalMedia(type);
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    sendRaw({ type: "call_answer", receiver_id: peerId, data: JSON.stringify({ sdp: answer }) });
  }
  function rejectCall(peerId) {
    sendRaw({ type: "call_reject", receiver_id: peerId });
    callStore.endCall();
  }
  function endCall() {
    sendRaw({ type: "call_end", receiver_id: callStore.peerId });
    cleanup();
    callStore.endCall();
  }
  function cleanup() {
    localStream == null ? void 0 : localStream.getTracks().forEach((t) => t.stop());
    pc == null ? void 0 : pc.close();
    pc = null;
    localStream = null;
  }
  async function setupPC() {
    if (pc) {
      pc.close();
      pc = null;
    }
    pc = new RTCPeerConnection({ iceServers });
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendRaw({
          type: "call_ice",
          receiver_id: callStore.peerId,
          data: JSON.stringify({ candidate: e.candidate })
        });
      }
    };
    pc.ontrack = (e) => {
      if (remoteVideo.value) remoteVideo.value.srcObject = e.streams[0];
    };
  }
  async function getLocalMedia(type) {
    localStream = await (void 0).mediaDevices.getUserMedia({
      video: type === "video",
      audio: true
    });
    if (localVideo.value) localVideo.value.srcObject = localStream;
    return localStream;
  }
  return { startCall, acceptCall, rejectCall, endCall, localVideo, remoteVideo };
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "VideoCallOverlay",
  __ssrInlineRender: true,
  setup(__props) {
    const callStore = useCallStore();
    const { localVideo, remoteVideo } = useWebRTC();
    const localVideoEl = ref(null);
    const remoteVideoEl = ref(null);
    watch(localVideoEl, (value) => {
      if (value) localVideo.value = value;
    }, { immediate: true });
    watch(remoteVideoEl, (value) => {
      if (value) remoteVideo.value = value;
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" }, _attrs))}><div class="w-full max-w-5xl bg-slate-950 rounded-3xl overflow-hidden shadow-2xl"><div class="flex items-center justify-between px-5 py-4 border-b border-white/10 text-white"><div><p class="font-semibold">${ssrInterpolate(unref(callStore).peerName || "Call")}</p><p class="text-xs text-white/60">${ssrInterpolate(unref(callStore).type === "video" ? "Video call" : "Audio call")}</p></div><div class="flex items-center gap-2">`);
      if (unref(callStore).incoming) {
        _push(`<button class="px-4 py-2 rounded-full bg-green-600 hover:bg-green-500 text-sm">Accept</button>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(callStore).incoming) {
        _push(`<button class="px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-500 text-sm">Reject</button>`);
      } else {
        _push(`<button class="px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-sm">End</button>`);
      }
      _push(`</div></div><div class="grid md:grid-cols-2 gap-4 p-4 bg-slate-900"><div class="aspect-video rounded-2xl bg-black overflow-hidden flex items-center justify-center text-white/40"><video autoplay playsinline muted class="w-full h-full object-cover"></video>`);
      if (unref(callStore).type === "audio") {
        _push(`<span class="absolute">Local audio</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="aspect-video rounded-2xl bg-black overflow-hidden flex items-center justify-center text-white/40"><video autoplay playsinline class="w-full h-full object-cover"></video>`);
      if (unref(callStore).type === "audio") {
        _push(`<span class="absolute">Remote audio</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/VideoCallOverlay.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    const callStore = useCallStore();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppSidebar = _sfc_main$2;
      const _component_VideoCallOverlay = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex h-screen overflow-hidden bg-tg-bg font-sans text-gray-900" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AppSidebar, null, null, _parent));
      _push(`<main class="flex-1 flex flex-col min-w-0">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main>`);
      if (unref(callStore).active) {
        _push(ssrRenderComponent(_component_VideoCallOverlay, null, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-B-Msk-3x.mjs.map
