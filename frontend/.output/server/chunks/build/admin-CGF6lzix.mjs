import { _ as _sfc_main$1 } from './UserAvatar-BjFy4kfy.mjs';
import { defineComponent, ref, reactive, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
import { u as useAuthStore } from './auth-nXosHa-n.mjs';
import { a as useAuthHeaders } from './useAuth-CYq6jCny.mjs';
import './server.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "admin",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    useAuthHeaders();
    const users = ref([]);
    const loadingUsers = ref(true);
    const form = reactive({ display_name: "", username: "", password: "", role: "user" });
    const creating = ref(false);
    const createError = ref("");
    const packName = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UserAvatar = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 max-w-2xl mx-auto w-full" }, _attrs))}><h1 class="text-xl font-semibold text-gray-100 mb-6">\u{1F464} Admin Panel</h1><section class="bg-tg-sidebar rounded-2xl p-5 mb-6"><h2 class="text-sm font-semibold text-white mb-4">Create New Member</h2><form class="space-y-3"><input${ssrRenderAttr("value", unref(form).display_name)} placeholder="Display name" required class="w-full bg-tg-sidebar-darker text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-tg-blue placeholder-gray-500"><input${ssrRenderAttr("value", unref(form).username)} placeholder="Username (login)" required class="w-full bg-tg-sidebar-darker text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-tg-blue placeholder-gray-500"><input${ssrRenderAttr("value", unref(form).password)} type="password" placeholder="Password (min 8 chars)" required minlength="8" class="w-full bg-tg-sidebar-darker text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-tg-blue placeholder-gray-500"><select class="w-full bg-tg-sidebar-darker text-white rounded-xl px-3 py-2.5 text-sm outline-none"><option value="user"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "user") : ssrLooseEqual(unref(form).role, "user")) ? " selected" : ""}>User</option><option value="admin"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "admin") : ssrLooseEqual(unref(form).role, "admin")) ? " selected" : ""}>Admin</option></select>`);
      if (unref(createError)) {
        _push(`<p class="text-red-400 text-xs">${ssrInterpolate(unref(createError))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="submit"${ssrIncludeBooleanAttr(unref(creating)) ? " disabled" : ""} class="w-full bg-tg-blue hover:bg-tg-blue-dark text-white rounded-xl py-2.5 text-sm font-medium transition disabled:opacity-60">${ssrInterpolate(unref(creating) ? "Creating\u2026" : "Create Member")}</button></form></section><section class="bg-tg-sidebar rounded-2xl p-5"><h2 class="text-sm font-semibold text-white mb-4">All Members</h2>`);
      if (unref(loadingUsers)) {
        _push(`<div class="text-tg-gray text-sm text-center py-4">Loading\u2026</div>`);
      } else {
        _push(`<ul class="space-y-2"><!--[-->`);
        ssrRenderList(unref(users), (u) => {
          var _a;
          _push(`<li class="flex items-center justify-between bg-tg-sidebar-darker rounded-xl px-4 py-3"><div class="flex items-center gap-3 min-w-0">`);
          _push(ssrRenderComponent(_component_UserAvatar, {
            user: u,
            size: "sm"
          }, null, _parent));
          _push(`<div class="min-w-0"><p class="text-white text-sm font-medium truncate">${ssrInterpolate(u.display_name)}</p><p class="text-tg-gray text-xs truncate">${ssrInterpolate(u.tag)} \xB7 ${ssrInterpolate(u.role)}</p></div></div>`);
          if (u.id !== ((_a = unref(auth).user) == null ? void 0 : _a.id)) {
            _push(`<button class="ml-4 text-red-400 hover:text-red-300 text-xs flex-shrink-0">Remove</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
      }
      _push(`</section><section class="bg-tg-sidebar rounded-2xl p-5 mt-6"><h2 class="text-sm font-semibold text-white mb-4">Sticker Packs</h2><form class="flex gap-2 mb-4"><input${ssrRenderAttr("value", unref(packName))} placeholder="Pack name" required class="flex-1 bg-tg-sidebar-darker text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-tg-blue placeholder-gray-500"><button type="submit" class="bg-tg-blue text-white rounded-xl px-4 text-sm hover:bg-tg-blue-dark transition"> Add </button></form><p class="text-tg-gray text-xs"> After creating a pack, upload sticker images via the file upload endpoint and manage them using the API. </p></section></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/app/admin.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=admin-CGF6lzix.mjs.map
