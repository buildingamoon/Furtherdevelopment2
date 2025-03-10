<template>
    <Courseheader />
    <div class="addchitchatwrapper">
      <div class="left">
        <p>Featured Photo</p>
        <div class="image-preview">
          <img :src="featurePhoto" @click="openFileDialog" width="250" height="250" alt="Feature Photo" style="cursor: pointer;" />
          <input type="file" ref="fileInput" @change="onFileChange" style="display:none;">
        </div>
        <div class="upload-controls">
          <p v-if="uploading">Uploading...</p>
        </div>
      </div>
      <div class="right">
        <form @submit.prevent="createDiscussion" class="rightwrap">
          <input class="chatRoomname" v-model="discussion.roomId" placeholder="Roomname" required />
          <input class="chatTopic" v-model="discussion.topic" placeholder="Topic" required />
          <select v-model="discussion.type" @change="toggleDateInputs" required>
            <option clss="chatdiscussion" value="discussion">Discussion</option>
            <option clss="chatevent" value="event">Event</option>
          </select>
          <emoji-picker @emoji-click="addEmoji"style="opacity:0;height:0;">Emoji</emoji-picker>
          <div v-if="discussion.type === 'event'">
            <input class="chatstartdate" v-model="discussion.startDate" type="date" placeholder="Start Date" />
            <input class="chatenddate" v-model="discussion.endDate" type="date" placeholder="End Date" />
            <input class="chattime" v-model="discussion.startTime" type="time" placeholder="Start Time" />
          </div>
          <textarea v-model="discussion.content" placeholder="type your content here..." required></textarea>
          <button class="confirm" type="submit">PULISH</button>
        </form>
      </div>
    </div>
</template>


<script setup>
import { ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useRuntimeConfig } from '#imports';
import { useSession } from '@/composables/state';
import Swipercarouselsub from '~/components/Swipercarouselsub.vue';


const runtimeConfig = useRuntimeConfig();
const session = useSession();

definePageMeta({
  middleware: ['auth']
});

const discussion = ref({
  roomId: '',
  topic: '',
  content: '',
  type: 'discussion',
  startDate: '',
  endDate: '',
  startTime: '',
});

const router = useRouter();

const featurePhoto = ref('/picture/addblack2.png');
const uploading = ref(false);
const fileInput = ref(null);

const addEmoji = (event) => {
  discussion.value.content += event.detail.unicode; // Append the selected emoji to the content
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

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${runtimeConfig.public.apiBase}discussions/imageupload`, {
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
    return data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

const saveFeaturePhoto = async (photoUrl) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${runtimeConfig.public.apiBase}/discussions/savePhoto`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ photos: photoUrl }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    console.log('Saved feature photo:', photoUrl);
  } catch (error) {
    console.error('Error saving feature photo:', error);
  }
};

const openFileDialog = () => {
  fileInput.value.click();
};

const onFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (validateFile(file)) {
    uploading.value = true;
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      featurePhoto.value = imageUrl;
      await saveFeaturePhoto(imageUrl);
    }
    uploading.value = false;
  }
};

const createDiscussion = async () => {
  try {
    const token = localStorage.getItem('token'); // Get the JWT token from localStorage
    console.log('JWT Token:', token); // Log the token to verify its presence

    if (!token) {
      alert('No token found. Please log in.');
      return;
    }

    const payload = { ...discussion.value, photos: featurePhoto.value }; // Include the feature photo URL

    if (payload.startTime) {
      const [hours, minutes] = payload.startTime.split(':');
      const startDate = new Date(payload.startDate);
      startDate.setHours(hours, minutes, 0, 0);
      payload.startTime = startDate;
      console.log('Converted startTime:', startDate); // Log the converted startTime
    }

    console.log('Payload before submission:', payload); // Log the payload to verify data

    const response = await fetch(runtimeConfig.public.apiBase + 'discussions', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Response Data:', data); // Log the response data for debugging

    if (response.ok) {
      const message = data.type === 'discussion' ? 'Discussion created successfully!' : 'Event created successfully!';
      alert(message); // Display the success message

      // Navigate to the newly created discussion/event page
      await nextTick(); // Ensure DOM is updated before navigation
      router.push(`/discussions/${data._id}`); // Use the correct key for _id
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error creating discussion:', error);
  }
};

</script>

<style>
.addchitchatwrapper {
    width: 100%;
    height: 87vh;
    padding: 0;
    margin: -1px;
    background: rgb(7, 7, 7);
    box-sizing: border-box;
    margin-top: 13vh;
    display: flex;
}
.addchitchatwrapper p{
    color: white;
}
.addchitchatwrapper .left {
  flex: 2;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  height: 100%;
  border: 1px dotted black;
}
.addchitchatwrapper .left img {
  margin-top: 10%;
    width: 50vh;
    height: 32vh;
}
.addchitchatwrapper .right {
  flex: 4;
    justify-content: center;
    text-align: center;
    height: 100%;
    display: flex;
    border: 1px dotted black;
    width: 100%;
    margin: 4vh 15vh;
}
.addchitchatwrapper .right .rightwrap {
  flex: 5;
  flex-direction: column;
  text-align: center;
  height: 100%;
  display: flex;
  border: 1px dotted black;
  width: 80%;
  padding-top: 2%;
  margin-top: 15%;
}
.addchitchatwrapper .right .rightwrap textarea {
  height: 47%;
  background: black;
  color: white;
}
.emoji-picker {
  position: absolute;
  top: 50px;
  right: 0;
  z-index: 1000;
  display: none;
}
.emoji-picker.visible {
  display: block;
}
.image-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 5px;
    margin: 5vh;
}
.upload-controls {
  text-align: center;
  margin-top: 10px;
}
.image-preview2 {
  display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
}
.chatRoomname, .chatTopic, .chatdiscussion,.chatevent{
  background: black;
  color:white;
}
.rightwrap select{
  background: black;
  color: white;
}
.confirm {
        height: 6vh;
        background: #fffde769;
        border: 2px solid black;
        width: 25%;
        align-self: center;
        margin: 1vh;
        font-size: 0.8em;
        border-radius: 5px;
        padding: 1vh;
        color: white;
    }
    .confirm:hover {
        background:white;
        color: black;
    }


@media(max-width:600px){
  .confirm {
        height: 6vh;
        background: #fffde769;
        border: 2px solid black;
        width: 25%;
        align-self: center;
        margin: 1vh;
        font-size: 0.8em;
        border-radius: 5px;
        padding: 1vh;
        color: white;
    }
    .confirm:hover {
        background:white;
        color: black;
    }

    .addchitchatwrapper .left img {
        margin-top: 10%;
        width: 20vh;
        height: 21vh;
        cursor: pointer;
        width: 30vh;
    }

.addchitchatwrapper {
    width: 100%;
    height: 87vh;
    padding: 0;
    margin: 0;
    background: rgb(7, 7, 7);
    box-sizing: border-box;
    margin-top: 13vh;
    display: flex;
    flex-direction: column;
}
.rightwrap select{
  background: black;
  color: white;
}
.addchitchatwrapper .right .rightwrap {
    flex: 5;
    flex-direction: column;
    text-align: center;
    height: 100%;
    display: flex;
    width: 80%;
    padding-top: 2%;
    background: black;
}
.addchitchatwrapper .right {
        flex: 2;
        justify-content: center;
        text-align: center;
        min-height: 60%;
        display: flex;
        /* border: 1px dotted black; */
        width: 86%;
        align-self: center;
        margin-top: -8vh;
        border-radius: 10px;
    }
}

</style>
