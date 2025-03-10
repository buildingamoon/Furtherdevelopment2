<template>
    <div>
      <header class="active">
        <section id="coursenav">
          <div class="coursenavcontainer">
            <a href="/" class="coursenavitems">
              <img class="websiteicon" src="/public/picture/logonoword.png" alt="o-dots!">
            </a>
            <div class="coursenavitems ul">
                <ul>
                    <a href="/courses/mycourses"><li>My Courses</li></a>
                    <a href="/discussions/messagelobby"><li>classChitchat</li></a>
                    <a href="/courses/allcourses"><li>Courses</li></a>
                </ul>
            </div>
            <div class="coursenavitems loginmsg menu">
                <a v-if='!session.data?.user' href='/users/signin'>Login</a>
                <a v-else href='/users/signout'>
                    Logout
                    <p class="loginemail">({{ session.data?.user.email }})</p>
                </a>
            </div>
          </div>
        </section>
      </header>
    </div>
  </template>

<script setup>
    const session =useSession();
</script>
<style>
@media (max-width: 600px) {
  .loginemail {
    opacity: 0;
    height: 0;
    width: 0;
  }
  .coursenavitems{
    font-size: 0.8em;
  }
}
</style>