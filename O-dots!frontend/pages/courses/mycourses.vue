<template>
  <div>
    <Courseheader />
    <div class="my-courses">
      <!-- User Profile Section -->
      <div class="user-profile">
        <div class="image-preview">
          <img :src="userIcon" @click="openFileDialog" class="mycourseusericon" alt="User Icon" />
          <input type="file" ref="fileInput" @change="onFileChange" style="display:none;">
        </div>
        <p class="user-name">{{ user.name }}</p>
        <p v-if="uploadingUserIcon" class="upload-status">Uploading...</p>
      </div>

      <!-- Tabs Navigation -->
      <div class="tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'created' }]"
          @click="activeTab = 'created'"
        >
          My Created Courses
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'subscribed' }]"
          @click="activeTab = 'subscribed'"
        >
          My Subscriptions
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'wishlist' }]"
          @click="activeTab = 'wishlist'"
        >
          My Wishlist
        </button>
      </div>

      <!-- Created Courses Tab -->
      <div v-if="activeTab === 'created'" class="courses-grid">
        <div v-if="createdCourses.length === 0" class="empty-state">
          <p>You haven't created any courses yet.</p>
          <NuxtLink to="/courses/addcourse" class="create-btn">Create Course</NuxtLink>
        </div>
        <div v-else class="course-cards">
          <div v-for="course in createdCourses" :key="course._id" class="course-card">
            <div class="course-image" :style="{ backgroundImage: `url(${course.photos?.[0] || '/public/picture/inner.png'})` }">
              <div class="course-overlay">
                <NuxtLink :to="`/courses/${course._id}/edit`" class="edit-btn">
                  Edit Course
                </NuxtLink>
                <div class="approval-status" :class="course.is_approved ? 'approved' : 'pending'">
                  {{ course.is_approved ? 'Approved' : course.disapprovalReason ? 'Disapproved' : 'Pending Approval' }}
                </div>
              </div>
            </div>
            <div class="course-info">
              <h3>{{ course.title }}</h3>
              <p v-if="course.disapprovalReason" class="disapproval-reason">
                Reason: {{ course.disapprovalReason }}
              </p>
            </div>
          </div>
          <NuxtLink to="/courses/addcourse" class="create-course-card">
            <div class="create-course-content">
              <span class="plus-icon">+</span>
              <p>Create New Course</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Subscribed Courses Tab -->
      <div v-if="activeTab === 'subscribed'" class="courses-grid">
        <div v-if="paidProducts.length === 0" class="empty-state">
          <p>You haven't subscribed to any courses yet.</p>
          <NuxtLink to="/courses/allcourses" class="browse-btn">Browse Courses</NuxtLink>
        </div>
        <div v-else class="course-cards">
          <div v-for="product in paidProducts" :key="product._id" class="course-card">
            <div class="course-image" :style="{ backgroundImage: `url(${product.course_id?.photos?.[0] || '/public/picture/inner.png'})` }">
              <div class="course-overlay">
                <NuxtLink :to="`/courses/${product.course_id?._id}/watch`" class="watch-btn">
                  Watch Course
                </NuxtLink>
              </div>
            </div>
            <div class="course-info">
              <h3>{{ product.productName }}</h3>
              <p class="purchase-date">Purchased: {{ formatDate(product.createdAt) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Wishlist Tab -->
      <div v-if="activeTab === 'wishlist'" class="courses-grid">
        <div v-if="wishlistedCourses.length === 0" class="empty-state">
          <p>Your wishlist is empty.</p>
          <NuxtLink to="/courses/allcourses" class="browse-btn">Browse Courses</NuxtLink>
        </div>
        <div v-else class="course-cards">
          <div v-for="course in wishlistedCourses" :key="course._id" class="course-card">
            <div class="course-image" :style="{ backgroundImage: `url(${course.photos?.[0] || '/public/picture/inner.png'})` }">
              <div class="course-overlay">
                <button @click="removeFromWishlist(course._id)" class="remove-btn">
                  Remove
                </button>
                <NuxtLink :to="`/courses/${course._id}`" class="view-btn">
                  View Course
                </NuxtLink>
              </div>
            </div>
            <div class="course-info">
              <h3>{{ course.title }}</h3>
              <div class="price">HK$ {{ formatPrice(course.Price) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRuntimeConfig } from '#imports';
import { formatDate, formatPrice } from '@/composables/globalfunction';

const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const user = ref({});
const userIcon = ref('/public/picture/inner.png');
const uploadingUserIcon = ref(false);
const fileInput = ref(null);
const paidProducts = ref([]);
const wishlistedCourses = ref([]);
const createdCourses = ref([]);
const activeTab = ref('created');

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
    // Store user email in localStorage for subscription checks
    localStorage.setItem('userEmail', data.user.email);
  } catch (error) {
    console.error('Error fetching user data:', error);
    router.push('/users/signin');
  }
};

const fetchCreatedCourses = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${runtimeConfig.public.apiBase}courses/my-courses`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch created courses');
    const data = await response.json();
    createdCourses.value = data;
  } catch (error) {
    console.error('Error fetching created courses:', error);
  }
};

const fetchSubscriptions = async () => {
  try {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    
    if (!email) {
      console.error('No user email found');
      return;
    }

    console.log('Fetching subscriptions for email:', email); // Debug log

    const response = await fetch(`${runtimeConfig.public.apiBase}payments/user-coursesubscription?email=${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch subscriptions: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched subscriptions:', data); // Debug log
    paidProducts.value = data;
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
  }
};

const fetchWishlistedCourses = async () => {
  try {
    const wishlist = JSON.parse(localStorage.getItem('courseWishlist') || '[]');
    const courses = [];
    
    for (const courseId of wishlist) {
      const response = await fetch(`${runtimeConfig.public.apiBase}courses/${courseId}`);
      if (response.ok) {
        const course = await response.json();
        courses.push(course);
      }
    }
    
    wishlistedCourses.value = courses;
  } catch (error) {
    console.error('Error fetching wishlisted courses:', error);
  }
};

const removeFromWishlist = (courseId) => {
  const wishlist = JSON.parse(localStorage.getItem('courseWishlist') || '[]');
  const updatedWishlist = wishlist.filter(id => id !== courseId);
  localStorage.setItem('courseWishlist', JSON.stringify(updatedWishlist));
  wishlistedCourses.value = wishlistedCourses.value.filter(course => course._id !== courseId);
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
      if (!response.ok) throw new Error(data.message);
      
      userIcon.value = data.url;
      await updateUserIcon(data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      uploadingUserIcon.value = false;
    }
  }
};

const updateUserIcon = async (icon) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${runtimeConfig.public.apiBase}auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userIcon: icon }),
    });
    if (!response.ok) throw new Error('Failed to update user icon');
  } catch (error) {
    console.error('Error updating user icon:', error);
  }
};

const openFileDialog = () => {
  fileInput.value.click();
};

onMounted(async () => {
  await fetchUserData(); // Fetch user data first to ensure email is stored
  await Promise.all([
    fetchCreatedCourses(),
    fetchSubscriptions(),
    fetchWishlistedCourses()
  ]);
});
</script>

<style scoped>
.my-courses {
  min-height: 100vh;
  background: #000000;
  color: #ffffff;
  padding: 2rem 0;
}

.user-profile {
  text-align: center;
  padding: 2rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mycourseusericon {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: border-color 0.3s;
}

.mycourseusericon:hover {
  border-color: rgba(255, 255, 255, 0.5);
}

.user-name {
  margin-top: 1rem;
  font-size: 1.2rem;
}

.upload-status {
  color: #4CAF50;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.1);
  border-color: #ffffff;
}

.courses-grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
}

.browse-btn, .create-btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  margin-top: 1rem;
  transition: background-color 0.3s;
}

.browse-btn:hover, .create-btn:hover {
  background: #45a049;
}

.course-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.course-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s;
}

.course-card:hover {
  transform: translateY(-4px);
}

.course-image {
  height: 160px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.course-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.course-image:hover .course-overlay {
  opacity: 1;
}

.watch-btn,
.view-btn,
.edit-btn,
.remove-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.3s;
}

.watch-btn,
.view-btn,
.edit-btn {
  background: #4CAF50;
  color: white;
}

.remove-btn {
  background: #ff4444;
  color: white;
  border: none;
  cursor: pointer;
}

.course-info {
  padding: 1rem;
}

.course-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
}

.purchase-date,
.price {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.create-course-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #ffffff;
  transition: all 0.3s;
}

.create-course-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}

.create-course-content {
  text-align: center;
  padding: 2rem;
}

.plus-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.approval-status {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.approval-status.approved {
  background: #4CAF50;
  color: white;
}

.approval-status.pending {
  background: #FFC107;
  color: black;
}

.disapproval-reason {
  font-size: 0.8rem;
  color: #ff4444;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .courses-grid {
    padding: 0 0.5rem;
  }

  .course-cards {
    grid-template-columns: 1fr;
  }

  .tabs {
    flex-direction: column;
    padding: 0 1rem;
  }

  .tab-btn {
    width: 100%;
  }
}
</style>