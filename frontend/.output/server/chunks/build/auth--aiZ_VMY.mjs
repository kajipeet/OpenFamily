import { d as defineNuxtRouteMiddleware, n as navigateTo } from './server.mjs';
import { u as useAuthStore } from './auth-nXosHa-n.mjs';
import 'vue';
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
import 'vue/server-renderer';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const auth = defineNuxtRouteMiddleware((to) => {
  const auth2 = useAuthStore();
  if (!auth2.isLoggedIn) {
    return navigateTo("/garden");
  }
});

export { auth as default };
//# sourceMappingURL=auth--aiZ_VMY.mjs.map
