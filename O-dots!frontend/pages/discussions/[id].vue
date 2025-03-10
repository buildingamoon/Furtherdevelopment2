<template>
  <div>
    <Chitchatbackheader />
    <div id="classChitchat">
      <div class="chitchatwrapper">
        <!-- Left Section -->
        <div class="bigwrap">
          <div class="chitchatcol left" v-for="discussion in discussions" :key="discussion._id">
            <img :src="discussion.host?.userIcon" alt="Host Image" v-if="discussion.host?.userIcon" />
            <p>{{ discussion.host?.name }}</p>
          </div>

          <!-- Middle Section -->
          <div class="chitchatcol middle" v-for="discussion in discussions" :key="discussion._id">
            <div class="chitchatmediawrapper">
              <div class="overlay">
                <div class="overlaytextwrapper">
                  <p class="title">{{ discussion.topic }}</p>
                  <p class="content">{{ discussion.content }}</p>
                </div>
              </div>
            </div>
          </div>
      </div>


        <!-- Right Section -->
        <div class="chitchatcol right">
          <div class="upper" ref="messageContainer">
            <div class="box">
              <ul>
                <li v-for="(messages, date) in groupedMessages" :key="date">
                  <div class="date-separator">{{ date }}</div>
                  <ul>
                    <li v-for="message in messages" :key="message._id" :class="{'right-align': message.sender._id === user._id, 'left-align': message.sender._id !== user._id}">
                      <p class="message-info">
                        <strong class="message-sender">{{ message.senderShow }}</strong>
                        <span class="message-timestamp">{{ formatTime(message.timestamp) }}</span>:
                      </p>
                      <span>{{ message.text }}</span>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
          <div class="lower">
            <div class="userdetails">
              <div :style="{ backgroundImage: `url(${user.userIcon})`, backgroundSize: 'cover', backgroundPosition: 'center' }" class="msguserIcon"></div>
              <div v-if="user && user.name">
                <p class="msgusername">{{ user.name }} </p>
              </div>
              <div v-else>
                <p>User data not available</p>
              </div>
            </div> 
            <textarea v-model="newMessage" class="sent-message" id="comment" placeholder="Type your message..."></textarea>
            <div class="emoji-container">
              <button class="lowerbtn" @click="sendMessage"><img src="/public/picture/circleright.png"></button>
              <button @click="toggleEmojiPicker" class="emoji-toggle">😀</button>
              <div v-if="emojiPickerVisible">
                <emoji-picker @select="addEmoji" class="emoji-picker" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed, nextTick } from 'vue';
import { useRuntimeConfig } from '#imports';
import { useRouter, useRoute } from 'vue-router';
import { io } from 'socket.io-client';
import EmojiPicker from 'vue3-emoji-picker';
import { useSession } from '@/composables/state';

const user = reactive({});
const userIcon = ref('');
const newMessage = ref('');
const emojiPickerVisible = ref(false);
const discussions = ref([]);
const messages = ref([]);
const messageContainer = ref(null);

const runtimeConfig = useRuntimeConfig();
const route = useRoute();
const router = useRouter();
const socket = io('https://backend.o-dots.com');


const discussionId = route.params.id;

const fetchUserData = async () => {
  try {
    const session = useSession();
    if (!session.value || !session.value.data) {
      throw new Error('No session data available');
    }
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token available');
    }
    const response = await fetch(`${runtimeConfig.public.apiBase}users?email=${session.value.data.user.email}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    const data = await response.json();
    Object.assign(user, data);
    if (data.userIcon) {
      userIcon.value = data.userIcon;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    router.push('/users/signin');
  }
};

const fetchDiscussions = async () => {
  try {
    const response = await fetch(`${runtimeConfig.public.apiBase}discussions/${discussionId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    const data = await response.json();
    discussions.value = [data];
  } catch (error) {
    console.error('Error fetching discussions:', error);
  }
};

const fetchMessages = async () => {
  if (!discussionId || discussionId === "undefined") {
    console.error('Discussion ID is undefined or invalid');
    return;
  }
  try {
    const response = await fetch(`${runtimeConfig.public.apiBase}messages/discussion/${discussionId}`);
    if (response.status === 404) {
      console.log('No messages found for this discussion');
      return;
    }
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    const data = await response.json();

    // Clear existing messages to avoid duplication
    messages.value = [];
    messages.value = data;
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
};


const groupedMessages = computed(() => {
  const groups = {};
  messages.value.forEach((message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
  });
  return groups;
});

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString();
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

const addEmoji = (emoji) => {
  if (emoji && (emoji.native || emoji.i)) {
    const emojiChar = emoji.native || emoji.i;
    newMessage.value += emojiChar;
  } else {
    console.error('Invalid emoji object:', emoji);
  }
  emojiPickerVisible.value = false;
};

const toggleEmojiPicker = () => {
  emojiPickerVisible.value = !emojiPickerVisible.value;
  console.log("Emoji Picker Visible: ", emojiPickerVisible.value);
};

onMounted(async () => {
  try {
    await fetchDiscussions();
    await fetchMessages();

    const session = useSession();
    if (session.value && session.value.data) {
      await fetchUserData(session.value.data.user.email);
    } else {
      router.push('/users/signin');
    }

    socket.emit('joinRoom', discussionId);
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });

    socket.on('message', (message) => {
      console.log('Received message:', message);
      if (message.discussionId === discussionId) {
        if (!messages.value.some(msg => msg._id === message._id)) {
          messages.value.push(message);
          nextTick(() => {
            messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
          });
        }
      }
    });

    socket.on('allMessages', (allMessages) => {
      console.log('Received allMessages:', allMessages);
      // Clear existing messages to avoid duplication
      messages.value = [];
      messages.value = allMessages;
      nextTick(() => {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
      });
    });
  } catch (error) {
    console.error('Error in mounted hook:', error);
  }
});



const sendMessage = () => {
  if (newMessage.value.trim() !== '') {
    const messageData = {
      text: newMessage.value,
      sender: user._id,
      senderShow: user.name,
      discussionId,
      timestamp: new Date()
    };
    // Emit the message through socket.io
    socket.emit('sendMessage', messageData);
    console.log('Sent message through socket:', messageData);

    // Clear the message input
    newMessage.value = '';
  }
};


</script>



<style scoped>
.hidden {
  display: none;
}

.emoji-container {
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: row;
  width: 95%;
  justify-content: space-between;
}

.emoji-toggle {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  margin-left: 0.5em;
}

.emoji-picker {
  position: absolute;
  top: -419px;
  right: 364px;
  z-index: 2000; /* Adjust the z-index */
}



.sent-message {
  height: 3vh;
  border-radius: 1em;
  font-size: 1.5em;
  text-align: left;
  padding: 3vh;
  box-sizing: border-box;
}

.upper {
  overflow-y: auto;
  width: auto;
  height: 3vh;
}

.upper li {
  padding: 1vh;
  font-weight: 300;
  display: flex;
  flex-direction: column;

  margin: 0.5vh;
  width: auto;
  min-height: 5vh;
  border-radius: 1em;
}

.right-align {
  justify-content: flex-end; /* Align to right */
  align-self: flex-end; /* Align to right */
  background: black;
  width: 100%;
}

.left-align {
  justify-content: flex-start; /* Align to left */
}

.message-info {
  font-size: 0.8em;
  text-align: right;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.message-sender {
  font-weight: bold;
  color: red;
  font-size: 0.9em;
}

.message-timestamp {
  font-size: 0.7em;
  margin-left: 0.5em;
  font-style: italic; /* Optional styling */
}

.date-separator {
  width: 30%;
  align-self: center;
  font-size: 1em;
  font-weight: bold;
  margin: 1vh 0;
  text-align: center;
  background: #f0f0f0;
  padding: 0.5em;
  border-radius: 1em;
}

.lower .lowerbtn {
  background-color: black;
  color: white;
  width: 25%;
  align-self: center;
  border: 1px solid white;
  height: 90%;
}
.msgusername{
  color: white;
  background-color: #000000e6;
  padding: 1em;
  border-radius: 1em;
  margin-right: 5vh;
}
.msguserIcon{

  height: 4em;
  border-radius: 17%;
  padding-right: 10vh;
}
.lowerbtn img{
  height:5vh;
}
.bigwrap{
    display: flex;
    flex-direction: row;
    flex:4;

}

@media (max-width: 600px) {
.app {
    overflow: hidden; /* Hide scrollbars */
}
.bigwrap{
    display: flex;
    flex-direction: row;
    flex:1.5;

}
.chitchatwrapper .right .lower{
  flex-direction: row;
  margin-left: 2vh;
}
.lowerbtn img{
  height:8vh;
}
.emoji-container{
  width:10px;
  height:auto;
}
.lower .lowerbtn{
  border:none;
}
.emoji-toggle{
  opacity: 0;
  width:0;
  height: 0;
}
.chitchatwrapper{
    flex-direction: column;
}
.chitchatwrapper .left{
    flex-direction: column;
    flex:1;
}
.chitchatcol.left img{
    width: 8vh;
    height: 8vh;
    margin-bottom: 1vh;
    margin: 1vh;
}
.chitchatcol.middle{
    flex:3;
    background: white;
}
.overlaytextwrapper .title{
    font-size: 1em;
}
.overlaytextwrapper .content{
    font-size: 0.8em;
}
.chitchatcol.right .date-separator{
    background:rgba(0, 0, 0, 0.622);
    color:white;
    font-size: 0.65em;
    width:auto;
}
.chitchatcol.right .lower textarea::placeholder {
    font-size: 0.8em; /* Adjust the font size as needed */
    color: #999; /* Optional: Adjust the color of the placeholder text */
}
.msgusername{
  margin-right: 0vh;
  opacity: 0;
  width: 0;
}
.sent-message{
 font-size: 0.8em;
}

}

</style>
