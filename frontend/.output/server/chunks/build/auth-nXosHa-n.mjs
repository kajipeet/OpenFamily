import { g as defineStore } from './server.mjs';

const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null,
    user: null
  }),
  getters: {
    isLoggedIn: (s) => !!s.token,
    isAdmin: (s) => {
      var _a;
      return ((_a = s.user) == null ? void 0 : _a.role) === "admin";
    }
  },
  actions: {
    hydrate() {
    },
    set(token, user) {
      this.token = token;
      this.user = user;
    },
    logout() {
      this.token = null;
      this.user = null;
    }
  }
});

export { useAuthStore as u };
//# sourceMappingURL=auth-nXosHa-n.mjs.map
