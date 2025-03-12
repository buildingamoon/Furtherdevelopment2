<template>
  <div class="search-container" :class="{ 'has-results': hasResults, 'is-mobile': isMobile }">
    <!-- Search toggle button for mobile -->
    <button 
      class="search-toggle" 
      @click="toggleSearch" 
      v-if="isMobile"
      :class="{ 'active': isSearchVisible }"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </button>

    <!-- Search input and controls -->
    <div class="search-controls" :class="{ 'visible': !isMobile || isSearchVisible }">
      <div class="search-input-wrapper">
        <div class="search-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input 
          type="text" 
          v-model="keyword" 
          placeholder="Search titles, categories..." 
          @input="handleSearch"
          @focus="handleFocus"
          @blur="handleBlur"
          class="search-input"
          ref="searchInput"
        />
        <button v-if="keyword" class="clear-button" @click="clearSearch">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="search-loading">
      <div class="loading-spinner"></div>
    </div>

    <!-- Search results -->
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
            <img :src="result.photos?.[0] || result.photos || '/public/picture/inner.png'" :alt="result.title">
          </div>
          <div class="result-content">
            <h3>{{ result.title }}</h3>
            <p class="result-excerpt">{{ getExcerpt(result.content || result.description || '') }}</p>
            <div class="result-meta">
              <div class="result-categories">
                <span v-for="cat in result.categories" :key="cat" class="category-tag">{{ cat }}</span>
              </div>
              <span class="result-type" :class="result.type">{{ result.type === 'course' ? 'Course' : 'Post' }}</span>
            </div>
          </div>
        </router-link>
      </div>
      <div v-else-if="hasSearched" class="no-results">
        <p>No results found for "{{ keyword }}"</p>
        <p class="no-results-suggestion">Try adjusting your search terms</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
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
const searchInput = ref(null);
const isMobile = ref(false);
const isSearchVisible = ref(false);
const searchAbortController = ref(null);

const hasResults = computed(() => keyword.value && results.value.length > 0);

const search = async () => {
  if (!keyword.value.trim()) {
    results.value = [];
    hasSearched.value = false;
    return;
  }

  if (searchAbortController.value) {
    searchAbortController.value.abort();
  }

  searchAbortController.value = new AbortController();
  loading.value = true;
  hasSearched.value = true;

  try {
    const response = await fetch(
      `${config.public.apiBase}search?keyword=${encodeURIComponent(keyword.value)}`,
      { signal: searchAbortController.value.signal }
    );

    if (!response.ok) throw new Error('Search failed');
    const data = await response.json();
    results.value = data.results || [];
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Search error:', error);
      results.value = [];
    }
  } finally {
    loading.value = false;
  }
};

const handleSearch = debounce(() => search(), 150);

const toggleSearch = () => {
  isSearchVisible.value = !isSearchVisible.value;
  if (isSearchVisible.value) {
    nextTick(() => {
      searchInput.value?.focus();
    });
  } else {
    clearSearch();
  }
};

const clearSearch = () => {
  keyword.value = '';
  results.value = [];
  hasSearched.value = false;
  if (searchInput.value) {
    searchInput.value.focus();
  }
};

const handleFocus = () => showResults.value = true;

const handleBlur = () => {
  setTimeout(() => {
    if (!isMobile.value) {
      showResults.value = false;
    }
  }, 200);
};

const handleResultClick = (result) => {
  router.push(getResultLink(result));
  showResults.value = false;
  keyword.value = '';
  if (isMobile.value) {
    isSearchVisible.value = false;
  }
};

const getResultLink = (result) => {
  if (!result?._id) return '/';
  return result.type === 'course' ? `/courses/${result._id}` : `/posts/${result._id}`;
};

const getExcerpt = (text) => {
  const words = text.split(' ');
  return words.slice(0, 15).join(' ') + (words.length > 15 ? '...' : '');
};

const handleResize = () => {
  if (process.client) {
    isMobile.value = window.innerWidth <= 768;
    if (!isMobile.value) {
      isSearchVisible.value = false;
    }
  }
};

onMounted(() => {
  if (process.client) {
    window.addEventListener('resize', handleResize);
    handleResize();
  }
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', handleResize);
  }
  if (searchAbortController.value) {
    searchAbortController.value.abort();
  }
});

watch(isSearchVisible, (newValue) => {
  if (process.client) {
    document.body.style.overflow = newValue && isMobile.value ? 'hidden' : '';
  }
});
</script>

<style scoped>
.search-container {
  position: relative;
  z-index: 1000;
  transition: all 0.3s ease;
  margin-top: 20%;
  width: 60%;
  margin-left: 20%;
}

.search-toggle {
  display: none;
  background: none;
  border: none;
  color: white;
  padding: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.search-toggle.active {
  transform: scale(1.1);
}

.search-controls {
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  padding: 8px 16px;
}

.search-icon {
  color: rgba(255, 255, 255, 0.5);
  margin-right: 12px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 16px;
  padding: 8px 0;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.clear-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s ease;
}

.clear-button:hover {
  color: white;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 80vh;
  overflow-y: auto;
  backdrop-filter: blur(10px);
}

.search-result-item {
  display: flex;
  padding: 16px;
  text-decoration: none;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background-color 0.2s ease;
}

.search-result-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.result-image {
  width: 120px;
  height: 68px;
  flex-shrink: 0;
  margin-right: 16px;
  border-radius: 4px;
  overflow: hidden;
}

.result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-content h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
}

.result-excerpt {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 8px;
  line-height: 1.4;
}

.result-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.result-categories {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-tag {
  font-size: 12px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.result-type {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.result-type.course {
  background: rgba(229, 9, 20, 0.2);
  color: #e50914;
}

.result-type.post {
  background: rgba(0, 123, 255, 0.2);
  color: #007bff;
}

.no-results {
  padding: 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.no-results-suggestion {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 8px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile Styles */
@media (max-width: 768px) {
  .search-container.is-mobile .search-toggle {
    display: block;
  }

  .search-container.is-mobile .search-controls {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 16px;
    background: rgba(0, 0, 0, 0.95);
    z-index: 1001;
  }

  .search-container.is-mobile .search-controls.visible {
    display: block;
  }

  .search-container.is-mobile .search-results {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    border: none;
  }

  .result-image {
    width: 80px;
    height: 45px;
  }

  .result-excerpt {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .result-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>