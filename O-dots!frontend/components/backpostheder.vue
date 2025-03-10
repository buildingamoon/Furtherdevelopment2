<template>
    <div>
      <header class="active">
        <section id="nav">
          <div class="navcontainer">
            <a href="/posts/allposts" class="navitems">
              <img class="websiteicon" src="/public/picture/backtext.png" alt="o-dots!">
            </a>
          </div>
        </section>
      </header>
    </div>
  </template>

<script setup>
    const session =useSession();
</script>

<style>
.navcontainer {
    display: flex !important;
    flex-direction: row;
    padding: 2vh 2vh;
    justify-content: space-between;
    position: sticky;
    top: 0px;
    left: 0px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.5), transparent 90%);
    z-index: 1;
}
nav {
    position: fixed;
    z-index: 2;
    top: 0;
    left: 0;
    width: 100%;
}
img{
    width:auto;
    height:5vh;
}
.websiteiconback {
    height: 2em;
    opacity: 1;
}
</style>