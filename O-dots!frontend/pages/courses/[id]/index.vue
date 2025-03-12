<template>
  <courseheader/>
  <div class="course-details">
    <!-- Hero Section -->
    <div class="hero-section" :style="course?.photos?.[0] ? { backgroundImage: `url(${course.photos[0]})` } : null">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="container">
          <div class="course-info">
            <div class="course-categories">
              <span v-for="category in course?.categories" :key="category" class="category-tag">
                {{ category }}
              </span>
            </div>
            <h1 class="course-title">{{ course?.title }}</h1>
            <div class="course-meta">
              <div class="tutor-info" v-if="course?.tutor">
                <img :src="tutorIcon" alt="Tutor" class="tutor-avatar">
                <span class="tutor-name">{{ course?.tutor?.name }}</span>
              </div>
              <div class="course-stats">
                <div class="stat">
                  <i class="fas fa-users"></i>
                  <span>{{ enrolledCount }} students</span>
                </div>
                <div class="stat">
                  <i class="fas fa-clock"></i>
                  <span>{{ course?.duration }} hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="container">
        <div class="content-grid">
          <!-- Left Column -->
          <div class="course-content">
            <!-- Course Description -->
            <section class="content-section">
              <h2>Course Description</h2>
              <div class="description" v-html="course?.description"></div>
            </section>

            <!-- What You'll Learn -->
            <section class="content-section">
              <h2>What You'll Learn</h2>
              <div class="learning-outcomes" v-html="course?.learningOutcomes"></div>
            </section>

            <!-- Course Curriculum -->
            <section class="content-section">
              <h2>Course Curriculum</h2>
              <div class="curriculum-list">
                <div v-for="(video, index) in course?.videos" :key="index" class="curriculum-item">
                  <div class="item-header">
                    <span class="item-number">{{ index + 1 }}</span>
                    <span class="item-title">{{ video.name }}</span>
                    <span class="item-duration">{{ video.duration || '00:00' }}</span>
                  </div>
                  <p class="item-description">{{ video.tutorremarks }}</p>
                </div>
              </div>
            </section>
          </div>

          <!-- Right Column -->
          <div class="course-sidebar">
            <div class="sidebar-card">
              <!-- Preview Video -->
              <div v-if="course?.promotionUrl" class="preview-video">
                <iframe 
                  :src="course.promotionUrl" 
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen
                ></iframe>
              </div>
              <div v-else-if="course?.photos?.[0]" class="preview-image">
                <img :src="course.photos[0]" alt="Course Preview">
              </div>

              <!-- Course Price -->
              <div class="price-section">
                <div class="price" v-if="course?.Price">
                  <span class="currency">HK$</span>
                  <span class="amount">{{ formatPrice(course.Price) }}</span>
                </div>
                <div class="price-actions">
                  <button @click="redirectToStripe" class="btn-primary">
                    Enroll Now
                  </button>
                  <button @click="addToWishlist" class="btn-secondary" :disabled="isInWishlist">
                    {{ isInWishlist ? 'In Wishlist' : 'Add to Wishlist' }}
                  </button>
                </div>
              </div>

              <!-- Course Stats -->
              <div class="course-highlights">
                <div class="highlight-item">
                  <i class="fas fa-play-circle"></i>
                  <div class="highlight-info">
                    <span class="highlight-value">{{ course?.videos?.length || 0 }}</span>
                    <span class="highlight-label">Lessons</span>
                  </div>
                </div>
                <div class="highlight-item">
                  <i class="fas fa-clock"></i>
                  <div class="highlight-info">
                    <span class="highlight-value">{{ course?.duration || 0 }}</span>
                    <span class="highlight-label">Hours</span>
                  </div>
                </div>
                <div class="highlight-item">
                  <i class="fas fa-infinity"></i>
                  <div class="highlight-info">
                    <span class="highlight-value">Lifetime</span>
                    <span class="highlight-label">Access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRuntimeConfig } from '#imports';
import { loadStripe } from '@stripe/stripe-js';

const route = useRoute();
const router = useRouter();
const runtimeConfig = useRuntimeConfig();

const course = ref(null);
const tutorIcon = ref('/public/picture/inner.jpg');
const enrolledCount = ref(Math.floor(Math.random() * 1000) + 100);
const isInWishlist = ref(false);

const formatPrice = (price) => {
  return (price / 100).toFixed(2);
};

const addToWishlist = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/users/signin');
      return;
    }

    // Add to wishlist in localStorage
    const wishlist = JSON.parse(localStorage.getItem('courseWishlist') || '[]');
    if (!wishlist.includes(course.value._id)) {
      wishlist.push(course.value._id);
      localStorage.setItem('courseWishlist', JSON.stringify(wishlist));
      isInWishlist.value = true;
      alert('Course added to wishlist!');
    }
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    alert('Failed to add course to wishlist');
  }
};

const redirectToStripe = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/users/signin');
      return;
    }

    const response = await fetch(`${runtimeConfig.public.apiBase}payments/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productName: course.value.title,
        price: course.value.Price,
        quantity: 1,
        email: localStorage.getItem('userEmail'),
        name: localStorage.getItem('userName'),
        course_id: course.value._id,
        successUrl: `${window.location.origin}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
        failUrl: `${window.location.origin}/payments/fail`
      })
    });

    const session = await response.json();
    const stripe = await loadStripe(runtimeConfig.public.stripePubishKey);
    await stripe.redirectToCheckout({ sessionId: session.id });
  } catch (error) {
    console.error('Error redirecting to Stripe:', error);
  }
};

onMounted(async () => {
  try {
    const response = await fetch(`${runtimeConfig.public.apiBase}courses/${route.params.id}`);
    if (!response.ok) throw new Error('Failed to fetch course');
    course.value = await response.json();

    if (course.value.tutor?.userIcon) {
      tutorIcon.value = course.value.tutor.userIcon;
    }

    // Check if course is in wishlist
    const wishlist = JSON.parse(localStorage.getItem('courseWishlist') || '[]');
    isInWishlist.value = wishlist.includes(course.value._id);
  } catch (error) {
    console.error('Error fetching course:', error);
  }
});
</script>

<style scoped>
.course-details {
  min-height: 100vh;
  background: #f8f9fa;
}

.hero-section {
  position: relative;
  height: 500px;
  background-size: cover;
  background-position: center;
  color: white;
  margin-top: 60px;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8));
}

.hero-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  align-items: center;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  width: 100%;
}

.course-info {
  max-width: 800px;
}

.course-categories {
  margin-bottom: 20px;
}

.category-tag {
  display: inline-block;
  padding: 6px 12px;
  background: rgba(255,255,255,0.2);
  border-radius: 20px;
  margin-right: 10px;
  font-size: 14px;
}

.course-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 30px;
  line-height: 1.2;
}

.course-meta {
  display: flex;
  align-items: center;
  gap: 30px;
}

.tutor-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tutor-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.course-stats {
  display: flex;
  gap: 20px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.main-content {
  padding: 60px 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

.content-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.content-section h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.description {
  line-height: 1.8;
  color: #666;
}

.learning-outcomes {
  margin-top: 1rem;
  line-height: 1.6;
  color: #666;
}

.curriculum-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.curriculum-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.item-number {
  width: 24px;
  height: 24px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #666;
}

.item-title {
  flex: 1;
  font-weight: 500;
}

.item-duration {
  color: #666;
  font-size: 14px;
}

.item-description {
  color: #666;
  font-size: 14px;
  margin-left: 39px;
}

.sidebar-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  position: sticky;
  top: 80px;
}

.preview-video,
.preview-image {
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.preview-video iframe,
.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.price-section {
  padding: 30px;
  border-bottom: 1px solid #eee;
}

.price {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #333;
}

.currency {
  font-size: 24px;
  margin-right: 5px;
}

.price-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-primary,
.btn-secondary {
  width: 100%;
  padding: 15px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background: #43a047;
}

.btn-secondary {
  background: transparent;
  border: 1px solid #ffffff;
  color: #ffffff;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.course-highlights {
  padding: 30px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  text-align: center;
}

.highlight-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.highlight-item i {
  font-size: 24px;
  color: #666;
}

.highlight-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.highlight-value {
  font-weight: 600;
  color: #333;
}

.highlight-label {
  font-size: 12px;
  color: #666;
}

@media (max-width: 768px) {
  .hero-section {
    height: 400px;
    margin-top: 50px;
  }

  .course-title {
    font-size: 32px;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .course-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .sidebar-card {
    position: static;
  }
}
</style>