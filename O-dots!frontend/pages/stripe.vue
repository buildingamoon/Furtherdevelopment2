<template>
    <div>
        <button  @click.prevent="redirectToStripe" > Pay </button>
    </div>
 </template>
 
 
 <script setup>
 
 
    import { loadStripe } from '@stripe/stripe-js';
 
 
    const runtimeConfig = useRuntimeConfig();
 
 
 
 
    const redirectToStripe = async () => {
 
 
 
 
 
 
      const response = await fetch(runtimeConfig.public.apiBase + '/payments/create-checkout-session', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
      
          body: JSON.stringify({
 
 
            productName: 'Some Name',
            price: 1000,
            quantity: 1,
            successUrl: "https://o-dots.com/payments/success?session_id={CHECKOUT_SESSION_ID}",
            failUrl: "https://o-dots.com/payments/fail",
     
          })
      });
 
      const data = await response.json();
     
      // const stripe = await loadStripe(runtimeConfig.public.stripeTestKey);
      const stripe = await loadStripe(runtimeConfig.public.stripePubishKey);
      await stripe.redirectToCheckout({ sessionId: data.id });
 
    }
 </script>
 