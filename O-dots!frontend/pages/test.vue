<template>
  <div class="course-creation">
    <Cleanheader />
    <div class="main-container">
      <div class="form-wrapper">
        <h1 class="page-title">Create New Course</h1>
        
        <form @submit.prevent="submitCourse" class="course-form">
          <!-- Basic Information Section -->
          <section class="form-section">
            <h2>Basic Information </h2>
            
            <div class="form-group">
              <label>Course Title</label>
              <input type="text" v-model="course.title" required>
            </div>

            <div class="form-group">
              <label>Categories</label>
              <div class="categories-checkboxes">
                <label v-for="category in availableCategories" :key="category" class="category-checkbox">
                  <input 
                    type="checkbox" 
                    :value="category"
                    v-model="course.categories"
                    required
                  >
                  <span>{{ category }}</span>
                </label>
              </div>
              <small v-if="!course.categories.length" class="error-text">
                Please select at least one category
              </small>
              <div class="selected-categories">
                <span v-for="(category, index) in course.categories" :key="index" class="category-tag">
                  {{ category }}
                  <button type="button" @click="removeCategory(index)" class="remove-category">&times;</button>
                </span>
              </div>
            </div>

            <div class="form-group">
              <label>Learning Modes</label>
              <div class="learning-modes">
                <label v-for="mode in learningModes" :key="mode" class="mode-checkbox">
                  <input 
                    type="checkbox" 
                    :value="mode" 
                    v-model="course.learningModes"
                    required
                  >
                  <span>{{ mode }}</span>
                </label>
              </div>
              <small v-if="!course.learningModes.length" class="error-text">
                Please select at least one learning mode
              </small>
            </div>

            <div class="form-group">
              <label>Course Price (in $)</label>
              <input type="number" v-model="course.Price" min="0" step="0.01" required>
            </div>

            <div class="form-group">
              <label>Promotion Video URL</label>
              <input type="text" v-model="course.promotionUrl" placeholder="Enter video embed URL">
              <small>Paste the embed URL from YouTube, Vimeo, etc.</small>
            </div>
          </section>

          <!-- Course Description -->
          <section class="form-section">
            <h2>Course Description</h2>
            <div class="form-group">
              <textarea 
                v-model="course.description" 
                rows="6" 
                placeholder="Provide a detailed description of your course..."
                required
              ></textarea>
            </div>
          </section>

          <!-- Course Content -->
          <section class="form-section">
            <h2>Course Content</h2>
            <div class="videos-container">
              <div v-for="(video, index) in course.videos" :key="index" class="video-item">
                <div class="video-header">
                  <h3>Video {{ index + 1 }}</h3>
                  <button type="button" @click="removeVideo(index)" class="remove-btn">Remove</button>
                </div>
                
                <div class="video-form">
                  <input type="text" v-model="video.name" placeholder="Video Title" required>
                  <input type="text" v-model="video.url" placeholder="Video Embed URL" required>
                  <textarea 
                    v-model="video.tutorremarks" 
                    placeholder="Add notes or remarks for this video"
                    rows="3"
                  ></textarea>
                </div>
              </div>
              
              <button type="button" @click="addVideo" class="add-video-btn">
                + Add New Video
              </button>
            </div>
          </section>

          <!-- Course Media -->
          <section class="form-section">
            <h2>Course Thumbnail</h2>
            <div class="media-upload">
              <div class="thumbnail-preview">
                <img 
                  :src="photoPreview || '/public/picture/addblack2.png'" 
                  @click="openFileDialog" 
                  alt="Course Thumbnail"
                >
                <input 
                  type="file" 
                  ref="fileInput" 
                  @change="onFileChange" 
                  accept="image/*" 
                  style="display:none"
                >
              </div>
              <div class="upload-controls">
                <p v-if="uploading">Uploading...</p>
                <button 
                  type="button" 
                  @click="removePhoto" 
                  v-if="photoPreview" 
                  class="remove-btn"
                >
                  Remove Photo
                </button>
              </div>
            </div>
          </section>

          <!-- Submit Section -->
          <section class="form-actions">
            <button type="submit" class="submit-btn">Create Course</button>
            <button type="button" @click="$router.push('/courses')" class="cancel-btn">Cancel</button>
          </section>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useRuntimeConfig } from '#imports';

const availableCategories = [
  'Interior Design',
  'Creative Writing',
  'Marketing',
  'Design',
  'Technology',
  'Business'
];

const learningModes = [
  'Video',
  'Audio/Podcast',
  'Reading materials/article/e-book',
  'Seminar/live streaming/Q&A',
  'Other'
];

const course = ref({
  title: '',
  promotionUrl: '',
  categories: [],
  description: '',
  photos: '',
  Price: null,
  videos: [],
  learningModes: [],
  tutor: ''
});

const photoPreview = ref(null);
const uploading = ref(false);
const fileInput = ref(null);
const router = useRouter();
const runtimeConfig = useRuntimeConfig();

const extractSrc = (embedCode) => {
  if (!embedCode) return '';
  const match = embedCode.match(/src=["'](.*?)["']/);
  return match ? match[1] : embedCode;
};

watch(() => course.value.promotionUrl, (newValue) => {
  if (newValue) {
    course.value.promotionUrl = extractSrc(newValue);
  }
});

watch(() => course.value.videos, (newVideos) => {
  newVideos.forEach(video => {
    if (video.url) {
      video.url = extractSrc(video.url);
    }
  });
}, { deep: true });

const removeCategory = (index) => {
  course.value.categories.splice(index, 1);
};

const addVideo = () => {
  course.value.videos.push({
    name: '',
    url: '',
    tutorremarks: ''
  });
};

const removeVideo = (index) => {
  course.value.videos.splice(index, 1);
};

const validateFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!allowedTypes.includes(file.type)) {
    alert('Please upload only JPEG, PNG, or GIF images');
    return false;
  }

  if (file.size > maxSize) {
    alert('File size must be less than 2MB');
    return false;
  }

  return true;
};

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${runtimeConfig.public.apiBase}courses/imageupload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
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
      course.value.photos = imageUrl;
      photoPreview.value = imageUrl;
    }
    uploading.value = false;
  }
};

const openFileDialog = () => {
  fileInput.value.click();
};

const removePhoto = () => {
  course.value.photos = '';
  photoPreview.value = null;
};

const submitCourse = async () => {
  try {
    if (!course.value.learningModes.length) {
      alert('Please select at least one learning mode');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to create a course');
      return;
    }

    course.value.videos.forEach(video => {
      if (video.url) {
        video.url = extractSrc(video.url);
      }
    });

    if (course.value.promotionUrl) {
      course.value.promotionUrl = extractSrc(course.value.promotionUrl);
    }

    const response = await fetch(`${runtimeConfig.public.apiBase}courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(course.value)
    });

    const data = await response.json();
    if (response.ok) {
      alert('Course created successfully!');
      await nextTick();
      router.push(`/courses/${data._id}`);
    } else {
      alert(data.message || 'Failed to create course');
    }
  } catch (error) {
    console.error('Error creating course:', error);
    alert('An error occurred while creating the course');
  }
};
</script>

<style scoped>
.course-creation {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 2rem 0;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.form-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.page-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
}

.form-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 4px;
}

.form-section h2 {
  font-size: 1.5rem;
  color: #444;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.learning-modes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.mode-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.mode-checkbox input[type="checkbox"] {
  width: 1.2rem;
  height: 1.2rem;
}

.error-text {
  color: #ff4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

input[type="text"],
input[type="number"],
textarea,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #666;
  outline: none;
}

.categories-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.category-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.category-checkbox:hover {
  background-color: #f5f5f5;
}

.category-checkbox input[type="checkbox"] {
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
}

.category-checkbox span {
  font-size: 1rem;
  color: #444;
}

.selected-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.category-tag {
  background: #f0f0f0;
  padding: 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-category {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0;
  font-size: 1.2rem;
}

.videos-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.video-item {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 1rem;
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.video-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.add-video-btn {
  padding: 1rem;
  background: #f5f5f5;
  border: 2px dashed #ddd;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.add-video-btn:hover {
  background: #eee;
  border-color: #ccc;
}

.media-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.thumbnail-preview {
  width: 200px;
  height: 200px;
  border: 2px dashed #ddd;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.thumbnail-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.submit-btn,
.cancel-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn {
  background: #4CAF50;
  color: white;
  border: none;
}

.submit-btn:hover {
  background: #45a049;
}

.cancel-btn {
  background: white;
  color: #666;
  border: 1px solid #ddd;
}

.cancel-btn:hover {
  background: #f5f5f5;
}

.remove-btn {
  padding: 0.5rem 1rem;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.remove-btn:hover {
  background: #ff0000;
}

@media (max-width: 768px) {
  .main-container {
    padding: 0 0.5rem;
  }

  .form-wrapper {
    padding: 1rem;
  }

  .form-section {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .submit-btn,
  .cancel-btn {
    width: 100%;
  }
}
</style>