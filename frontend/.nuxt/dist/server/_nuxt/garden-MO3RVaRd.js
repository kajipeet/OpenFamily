import { _ as __nuxt_component_0 } from "./nuxt-link-FLrwJPI1.js";
import { defineComponent, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderComponent } from "vue/server-renderer";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/nuxt/node_modules/hookable/dist/index.mjs";
import { a as useSeoMeta } from "./v3-AquQDfP1.js";
import { u as useAuth } from "./useAuth-CYq6jCny.js";
import { u as useRouter } from "../server.mjs";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/ufo/dist/index.mjs";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/defu/dist/defu.mjs";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/@unhead/vue/dist/index.mjs";
import "./auth-nXosHa-n.js";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/unctx/dist/index.mjs";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/h3/dist/index.mjs";
import "vue-router";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/klona/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "garden",
  __ssrInlineRender: true,
  setup(__props) {
    useSeoMeta({
      title: "Sign In - OpenFamily",
      robots: "noindex, nofollow"
    });
    useAuth();
    useRouter();
    const username = ref("");
    const password = ref("");
    const error = ref("");
    const loading = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4" }, _attrs))}><div class="w-full max-w-sm"><div class="text-center mb-8"><span class="text-5xl">🌿</span><h1 class="text-xl font-semibold text-green-900 mt-3">OpenFamily</h1><p class="text-sm text-gray-500 mt-1">Private family messenger sign in</p></div><form class="bg-white rounded-2xl shadow-md p-6 space-y-4"><div><label class="block text-xs font-medium text-gray-600 mb-1">Username</label><input${ssrRenderAttr("value", unref(username))} type="text" autocomplete="username" required class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-300" placeholder="Username"></div><div><label class="block text-xs font-medium text-gray-600 mb-1">Password</label><input${ssrRenderAttr("value", unref(password))} type="password" autocomplete="current-password" required class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-300" placeholder="••••••••"></div>`);
      if (unref(error)) {
        _push(`<p class="text-red-500 text-xs text-center">${ssrInterpolate(unref(error))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="submit"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} class="w-full bg-green-700 hover:bg-green-800 text-white font-medium rounded-xl py-2.5 text-sm transition disabled:opacity-60">${ssrInterpolate(unref(loading) ? "Signing in…" : "Sign In")}</button></form><p class="text-center text-xs text-gray-400 mt-6">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "hover:underline"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`← Back to Home`);
          } else {
            return [
              createTextVNode("← Back to Home")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/garden.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=garden-MO3RVaRd.js.map
