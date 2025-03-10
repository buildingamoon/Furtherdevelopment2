<template>
  <div class="search-container" :class="{ 'has-results': hasResults }">
    <div class="search-controls">
      <div class="search-input-wrapper">
        <input 
          type="text" 
          v-model="keyword" 
          placeholder="Search courses and content..." 
          @input="handleSearch"
          @focus="showResults = true"
          @blur="handleBlur"
          class="search-input"
        />
      </div>
    </div>

    <div v-if="loading" class="search-loading">
      <div class="loading-spinner"></div>
    </div>

    <div v-show="showResults && keyword" class="search-results" ref="resultsContainer">
      <div v-if="results.length > 0" class="results-list">
        <router-link 
          v-for="result in results" 
          :key="result._id" 
          :to="getResultLink(result)"
          class="search-result-item"
          @mousedown.prevent="handleResultClick(result)"
        >
          <div class="result-image">
            <img :src="result.photos?.[0] || '/public/picture/inner.png'" :alt="result.title">
          </div>
          <div class="result-content">
            <h3>{{ result.title }}</h3>
            <p class="result-excerpt">{{ getExcerpt(result.content || '') }}</p>
            <div class="result-categories">
              <span v-for="cat in result.categories" :key="cat" class="category-tag">
                {{ cat }}
              </span>
            </div>
          </div>
        </router-link>
      </div>
      <div v-else-if="hasSearched" class="no-results">
        No results found for "{{ keyword }}"
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import debounce from 'lodash.debounce';
import { useRuntimeConfig } from '#imports';

const router = useRouter();
const config = useRuntimeConfig();
const keyword = ref('');
const results = ref([]);
const loading = ref(false);
const hasSearched = ref(false);
const showResults = ref(false);
const resultsContainer = ref(null);

const hasResults = computed(() => {
  return keyword.value && results.value.length > 0;
});

// Mock data for testing - replace with actual API call in production
const mockData = [
  {
    _id: '1',
    title: 'Introduction to Web Development',
    content: 'Learn the basics of web development including HTML, CSS, and JavaScript.',
    photos: ['/public/picture/demo1.jpg'],
    categories: ['Development', 'Technology'],
    type: 'course'
  },
  {
    _id: '2',
    title: 'Digital Marketing Fundamentals',
    content: 'Master the essentials of digital marketing strategies and implementation.',
    photos: ['/public/picture/demo2.jpg'],
    categories: ['Marketing', 'Business'],
    type: 'course'
  },
  {
    _id: '3',
    title: 'Creative Photography',
    content: 'Explore the art of photography and develop your creative eye.',
    photos: ['/public/picture/demo3.jpg'],
    categories: ['Photography', 'Art'],
    type: 'course'
  }
];

const search = async () => {
  if (!keyword.value.trim()) {
    results.value = [];
    hasSearched.value = false;
    return;
  }

  loading.value = true;
  hasSearched.value = true;

  try {
    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 300));
    
    results.value = mockData.filter(item => {
      const searchTerm = keyword.value.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchTerm) ||
        item.content.toLowerCase().includes(searchTerm) ||
        item.categories.some(cat => cat.toLowerCase().includes(searchTerm))
      );
    });
  } catch (error) {
    console.error('Search error:', error);
    results.value = [];
  } finally {
    loading.value = false;
  }
};

const handleSearch = debounce(() => {
  search();
}, 300);

const handleBlur = () => {
  // Small delay to allow click events on results
  setTimeout(() => {
    showResults.value = false;
  }, 200);
};

const handleResultClick = (result) => {
  router.push(getResultLink(result));
  showResults.value = false;
  keyword.value = '';
};

const getResultLink = (result) => {
  if (!result || !result._id) return '/';
  
  switch (result.type) {
    case 'course':
      return `/courses/${result._id}`;
    case 'post':
      return `/posts/${result._id}`;
    case 'discussion':
      return `/discussions/${result._id}`;
    default:
      return '/';
  }
};

const getExcerpt = (text) => {
  const words = text.split(' ');
  return words.slice(0, 15).join(' ') + (words.length > 15 ? '...' : '');
};

// Close results when clicking outside
const handleClickOutside = (event) => {
  if (resultsContainer.value && !resultsContainer.value.contains(event.target)) {
    showResults.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.search-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1000;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-controls {
  display: flex;
  gap: 10px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
}

.search-input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
  margin-top: 4px;
}

.search-result-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s ease;
  text-decoration: none;
  color: inherit;
}

.search-result-item:hover {
  background-color: #f8f9fa;
}

.search-result-item:last-child {
  border-bottom: none;
}

.result-image {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-content h3 {
  margin: 0;
  font-size: 1.1em;
  color: #333;
}

.result-excerpt {
  font-size: 0.9em;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.category-tag {
  display: inline-block;
  padding: 4px 12px;
  margin: 0 6px 6px 0;
  background: #f0f0f0;
  border-radius: 16px;
  font-size: 0.85em;
  color: #666;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #666;
  background: white;
  border-radius: 0 0 12px 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 600px) {
  .search-container {
    margin: 10px;
    width: calc(100% - 20px);
  }

  .search-controls {
    padding: 10px;
  }

  .search-result-item {
    padding: 10px;
  }

  .result-image {
    width: 60px;
    height: 60px;
  }

  .result-content h3 {
    font-size: 0.9em;
  }

  .result-excerpt {
    font-size: 0.8em;
  }

  .category-tag {
    font-size: 0.75em;
    padding: 2px 8px;
  }
}
</style>