<template>
    <div class="swiper-container">
      <div class="swiper-wrapper">
        <div v-for="course in featuredCourses" :key="course._id" class="swiper-slide">
          <div class="hero-slide" :style="{ backgroundImage: `url(${course.photos?.[0] || '/public/picture/inner.png'})` }">
            <div class="hero-content">
              <div class="hero-categories">
                <span v-for="category in course.categories" :key="category" class="category-tag">
                  {{ category }}
                </span>
              </div>
              <h2 class="hero-title">{{ course.title }}</h2>
              <p class="hero-description">{{ course.description }}</p>
              <NuxtLink :to="`/courses/${course._id}`" class="hero-cta">
                Learn More
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
      <div class="swiper-pagination"></div>
    </div>
  </template>
  
  <script>
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
  
  export default {
    name: 'HeroBanner',
    setup() {
      const featuredCourses = ref([]);
  
      const initializeSwiper = () => {
        new Swiper('.swiper-container', {
          loop: true,
          grabCursor: true,
          spaceBetween: 0,
          autoplay: {
            delay: 5000,
            disableOnInteraction: false
          },
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
          keyboard: {
            enabled: true,
          },
          mousewheel: {
            thresholdDelta: 70,
          },
          slidesPerView: 1
        });
      };
  
      const fetchFeaturedCourses = async () => {
        try {
          const response = await fetch(`${useRuntimeConfig().public.apiBase}courses?featured=true`);
          if (!response.ok) throw new Error('Failed to fetch courses');
          const data = await response.json();
          featuredCourses.value = data.Courses;
        } catch (error) {
          console.error('Error fetching featured courses:', error);
        }
      };
  
      watch(() => featuredCourses.value, (newCourses) => {
        if (newCourses.length > 0) {
          initializeSwiper();
        }
      });
  
      onMounted(async () => {
        await fetchFeaturedCourses();
        if (featuredCourses.value.length > 0) {
          initializeSwiper();
        }
      });
  
      return {
        featuredCourses
      };
    }
  };
  </script>
  
  <style scoped>
  .swiper-container {
    width: 100%;
    height: 600px;
    position: relative;
  }
  
  .swiper-slide {
    width: 100%;
    height: 100%;
  }
  
  .hero-slide {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    position: relative;
  }
  
  .hero-slide::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.3));
  }
  
  .hero-content {
    position: relative;
    z-index: 1;
    max-width: 800px;
    margin: 0 auto;
    padding: 60px;
    color: white;
  }
  
  .hero-categories {
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
  
  .hero-title {
    font-size: 48px;
    font-weight: 700;
    margin-bottom: 20px;
    line-height: 1.2;
  }
  
  .hero-description {
    font-size: 18px;
    margin-bottom: 30px;
    opacity: 0.8;
    line-height: 1.6;
  }
  
  .hero-cta {
    display: inline-block;
    padding: 12px 30px;
    background: #4CAF50;
    color: white;
    text-decoration: none;
    border-radius: 30px;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  
  .hero-cta:hover {
    background: #43a047;
    transform: translateY(-2px);
  }
  
  .swiper-pagination {
    position: absolute;
    bottom: 20px;
  }
  
  .swiper-pagination-bullet {
    background: white;
    opacity: 0.5;
  }
  
  .swiper-pagination-bullet-active {
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    .swiper-container {
      height: 400px;
    }
  
    .hero-content {
      padding: 30px;
    }
  
    .hero-title {
      font-size: 32px;
    }
  
    .hero-description {
      font-size: 16px;
    }
  }
  </style>