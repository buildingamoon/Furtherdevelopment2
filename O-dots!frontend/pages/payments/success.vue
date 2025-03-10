<template>
    <Mainheader />
    <div class="paymentsucess">
      <div v-if="loading">
        <h1>Processing your payment....</h1>
      </div>
      <div class='successnotice' v-else-if="paymentStatus === 'success'">
        <img src="/public/picture/logowordbg.png" />
        <h1>Payment Success!</h1>
        Name: {{ sessionDetails.metadata.name }}
        <br />
        Items purchased: {{ sessionDetails.metadata.productName }}
        <br />
        Price(HKD): {{ formatPrice(sessionDetails.metadata.price) }}
        <br />
        Reference ID: {{ sessionDetails.metadata.bookingid }}
        <h3>
          Start your journey now. Your subscription could be found
          <a href="https://o-dots.com/courses/mycourses">HERE</a><br>
        </h3>
        <p>Enjoy Playing and Learning with O-dots!</p>
      </div>
    </div>
  </template>
  
  <script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRuntimeConfig } from '#imports'; // Corrected import
import { formatPrice } from '~/composables/globalfunction'; // Import the formatPrice function

const loading = ref(true);
const sessionDetails = ref(null);
const paymentStatus = ref(null);

const { query } = useRoute();
const sessionId = query.session_id;

const runtimeConfig = useRuntimeConfig();

const fetchSessionDetails = async () => {
  try {
    if (sessionId) {
      const response = await fetch(runtimeConfig.public.apiBase + `/payments/session-details?sessionId=${sessionId}`);
      const data = await response.json();

      sessionDetails.value = data.session;
      paymentStatus.value = data.paymentStatus;
    }
  } catch (error) {
    console.error('Error fetching session details:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchSessionDetails();
});
</script>

  
  <style>
  .paymentsucess {
    height: 90vh;
    width: 100%;
    padding: 0;
  }
  
  .paymentsucess a {
    text-decoration: none;
    color: orange;
    font-size: 1.5em;
    font-weight: 600;
  }
  .paymentsucess img{
    height:10vh;
  }
  .secondnav{
    display:none;
  }
  .successnotice{
    margin-top: 8%;
    padding: 5%;
  }

  @media (max-width: 600px){
    .paymentsucess{
    margin-top: 20%;
    }
    .successnotice {
    margin-top: 20%;
    padding: 5%;
}
.successnotice img{
    height:5vh;
  }
  }
  </style>
  