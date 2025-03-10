<template>
    <courseheader/>
    <div class="coursedetailswhole">
      <div class="addedlayer" v-if="course">
        <div class="course-container">
          <div class="course-left">
            <div v-if="course.promotionUrl" class="mediawrapper">
              <iframe :src="`${course.promotionUrl}?autoplay=1`" width="100%" height="100%" frameborder="0" allow="autoplay" allowfullscreen muted></iframe>
            </div>
            <div v-else class="mediawrapper">
              <img :src="course.photos[0]" alt="Course Photo" width="100%" height="100%" />
            </div>
            <h3>Course Title: {{ course.title }}</h3>
            <div class="course-info">
              <div class="tutor">Tutor: {{ course.tutor }}</div>
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
            <div>
              <br>
              <p>Course Description</p>
              <div class="coursedescription">
                <p>{{ course.description }}</p>
              </div>
            </div>
          </div>
          <div class="course-right">
            <div v-if="course.photos.length" v-for="photo in course.photos" :key="photo">
              <img :src="photo" alt="Course Photo" class="course-photo">
            </div>
            <div v-if="course.Price !== null && course.Price !== 0">
              <h3>Price: ${{ course.Price }}</h3>
              <button @click="proceedToPayment">Proceed to Payment</button>
            </div>
            <div v-else>
              <button @click="watchItNow">Watch it now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useRuntimeConfig } from '#imports';
  import { loadStripe } from '@stripe/stripe-js';
  
  const course = ref(null);
  const route = useRoute();
  const router = useRouter();
  const runtimeConfig = useRuntimeConfig();
  
  const fetchCourse = async () => {
    const courseId = route.params.id;
  
    try {
      const response = await fetch(`${runtimeConfig.public.apiBase}courses/${courseId}`);
      const data = await response.json();
      course.value = data;
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };
  
  const proceedToPayment = async () => {
    const stripe = await loadStripe('your_publishable_key_here');
  
    // Create a checkout session on the server
    const sessionResponse = await fetch(`${runtimeConfig.public.apiBase}payments/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productName: course.value.title,
        price: course.value.Price,
        successUrl: window.location.origin + '/success',
        failUrl: window.location.origin + '/cancel',
        quantity: 1,
      }),
    });
  
    const session = await sessionResponse.json();
  
    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    });
  
    if (error) {
      console.error('Error redirecting to checkout:', error);
    }
  };
  
  const watchItNow = () => {
    router.push(`/courses/${course.value._id}/watch`);
  };
  
  onMounted(async () => {
    await fetchCourse();
  });
  </script>
  
  <style scoped>
  .coursedetailswhole {
    display: flex;
    background-color: black;
    margin-top: 17vh;
    padding: 0px 5%;
    width: 100%;
  }
  .course-container {
    display: flex;
    justify-content: center;
    padding: 20px;
    border: 1px dotted white;
    color: white;
    flex-direction: row;
    width: 100%;
  }
  
  .course-left {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 5px;
    box-sizing: border-box;
    padding: 1em;
    border: 1px dotted white;
    width: 50%;
  }
  .coursedescription {
    padding: 4px;
    border: 1px dotted white;
    font-size: 1em;
    max-height: 45%;
    position: relative;
    overflow-y: auto;
    margin: 5px 0%;
  }
  
  .course-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1em;
    border: 1px dotted white;
    justify-content: flex-start;
    padding-top: 5%;
    text-align: center;
  }
  
  .course-details {
    border: 1px solid #ddd;
    padding: 20px;
    margin-bottom: 20px;
    font-size: 1em;
  }
  .course-info {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  
  .course-photo {
    max-width: 50%;
    height: auto;
  }
  
  .mediawrapper {
    margin-top: 10px;
    aspect-ratio: 16/9;
    width: 100%;
    overflow: hidden;
    border: 1px solid #ddd;
  }
  
  .categories {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .category {
    padding: 2px 8px;
    background-color: rgba(237, 48, 48, 0.6);
    border-radius: 1em;
    font-size: 0.8em;
  }
  
  button {
    padding: 10px 20px;
    margin-top: 20px;
    background-color: #4caf50;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #45a049;
  }
  .addedlayer {
    width: 85%;
  }
  </style>
  