<template>
    <div class="course-swiper">
      <Swiper
        :modules="swiperModules"
        :slides-per-view="1"
        :space-between="30"
        :autoplay="{
          delay: 5000,
          disableOnInteraction: false
        }"
        :pagination="{
          clickable: true,
          dynamicBullets: true
        }"
        :navigation="true"
        class="course-swiper"
      >
        <SwiperSlide v-for="course in courses" :key="course._id" class="course-slide">
          <div class="course-content" :style="{ backgroundImage: `url(${course.photos?.[0] || '/public/picture/inner.png'})` }">
            <div class="course-overlay">
              <div class="course-info">
                <div class="course-categories">
                  <span v-for="category in course.categories" :key="category" class="category-tag">
                    {{ category }}
                  </span>
                </div>
                <h2 class="course-title">{{ course.title }}</h2>
                <p class="course-description">{{ course.description }}</p>
                <div class="course-meta">
                  <div class="tutor-info" v-if="course.tutor">
                    <img :src="course.tutor.userIcon || '/public/picture/inner.png'" alt="Tutor" class="tutor-avatar">
                    <span class="tutor-name">{{ course.tutor.name }}</span>
                  </div>
                  <div class="price" v-if="course.Price">
                    <span class="currency">HK$</span>
                    <span class="amount">{{ formatPrice(course.Price) }}</span>
                  </div>
                </div>
                <NuxtLink :to="`/courses/${course._id}`" class="course-cta">
                  Learn More
                </NuxtLink>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { Swiper, SwiperSlide } from 'swiper/vue';
  import { Autoplay, Pagination, Navigation } from 'swiper/modules';
  import { useRuntimeConfig } from '#imports';
  import { formatPrice } from '@/composables/globalfunction';
  
  // Import Swiper styles
  import 'swiper/css';
  import 'swiper/css/pagination';
  import 'swiper/css/navigation';
  import 'swiper/css/autoplay';
  
  const runtimeConfig = useRuntimeConfig();
  const courses = ref([]);
  const swiperModules = [Autoplay, Pagination, Navigation];
  
  const fetchFeaturedCourses = async () => {
    try {
      const response = await fetch(`${runtimeConfig.public.apiBase}courses?featured=true`);
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      courses.value = data.Courses;
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };
  
  onMounted(() => {
    fetchFeaturedCourses();
  });
  </script>
  
  <style scoped>
  .course-swiper {
    width: 100%;
    height: 600px;
    margin: 0 auto;
  }
  
  .course-slide {
    height: 100%;
    position: relative;
  }
  
  .course-content {
    width: 100%;
    height: 100%;
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
    background: linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.3));
    display: flex;
    align-items: center;
    padding: 60px;
  }
  
  .course-info {
    max-width: 600px;
    color: white;
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
    margin-bottom: 20px;
    line-height: 1.2;
  }
  
  .course-description {
    font-size: 18px;
    margin-bottom: 30px;
    opacity: 0.8;
    line-height: 1.6;
  }
  
  .course-meta {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
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
  
  .tutor-name {
    font-size: 16px;
    opacity: 0.9;
  }
  
  .price {
    font-size: 24px;
    font-weight: 600;
  }
  
  .currency {
    font-size: 16px;
    margin-right: 4px;
  }
  
  .course-cta {
    display: inline-block;
    padding: 12px 30px;
    background: #4CAF50;
    color: white;
    text-decoration: none;
    border-radius: 30px;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  
  .course-cta:hover {
    background: #43a047;
    transform: translateY(-2px);
  }
  
  :deep(.swiper-pagination-bullet) {
    background: white;
    opacity: 0.5;
  }
  
  :deep(.swiper-pagination-bullet-active) {
    opacity: 1;
  }
  
  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    color: white;
  }
  
  @media (max-width: 768px) {
    .course-swiper {
      height: 400px;
    }
  
    .course-overlay {
      padding: 30px;
    }
  
    .course-title {
      font-size: 32px;
    }
  
    .course-description {
      font-size: 16px;
    }
  
    .course-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
    }
  }
  </style>