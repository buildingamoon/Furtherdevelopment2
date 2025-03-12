
<template>
  <div>
    <header class="active">
      <section id="nav">
        <div class="navcontainer">
          <a href="/" class="navitems">
            <img class="websiteicon" src="/public/picture/logonoword.png" alt="o-dots!" href='/'>
          </a>
          <div class="websitename navitems">O-dots!</div>
          <div class="loginmsg menu">
            <a v-if='!session.data?.user' href='/users/signin'>Login</a>
            <a v-else href='/users/signout'>
              <div :style="{ backgroundImage: `url(${user.userIcon})`, backgroundSize: 'cover', backgroundPosition: 'center' }" class="msguserIcon"></div>
              <p class="loginemail">({{ session.data?.user.email }})</p>
              Logout
            </a>
          </div>
        </div>
      </section>
      <div class="secondnav">
        <ul>
          <li><a href="#" data-target="page1" @click="handleClick($event, 'page1')" :class="{ 'active-nav-item': activePage === 'page1' }">
            <svg width="40px" height="40px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="menu-item1 nav-icon">
              <g>
                <path fill="none" d="M0 0h24v24H0z"/>
                <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zM6.023 15.416C7.491 17.606 9.695 19 12.16 19c2.464 0 4.669-1.393 6.136-3.584A8.968 8.968 0 0 0 12.16 13a8.968 8.968 0 0 0-6.137 2.416zM12 11a3 3 0 1 0 0-6 3 3  0 0 0 0 6z"/>
              </g>
            </svg>
            <br><p>Home</p>
          </a></li>
          <li><a href="#" data-target="page2" @click="handleClick($event, 'page2')" :class="{ 'active-nav-item': activePage === 'page2' }">
            <svg width="40px" height="40px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="menu-item2 nav-icon">
              <g>
                <path fill="none" d="M0 0h24v24H0z"/>
                <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zM6.023 15.416C7.491 17.606 9.695 19 12.16 19c2.464 0 4.669-1.393 6.136-3.584A8.968 8.968 0 0 0 12.16 13a8.968 8.968 0 0 0-6.137 2.416zM12 11a3 3 0 1 0 0-6 3 3  0 0 0 0 6z"/>
              </g>
            </svg>
            <br><p>Hot-dots!</p>
          </a></li>
          <li><a href="#" data-target="page3" @click="handleClick($event, 'page3')" :class="{ 'active-nav-item': activePage === 'page3' }">
            <svg width="40px" height="40px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="menu-item3 nav-icon">
              <g>
                <path fill="none" d="M0 0h24v24H0z"/>
                <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zM6.023 15.416C7.491 17.606 9.695 19 12.16 19c2.464 0 4.669-1.393 6.136-3.584A8.968 8.968 0 0 0 12.16 13a8.968 8.968 0 0 0-6.137 2.416zM12 11a3 3 0 1 0 0-6 3 3  0 0 0 0 6z"/>
              </g>
            </svg>
            <br><p>Dot Academy</p>
          </a></li>
          <li><a href="#" data-target="page4" @click="handleClick($event, 'page4')" :class="{ 'active-nav-item': activePage === 'page4' }">
            <svg width="40px" height="40px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="menu-item4 nav-icon">
              <g>
                <path fill="none" d="M0 0h24v24H0z"/>
                <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zM6.023 15.416C7.491 17.606 9.695 19 12.16 19c2.464 0 4.669-1.393 6.136-3.584A8.968 8.968 0 0 0 12.16 13a8.968 8.968 0 0 0-6.137 2.416zM12 11a3 3 0 1 0 0-6 3 3  0 0 0 0 6z"/>
              </g>
            </svg>
            <br><p>My O-dots!</p>
          </a></li>
        </ul>
      </div>
    </header>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useSession } from '@/composables/state';
import { useRuntimeConfig } from '#imports';
import { useRoute, useRouter } from 'vue-router';

const session = useSession();
const userIcon = ref('');
const user = reactive({});
const route = useRoute();
const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const activePage = ref('');

const waitForSessionData = () => {
  return new Promise((resolve) => {
    const checkSessionData = () => {
      const sessionData = session.value?.data;
      if (sessionData) {
        resolve(sessionData);
      } else {
        setTimeout(checkSessionData, 100); // Retry after 100ms
      }
    };
    checkSessionData();
  });
};

const fetchUserData = async () => {
  try {
    const sessionData = await waitForSessionData();


    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token available');
    }

    const response = await fetch(`${runtimeConfig.public.apiBase}users?email=${sessionData.user.email}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`Failed to fetch user data: ${response.status} - ${error.message}`);
      throw new Error(`Failed to fetch user data: ${response.status} - ${error.message}`);
    }

    const data = await response.json();
    Object.assign(user, data);
    if (data.userIcon) {
      userIcon.value = data.userIcon;
    }
  } catch (error) {
    console.error('Error fetching user data:', error.message);
    router.push('/users/signin');
  }
};

onMounted(async () => {
  await fetchUserData();
});




const handleClick = (event, targetPage) => {
  event.preventDefault();
  activePage.value = targetPage;
};

onMounted(fetchUserData);
</script>

<style>
.signedin {
  display: flex;
  flex-direction: column;
  align-items: end;
}

.msguserIcon {
  align-self: flex-end;
  width: 40px;
  height: 40px;
  border-radius: 10%;
  background-color: #ddd;
  background-size: cover;
  background-position: center;
}

.active-nav-item {
  color: yellow;
}

@media (max-width: 600px) {
  .loginemail {
    opacity: 0;
    height: 0;
    width: 0;
  }
  .navcontainer, .secondnav {
    font-size: 0.8em;
  }
  .loginmsg a {
    font-size: 0.7em;
  }
  ul {
      margin: 0;
      padding: 0;
      list-style: none;
      margin-top: -15%!important;
  }
}
</style>


