import { mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderSlot } from "vue/server-renderer";
import { _ as _export_sfc } from "../server.mjs";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/nuxt/node_modules/hookable/dist/index.mjs";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/unctx/dist/index.mjs";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/h3/dist/index.mjs";
import "vue-router";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/defu/dist/defu.mjs";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/ufo/dist/index.mjs";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/klona/dist/index.mjs";
const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-white font-sans" }, _attrs))}>`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/public.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _public = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  _public as default
};
//# sourceMappingURL=public-1EtkA2Zk.js.map
