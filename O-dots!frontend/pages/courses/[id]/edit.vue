<template>
    <div class="course-creation">
      <Cleanheader />
      <div class="main-container">
        <div class="form-wrapper">
          <h1 class="page-title">Edit Course</h1>
          
          <form @submit.prevent="submitCourse" class="course-form" v-if="course">
            <!-- Basic Information Section -->
            <section class="form-section">
              <h2>Basic Information</h2>
              
              <div class="form-group">
                <label>Course Title</label>
                <input type="text" v-model="course.title" required>
              </div>
  
              <div class="form-group">
                <label>Categories</label>
                <select v-model="course.categories" multiple required class="category-select">
                  <option v-for="category in availableCategories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
                <small v-if="!course.categories.length" class="error-text">
                  Please select at least one category
                </small>
              </div>
  
              <div class="form-group">
                <label>Course Description</label>
                <textarea 
                  v-model="course.description" 
                  rows="6" 
                  placeholder="Provide a detailed description of your course..."
                  required
                ></textarea>
              </div>
  
              <div class="form-group">
                <label>What Students Will Learn</label>
                <textarea 
                  v-model="course.learningOutcomes" 
                  rows="4" 
                  placeholder="List the key learning outcomes and skills students will gain..."
                  required
                ></textarea>
              </div>
  
              <div class="form-group">
                <label>Learning Modes</label>
                <div class="learning-modes">
                  <label v-for="mode in learningModes" :key="mode" class="mode-checkbox">
                    <input 
                      type="checkbox" 
                      :value="mode" 
                      v-model="course.learningModes"
                    >
                    <span>{{ mode }}</span>
                  </label>
                </div>
                <small v-if="!course.learningModes.length" class="error-text">
                  Please select at least one learning mode
                </small>
              </div>
  
              <div class="form-group">
                <label>Course Duration (hours)</label>
                <input 
                  type="number" 
                  v-model="course.duration" 
                  min="1" 
                  step="0.5"
                  required
                >
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
  
              <div class="form-group">
                <label>
                  <input type="checkbox" v-model="course.isCrowdfunding">
                  This is a crowdfunding course
                </label>
              </div>
  
              <div v-if="course.isCrowdfunding" class="crowdfunding-section">
                <div class="form-group">
                  <label>Minimum Number of Students</label>
                  <input type="number" v-model="course.crowdfunding.minStudents" min="1" required>
                </div>
  
                <div class="form-group">
                  <label>Expected Start Date</label>
                  <input type="date" v-model="course.crowdfunding.startDate" :min="minDate" required>
                </div>
  
                <div class="form-group">
                  <label>Startup Fee ($)</label>
                  <input type="number" v-model="course.crowdfunding.startupFee" min="0" step="0.01" required>
                </div>
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
                    :src="photoPreview || course.photos?.[0] || '/public/picture/addblack2.png'" 
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
                    v-if="photoPreview || course.photos?.length" 
                    class="remove-btn"
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            </section>
  
            <!-- Submit Section -->
            <section class="form-actions">
              <button type="submit" class="submit-btn" :disabled="!isFormValid">Re-submit Course</button>
              <button type="button" @click="$router.push('/courses/mycourses')" class="cancel-btn">Cancel</button>
            </section>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useRuntimeConfig } from '#imports';
  
  const route = useRoute();
  const router = useRouter();
  const runtimeConfig = useRuntimeConfig();
  
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
  
  const course = ref(null);
  const photoPreview = ref(null);
  const uploading = ref(false);
  const fileInput = ref(null);
  
  const minDate = computed(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  
  const isFormValid = computed(() => {
    if (!course.value) return false;
    return course.value.title &&
           course.value.categories.length > 0 &&
           course.value.description &&
           course.value.learningOutcomes &&
           course.value.duration > 0 &&
           course.value.learningModes.length > 0 &&
           (!course.value.isCrowdfunding || (
             course.value.crowdfunding.minStudents > 0 &&
             course.value.crowdfunding.startDate &&
             course.value.crowdfunding.startupFee >= 0
           ));
  });
  
  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${runtimeConfig.public.apiBase}courses/${route.params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch course');
      const data = await response.json();
      course.value = data;
      
      if (data.photos?.length) {
        photoPreview.value = data.photos[0];
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      alert('Failed to fetch course details');
      router.push('/courses/mycourses');
    }
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
        course.value.photos = [imageUrl];
        photoPreview.value = imageUrl;
      }
      uploading.value = false;
    }
  };
  
  const openFileDialog = () => {
    fileInput.value.click();
  };
  
  const removePhoto = () => {
    course.value.photos = [];
    photoPreview.value = null;
  };
  
  const submitCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to submit the course');
        return;
      }
  
      const courseData = {
        ...course.value,
        resubmitted: true
      };
  
      const response = await fetch(`${runtimeConfig.public.apiBase}courses/${route.params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(courseData)
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update course');
      }
  
      alert('Course re-submitted successfully! It will be reviewed by an administrator.');
      router.push('/courses/mycourses');
    } catch (error) {
      console.error('Error updating course:', error);
      alert(error.message || 'Failed to update course. Please try again.');
    }
  };
  
  onMounted(fetchCourse);
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

.category-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  min-height: 150px;
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
input[type="date"],
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

.crowdfunding-section {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
  background: #f9f9f9;
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

.submit-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
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

.form-group textarea.learning-outcomes {
  min-height: 120px;
  font-size: 0.95rem;
}

.duration-input {
  width: 150px;
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