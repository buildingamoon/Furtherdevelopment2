<template>
  <courseheader/>
  <div>
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading course content...</p>
    </div>

    <div v-else-if="!hasAccess" class="access-denied">
      <h2>Access Denied</h2>
      <p>You need to purchase this course to access its content.</p>
      <NuxtLink :to="`/courses/${$route.params.id}`" class="back-btn">
        Back to Course Details
      </NuxtLink>
    </div>

    <div v-else-if="course" class="course-container">
      <!-- Side Menu Toggle -->
      <button 
        class="menu-toggle" 
        :class="{ 'active': !isMenuHidden }" 
        @click="toggleMenu"
        :style="{ left: isMenuHidden ? '20px' : '320px' }"
      >
        <span class="menu-icon"></span>
      </button>

      <!-- Left Sidebar -->
      <div 
        ref="menu" 
        class="sidebar" 
        :class="{ 'hidden': isMenuHidden }"
        :style="{ transform: `translateX(${isMenuHidden ? '-100%' : '0'})` }"
      >
        <div class="course-nav">
          <div class="course-header">
            <h2 class="course-title">{{ course.title }}</h2>
          </div>
          
          <div class="video-list">
            <h3>Course Content</h3>
            <div class="progress-bar">
              <div class="progress" :style="{ width: `${progress}%` }"></div>
              <span class="progress-text">{{ progress }}% Complete</span>
            </div>

            <!-- Modules Accordion -->
            <div class="modules-list">
              <div v-for="(module, moduleIndex) in organizedVideos" :key="moduleIndex" class="module">
                <div 
                  class="module-header" 
                  @click="toggleModule(moduleIndex)"
                  :class="{ 'active': expandedModules[moduleIndex] }"
                >
                  <span class="module-title">Module {{ moduleIndex + 1 }}: {{ module.title }}</span>
                  <span class="module-progress">{{ getModuleProgress(module.videos) }}%</span>
                  <span class="module-toggle">{{ expandedModules[moduleIndex] ? '−' : '+' }}</span>
                </div>
                
                <transition name="slide">
                  <div v-show="expandedModules[moduleIndex]" class="module-content">
                    <ul class="ulwrap">
                      <li 
                        v-for="(video, videoIndex) in module.videos" 
                        :key="video.url"
                        :class="{ 
                          'active': currentVideo.url === video.url, 
                          'completed': completedVideos.includes(video.url) 
                        }"
                        @click="updateVideo(video, getGlobalVideoIndex(moduleIndex, videoIndex))"
                      >
                        <div class="video-item">
                          <div class="video-info">
                            <span class="video-number">{{ getGlobalVideoIndex(moduleIndex, videoIndex) + 1 }}</span>
                            <span class="video-name">{{ video.name }}</span>
                          </div>
                          <div class="video-status">
                            <span v-if="completedVideos.includes(video.url)" class="completed-icon">✓</span>
                            <span v-else class="duration">{{ video.duration || '00:00' }}</span>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content" :class="{ 'expanded': isMenuHidden }">
        <div class="video-container">
          <div class="video-wrapper" v-if="currentVideo.url">
            <iframe 
              :src="currentVideo.url" 
              frameborder="0" 
              allowfullscreen
              @load="handleVideoLoad"
            ></iframe>
          </div>
          <div class="video-controls">
            <button 
              class="prev-video" 
              @click="playPreviousVideo" 
              :disabled="currentVideoIndex === 0"
            >
              Previous
            </button>
            <button 
              class="next-video" 
              @click="playNextVideo" 
              :disabled="currentVideoIndex === getTotalVideos() - 1"
            >
              Next
            </button>
          </div>
          <h3 class="current-video-title">{{ currentVideo.name }}</h3>
        </div>

        <div class="content-tabs">
          <div class="tab-buttons">
            <button 
              v-for="tab in ['Notes', 'Tutor Remarks']" 
              :key="tab"
              :class="{ active: activeTab === tab }"
              @click="activeTab = tab"
            >
              {{ tab }}
            </button>
          </div>
          
          <div class="tab-content">
            <div v-if="activeTab === 'Notes'" class="notes-section">
              <div class="notes-toolbar">
                <button @click="saveNotes" :disabled="!hasUnsavedChanges">
                  {{ hasUnsavedChanges ? 'Save Changes' : 'Saved' }}
                </button>
                <span v-if="lastSaved" class="last-saved">
                  Last saved: {{ formatLastSaved }}
                </span>
              </div>
              <textarea 
                v-model="notes[currentVideo.url]" 
                placeholder="Take notes for this lesson..."
                @input="handleNotesChange"
                ref="notesTextarea"
              ></textarea>
            </div>
            <div v-else class="tutor-remarks">
              {{ currentVideo.tutorremarks }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error-state">
      <h2>Course not found</h2>
      <p>We couldn't find the course you're looking for. Please check the URL or try again later.</p>
      <button @click="$router.push('/courses')">Browse Courses</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRuntimeConfig } from '#imports';
import { format } from 'date-fns';
import gsap from 'gsap';

definePageMeta({
  middleware: ['auth']
});

const route = useRoute();
const router = useRouter();
const runtimeConfig = useRuntimeConfig();

const course = ref(null);
const currentVideo = ref({});
const currentVideoIndex = ref(0);
const loading = ref(true);
const isMenuHidden = ref(true);
const menu = ref(null);
const activeTab = ref('Notes');
const notes = ref({});
const completedVideos = ref([]);
const expandedModules = ref({});
const hasUnsavedChanges = ref(false);
const lastSaved = ref(null);
const notesTextarea = ref(null);
const autoSaveInterval = ref(null);
const hasAccess = ref(false);

// Check if user has access to the course
const checkCourseAccess = async () => {
  try {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    
    if (!token || !email) {
      hasAccess.value = false;
      return;
    }

    const response = await fetch(`${runtimeConfig.public.apiBase}payments/user-coursesubscription?email=${email}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch subscriptions');
    
    const subscriptions = await response.json();
    hasAccess.value = subscriptions.some(sub => 
      sub.course_id?._id === route.params.id && 
      sub.status === 'success'
    );

  } catch (error) {
    console.error('Error checking course access:', error);
    hasAccess.value = false;
  }
};

// Organize videos into modules (4 videos per module)
const organizedVideos = computed(() => {
  if (!course.value?.videos) return [];
  
  const modules = [];
  const videosPerModule = 4;
  
  for (let i = 0; i < course.value.videos.length; i += videosPerModule) {
    modules.push({
      title: `${course.value.videos[i].name.split(' ')[0]}`,
      videos: course.value.videos.slice(i, i + videosPerModule)
    });
  }
  
  return modules;
});

const formatLastSaved = computed(() => {
  if (!lastSaved.value) return '';
  return format(lastSaved.value, 'MMM d, yyyy HH:mm:ss');
});

// Progress calculations
const progress = computed(() => {
  if (!course.value?.videos?.length) return 0;
  return Math.round((completedVideos.value.length / course.value.videos.length) * 100);
});

const getModuleProgress = (moduleVideos) => {
  const completed = moduleVideos.filter(video => completedVideos.value.includes(video.url)).length;
  return Math.round((completed / moduleVideos.length) * 100);
};

const getTotalVideos = () => {
  return course.value?.videos?.length || 0;
};

const getGlobalVideoIndex = (moduleIndex, videoIndex) => {
  const videosPerModule = 4;
  return moduleIndex * videosPerModule + videoIndex;
};

const toggleModule = (moduleIndex) => {
  expandedModules.value[moduleIndex] = !expandedModules.value[moduleIndex];
};

const handleNotesChange = () => {
  hasUnsavedChanges.value = true;
};

const saveNotes = async () => {
  try {
    const userId = localStorage.getItem('userId');
    const courseId = course.value._id;
    
    localStorage.setItem(
      `notes_${userId}_${courseId}`,
      JSON.stringify({
        notes: notes.value,
        lastSaved: new Date()
      })
    );
    
    hasUnsavedChanges.value = false;
    lastSaved.value = new Date();
  } catch (error) {
    console.error('Error saving notes:', error);
  }
};

// Auto-save notes every 30 seconds if there are changes
const startAutoSave = () => {
  autoSaveInterval.value = setInterval(() => {
    if (hasUnsavedChanges.value) {
      saveNotes();
    }
  }, 30000);
};

const stopAutoSave = () => {
  if (autoSaveInterval.value) {
    clearInterval(autoSaveInterval.value);
  }
};

const loadSavedData = () => {
  const userId = localStorage.getItem('userId');
  const courseId = course.value._id;
  
  // Load notes
  const savedNotesData = localStorage.getItem(`notes_${userId}_${courseId}`);
  if (savedNotesData) {
    const { notes: savedNotes, lastSaved: savedTimestamp } = JSON.parse(savedNotesData);
    notes.value = savedNotes;
    lastSaved.value = new Date(savedTimestamp);
  }
  
  // Load progress
  const savedProgress = localStorage.getItem(`progress_${userId}_${courseId}`);
  if (savedProgress) {
    completedVideos.value = JSON.parse(savedProgress);
  }
};

const updateVideo = (video, index) => {
  currentVideo.value = video;
  currentVideoIndex.value = index;
  
  // Save current progress
  if (!completedVideos.value.includes(video.url)) {
    completedVideos.value.push(video.url);
    const userId = localStorage.getItem('userId');
    localStorage.setItem(
      `progress_${userId}_${course.value._id}`,
      JSON.stringify(completedVideos.value)
    );
  }
  
  if (window.innerWidth <= 768) {
    isMenuHidden.value = true;
  }
  
  // Focus notes textarea when switching videos
  if (activeTab.value === 'Notes') {
    nextTick(() => {
      notesTextarea.value?.focus();
    });
  }
};

const handleVideoLoad = () => {
  if (!completedVideos.value.includes(currentVideo.value.url)) {
    completedVideos.value.push(currentVideo.value.url);
    const userId = localStorage.getItem('userId');
    localStorage.setItem(
      `progress_${userId}_${course.value._id}`,
      JSON.stringify(completedVideos.value)
    );
  }
};

const playNextVideo = () => {
  const totalVideos = getTotalVideos();
  if (currentVideoIndex.value < totalVideos - 1) {
    const nextIndex = currentVideoIndex.value + 1;
    const moduleIndex = Math.floor(nextIndex / 4);
    const videoIndex = nextIndex % 4;
    expandedModules.value[moduleIndex] = true;
    updateVideo(course.value.videos[nextIndex], nextIndex);
  }
};

const playPreviousVideo = () => {
  if (currentVideoIndex.value > 0) {
    const prevIndex = currentVideoIndex.value - 1;
    const moduleIndex = Math.floor(prevIndex / 4);
    const videoIndex = prevIndex % 4;
    expandedModules.value[moduleIndex] = true;
    updateVideo(course.value.videos[prevIndex], prevIndex);
  }
};

const toggleMenu = () => {
  isMenuHidden.value = !isMenuHidden.value;
  
  gsap.to(menu.value, {
    x: isMenuHidden.value ? '-100%' : '0',
    duration: 0.5,
    ease: 'power2.inOut'
  });

  gsap.to('.main-content', {
    marginLeft: isMenuHidden.value ? '0' : '300px',
    duration: 0.5,
    ease: 'power2.inOut'
  });

  gsap.to('.menu-toggle', {
    left: isMenuHidden.value ? '20px' : '320px',
    duration: 0.5,
    ease: 'power2.inOut'
  });
};

// Save notes before leaving the page
onBeforeUnmount(() => {
  if (hasUnsavedChanges.value) {
    saveNotes();
  }
  stopAutoSave();
});

onMounted(async () => {
  try {
    await checkCourseAccess();
    
    if (!hasAccess.value) {
      loading.value = false;
      return;
    }

    const courseId = route.params.id;
    const response = await fetch(`${runtimeConfig.public.apiBase}courses/${courseId}`);
    
    if (!response.ok) throw new Error('Failed to fetch course');
    
    const data = await response.json();
    course.value = data;
    
    if (course.value.videos?.length > 0) {
      currentVideo.value = course.value.videos[0];
      // Expand first module by default
      expandedModules.value[0] = true;
    }

    loadSavedData();
    startAutoSave();
  } catch (error) {
    console.error('Error fetching course:', error);
  } finally {
    loading.value = false;
  }

  if (window.innerWidth <= 768) {
    isMenuHidden.value = true;
  }
});

// Watch for changes in current video to update expanded modules
watch(currentVideo, (newVideo) => {
  if (newVideo) {
    const moduleIndex = Math.floor(currentVideoIndex.value / 4);
    expandedModules.value[moduleIndex] = true;
  }
});
</script>

<style scoped>
.ulwrap{
        flex-direction: column;
}
.course-watch {
  min-height: 100vh;
  background: #1a1a1a;
  color: #fff;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

.course-container{
  background: black;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.menu-toggle {
  position: fixed;
  top: 20px;
  z-index: 100;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  transition: all 0.3s ease;
}

.menu-icon {
  display: block;
  width: 25px;
  height: 3px;
  background: #fff;
  position: relative;
  transition: all 0.3s ease;
}

.menu-icon::before,
.menu-icon::after {
  content: '';
  position: absolute;
  width: 25px;
  height: 3px;
  background: #fff;
  transition: all 0.3s ease;
}

.menu-icon::before { top: -8px; }
.menu-icon::after { bottom: -8px; }

.menu-toggle.active .menu-icon {
  transform: rotate(45deg);
}

.menu-toggle.active .menu-icon::before {
  top: 0;
  transform: rotate(0);
}

.menu-toggle.active .menu-icon::after {
  bottom: 0;
  transform: rotate(-90deg);
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 300px;
  height: 100vh;
  background: #222;
  transition: transform 0.5s ease;
  z-index: 50;
  overflow-y: auto;
}

.course-nav {
  padding: 20px;
}

.course-header {
  margin-bottom: 20px;
}

.course-title {
  font-size: 1.5rem;
  margin: 10px 0;
}

.progress-bar {
  height: 4px;
  background: #333;
  margin: 20px 0;
  border-radius: 2px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #4CAF50;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: #888;
}

.module {
  margin-bottom: 10px;
  border: 1px solid #333;
  border-radius: 8px;
  overflow: hidden;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #2a2a2a;
  cursor: pointer;
  transition: background 0.2s;
}

.module-header:hover {
  background: #333;
}

.module-header.active {
  background: #333;
  border-bottom: 1px solid #444;
}

.module-title {
  font-weight: 500;
  flex: 1;
}

.module-progress {
  margin-right: 10px;
  font-size: 14px;
  color: #888;
}

.module-toggle {
  font-size: 20px;
  width: 20px;
  text-align: center;
  color: #888;
}

.module-content {
  background: #1a1a1a;
}

.video-item {
  padding: 12px 15px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.video-item.active {
  background: rgba(255, 255, 255, 0.1);
}

.video-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.video-number {
  width: 24px;
  height: 24px;
  background: #333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.video-name {
  font-size: 14px;
}

.video-status {
  font-size: 12px;
  color: #888;
}

.completed-icon {
  color: #4CAF50;
}

.main-content {
  margin-left: 0;
  padding: 20px;
  transition: margin-left 0.5s ease;
}

.main-content.expanded {
  margin-left: 300px;
}

.video-container {
  max-width: 1200px;
  margin: 0 auto;
}

.video-wrapper {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: 8px;
}

.video-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-controls {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.video-controls button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background: #333;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}

.video-controls button:hover:not(:disabled) {
  background: #444;
}

.video-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.current-video-title {
  font-size: 1.5rem;
  margin: 20px 0;
}

.content-tabs {
  margin-top: 30px;
  background: #222;
  border-radius: 8px;
  overflow: hidden;
}

.tab-buttons {
  display: flex;
  background: #2a2a2a;
}

.tab-buttons button {
  padding: 15px 30px;
  border: none;
  background: none;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}

.tab-buttons button.active {
  background: #333;
}

.tab-content {
  padding: 20px;
}

.notes-section textarea {
  width: 100%;
  min-height: 200px;
  padding: 15px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
}

.notes-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.notes-toolbar button {
  padding: 8px 16px;
  background: #333;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.notes-toolbar button:hover:not(:disabled) {
  background: #444;
}

.notes-toolbar button:disabled {
  background: #2a2a2a;
  color: #666;
  cursor: not-allowed;
}

.last-saved {
  font-size: 12px;
  color: #666;
}

.tutor-remarks {
  font-size: 14px;
  line-height: 1.6;
  color: #ccc;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.access-denied {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #1a1a1a;
  color: white;
  padding: 2rem;
}

.access-denied h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.access-denied p {
  margin-bottom: 2rem;
  color: #888;
}

.back-btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background: #45a049;
}

.error-state {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #1a1a1a;
  color: white;
  padding: 2rem;
}

.error-state h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error-state p {
  margin-bottom: 2rem;
  color: #888;
}

.error-state button {
  padding: 0.75rem 1.5rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.error-state button:hover {
  background: #45a049;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
  }

  .main-content.expanded {
    margin-left: 0;
  }

  .module-header {
    padding: 12px;
  }

  .module-title {
    font-size: 14px;
  }

  .video-item {
    padding: 10px;
  }

  .notes-toolbar {
    flex-direction: column;
    gap: 10px;
  }

  .last-saved {
    text-align: center;
  }

  .tab-buttons button {
    padding: 10px 15px;
    font-size: 14px;
  }
}
</style>