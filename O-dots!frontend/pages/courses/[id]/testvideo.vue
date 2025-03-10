<template>
    <div>
      <div class="loading-screen" id="loadingScreen" ref="loadingScreen"></div>
      <div v-if="loading" class="loading-bar">Loading...</div>
      <div v-else-if="course" class="singlecourse">
        <p class="sidemenu" @click="toggleMenu">MENU</p>
        <div ref="menu" class="left">
          <div class="coursenav">
            <div class="core">
              <courseheader/>
              <label>{{ course.title }}</label><br>
            </div>
            <div class="sub">
              <label>Videos</label>
              <ul>
                <li v-for="video in course.videos" :key="video.url" @click="updateVideo(video)">
                  {{ video.name }}
                </li>
              </ul>
            </div>
          </div>
        </div>
  
        <div class="bigright">
          <div class="middle">
            <div class="mediawrapper" v-if="currentVideo.url">
              <iframe :src="currentVideo.url" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>
            </div>
            <p>{{ currentVideo.name }}</p>
          </div>
          <div class="right">
            <div class="tutorremark">
              <p>{{ currentVideo.tutorremarks }}</p>
            </div>
            <div class="notepad">
              <textarea placeholder="Drop your notes here..."></textarea>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <p>No course data available</p>
      </div>
    </div>
  </template>
  
  <script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRuntimeConfig, useFetch } from '#imports';
import { gsap } from 'gsap';

const route = useRoute();
const course = ref(null);
const currentVideo = ref({
  name: '',
  url: '',
  tutorremarks: ''
});
const runtimeConfig = useRuntimeConfig();
const loadingScreen = ref(null);
const loading = ref(true);
const isMenuHidden = ref(true); // Initially hidden
const menu = ref(null);

const fetchData = async () => {
  const courseId = route.params.id;
  console.log('Fetching course with ID:', courseId);

  const timestamp = new Date().getTime();

  try {
    const { data, error } = await useFetch(`${runtimeConfig.public.apiBase}courses/${courseId}?timestamp=${timestamp}`);
    console.log('API Base URL:', `${runtimeConfig.public.apiBase}courses/${courseId}?timestamp=${timestamp}`);

    if (error.value) {
      console.error('Error fetching course:', error.value);
    } else {
      console.log('API Response:', data.value);
    }

    if (data.value) {
      console.log('Fetched course data:', data.value);
      course.value = data.value;
      if (course.value.videos && course.value.videos.length > 0) {
        currentVideo.value = course.value.videos[0];
        console.log('Set current video:', currentVideo.value);
      }
    } else {
      console.log('No data received from API');
    }
  } catch (err) {
    console.error('Fetch Error:', err);
  } finally {
    loading.value = false;
  }

  setTimeout(() => {
    if (loadingScreen.value) {
      loadingScreen.value.classList.add('dim');
    }
  }, 1000);
};

onMounted(async () => {
  await nextTick();
  await fetchData();
});

const updateVideo = (video) => {
  currentVideo.value = video;
  console.log('Updated current video:', currentVideo.value);
};

const toggleMenu = () => {
  if (isMenuHidden.value) {
    gsap.to(menu.value, { left: 0, duration: 0.5 });
    gsap.to('.sidemenu', { left: '25%', duration: 0.5 });
  } else {
    gsap.to(menu.value, { left: '-25%', duration: 0.5 });
    gsap.to('.sidemenu', { left: 0, duration: 0.5 });
  }
  isMenuHidden.value = !isMenuHidden.value;
};
</script>

<style scoped>
.loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #f3f3f3;
  text-align: center;
  padding: 10px 0;
  font-weight: bold;
}

.sidemenu {
  position: absolute;
  top: 50%;
  left: 0;
  background: #80808045;
  border: 1px solid #616161;
  padding: 1vh;
  border-left: none;
  cursor: pointer;
}

.singlecourse .left {
  box-sizing: border-box;
  flex: 2;
  display: flex;
  width: 100%;
  height: 100%;
  position: absolute;
  overflow: hidden;
  padding: 3vh;
  width: 25%;
  left: -25%;
  background: #80808087;
}

.singlecourse .bigright {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  margin-left: 0; /* Ensure there's no margin on the left */
}

.singlecourse .middle {
  flex: 7;
  padding: 3vh;
}

.singlecourse .right {
  flex: 3;
  padding: 3vh;
}
</style>


  