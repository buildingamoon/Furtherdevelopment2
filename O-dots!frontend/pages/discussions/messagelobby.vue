<template>
  <div>
    <Courseheader />
    <div class="chitchatwrapper">
      <div class="lower">
        <div class="left">
          <div class="upper">
            <h4>We are Discussing something......<br><p>Interesting!</p></h4>
          </div>
          <div class="box box1">
            <ul>
              <router-link v-for="discussion in paginatedDiscussions" :key="discussion._id" :to="`/discussions/${discussion._id}`" style="width: 100%;">
                <li style="width: 90%;">
                  <div class="topic">{{ discussion.topic }}</div>
                  <div class="datahost">
                    <div class="date">{{ formatDate(discussion.createdAt) }}</div>
                  </div>
                </li>
              </router-link>
            </ul>
            <!-- Pagination Controls -->
            <div class="pagination-controls" style="width:80%; margin:3px;align-self: center;">
              <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
              <span>Page {{ currentPage }} of {{ totalPages }}</span>
              <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
            </div>
          </div>
        </div>
        <div class="right">
          <div class="carousel-container">
            <button class="carousel-control prev" @click="prevSlide">‹</button>
            <div class="carousel">
              <div class="carousel-item" v-for="(event, index) in paginatedEvents" :key="event._id" :style="getCarouselItemStyle(index)">
                <router-link :to="`/discussions/${event._id}`">
                  <div class="tiny tiny1" :style="[discussionBackgroundStyle(event.photos), { height: '20em' }]">
                    <div class="tinyoverlay"></div>
                    <div class="content-center">
                      <div class="topic1">{{ event.topic }}</div>
                      <div class="datahost">
                        <div class="date1">{{ event.startDate ? formatDate(event.startDate) : 'No Start Date' }}</div>
                      </div>
                    </div>
                  </div>
                </router-link>
              </div>
            </div>
            <button class="carousel-control next" @click="nextSlide">›</button>
          </div>
          <div>
            <p>Discussing Today</p>
            <div class="todaydicsussionwrap">
              <router-link v-for="discussion in todayDiscussions" :key="discussion._id" :to="`/discussions/${discussion._id}`">
                <div class="row row1">
                  <div class="newbox1" :style="discussionBackgroundStyle(discussion.photos)">
                    <p>{{ discussion.topic }}</p>
                    <div class="addbtn2"><a href="/discussions/addChitchat"> +NEW</a></div>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
          <div class="addbtn2"><a href="/discussions/addChitchat"> +NEW</a></div>
        </div>
        <div class="addbtn"><a href="/discussions/addChitchat"> +NEW</a></div>
      </div>
    </div>
  </div>
</template>

<script setup>

definePageMeta({
    middleware:["auth"]
})

import { ref, computed, onMounted } from 'vue';
import { useRuntimeConfig } from '#imports';

const discussions = ref([]);
const events = ref([]);
const todayDiscussions = ref([]);
const runtimeConfig = useRuntimeConfig();

const currentPage = ref(1);
const postsPerPage = 10;

const currentSlide = ref(0);

const fetchDiscussions = async () => {
  try {
    const response = await fetch(`${runtimeConfig.public.apiBase}discussions`);
    const data = await response.json();

    if (Array.isArray(data.discussions)) {
      discussions.value = data.discussions.filter(discussion => discussion.type === 'discussion');

      // Simplified date comparison for events using only startDate
      const now = new Date();
      events.value = data.discussions.filter(event => {
        if (event.type === 'event' && event.startDate) {
          const eventDate = new Date(event.startDate);
          return eventDate.toDateString() === now.toDateString() || eventDate >= now;
        }
        return false;
      });

      // Fetch only the first five todayDiscussions
      todayDiscussions.value = data.discussions
        .filter(discussion =>
          discussion.type === 'discussion' &&
          new Date(discussion.createdAt).toDateString() === new Date().toDateString()
        )
        .slice(0, 5);

    } else {
      console.error('API Response does not contain an array of discussions');
    }
  } catch (error) {
    console.error('Error fetching discussions:', error);
  }
};

 

const paginatedDiscussions = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage;
  const end = start + postsPerPage;
  return discussions.value.slice(start, end);
});

const paginatedEvents = computed(() => {
  const start = currentSlide.value;
  const end = start + 1; // Show 1 event per slide
  return events.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(discussions.value.length / postsPerPage);
});

const totalSlides = computed(() => {
  return Math.ceil(events.value.length);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextSlide = () => {
  if (currentSlide.value < totalSlides.value - 1) {
    currentSlide.value++;
  }
};

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--;
  }
};

const getCarouselItemStyle = (index) => {
  return {
    transform: `translateX(${(index - currentSlide.value) * 100}%)`,
  };
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const discussionBackgroundStyle = (photoUrl) => {
  const defaultPhotoUrl = '/public/pictures/inner.png';
  return {
    backgroundImage: `url(${photoUrl || defaultPhotoUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
};

onMounted(async () => {
  await fetchDiscussions();
});
</script>

<style scoped>
.topic, .date, .host {
  color: black;
  display: block;
}
.carousel-container {
  display: flex;
  flex-direction: row;
  height: 20em;
}
.carousel {
  width: 45em;
  height: 100%;
}
.carousel-item {
  height: 100%;
}
.carousel-item a {
  height: 100%;
}
.chitchatwrapper {
  width: 100%;
  max-height: 90vh;
  background-color: white;
  display: flex;
  flex-direction: column;
}
.chitchatwrapper .upper {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex: 0.5;
  align-items: center;
}
.chitchatwrapper .upper h4 {
  font-size: 1em;
}
.chitchatwrapper .upper p {
  font-size: 2em;
}
.chitchatwrapper .upper img {
  width: 13vh;
  height: 13vh;
}
.chitchatwrapper .lower {
  flex: 4;
  display: flex;
  flex-direction: row;
  justify-content: center;
  overflow-y: auto; /* Added overflow-y:auto to .lower */
}
.chitchatwrapper .lower .left,
.chitchatwrapper .lower .right {
  flex: 1;
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  gap: 1vh;
  padding: 1vh;
  overflow-y: auto; /* Added overflow-y:auto to .lower .left and .lower .right */
}
.chitchatwrapper .left .box1 {
  display: flex;
  background-color: rgba(128, 128, 128, 0.288);
  flex: 2;
  width: 100%;
  height: 90%;
  box-sizing: border-box;
  position: relative;
  overflow-y: auto;
  flex-direction: column;
  overflow-x: hidden;
}
.chitchatwrapper .left .box1 ul {
  display: flex;
  flex-direction: column;
  padding: 1vh;
  width: 100%;
  align-content: center;
}
.chitchatwrapper .left .box1 ul li {
  text-decoration: none;
  color: black;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  border: 1px solid white;
  margin: 0.3em;
  background-color: rgba(128, 128, 128, 0.055);
}
.pagination-controls {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
.chitchatwrapper .left .box1 ul li .date,
.chitchatwrapper .left .box1 ul li .host {
  color: gray;
  font-size: 0.7em;
  flex-shrink: 0;
}
.chitchatwrapper .left .box2 {
  display: flex;
  background-color: rgba(128, 128, 128, 0.288);
  flex: 1;
  width: 80%;
  height: 90%;
  box-sizing: border-box;
  padding: 2vh;
  overflow-y: auto;
}
.chitchatwrapper .left .box2 a{
  width:100%;
}
.chitchatwrapper .left .tiny {
  display: flex;
  background-color: rgba(128, 128, 128, 0.288);
  flex: 1;
  width: calc(100% - 1vh);
  margin-right: 1vh;
  height: 20em;
  box-sizing: border-box;
  flex-direction: column;
  border-radius: 5px;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  justify-content: center;
}

  .date{
    font-size: 0.7em;
  }
.chitchatwrapper .right .row {
  display: flex;
  flex: 1;
  width: 90%;
  height: 90%;
  box-sizing: border-box;
  flex-direction: row;
  gap: 1vh;
}
.todaydicsussionwrap{
  display: flex;
  flex-direction: row;
}
.chitchatwrapper .right p {
  color: white;
}
.chitchatwrapper .right .box {
  display: flex;
  flex: 3;
  width: calc(50% - 1vh);
  height: 101%;
  box-sizing: border-box;
  flex-direction: column;
  gap: 1vh;
  background-size: cover;
  background-position: center;
}
.chitchatwrapper .right button {
  align-self: center;
  display: flex;
  flex: 0;
  width: 30%;
  height: 20%;
  box-sizing: border-box;
  background-color: white;
  font-size: 2em;
  text-align: center;
  justify-content: center;
  align-items: center;
  margin-bottom: 1vh;
}
.tinyoverlay {
  background-color: rgba(255, 255, 255, 0.5);
  position: absolute;
  z-index: 0;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}

.content-center {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: black; /* Ensures text color is visible over the overlay */
}

.topic, .date {
  margin: 0.5em 0; /* Optional: add some spacing around text */
}
.topic1{
  font-size: 2.5em;
  color: white;
}
.date1{
  font-size: 1em;
  color: rgb(63, 63, 63);
}
.newbox1 {
  display: flex;
  background-color: rgba(128, 128, 128, 0.288);
  flex: 2;
  width: 11.5em;
  height: 10em;
  box-sizing: border-box;
  position: relative;
  overflow-y: auto;
  flex-direction: column;
  margin:0.2em;
}
.addbtn{
  width:30%;
  margin-top: 2vh;
  opacity:0;
  width:0;
}
.addbtn a {
    color: #090909;
    border: 2px solid #c9d007;
    padding: 2vh;
    background: rgb(248 244 244 / 21%);
    border-radius: 11px;
    margin: 2vh;
    text-decoration:none;
}
.addbtn a:hover {
    color: white;
    border: 2px solid #c9d007;
    padding: 2vh;
    background: #c9d007;
    border-radius: 11px;
    margin: 2vh;
}
.newbox1 p{
  background: #00000099;
  height:20%;
}
.box1 ul{
  background: white;
}
.addbtn2{
  width:30%;
  margin-top: 2vh;
}
.addbtn2 a{
  color: white;
    border: 1px solid white;
    padding: 2vh;
    background: rgb(255 255 255 / 20%);
    border-radius: 10px;
}
@media (max-width: 600px) {
.app {
    overflow: hidden; /* Hide scrollbars */
}
.chitchatwrapper .lower{
  flex-direction: column-reverse;
}
.chitchatwrapper .upper{
  opacity: 0;
  width:0;
  height:0;
}
.addbtn{
  width:30%;
  margin-top: 2vh;
  opacity:1;
  width:100%;
}
.addbtn2{
  width:0;
  opacity:0;
}
}


</style>
  
  