//middleware/admin.js



export default defineNuxtRouteMiddleware((to, from) => {



    if (process.client) {

       const userData = getUser();

     

         

           if (!userData?.user){

  

               window.location.pathname = '/'

           }



           if (userData?.user.role != 'admin'){

      

                window.location.pathname = '/'

           }

      

   }







})