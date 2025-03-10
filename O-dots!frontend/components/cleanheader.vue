<template>
    <div>
      <header class="active">
        <section id="nav">
          <div class="navcontainer">
            <a href="/" class="navitems">
              <img class="websiteicon" src="/public/picture/logonoword.png" alt="o-dots!">
            </a>
            <div class="websitename navitems"></div>
            <div class="loginmsg menu">
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
  