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
          <h3>Title: {{ course.title }}</h3>
          <div class="course-info">
            <div class="tutor">Tutor: {{ course.tutor }}</div>
            <div class="categories">
              <span v-for="category in course.categories" :key="category" class="category">
                {{ category }}
              </span>
            </div>
          </div>
          <div class="toname">
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
            <h3>Price: ${{ formatPrice(course.Price) }}</h3>
            <button @click="redirectToStripe">Buy it now</button>
          </div>
          <div v-else>
            <button @click="watchItNow">Watch it now</button>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <h2>Course not found</h2>
      <p>We couldn't find the course you're looking for. Please check the URL or try again later.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loadStripe } from '@stripe/stripe-js';
import { useRuntimeConfig } from '#imports';
import { useSession } from '@/composables/state';

const session = useSession();
const userData = ref({});
const route = useRoute();
const router = useRouter();

const name = ref('');
const email = ref('');
const course = ref(null); // Initialize course as a reactive reference
const runtimeConfig = useRuntimeConfig();

const fetchUserProfile = async () => {
    try {
        const token = localStorage.getItem('token');
        console.log('Token:', token); // Log the token
        if (!token) {
            throw new Error('No token available');
        }
        const response = await fetch(runtimeConfig.public.apiBase + 'auth/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Include token if needed
            },
        });

        const data = await response.json(); // Store user data
        console.log('Fetched user profile data:', data); // Log the fetched data

        userData.value = data;
        if (data) {
            name.value = data.user.name; // Update reactive reference
            email.value = data.user.email; // Update reactive reference
            console.log('Name after fetch:', name.value); // Log the name
            console.log('Email after fetch:', email.value); // Log the email
        } else {
            console.error('No user data found');
        }

    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
};

const course_id = ref('');
const courseId = ref(route.params.id);

const redirectToStripe = async () => {
  try {
    console.log('Redirecting to Stripe...');
    console.log('Email before request:', email.value); // Log the email before request
    console.log('Name before request:', name.value);   // Log the name before request
    console.log('Course ID before request:', courseId.value); // Log the course ID before request

    // Ensure course_id is updated with courseId.value
    course_id.value = courseId.value;

    // Create customer and await the response
    const response = await fetch(`${runtimeConfig.public.apiBase}payments/create-customer`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Include token if needed
      },
      body: JSON.stringify({
        email: email.value,
        name: name.value,
        course_id: course_id.value, // Use course_id.value
      })
    });

    const customerData = await response.json();
    if (!response.ok) {
      throw new Error('Error creating customer: ' + (customerData.message || response.statusText));
    }

    console.log('Customer created:', customerData); // Log the customer data

    // Proceed to create checkout session only if customer creation was successful
    const checkoutResponse = await fetch(`${runtimeConfig.public.apiBase}payments/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productName: course.value.title,
        price: course.value.Price,
        quantity: 1,
        email: email.value, // Include email
        name: name.value,   // Include name
        course_id: course_id.value, // Use course_id.value
        successUrl: "https://o-dots.com/payments/success?session_id={CHECKOUT_SESSION_ID}",
        failUrl: "https://o-dots.com/payments/fail",
      })
    });

    const checkoutSessionData = await checkoutResponse.json();
    if (!checkoutSessionData.id) {
      throw new Error('No session ID returned from API');
    }

    console.log('Checkout session created:', checkoutSessionData); // Log the checkout session data

    const stripe = await loadStripe(runtimeConfig.public.stripePubishKey);
    await stripe.redirectToCheckout({ sessionId: checkoutSessionData.id });
  } catch (error) {
    console.error('Error redirecting to Stripe:', error);
  }
};

const watchItNow = () => {
  router.push(`/courses/${course.value._id}/watch`);
};

const fetchCourse = async () => {
  const courseId = route.params.id;

  try {
    const response = await fetch(`${runtimeConfig.public.apiBase}courses/${courseId}`);
    if (!response.ok) {
      throw new Error(`Error fetching course details: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    course.value = data;
    console.log('Fetched course data:', course.value); // Log the course data
  } catch (error) {
    console.error('Error fetching course details:', error);
    course.value = null;
  }
};

onMounted(async () => {
  await fetchUserProfile();
  await fetchCourse();
});
</script>



<style scoped>
.coursedetailswhole{
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
    width: 150vh;
    overflow: hidden;
    height: 150vh;
}
.course-left{
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 5px;
    box-sizing: border-box;
    padding: 1em;
    border: 1px dotted white;
    width: 50%;
    overflow: hidden;
    height: 157%;
}
.coursedescription {
  padding: 4px;
  border: 1px dotted white;
  font-size: 1em;
  position: relative;
  overflow-y: auto;
  margin: 5px 0%;
  flex:1;
  height: 275%;
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
.mediawrapper{
    margin-top: 10px;
    aspect-ratio: 16 / 9;
    width: 100%;
    overflow: hidden;
    border: 1px solid #ddd;
    height: 487px;
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
  background-color: #d9d927e0;
  color: white;
  cursor: pointer;
  font-size:1em;
  border-radius:5px;
}
button:hover {
  background-color:#F2F5D2;
  color:black;
  border:white;
}
.addedlayer {
  width: 85%;
}
.course-left h3{
  text-align: center;
    color: #d9d927e0;
    font-size: 1.3em;
}

@media(max-width:600px){
  .coursedetailswhole{
    display: flex;
    background-color: black;
    margin-top: 17vh;
    width: 100%;
}
.course-container{
    display: flex;
    justify-content: center;
    padding: 3px;
    border: 1px dotted white;
    color: white;
    flex-direction: row;
    width: 100%;
    overflow: hidden;
    height: 73vh;
}
.course-left{
    flex: 6;
    display: flex;
    flex-direction: column;
    gap: 5px;
    box-sizing: border-box;
    padding: 1em;
    border: 1px dotted white;
    width: 50%;
    overflow: hidden;
    height: 73vh;
}
.course-right h3{
  font-size:1em;
}
.mediawrapper{
    margin-top: 10px;
    aspect-ratio: 16 / 9;
    width: 100%;
    overflow: hidden;
    border: 1px solid #ddd;
    height: 150px;
    flex: 4;
}
.course-left h3{
    font-size: 1em;
    color:#d9d927e0;
    text-align:center;
}
.course-info{
    font-size: 0.8em;
}
.toname{

    height: 40%;
}
.toname p{
  font-size: 0.8em;
}
.coursedescription{
    padding: 4px;
    border: 1px dotted white;
    font-size: 0.8em;
    height: 57%;
    position: relative;
    overflow-y: auto;
    margin: 5px 0%;
    overflow-x: hidden;
}
button {
  font-size:0.8em;
}
}
</style>


