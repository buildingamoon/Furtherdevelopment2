<template>
    <div>

    </div>
</template>

<script setup>

   onMounted(() => {

     // set session to null

     useSetSession(null);

    

     setTimeout(() => {

       alert("Goodbye, See You soon!");

       window.location.pathname="/";

     }, 100);



   });

   </script>