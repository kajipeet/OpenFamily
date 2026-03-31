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

const admin = defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore();
  if (!auth.isAdmin) {
    return navigateTo("/app");
  }
});

export { admin as default };
//# sourceMappingURL=admin-V9omd-mJ.mjs.map
