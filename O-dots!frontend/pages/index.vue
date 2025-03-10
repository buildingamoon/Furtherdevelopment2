<template>
  <div>
    <div class="loader">
      <div class="loaderwrap">
        <div>
          <img src="/public/picture/logobody.png" class="bodyloader">
          <img src="/public/picture/logoeyes.png" class="eyesloader">
          <div class="loaderwebsitename">O-dots!</div>
        </div>
      </div>
    </div>
    <mainheader />
    <main>
      <div v-if="currentPage === 'page1'">
      <section class="page page1 active">
          <div class="pagewrapper page1wrapper">
            <div class="upper">
              <video autoplay muted loop>
                <source src="/video/full-width.mp4" type="video/mp4">
              </video>
            </div>
            <div class="lower">
                <div class="page1loopbox box1">
                    <Swipercarouselclean />
                </div>
                <div class="page1loopbox page1loopbox2">
                    <h2>Crowfunding programme</h2>
                    <Crowdfund />
                </div>
                <div class="page1loopbox page1loopbox3">
                  <div class="box3flexwrap">
                    <h2>O-dots!Pick for you!</h2>
                    <span>Explore More>></span>
                  </div>
                      <Crowdfund />
                </div>
                <div class="page1loopbox page1loopbox4">
                      <h2>Cover your favourite</h2>
                      <div class="box4wrap">
                        <img src="/public/picture/ADDBG.png">
                        <div class="coursecatwrap">
                          <div class="coursecat coursecat1">1</div>
                          <div class="coursecat coursecat1">1</div>
                          <div class="coursecat coursecat1">1</div>
                          <div class="coursecat coursecat1">1</div>
                          <div class="coursecat coursecat1">1</div>
                          <div class="coursecat coursecat1">1</div>
                          <div class="coursecat coursecat1">1</div>
                          <div class="coursecat coursecat1">1</div>
                          <div class="coursecat coursecat1">1</div>
                          <div class="coursecat coursecat1">1</div>
                        </div>
                      </div>
                </div>
                <div class="page1loopbox page1loopbox5">
                      <h2>Shining Tutors</h2>
                      <newbies />
                </div>
            </div>
          </div>
      </section>
      </div>
      <section class="page page2">
        <div class="pagewrapper page2wrapper">
          <div class="whole">
            <div v-for="post in featuredPosts" :key="post._id" class="page2box page2box1">
              <div class="left">
                <h4>{{ formatDate(post.createdAt, 'day') }}</h4>
                <p>{{ formatDate(post.createdAt, 'monthYear') }}</p>
              </div>
              <div class="right">
                <div class="Lbox box1" :style="{ backgroundImage: 'url(' + post.photos + ')' }">
                  <h5>{{ post.title }}</h5>
                </div>
                <div class="Lbox box2">
                  <p>
                    {{ getExcerpt(post.content) }}
                    <a :href="'/posts/' + post._id">(Read More...)</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="page page3">
        <div class="pagewrapper page3wrapper">
          <div class="promotionslogan2">
            <a href="/courses/mycourses">My Courses</a>
            <a href="/courses/allcourses">All Courses in O-dots!</a>
          </div>
          <div class="page3videocontainer">
            <div class="upperlayer">
              <div class="coursecontainer coursecontainer1" v-if="featuredCourse">
                <router-link :to="`/courses/${featuredCourse._id}`" class="course-link">
                  <div class="_isfeaturedcourse" :style="{ backgroundImage: `url(${featuredCourse.photos[0]})`, backgroundSize: 'cover' }">
                    <div class="page3cover"></div>
                    <p class="courselooptitle">{{ featuredCourse.title }}</p>
                    <p class="courseloopcatagories">{{ featuredCourse.categories.join(', ') }}</p>
                    <button class="watchnow">Watch Now</button>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
          <div class="page3cubewrap">
            <div class="page3cube page3cube1">
              <ul>
                <li>cat1</li>
                <li>cat2</li>
                <li>cat3</li>
                <li>cat4</li>
                <li>cat5</li>
                <li>cat6</li>
              </ul>
            </div>
            <div class="page3cube page3cube2">
              <h3>Tutors' Trend</h3>
              <iframe src="/public/video/demo1.mp4"></iframe>
            </div>
            <div class="page3cube page3cube3">
              <h3>Acheivements</h3>
              <div class="acheivewrap">
                <div class="acheive acheive1">1</div>
                <div class="acheive acheive2">2</div>
                <div class="acheive acheive3">3</div>
                <div class="acheive acheive4">4</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="page page4">
        <div class="pagewrapper page4wrapper">
          <div class="left">
            <div class="image-preview2">
              <img :src="userIcon" @click="openFileDialog" class="mycourseusericon" alt="User Icon" style="cursor: pointer;" />
              <input type="file" ref="fileInput" @change="onFileChange" style="display:none;">
            </div>
            <input
              v-if="isEditing"
              type="text"
              v-model="user.name"
              @blur="saveUserName"
              @keyup.enter="saveUserName"
            />
            <p v-else @click="isEditing = true">{{ user.name }}</p>
            <p>{{ user.email }}</p>
            <a v-if='!session.data?.user' href='/users/signin'>Login</a>
            <a v-else href='/users/signout'>
              Logout
            </a>
            <div class="upload-controls">
              <label :for="'uploadUserIcon'">
              </label>
              <p v-if='uploadingUserIcon'>Uploading...</p>
            </div>
          </div>
          <div class="middle">
            <div>
              <h4>My Pocket</h4>
              
            </div>

            <div class="loopbox">
              <!-- Clip boxes here -->
            </div>
          </div>
          <div class="right">
            <div class="title">
              <h4>My Clips</h4>
            </div>
            <div class="loopbox">
              <!-- Course boxes here -->
            </div>
          </div>
        </div>
      </section>
    </main>
    <footer></footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import gsap from 'gsap';

import Swipercarouselclean from '~/components/Swipercarouselclean.vue';
import Swipercarouselsub from '~/components/Swipercarouselsub.vue';
import Crowdfund from '~/components/Crowdfund.vue';
import newbies from '~/components/newbies.vue';





const session = useSession();
const router = useRouter();
const runtimeConfig = useRuntimeConfig();

const currentPage = ref('page1'); // Default to Page 1
const posts = ref([]);
const featuredPosts = ref([]);
const courses = ref([]);
const featuredCourse = ref(null);
const recentCourses = ref([]);
const user = ref({ name: '' });
const userIcon = ref('/public/picture/inner.jpg');
const uploadingUserIcon = ref(false);
const fileInput = ref(null);
const isEditing = ref(false);
const paidProducts = ref([]);

const fetchUserData = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${runtimeConfig.public.apiBase}auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    user.value = data.user;
    if (data.user.userIcon) {
      userIcon.value = data.user.userIcon;
    }

  } catch (error) {
    console.error('Error fetching user data:', error);
    router.push('/users/signin');
  }
};

const fetchUserPayments = async () => {
  try {
    const token = session.data?.token || localStorage.getItem('token');
    const userEmail = user.value.email; // Get the user email fetched by fetchUserData()

    const response = await fetch(`${runtimeConfig.public.apiBase}/payments/user-coursesubscription?email=${userEmail}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const payments = await response.json();
      
      paidProducts.value = payments;
    } else {
      const error = await response.json();
      console.error('Failed to fetch payments:', error.message);
    }
  } catch (error) {
    console.error('Error fetching payments:', error);
  }
};

onMounted(async () => {
  await fetchUserData(); // Ensure user data is fetched first
  await fetchUserPayments(); // Fetch user payments after user data is available
});

const saveUserName = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${runtimeConfig.public.apiBase}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name: user.value.name }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    isEditing.value = false;
  } catch (error) {
    console.error('Error saving user name:', error);
  }
};

const openFileDialog = () => {
  fileInput.value.click();
};

const validateFile = (file) => {
  const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedFileTypes.includes(file.type)) {
    alert('Invalid file type. Only JPEG, PNG, and GIF images are allowed.');
    return false;
  }

  const maxSizeInMB = 2;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    alert(`File size exceeds the maximum limit of ${maxSizeInMB} MB.`);
    return false;
  }

  return true;
};

const onFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (validateFile(file)) {
    uploadingUserIcon.value = true;
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      userIcon.value = imageUrl;
      await saveUserIcon(imageUrl);
    }
    uploadingUserIcon.value = false;
  }
};

const changeIcon = async (icon) => {
  userIcon.value = icon;
  uploadingUserIcon.value = true;
  await saveUserIcon(icon);
  uploadingUserIcon.value = false;
};

const fetchAllPosts = async () => {
  let page = 1;
  const allPosts = [];
  let totalPages;

  try {
    do {
      const data = await $fetch(`${runtimeConfig.public.apiBase}posts?page=${page}&limit=10`);
      if (data && data.posts) {
        allPosts.push(...data.posts);
        totalPages = data.totalPages;
        page++;
      } else {
        console.error('Failed to fetch posts');
        break;
      }
    } while (page <= totalPages);

    posts.value = allPosts;
    featuredPosts.value = allPosts
      .filter(post => post.is_featured)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
};

const fetchAllCourses = async () => {
  let page = 1;
  const allCourses = [];
  let totalPages;

  try {
    do {
      const data = await $fetch(`${runtimeConfig.public.apiBase}courses?page=${page}&limit=10`);
      if (data && data.Courses) {
        allCourses.push(...data.Courses);
        totalPages = data.totalPages;
        page++;
      } else {
        console.error('Failed to fetch courses');
        break;
      }
    } while (page <= totalPages);

    courses.value = allCourses;
    featuredCourse.value = allCourses.find(course => course.is_featured) || null;
    recentCourses.value = allCourses
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
};

onMounted(() => {
  fetchAllPosts();
  fetchAllCourses();

  const loading = gsap.timeline();
  loading
    .fromTo('.loaderwrap', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 })
    .fromTo('.eyesloader', { autoAlpha: 0 }, { autoAlpha: 1, ease: 'power1.inOut', duration: 0.2 })
    .fromTo('.eyesloader', { autoAlpha: 0 }, { autoAlpha: 1, ease: 'power2.inOut', duration: 0.7 })
    .to('.loader', { y: '-100%', duration: 0.5 })
    .fromTo(
      ['header', '.page1'],
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 1,
        onComplete: () => {
          document.querySelectorAll('.page').forEach(page => {
            if (!page.classList.contains('page1')) page.classList.remove('active');
          });
        },
      }
    );
  document.querySelectorAll('.secondnav a, #nav a').forEach(link => {
    link.addEventListener('click', event => handleClick(event, link.dataset.target));
  });
});

const handleClick = (event, targetPage) => {
  const dynamicPages = ['page1', 'page2', 'page3', 'page4'];

  if (dynamicPages.includes(targetPage)) {
    event.preventDefault();

    if (targetPage === 'page4') {
      const userData = getUser();
      if (!userData || !userData.user) {
        window.location.pathname = "/users/signin";
        return;
      }
    }

    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
      page.classList.remove('active');
      page.style.visibility = 'hidden';
      page.style.opacity = '0';
    });

    const targetElement = document.querySelector(`.${targetPage}`);
    if (targetElement) {
      targetElement.classList.add('active');
      targetElement.style.visibility = 'visible';
      targetElement.style.opacity = '1';

    } else {
      console.error(`No element found for the class: ${targetPage}`);
    }
  }
};
</script>



<style>
.page3wrapper .upperlayer{
  overflow-y: auto;
  overflow-x: hidden;
}
.page1photolow{
  display:flex;
  flex-direction: row;
  justify-content:space-evenly;
}
h5{
  background: rgb(255 255 255 / 30%);
    font-size: 0.25em;
    bottom: 27%;
}
.page1wrapper .lower .one{
  flex:1;
  display:flex;
  flex-direction: row;
  margin:1vh;
  align-content: flex-end;
  align-items: end;
}

.page1wrapper .lower .two iframe{

  border: black;
}
.watchnow{
  width: 13%;
    height: 9%;
    border-radius: 5%;
    background: #d9d927e0;
    color: #ebebeb;
    position: absolute;
    top: 81%;
    right: 0;
    z-index: 2;
    font-weight: 700;
    background: #defa80ba;
    width: 13%;
    color: #415602;
    border: 1px dotted white;
    padding: 1vh;
    font-size: 1.5em;
}
.advtext{
  margin-top: 20%;
  margin-left: 72%;
  background: black!important;
  font-size: 0.9em!important;
}
.box3flexwrap{
  display:flex;
  flex-direction:row;
  justify-content: space-between;
  padding:3vh 10vh;
  color: white; 
}
.coursecat{
  width: calc(19% - 1vh);
  height:45%;
  background:rgba(207, 231, 176, 0.015);
  border-radius: 5px;
  border: 1px solid rgb(183, 215, 3);
  position:relative;
  overflow:hidden;
}
.coursecatwrap{
  width:100%;
  height:50vh;
  background:rgba(255, 255, 0, 0.09);
  display: flex;
  flex-wrap: wrap;
  gap:1vh;
  position:relative;
  overflow:hidden;
}
.box4wrap{
  display: flex;
  flex-direction: row;
  margin-top:10vh;
}
.box4wrap img{
  flex:2;
  width:48vh;
  height:48vh;
  padding-right:2vh;
}


@media (max-width: 600px) {
  .page2wrapper {
      margin-top: 13vh;
      height: 100vh;
  }
  .page2 .whole {
        width: 100%;
        flex-direction: column;
        margin-top: 86vh;
        margin-bottom: 10vh;
    }
  .page3cover .upperlayer{
    flex-direction: column;
    display: flex;
    flex-wrap: wrap;
    height: 95vh;
  }
  ._isfeaturedcourse{
    margin-left:0;
    margin-top: -17vh;
    width:100%;
    height: 82vh;
  }
  .row .box{
    width:20vh;
    height:20vh;
   
}
 .coursecontainer2{
  margin-top: 0px;
 }
 .upperlayer .coursecontainer .row {
    display: flex;
    flex: 1 1 calc(50%-1vh);
    flex-direction: column;
    margin: 0 .5vh;
    row-gap: 2vh;
    margin: 2vh;
}
.page4wrapper .middle,.page4wrapper .right{
    align-self: center;    
    margin-top:1vh;
}
.page1wrapper .upper {
    flex: 0.3;
    width: 100%;
    overflow-y: auto;
}
.coursecontainer1 a {
    color: #000;
    text-decoration: none;
    width: 100%;
    height: 100%;
    margin-top: 30.5vh;
}
.page2box {
    flex:none;
  }
  .page2wrapper .whole {
    padding-top: 141vh;

  }
  .page1wrapper .lower {
  flex: 1.5;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-wrap: wrap;
  gap: 1vh;
  position: relative;
  background-color: #00000017;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  flex-direction: column;
  margin-top: 17%;
}
.page1wrapper .lower .one{
  flex:0.2;
  display:flex;
  flex-direction: column;
  align-content: flex-end;
  align-items: center;
}
.page1wrapper .lower .one img{
  background: white;
  width:5vh;
  height: 5vh;
  border-radius: 50%;
  
}
.page1wrapper .lower .one .acc{
  color: white;
  padding-left:1vh;
  font-size: 0.7em;
  text-align: center;
}
.page1wrapper .lower .two{
  flex:7;
  display:flex;
  position:relative;
  overflow:hidden;
  width:100%;
  height:100%;
}
.page1wrapper .lower .two iframe{
  height:100%;
  width:95%;
  overflow:hidden;
  position: relative;
  border: black;
  left: 1.5vh;
  top: 3vh;
}


.page1wrapper .lower .three{
  margin-top:1vh;
  flex:2;
  display:flex;
  flex-direction: column;
  text-align: left;
  margin-left:2vh;
  overflow-y:auto;
}
.page1wrapper .lower .three .datetag{
  font-size: 0.8em;
}
.page1wrapper .lower a{
  width: 100%;
  height: 565px;
  margin-top: 10vh;
}
.page1loopbox {
  margin-top: -8vh;
}
.image-preview2 {
  display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
}
.textboxcontent {
  flex: 3;
  font-family: 'Dancing Script', cursive;
}
.page3wrapper .upperlayer{
  overflow-y: auto;
  overflow-x: hidden;
}
.courselooptitle {
    background: #f5f5f269;
    width: 33vh;
    height: 18vh;
    margin-top: 29vh;
    position: relative;
    overflow: hidden;
    border-top-right-radius: 20%;
    border-bottom-left-radius: 20%;
    letter-spacing: 0.8px;
    font-weight: 500;
    font-size: 2rem;
    line-height: 1.2;
    padding: 5vh;
    text-align: left;
    /* padding-left: 3vh; */
    color: #17171e;
}
.courseloopcatagories {
    background: #defa80ba;
    width: 30%;
    color: #415602;
    border: 1px dotted white;
    padding: 1vh;
    font-size: 0.8em;
}
.watchnow {
    width: 13%;
    height: 8%;
    border-bottom-left-radius: 10%;
    background: #d9d927e0;
    border-top-left-radius: 10%;
    color: #ebebeb;
    position: absolute;
    top: 23%;
    right: 0;
    z-index: 2;
    font-weight: 500;
    background: #defa80ba;
    width: 21%;
    color: #415602;
    border: 1px dotted white;
    padding: 1vh;
    font-size: 0.8em;
}
.page3cubewrap {
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 482%;
    justify-content: center;
    position: relative;
    width: 100%;
    font-size:0.8em;
    margin-top: 100vh;
}
.page3cube{
  font-size:0.8em;
}
.advtext {
    margin-top: 54%;
    margin-left: 12%;
    background: black !important;
    font-size: 0.8em !important;
}
/*start*/
.page1loopbox {
  margin-top: -1vh;
}
.page1loopbox {
flex: 3;
background: white;
border-radius: 0.2em;
min-width: 20vh;
min-height: 20vh;
position: relative;
overflow: hidden;
display: flex;
flex-direction: column;
height: 100%;
background: #000000a3;
width: 100%;
}
.page1loopbox2 {
    min-height: 17vh;
    /* padding: 5vh; */
    background: rgba(277, 277, 277, 0.3);
    margin-top: 2vh;
}
.page1loopbox3 {
    min-height: 27vh;
    background: rgba(228, 230, 142, 0.085);
}
.page1loopbox4 {
    min-height: 53vh;
    background: rgba(216, 39, 39, 0.142);
}
.box4wrap {
  margin-top: 0vh;
}
.box4wrap img {
    opacity: 0;
    width: 0vh;

}
.page1loopbox5 {
    min-height: 48vh;
    background: rgba(123, 123, 3, 0.174);
}
}

</style>












