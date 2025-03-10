<template>
  <div>
    <Courseheader />
    <div id="mycourses">
      <div class="coursewrapper">
        <div class="coursecol left">
          <div class="image-preview">
            <img :src="userIcon" @click="openFileDialog" class="mycourseusericon" alt="User Icon" style="cursor: pointer;" />
            <input type="file" ref="fileInput" @change="onFileChange" style="display:none;">
          </div>
          <br>
          <p>{{ user.name }}</p>
          <div class="upload-controls">
            <label :for="'uploadUserIcon'">
            </label>
            <p v-if='uploadingUserIcon'>Uploading...</p>
          </div>
        </div>
        <div class="coursecol middle">
          <h3>My Course Subscriptions</h3>
          <Swipercarouselsub :items="paidProducts"/>
        </div>
        <div class="coursecol right">
          <label>Info from Tutor</label>
          <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Repellat nobis voluptatem suscipit, qui voluptates doloribus! Labore quasi, maiores maxime nam quos asperiores illo? Ipsum amet accusamus illum explicabo perferendis ad.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRuntimeConfig } from '#imports';
import { useRouter } from 'vue-router';
import Swipercarouselsub from '@/components/Swipercarouselsub.vue';

const user = ref({ name: '' });
const userIcon = ref('/public/picture/inner.jpg');
const uploadingUserIcon = ref(false);
const fileInput = ref(null);
const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const session = useSession();
const paidProducts = ref([]);

definePageMeta({
  middleware: ["auth"]
});

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
    // console.log('Fetched user icon:', userIcon.value);
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
      // console.log('Filtered Payments:', payments); // Log the filtered payments
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

const openFileDialog = () => {
  fileInput.value.click();
};

const onFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

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

  if (validateFile(file)) {
    uploadingUserIcon.value = true;
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${runtimeConfig.public.apiBase}courses/imageupload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      const imageUrl = data.url;
      userIcon.value = imageUrl;
      await saveUserIcon(imageUrl);
      uploadingUserIcon.value = false;
    } catch (error) {
      console.error('Error uploading image:', error);
      uploadingUserIcon.value = false;
    }
  }
};

const saveUserIcon = async (icon) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${runtimeConfig.public.apiBase}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userIcon: icon }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    console.log('Saved user icon:', icon);
  } catch (error) {
    console.error('Error saving user icon:', error);
  }
};
</script>

<style scoped>
.mycourseusericon {
  width: 250px;
  height: 250px;
}
.coursewrapper .coursecol.left img {
  cursor: pointer;
}
.default-icons img {
  width: 50px;
  height: 50px;
  margin: 5px;
  cursor: pointer;
}
.coursewrapper {
  display: flex;
  background: black;
}
.coursecol.left {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.coursecol.middle {
  display: flex;
  flex-wrap: wrap;
  padding: 2vh;
}
.box {
  width: 100%;
  height: 100px;
  margin: 5px;
  position: relative;
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.coursecol.right {
  padding: 10px;
}
.image-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}
.image-preview img {
  width: 200px;
  height: 200px;
  object-fit: cover;
}
.upload-controls {
  text-align: center;
  margin-top: 10px;
}
@media (max-width: 600px) {
  .coursewrapper {
    flex-direction: column;
  }
  .coursecol.left {
    margin-top: 11vh;
  }
  .mycourseusericon {
    width: 25vh;
    height: 25vh;
  }
  .image-preview img {
    width: 10vh;
    height: 10vh;
  }
}
.coursecol.middle h3{
  font-size: 0.9em;
  color: white;
}
</style>
