<template>
    <div class="admin-courses">
      <Cleanheader />
      <div class="main-container">
        <h1 class="page-title">Course Approval Dashboard</h1>
        
        <div class="courses-list">
          <div v-for="course in pendingCourses" :key="course._id" class="course-card">
            <div class="course-header">
              <h2>{{ course.title }}</h2>
              <div class="status-badges">
                <span :class="['status', getStatusClass(course)]">
                  {{ course.resubmitted ? 'Resubmitted' : 'Pending Approval' }}
                </span>
              </div>
            </div>
            
            <div class="course-details">
              <div class="tutor-info">
                <img :src="course.tutor?.userIcon || '/public/picture/inner.png'" alt="Tutor" class="tutor-avatar">
                <div class="tutor-details">
                  <p class="tutor-name">{{ course.tutor?.name }}</p>
                  <p class="tutor-email">{{ course.tutor?.email }}</p>
                </div>
              </div>
              
              <div class="course-meta">
                <p><strong>Categories:</strong> {{ course.categories.join(', ') }}</p>
                <p><strong>Price:</strong> ${{ formatPrice(course.Price) }}</p>
                <p><strong>Learning Modes:</strong> {{ course.learningModes.join(', ') }}</p>
              </div>
              
              <div class="course-description">
                <p><strong>Description:</strong></p>
                <p>{{ course.description }}</p>
              </div>
  
              <div v-if="course.isCrowdfunding" class="crowdfunding-details">
                <p><strong>Crowdfunding Details:</strong></p>
                <p>
                  Minimum Students: {{ course.crowdfunding.minStudents }}<br>
                  Start Date: {{ formatDate(course.crowdfunding.startDate) }}<br>
                  Startup Fee: ${{ formatPrice(course.crowdfunding.startupFee) }}
                </p>
              </div>
  
              <!-- Featured Course Toggle -->
              <div class="featured-toggle">
                <label class="featured-label">
                  <input 
                    type="checkbox" 
                    v-model="course.is_featured"
                    @change="updateFeaturedStatus(course._id, course.is_featured)"
                  >
                  <span class="featured-text">Featured Course</span>
                  <span class="featured-description">
                    Featured courses will be prominently displayed on the homepage
                  </span>
                </label>
              </div>
            </div>
            
            <div class="approval-actions">
              <button @click="approveCourse(course._id)" class="approve-btn">
                Approve Course
              </button>
              
              <div class="disapproval-section">
                <textarea 
                  v-model="disapprovalReasons[course._id]" 
                  placeholder="Enter reason for disapproval..."
                  class="disapproval-reason"
                ></textarea>
                <button 
                  @click="disapproveCourse(course._id)" 
                  class="disapprove-btn"
                  :disabled="!disapprovalReasons[course._id]"
                >
                  Disapprove Course
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useRuntimeConfig } from '#imports';
  import { formatPrice } from '@/composables/globalfunction';
  
  definePageMeta({
    middleware: ['auth', 'adm']
  });
  
  const router = useRouter();
  const runtimeConfig = useRuntimeConfig();
  const pendingCourses = ref([]);
  const disapprovalReasons = ref({});
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };
  
  const fetchPendingCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${runtimeConfig.public.apiBase}pending-courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      pendingCourses.value = data;
    } catch (error) {
      console.error('Error fetching pending courses:', error);
      alert('Failed to fetch pending courses');
    }
  };
  
  const updateFeaturedStatus = async (courseId, isFeatured) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${runtimeConfig.public.apiBase}courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_featured: isFeatured
        })
      });
  
      if (!response.ok) throw new Error('Failed to update featured status');
      alert(isFeatured ? 'Course set as featured' : 'Course removed from featured');
    } catch (error) {
      console.error('Error updating featured status:', error);
      alert('Failed to update featured status');
    }
  };
  
  const approveCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${runtimeConfig.public.apiBase}courses/${courseId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) throw new Error('Failed to approve course');
      await fetchPendingCourses();
      alert('Course approved successfully');
    } catch (error) {
      console.error('Error approving course:', error);
      alert('Failed to approve course');
    }
  };
  
  const disapproveCourse = async (courseId) => {
    try {
      if (!disapprovalReasons.value[courseId]) {
        alert('Please provide a reason for disapproval');
        return;
      }
  
      const token = localStorage.getItem('token');
      const response = await fetch(`${runtimeConfig.public.apiBase}courses/${courseId}/disapprove`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: disapprovalReasons.value[courseId]
        })
      });
  
      if (!response.ok) throw new Error('Failed to disapprove course');
      await fetchPendingCourses();
      disapprovalReasons.value[courseId] = '';
      alert('Course disapproved successfully');
    } catch (error) {
      console.error('Error disapproving course:', error);
      alert('Failed to disapprove course');
    }
  };
  
  const getStatusClass = (course) => {
    if (course.resubmitted) return 'status-resubmitted';
    return 'status-pending';
  };
  
  onMounted(fetchPendingCourses);
  </script>
  
  <style scoped>
  .admin-courses {
    min-height: 100vh;
    background: #000000;
    padding: 2rem 0;
    color: #ffffff;
  }
  
  .main-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  .page-title {
    font-size: 2rem;
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .courses-list {
    display: grid;
    gap: 2rem;
  }
  
  .course-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .course-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .course-header h2 {
    font-size: 1.5rem;
    margin: 0;
  }
  
  .status {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .status-pending {
    background: rgba(255, 193, 7, 0.2);
    color: #ffc107;
  }
  
  .status-resubmitted {
    background: rgba(33, 150, 243, 0.2);
    color: #2196f3;
  }
  
  .tutor-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .tutor-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .tutor-details {
    font-size: 0.875rem;
  }
  
  .tutor-name {
    font-weight: 500;
    margin: 0;
  }
  
  .tutor-email {
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
  
  .course-meta {
    margin-bottom: 1rem;
  }
  
  .course-meta p {
    margin: 0.5rem 0;
    color: rgba(255, 255, 255, 0.9);
  }
  
  .course-description {
    margin-bottom: 1.5rem;
  }
  
  .crowdfunding-details {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
  
  .featured-toggle {
    margin: 1rem 0;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .featured-label {
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
  }
  
  .featured-label input[type="checkbox"] {
    width: 1.2rem;
    height: 1.2rem;
    accent-color: #4CAF50;
  }
  
  .featured-text {
    font-weight: 500;
  }
  
  .featured-description {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
  }
  
  .approval-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .approve-btn,
  .disapprove-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s;
    border: none;
  }
  
  .approve-btn {
    background: #4CAF50;
    color: white;
  }
  
  .approve-btn:hover {
    background: #45a049;
  }
  
  .disapproval-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .disapproval-reason {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    resize: vertical;
    min-height: 100px;
    background: rgba(255, 255, 255, 0.05);
    color: white;
  }
  
  .disapprove-btn {
    background: #dc3545;
    color: white;
  }
  
  .disapprove-btn:hover:not(:disabled) {
    background: #c82333;
  }
  
  .disapprove-btn:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    .main-container {
      padding: 0 0.5rem;
    }
  
    .course-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
  
    .approval-actions {
      flex-direction: column;
    }
  
    .approve-btn,
    .disapprove-btn {
      width: 100%;
    }
  
    .featured-label {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }
  </style>