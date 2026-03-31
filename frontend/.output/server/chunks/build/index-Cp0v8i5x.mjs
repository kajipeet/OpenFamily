import { _ as __nuxt_component_0 } from './nuxt-link-FLrwJPI1.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { u as useSeoMeta, a as useHead } from './v3-AquQDfP1.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useSeoMeta({
      title: "OpenFamily - Private Family Chat And Calls",
      description: "Self-hosted private family messenger with ephemeral messages, file sharing, stickers, and audio or video calls.",
      ogTitle: "OpenFamily - Private Family Chat And Calls",
      ogDescription: "Self-hosted private family messenger built with Go, Nuxt, Tailwind, JWT, WebSocket signalling, and MongoDB.",
      ogType: "website",
      robots: "index, follow"
    });
    useHead({
      script: [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "OpenFamily",
            description: "Self-hosted private family chat and calling platform.",
            about: { "@type": "SoftwareApplication", name: "Family messenger" },
            inLanguage: "en"
          })
        }
      ]
    });
    const features = [
      {
        name: "One-to-one chat",
        emoji: "\u{1F4AC}",
        description: "Telegram-like chat layout with per-user conversations and unread counters."
      },
      {
        name: "File and media sharing",
        emoji: "\u{1F4CE}",
        description: "Send files, images, voice notes, audio, and video attachments."
      },
      {
        name: "Audio and video calls",
        emoji: "\u{1F4F9}",
        description: "WebRTC-based direct calls with TURN support for self-hosted deployments."
      },
      {
        name: "Admin user lifecycle",
        emoji: "\u{1F6E1}\uFE0F",
        description: "Only administrators can create or remove accounts."
      },
      {
        name: "Automatic tags",
        emoji: "\u{1F3F7}\uFE0F",
        description: "Users are searchable by an automatically assigned unique tag."
      },
      {
        name: "Avatars and stickers",
        emoji: "\u{1F5BC}\uFE0F",
        description: "Upload profile avatars and create sticker packs for family chats."
      }
    ];
    const securityCards = [
      {
        name: "Encrypted fields in MongoDB",
        emoji: "\u{1F510}",
        description: "Sensitive user and message content fields are encrypted before persistence using AES-256-GCM.",
        tags: ["AES-256-GCM", "MongoDB", "At-rest protection"]
      },
      {
        name: "Ephemeral read lifecycle",
        emoji: "\u23F1\uFE0F",
        description: "Unread messages stay on the server until the recipient reads them, then enter a visible three-minute deletion window.",
        tags: ["Read receipts", "Visible timer", "Server cleanup"]
      },
      {
        name: "Self-host deployment",
        emoji: "\u{1F433}",
        description: "Docker Compose includes frontend, backend, MongoDB, Nginx, and coturn for a complete family-hosted stack.",
        tags: ["Docker Compose", "Nginx", "coturn"]
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ layout: "public" }, _attrs))}><nav class="border-b border-gray-100 sticky top-0 bg-white z-10"><div class="max-w-6xl mx-auto px-4 flex items-center justify-between h-14"><a href="/" class="flex items-center gap-2 font-semibold text-green-700 text-lg"> OpenFamily </a><div class="hidden md:flex items-center gap-6 text-sm text-gray-600"><a href="#features" class="hover:text-green-700">Features</a><a href="#security" class="hover:text-green-700">Security</a><a href="#about" class="hover:text-green-700">About</a>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/garden",
        class: "px-4 py-1.5 bg-green-700 text-white rounded-full text-sm hover:bg-green-800 transition"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Sign In `);
          } else {
            return [
              createTextVNode(" Sign In ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/garden",
        class: "md:hidden text-xs text-green-700 font-medium border border-green-700 px-3 py-1 rounded-full"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Sign In `);
          } else {
            return [
              createTextVNode(" Sign In ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></nav><header class="bg-gradient-to-br from-green-50 to-emerald-100 py-16 px-4 text-center"><h1 class="text-4xl md:text-5xl font-bold text-green-900 mb-4"> Private Family Chat And Calls </h1><p class="text-lg text-green-700 max-w-2xl mx-auto"> Self-hosted messaging for family communication with chat, file sharing, voice notes, stickers, and audio or video calls. </p></header><section class="max-w-4xl mx-auto px-4 -mt-6"><div class="bg-white rounded-2xl shadow-md p-6 grid md:grid-cols-3 gap-4 text-sm text-gray-600"><div><p class="font-semibold text-gray-900 mb-1">Admin-managed accounts</p><p>Users are created and removed only by an administrator.</p></div><div><p class="font-semibold text-gray-900 mb-1">Encrypted storage</p><p>MongoDB stores encrypted user and message payload fields.</p></div><div><p class="font-semibold text-gray-900 mb-1">Ephemeral messages</p><p>Read messages start a visible 3-minute deletion timer and are removed server-side.</p></div></div></section><section id="features" class="max-w-6xl mx-auto px-4 py-14"><h2 class="text-2xl font-bold text-gray-800 mb-8">Features</h2><div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"><!--[-->`);
      ssrRenderList(features, (feature) => {
        _push(`<div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"><div class="text-3xl mb-2">${ssrInterpolate(feature.emoji)}</div><h3 class="font-semibold text-gray-800 text-sm">${ssrInterpolate(feature.name)}</h3><p class="text-xs text-gray-500 mt-1">${ssrInterpolate(feature.description)}</p></div>`);
      });
      _push(`<!--]--></div></section><section id="security" class="bg-green-50 py-14"><div class="max-w-6xl mx-auto px-4"><h2 class="text-2xl font-bold text-gray-800 mb-8">Security And Delivery Model</h2><div class="grid md:grid-cols-3 gap-6"><!--[-->`);
      ssrRenderList(securityCards, (card) => {
        _push(`<article class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"><div class="h-40 flex items-center justify-center text-7xl bg-gradient-to-br from-green-50 to-emerald-100">${ssrInterpolate(card.emoji)}</div><div class="p-4"><h3 class="font-bold text-gray-800">${ssrInterpolate(card.name)}</h3><p class="text-sm text-gray-600">${ssrInterpolate(card.description)}</p><div class="mt-3 flex flex-wrap gap-1"><!--[-->`);
        ssrRenderList(card.tags, (tag) => {
          _push(`<span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">${ssrInterpolate(tag)}</span>`);
        });
        _push(`<!--]--></div></div></article>`);
      });
      _push(`<!--]--></div></div></section><section id="about" class="max-w-4xl mx-auto px-4 py-14"><h2 class="text-2xl font-bold text-gray-800 mb-4">About OpenFamily</h2><div class="prose prose-green max-w-none text-gray-600 text-sm leading-relaxed space-y-3"><p> OpenFamily is a self-hosted communication platform for small trusted groups. It is designed for direct administration, private infrastructure, and clear ownership of data and deployment. </p><p> The stack uses a Go backend with Gin, a Nuxt frontend styled with Tailwind, JWT authentication, WebSocket signalling, MongoDB for storage, and Docker Compose for deployment on a self-hosted server. </p><p> The application is intended for legitimate private communication. Access is explicit, administration is centralized, and the public landing page accurately describes the service. </p></div></section><footer class="border-t border-gray-100 py-8 text-center text-xs text-gray-400"> \xA9 ${ssrInterpolate((/* @__PURE__ */ new Date()).getFullYear())} OpenFamily \xB7 <a href="#" class="hover:underline">Privacy</a> \xB7 <a href="#" class="hover:underline">Terms</a></footer></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Cp0v8i5x.mjs.map
