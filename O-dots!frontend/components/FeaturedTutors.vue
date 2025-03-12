<template>
    <div class="tutors-section">
      <h2 class="section-title">Featured Tutors</h2>
      <Swiper
        :modules="[SwiperAutoplay, SwiperPagination]"
        :slides-per-view="slidesPerView"
        :space-between="30"
        :autoplay="{
          delay: 3000,
          disableOnInteraction: false
        }"
        :pagination="{
          clickable: true
        }"
        class="tutors-swiper"
      >
        <SwiperSlide v-for="tutor in tutors" :key="tutor._id" class="tutor-slide">
          <div class="tutor-card">
            <div class="tutor-avatar">
              <img :src="tutor.userIcon || '/public/picture/inner.png'" :alt="tutor.name">
            </div>
            <h3 class="tutor-name">{{ tutor.name }}</h3>
            <p class="tutor-courses">{{ tutor.courseCount }} Courses</p>
            <div class="tutor-categories">
              <span v-for="category in tutor.categories" :key="category" class="tutor-category">
                {{ category }}
              </span>
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
  const tutors = ref([]);
  
  const slidesPerView = computed(() => {
    if (process.client) {
      if (window.innerWidth < 640) return 2;
      if (window.innerWidth < 1024) return 3;
      return 5;
    }
    return 5;
  });
  
  const fetchTutors = async () => {
    try {
      const response = await fetch(`${runtimeConfig.public.apiBase}courses`);
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      
      // Process tutors from courses
      const tutorMap = new Map();
      data.Courses.forEach(course => {
        if (!course.tutor) return;
        
        if (!tutorMap.has(course.tutor._id)) {
          tutorMap.set(course.tutor._id, {
            _id: course.tutor._id,
            name: course.tutor.name,
            userIcon: course.tutor.userIcon,
            courseCount: 1,
            categories: new Set(course.categories)
          });
        } else {
          const tutor = tutorMap.get(course.tutor._id);
          tutor.courseCount++;
          course.categories.forEach(cat => tutor.categories.add(cat));
        }
      });
  
      tutors.value = Array.from(tutorMap.values()).map(tutor => ({
        ...tutor,
        categories: Array.from(tutor.categories).slice(0, 3) // Limit to 3 categories
      }));
    } catch (error) {
      console.error('Error fetching tutors:', error);
    }
  };
  
  onMounted(fetchTutors);
  </script>
  
  <style scoped>
  .tutors-section {
    padding: 40px 20px;
  }
  
  .section-title {
    text-align: center;
    margin-bottom: 40px;
    font-size: 2rem;
    color: #ffffff;
  }
  
  .tutors-swiper {
    padding: 20px 0 40px;
  }
  
  .tutor-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 20px;
    text-align: center;
    transition: transform 0.3s ease;
  }
  
  .tutor-card:hover {
    transform: translateY(-5px);
  }
  
  .tutor-avatar {
    width: 100px;
    height: 100px;
    margin: 0 auto 15px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid rgba(255, 255, 255, 0.2);
  }
  
  .tutor-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .tutor-name {
    color: #ffffff;
    font-size: 1.2rem;
    margin-bottom: 5px;
  }
  
  .tutor-courses {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    margin-bottom: 15px;
  }
  
  .tutor-categories {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    justify-content: center;
  }
  
  .tutor-category {
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    color: #ffffff;
  }
  
  @media (max-width: 1024px) {
    .tutor-avatar {
      width: 80px;
      height: 80px;
    }
  
    .tutor-name {
      font-size: 1rem;
    }
  }
  
  @media (max-width: 640px) {
    .tutors-section {
      padding: 20px 10px;
    }
  
    .tutor-avatar {
      width: 60px;
      height: 60px;
    }
  
    .tutor-category {
      font-size: 0.7rem;
    }
  }
  </style>