<template>
  <div>
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </div>
</template>

<script setup>
onMounted(() => {

const sessionCookie = useCookie('session')

if (sessionCookie.value) {

  useSetSession(sessionCookie.value)  // Use the value directly, no need to parse

}

})
/*
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Site Title` : 'O-dots!Explore the creative world!';
  }
})

onMounted(() => {
     // set session from localStorage
     useSetSession(JSON.parse(localStorage.getItem("session")));
   });

*/

</script>


