<template>
  <div>
    <h1>Add a New Post</h1>
    <div class="addpostwrapper">
      <!-- Left Section for Feature Photo -->
      <div class="left">
        <div class="image-preview">
          <img :src="photoPreview || '/path/to/default-image.jpg'" @click="openFileDialog" width="250" height="250" alt="Post Photo" style="cursor: pointer;" />
          <input type="file" ref="fileInput" @change="onFileChange" style="display:none;">
          <div class="upload-controls">
            <p v-if="uploading">Uploading...</p>
            <button type="button" @click="removePhoto" v-if="photoPreview">Remove Photo</button>
          </div>
        </div>
        <p>Feature Photo</p>
      </div>
      <!-- Right Section for Form -->
      <div class="right">
        <form @submit.prevent="submitPost" class="formwrap">
          <div>
            <label for="title">Title:</label>
            <input type="text" id="title" v-model="post.title" required>
          </div>
          <div>
            <label for="content">Content:</label>
            <textarea id="content" v-model="post.content"></textarea>
          </div>
          <div>
            <label for="categories">Categories:</label>
            <input type="text" id="categories" v-model="categoriesInput" @blur="addCategory">
            <ul>
              <li v-for="(category, index) in post.categories" :key="index">
                {{ category }} <button type="button" @click="removeCategory(index)">Remove</button>
              </li>
            </ul>
          </div>
          <div>
            <label for="memberOnly">Members Only:</label>
            <input type="checkbox" id="memberOnly" v-model="post.memberOnly">
          </div>
          <div>
            <label for="isFeatured">Featured Post:</label>
            <input type="checkbox" id="isFeatured" v-model="post.is_featured">
          </div>

          <button type="submit">Publish</button>
        </form>
      </div>
    </div>
  </div>
</template>




<script setup>
definePageMeta({
  middleware: ['auth']
});

import { ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useRuntimeConfig } from '#imports';

const post = ref({
  title: '',
  content: '',
  categories: [],
  memberOnly: false,
  isFeatured: false,
  photos: ''
});

const categoriesInput = ref('');
const photoPreview = ref(null);
const uploading = ref(false);
const fileInput = ref(null);

const router = useRouter();
const runtimeConfig = useRuntimeConfig();

const addCategory = () => {
  if (categoriesInput.value && !post.value.categories.includes(categoriesInput.value)) {
    post.value.categories.push(categoriesInput.value);
    categoriesInput.value = '';
  }
};

const removeCategory = (index) => {
  post.value.categories.splice(index, 1);
};

const removePhoto = () => {
  post.value.photos = '';
  photoPreview.value = null;
};

const validateFile = (file) => {
  const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedFileTypes.includes(file.type)) {
    alert('Invalid file type -- only JPEG, PNG, and GIF images are allowed');
    return false;
  }

  const maxSizeInMB = 2;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    alert(`Exceed the maximum file size. Max. size: ${maxSizeInMB} MB`);
    return false;
  }

  return true;
};

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:1337/api/posts/imageupload', {
      method: "POST",
      body: formData,
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    return data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

const onFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (validateFile(file)) {
    uploading.value = true;
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      post.value.photos = imageUrl;
      photoPreview.value = imageUrl;
    }
    uploading.value = false;
  }
};

const openFileDialog = () => {
  fileInput.value.click();
};

const submitPost = async () => {
  try {
    const token = localStorage.getItem('token'); 

    if (!token) {
      alert('No token found. Please log in.');
      return;
    }

    const payload = { ...post.value };

    const response = await fetch(runtimeConfig.public.apiBase + 'posts', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      alert('Post created successfully!');
      await nextTick();
      router.push(`/posts/${data._id}`);
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error creating post:', error);
  }
};
</script>


<style>
.addpostwrapper {
  display: flex;
}
.addpostwrapper .left {
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 1px dotted black;
}
.addpostwrapper .left img {
  width: 13vh;
  height: 13vh;
  cursor: pointer;
}
.addpostwrapper .right {
  flex: 4;
  display: flex;
  justify-content: center;
  text-align: center;
  border: 1px dotted black;
}
.addpostwrapper .right .formwrap {
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 80%;
  padding-top: 2%;
}
form div {
  margin-bottom: 10px;
}
form label {
  font-weight: bold;
}
form input, form textarea {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
}
form button {
  padding: 10px 20px;
  margin-top: 10px;
}
.upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.image-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #ddd;
  padding: 10px;
}
.upload-controls {
  text-align: center;
  margin-top: 10px;
}
</style>