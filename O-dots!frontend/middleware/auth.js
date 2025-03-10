// middleware/auth.js
export default defineNuxtRouteMiddleware((to, from) => {
    if (process.client) {
      const userData = getUser();
      if (!userData?.user) {
        // Store the target URL in localStorage
        localStorage.setItem('targetUrl', to.fullPath);
        window.location.pathname = '/users/signin';
      }
    }
  });
  