<template>
  <Backpostheder/>
  <div>
    <div class="cover" ref="cover" :style="{ backgroundImage: `url(${post.photos})` }">
      <h1 ref="title">{{ post.title }}</h1>
      <p>{{ post.subtitle }}</p>
      <div class="arrow" ref="scrollArrow">
        &darr;
        <span>Here We Go!</span>
      </div>
    </div>
    <div class="content" ref="content">
      <div class="content-inner">
        <h2>{{ post.title }}</h2>
        <div class="metatag">
          <div>
            <div v-if="userIcon" class="metatagitem metatagitem1" :style="{ backgroundImage: `url(${userIcon})` }"></div>
            <div class="metatagitem metatagitem2">{{ user.name }}</div>
          </div>
          <div class="metatagitem metatagitem3">
            <div v-for="(category, index) in post.categories" :key="index" class="category" :style="{ background: 'red' }">
              {{ category }}
            </div>
          </div>
          <div class="metatagitem4">{{ formatDate(post.createdAt, 'day month year') }}</div>
        </div>
        <p>{{ post.content }}</p>
      </div>
    </div>
  </div>
</template>


<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useRuntimeConfig } from '#imports';

const cover = ref(null);
const content = ref(null);
const title = ref(null);
const scrollArrow = ref(null);
const isContentVisible = ref(false);
const post = ref({});
const user = ref({}); // Use ref instead of reactive for consistency
const userIcon = ref('');

const route = useRoute();
const runtimeConfig = useRuntimeConfig();

const animateText = (element, delay) => {
  const words = element.innerHTML.split(' ');
  element.innerHTML = '';
  words.forEach((word, index) => {
    const span = document.createElement('span');
    span.innerHTML = word + ' ';
    span.className = 'animated-word';
    element.appendChild(span);
    setTimeout(() => {
      span.style.opacity = '1';
      span.style.transform = 'translateY(0)';
    }, index * delay);
  });

  setTimeout(() => {
    if (scrollArrow.value) {
      scrollArrow.value.style.opacity = '1';
    }
  }, words.length * delay + 50);
};

const fetchUserData = async (postId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token available');
    }
    const response = await fetch(`${runtimeConfig.public.apiBase}auth/byPost/${postId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    const data = await response.json();
    user.value = data; // Use ref assignment
    if (data.userIcon) {
      userIcon.value = data.userIcon;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

const fetchPost = async (postId) => {
  try {
    const response = await fetch(`${runtimeConfig.public.apiBase}posts/${postId}`);
    const data = await response.json();
    post.value = data;
    if (data.photos) {
      cover.value.style.backgroundImage = `url(${data.photos})`;
    }
    await fetchUserData(postId); // Fetch user data based on post ID
  } catch (error) {
    console.error('Error fetching post:', error);
  }
};

onMounted(async () => {
  const { id } = route.params; // Use 'id' instead of 'slug'
  if (id) {
    await fetchPost(id);

    if (title.value) {
      animateText(title.value, 300);
    }

    scrollArrow.value.addEventListener('click', () => {
      cover.value.classList.add('hidden');
      content.value.classList.add('active');
      isContentVisible.value = true; // Set content visible state
    });

    window.addEventListener('scroll', () => {
      if (!isContentVisible.value && window.scrollY > 100) {
        cover.value.classList.add('hidden');
        content.value.classList.add('active');
        isContentVisible.value = true; // Set content visible state
      }
    });
  } else {
    console.error('Post ID is missing from route params');
  }
});
</script>


<style scoped>
body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: Arial, sans-serif;
  overflow-x: hidden;
  background-size: cover;
  color: white;
}
.cover {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2;
  background: rgba(249, 248, 248, 0.8);
  text-align: center;
  transition: transform 0.5s ease-in-out, opacity 0.5s ease-in-out;
  color: black;
  background-size: cover;
  background-position: center;
}
.cover.hidden {
  transform: translateY(-100%);
  opacity: 0;
}
.cover h1 {
  font-size: 3em;
  margin: 5vh 0;
  text-shadow: -4px 1px 1px rgba(248, 248, 248, 0.6);
}
.cover p {
  font-size: 1.5em;
  margin: 5vh 0;
}
.arrow {
  text-shadow: -1px 1px 1px rgba(248, 248, 248, 0.9);
  border: 1px solid white;
  padding: 2vh;
  background: rgb(255 255 255 / 50%);
  border-radius: 10px;
  position: absolute;
  bottom: 26vh;
  font-size: 1em;
  cursor: pointer;
  animation: bounce 2s infinite;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  transition: opacity 0.5s ease;
}
.arrow span {
  font-size: 1em;
  margin-top: 0.5em;
}
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}
.content {
  display: none;
  padding: 2.5em;
  min-height: 100vh;
  position: relative;
}
.content.active {
  display: block;
}
.content-inner {
  position: relative;
  z-index: 2;
  max-width: 60%;
  margin: 0 auto;
}
.content h2 {
  font-size: 2.5em;
  margin-bottom: 5%;
  text-align: center;
}
.content p {
  font-size: 1em;
}
.animated-word {
  opacity: 0;
  display: inline-block;
  margin-right: 10%; /* Space between words */
  transform: translateY(-70px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.metatag {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: center;
  align-items: center;
  align-content: center;
  text-align: center;
}
.metatagitem {
  flex: 1;
  font-size: 0.7em;
  margin-top:1vh;
}
.metatagitem1 {
  width: 5vh;
  height: 5vh;
  border-radius: 50%;
  background-color: gray;
  background-size: cover;
  background-position: center;
}
.metatagitem2 {
  flex: 1;
  font-size: 0.6em;
}
.metatagitem3 {
  display: flex;
  gap: 1em;
  align-self: center;
  justify-content: center;
}
.category {
  padding: 0.5em 1em;
  border-radius: 25px;
  background: rgba(255, 0, 0, 0.551);
  color: white;
}
.metatagitem4 {
  font-size: 0.7em;
}


@media(max-width:600px){
  .content h2{
    font-size: 1.5em;
  }
.cover h1 {
  font-size: 2em;
}
}
</style>
