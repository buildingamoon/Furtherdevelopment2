<template>
    
    <div class="allposts-wrapper">
      <backhomeheader/>
      <h1>All Blog Posts</h1>
      <div>
        <label for="category">Filter by Category:</label>
        <select id="category" v-model="selectedCategory" @change="filterByCategory">
          <option value="">All</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
      <div class="posts-loop">
        <router-link
          v-for="post in posts"
          :key="post._id"
          :to="`/posts/${post._id}`"
          class="post"
          :style="{ backgroundImage: post.photos ? `url(${post.photos})` : 'none' }"
        >
          <div class="post-content">
            <div class="title">{{ post.title }}</div>
            <div class="categories">
              <span
                v-for="category in post.categories"
                :key="category"
                class="category"
              >
                {{ category }}
              </span>
            </div>
            <div class="excerpt">
              {{ post.content.slice(0, 100) }}...
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
  
  const session = useSession();
  const posts = ref([]);
  const categories = ref([]);
  const selectedCategory = ref('');
  const currentPage = ref(1);
  const totalPages = ref(1);
  const itemsPerPage = 4;
  const runtimeConfig = useRuntimeConfig();
  
  const fetchPosts = async (page, category) => {
    try {
      const categoryFilter = category ? `&category=${category}` : '';
      const response = await fetch(`${runtimeConfig.public.apiBase}/posts?page=${page}&limit=${itemsPerPage}${categoryFilter}`);
      const data = await response.json();
      posts.value = data.posts;
      totalPages.value = data.totalPages;
    } catch (error) {
      console.error('Error fetching posts:', error);
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
    fetchPosts(currentPage.value, selectedCategory.value);
  };
  
  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
      fetchPosts(currentPage.value, selectedCategory.value);
    }
  };
  
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
      fetchPosts(currentPage.value, selectedCategory.value);
    }
  };
  
  onMounted(async () => {
    await fetchCategories();
    await fetchPosts(currentPage.value, selectedCategory.value);
  });
  
  watch(selectedCategory, () => {
    filterByCategory();
  });
  </script>
  
  <style scoped>
  .allposts-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    margin-top: 13vh;
    min-height: 87vh;
  }
  
  .posts-loop {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    box-sizing: border-box;
    margin: 5px 20px;
    justify-content: center;
    align-items: center;
    color: black;
  }
  
  .post {
    border: 1px solid #ddd;
    border-radius: 1em;
    padding: 10px;
    margin-bottom: 10px;
    margin-right: 10px;
    min-width: calc(50% - 3em);
    background-color: white;
    background-size: cover;
    background-position: center;
    height: 200px;
    display: flex;
    flex-direction: column;
    color: black;
    position: relative;
    text-decoration: none; /* Ensure links don't have underlines */
  }
  
  .post-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    text-align: center;
    z-index: 1; /* Ensure text is above background image */
  }
  
  .title {
    flex: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5em;
    margin: 0;
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
    .post {
    width: calc(80% - 3em);
  }
  .secondnav {
        opacity: 0;
    }
  }
  </style>
  