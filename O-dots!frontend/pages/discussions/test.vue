<template>
  <div>
    <div class="loader">
      <div class="loaderwrap">
        <div>
          <img src="/public/picture/logobody.png" class="bodyloader">
          <img src="/public/picture/logoeyes.png" class="eyesloader">
          <div class="loaderwebsitename">O-dots!</div>
        </div>
      </div>
    </div>
    <mainheader ref="nav" :class="{ 'nav-scrolled': isScrollingUp }" />
    <main>
      <section :class="['page', { active: currentPage === 'page1' }]" class="page1">
        <div class="pagewrapper page1wrapper">
          <div class="upper">
            <SearchBar />
            <video autoplay muted loop>
              <source src="/video/full-width.mp4" type="video/mp4">
            </video>
          </div>
          <div class="lower">
            <!-- Featured Courses -->
            <div class="page1loopbox featured-section">
              <CourseSwiper />
            </div>

            <!-- Popular Courses -->
            <div class="page1loopbox popular-section">
              <div class="section-header">
                <h2 class="section-title">Most Popular</h2>
                <NuxtLink to="/courses/allcourses" class="view-all">View All</NuxtLink>
              </div>
              <div class="courses-grid">
                <NuxtLink 
                  v-for="course in popularCourses" 
                  :key="course._id"
                  :to="`/courses/${course._id}`" 
                  class="course-card"
                >
                  <div class="course-image" :style="{ backgroundImage: `url(${course.photos?.[0] || '/public/picture/inner.png'})` }">
                    <div class="course-overlay">
                      <span class="course-category">{{ course.categories?.[0] || 'General' }}</span>
                    </div>
                  </div>
                  <div class="course-content">
                    <h3 class="course-title">{{ course.title }}</h3>
                    <div class="course-meta">
                      <span class="course-tutor">{{ course.tutor }}</span>
                      <span class="course-price">${{ formatPrice(course.Price) }}</span>
                    </div>
                  </div>
                </NuxtLink>
              </div>
            </div>

            <!-- New Releases -->
            <div class="page1loopbox new-releases-section">
              <div class="section-header">
                <h2 class="section-title">New Releases</h2>
                <div class="category-filters">
                  <button 
                    v-for="category in categories" 
                    :key="category"
                    :class="{ active: selectedCategory === category }"
                    @click="filterByCategory(category)"
                  >
                    {{ category }}
                  </button>
                </div>
              </div>
              <Crowdfund />
            </div>

            <!-- Featured Tutors -->
            <div class="page1loopbox tutors-section">
              <h2 class="section-title">Featured Tutors</h2>
              <newbies />
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSession } from '@/composables/state';
import { useRuntimeConfig } from '#imports';
import { formatPrice } from '@/composables/globalfunction';

import CourseSwiper from '~/components/CourseSwiper.vue';
import Crowdfund from '~/components/Crowdfund.vue';
import newbies from '~/components/newbies.vue';
import SearchBar from '~/components/SearchBar.vue';

const session = useSession();
const runtimeConfig = useRuntimeConfig();

const currentPage = ref('page1');
const popularCourses = ref([]);
const categories = ref(['All']);
const selectedCategory = ref('All');
const isScrollingUp = ref(false);

const fetchPopularCourses = async () => {
  try {
    const response = await fetch(`${runtimeConfig.public.apiBase}courses?featured=true`);
    if (!response.ok) throw new Error('Failed to fetch courses');
    const data = await response.json();
    popularCourses.value = data.Courses;
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
};

const fetchCategories = async () => {
  try {
    const response = await fetch(`${runtimeConfig.public.apiBase}categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();
    categories.value = ['All', ...data];
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

const filterByCategory = (category) => {
  selectedCategory.value = category;
};

onMounted(async () => {
  await Promise.all([
    fetchPopularCourses(),
    fetchCategories()
  ]);

  const loading = gsap.timeline();
  loading
    .fromTo('.loaderwrap', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 })
    .fromTo('.eyesloader', { autoAlpha: 0 }, { autoAlpha: 1, ease: 'power1.inOut', duration: 0.2 })
    .fromTo('.eyesloader', { autoAlpha: 0 }, { autoAlpha: 1, ease: 'power2.inOut', duration: 0.7 })
    .to('.loader', { y: '-100%', duration: 0.5 })
    .fromTo(
      ['header', '.page1'],
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 1,
        onComplete: () => {
          document.querySelectorAll('.page').forEach(page => {
            if (!page.classList.contains('page1')) page.classList.remove('active');
          });
        },
      }
    );
});
</script>

<style>
/* Keep existing styles */
</style>