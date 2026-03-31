import { d as defineNuxtRouteMiddleware, n as navigateTo } from "../server.mjs";
import { u as useAuthStore } from "./auth-nXosHa-n.js";
import "vue";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/nuxt/node_modules/hookable/dist/index.mjs";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/unctx/dist/index.mjs";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/h3/dist/index.mjs";
import "vue-router";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/defu/dist/defu.mjs";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/ufo/dist/index.mjs";
import "/home/konrad/repo/OpenFamily/frontend/node_modules/klona/dist/index.mjs";
import "vue/server-renderer";
const auth = defineNuxtRouteMiddleware((to) => {
  const auth2 = useAuthStore();
  if (!auth2.isLoggedIn) {
    return navigateTo("/garden");
  }
});
export {
  auth as default
};
//# sourceMappingURL=auth--aiZ_VMY.js.map
