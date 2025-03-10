
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
      console.log('Session Data:', sessionData); // Log the session data for debugging
  
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Log the token for debugging
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
      console.log('User Data:', data); // Log the user data for debugging
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
    console.log('Mounted'); // Log when the component is mounted
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
  }
  </style>
  
  
  