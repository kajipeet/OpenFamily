import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "UserAvatar",
  __ssrInlineRender: true,
  props: {
    user: { type: Object, default: null },
    size: { type: String, default: "md" }
  },
  setup(__props) {
    const props = __props;
    const sizeClass = computed(() => {
      if (props.size === "sm") return "w-10 h-10 text-sm";
      if (props.size === "lg") return "w-16 h-16 text-xl";
      return "w-12 h-12 text-base";
    });
    const initials = computed(() => {
      var _a, _b;
      const text = ((_a = props.user) == null ? void 0 : _a.display_name) || ((_b = props.user) == null ? void 0 : _b.username) || "?";
      return String(text).split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("") || "?";
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: [
          "rounded-full overflow-hidden flex items-center justify-center bg-tg-header text-white shrink-0",
          unref(sizeClass)
        ]
      }, _attrs))}>`);
      if ((_a = __props.user) == null ? void 0 : _a.avatar) {
        _push(`<img${ssrRenderAttr("src", __props.user.avatar)}${ssrRenderAttr("alt", ((_b = __props.user) == null ? void 0 : _b.display_name) || ((_c = __props.user) == null ? void 0 : _c.username) || "avatar")} class="w-full h-full object-cover">`);
      } else {
        _push(`<span class="font-medium uppercase">${ssrInterpolate(unref(initials))}</span>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/UserAvatar.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=UserAvatar-BjFy4kfy.mjs.map
