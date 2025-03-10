<template>
  <div>
    <div class="upload-container">
      <div v-for="(file, index) in uploadedFiles" :key="index" class="file-preview">
        <img v-if="file && isImage(file)" :src="file" width="250" height="250" alt="Uploaded Image" />
        <video v-if="file && isVideo(file)" width="320" height="240" controls>
          <source :src="file" v-if="file.endsWith('.mp4')" type="video/mp4">
          <source :src="file" v-if="file.endsWith('.mov')" type="video/quicktime">
          Your browser does not support the video tag.
        </video>
        <div class="upload-controls">
          <label :for="`upload${index}`">
            <p>(Max. size: 30MB for videos, 2MB for images)</p>
          </label>
          <input type="file" @change="(e) => uploadFile(e, index)" :name="`upload${index}`" :id="`upload${index}`">
          <p v-if='uploading[index]'>Uploading...</p>
          <button @click="removeFile(index)">Delete File</button>
        </div>
      </div>
    </div>
    <br>
    <button @click="addFileUploadField">Add More File</button>
  </div>
</template>


<script setup>
import { ref } from 'vue';
import { useRuntimeConfig, useRoute } from '#imports';
const user = getUser();

const runtimeConfig = useRuntimeConfig();
const route = useRoute();

let uploading = ref([false]);
let uploadedFiles = ref([null]);

const allowedFileTypes = [
  'image/jpeg', 'image/png', 'image/gif',  // Images
  'video/mp4', 'video/quicktime'  // Videos
];

function validateFile(file) {
  if (!allowedFileTypes.includes(file.type)) {
    alert('Invalid file type -- only JPEG, PNG, GIF, MP4, and MOV files are allowed');
    return false;
  }

  const maxSizeInMB = file.type.startsWith('video') ? 30 : 2;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    alert(`Exceed the maximum file size. Max. size: ${maxSizeInMB} MB`);
    return false;
  }

  return true;
}

function isImage(file) {
  return ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
}

function isVideo(file) {
  return ['video/mp4', 'video/quicktime'].includes(file.type);
}

async function uploadFile(e, index) {
  const file = e.target.files[0];
  if (!file) return;

  if (validateFile(file)) {
    const formData = new FormData();
    formData.append(file.type.startsWith('video') ? 'video' : 'image', file);

    uploading.value[index] = true;

    try {
      const endpoint = file.type.startsWith('video') ? 'videos/videoupload' : 'posts/fileupload';
      const response = await useFetch(runtimeConfig.public.apiBase + endpoint, {
        method: "post",
        body: formData,
        headers: {
          "Authorization": "Bearer " + user?.accessToken
        }
      });
      uploadedFiles.value[index] = response.data.value.url;
      uploading.value[index] = false;
    } catch (error) {
      console.error('Error uploading file:', error);
      uploading.value[index] = false;
    }
  } else {
    alert('Error! Only JPEG, PNG, GIF, MP4, and MOV files are allowed. Maximum allowed size is 30MB for videos and 2MB for images.');
  }
}

function removeFile(index) {
  uploadedFiles.value.splice(index, 1);
  uploading.value.splice(index, 1);
}

function addFileUploadField() {
  uploadedFiles.value.push(null);
  uploading.value.push(false);
}

</script>

<style scoped>
.upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.file-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #ddd;
  padding: 10px;
}

.file-preview img {
  width: 250px;
  height: 250px;
  object-fit: cover;
}

.file-preview video {
  width: 320px;
  height: 240px;
  object-fit: cover;
}

.upload-controls {
  text-align: center;
  margin-top: 10px;
}
</style>

