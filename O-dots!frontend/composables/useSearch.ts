// composables/useSearch.ts
import { ref, computed } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'

export const useSearch = () => {
  const runtimeConfig = useRuntimeConfig()
  const searchQuery = ref('')
  const searchCategory = ref('all')
  const searchResults = ref({
    posts: [],
    courses: []
  })
  const isLoading = ref(false)

  const performSearch = async () => {
    if (!searchQuery.value.trim()) {
      searchResults.value = { posts: [], courses: [] }
      return
    }

    isLoading.value = true
    try {
      const [postsResponse, coursesResponse] = await Promise.all([
        fetch(`${runtimeConfig.public.apiBase}/posts?search=${searchQuery.value}`),
        fetch(`${runtimeConfig.public.apiBase}/courses?search=${searchQuery.value}`)
      ])

      const [postsData, coursesData] = await Promise.all([
        postsResponse.json(),
        coursesResponse.json()
      ])

      searchResults.value = {
        posts: postsData.posts || [],
        courses: coursesData.Courses || []
      }
    } catch (error) {
      console.error('Search error:', error)
      searchResults.value = { posts: [], courses: [] }
    } finally {
      isLoading.value = false
    }
  }

  return {
    searchQuery,
    searchCategory,
    searchResults,
    isLoading,
    performSearch
  }
}