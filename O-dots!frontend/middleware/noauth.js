//middleware/noauth.js



export default defineNuxtRouteMiddleware((to, from) => {



   if (process.client) {

     const userData = getUser();

     if (userData?.user){

       window.location.pathname = '/'

     }

   }



})