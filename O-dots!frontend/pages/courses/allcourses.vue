<template>
    <Courseheader/>
    <div class="allcoursewrapper">
      <h1>All Courses</h1>
      <div>
        <label for="category">Filter by Category:</label>
        <select id="category" v-model="selectedCategory" @change="filterByCategory">
          <option value="">All</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
      <div class="coursesloop">
        <router-link
          v-for="course in courses"
          :key="course._id"
          :to="`/courses/${course._id}`"
          class="course"
          :style="{ backgroundImage: course.photos.length ? `url(${course.photos[0]})` : 'none' }"
        >
          <div class="course-content">
            <div class="title">{{ course.title }}</div>
            <div class="categories">
              <span
                v-for="category in course.categories"
                :key="category"
                class="category"
              >
                {{ category }}
              </span>
            </div>
          </div>
        </router-link>
      </div>
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import { useRuntimeConfig } from '#imports';
  
  const courses = ref([]);
  const categories = ref([]);
  const selectedCategory = ref('');
  const currentPage = ref(1);
  const totalPages = ref(1);
  const itemsPerPage = 6;
  const runtimeConfig = useRuntimeConfig();
  
  const fetchCourses = async (page, category) => {
    try {
      const response = await fetch(`${runtimeConfig.public.apiBase}/courses?page=${page}&limit=${itemsPerPage}&category=${category}`);
      const data = await response.json();
      courses.value = data.Courses;
      totalPages.value = data.totalPages;
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${runtimeConfig.public.apiBase}/categories`);
      const data = await response.json();
      categories.value = data;
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  const filterByCategory = () => {
    currentPage.value = 1; // Reset to the first page when filtering
    fetchCourses(currentPage.value, selectedCategory.value);
  };
  
  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
      fetchCourses(currentPage.value, selectedCategory.value);
    }
  };
  
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
      fetchCourses(currentPage.value, selectedCategory.value);
    }
  };
  
  onMounted(async () => {
    await fetchCategories();
    await fetchCourses(currentPage.value, selectedCategory.value);
  });
  
  watch(selectedCategory, (newCategory) => {
    filterByCategory();
  });
  </script>
  
  <style scoped>
  .allcoursewrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    margin-top: 13vh;
    min-height: 87vh;
  }
  
  .coursesloop {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    box-sizing: border-box;
    margin: 17px 160px;
    justify-content: center;
    align-items: center;
    color: white;
  }
  
  .course {
    border: 1px solid #ddd;
    border-radius: 1em;
    padding: 10px;
    margin-bottom: 10px;
    margin-right: 10px;
    width: calc(40% - 3em);
    background-color: black;
    background-size: cover;
    background-position: center;
    height: 266px;
    display: flex;
    flex-direction: column;
    color: white;
    position: relative;
    text-decoration: none;
  }
  
  .course-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 120%;
    text-align: center;
    z-index: 1;
    background: #0000003d;
  }
  
  .title {
    flex: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5em;
    margin: 0;
    box-sizing: border-box;
    padding: 8vh;
  }
  
  .categories {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 5px;
    height: fit-content; /* Ensures the height of the background wraps around the content */
  }
  
  .category {
    padding: 2px 8px;
    background-color: rgb(237 48 48 / 60%);
    border-radius: 1em;
    font-size: 0.8em;
 
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
  }
  
  .pagination button {
    padding: 10px;
    margin: 0 5px;
  }
  
  .pagination span {
    margin: 0 10px;
  }

  @media(max-width:600px){
    .course {

    min-width: calc(80% - 3em);
    max-width: calc(80% - 3em);
    height: 200px;
  }
  .title {
    padding: 3vh;
    background:rgba(0, 0, 0, 0.2);
    width:100%;
    height:80%;
    border-radius:5%;

  }
  .coursesloop {

    margin: 17px 0px;

  }
  .allcoursewrapper {
    margin-top: 11vh;
}
  }
  </style>
  