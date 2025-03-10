<template>
    <div class="cart-container">
      <h1>Shopping Cart</h1>
      <div v-if="cartItems.length === 0">Your cart is empty</div>
      <div v-else>
        <div class="cart-item" v-for="(item, index) in cartItems" :key="index">
          <img :src="item.photo" alt="item.name" />
          <div class="cart-item-details">
            <h2>{{ item.name }}</h2>
            <p>Color: {{ item.color }}</p>
            <p>Size: {{ item.size }}</p>
            <p>Quantity: {{ item.quantity }}</p>
            <p>Price: {{ formatPrice(item.price) }}</p>
          </div>
        </div>
        <h2>Total: {{ formatPrice(totalPrice) }}</h2>
        <button @click="proceedToCheckout">Checkout</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        cartItems: []
      };
    },
    computed: {
      totalPrice() {
        return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      }
    },
    methods: {
      formatPrice(price) {
        return `$${(price / 100).toFixed(2)}`;
      },
      proceedToCheckout() {
        // Logic for proceeding to Stripe checkout goes here
      }
    },
    mounted() {
      // Fetch the cart items from the backend or local storage
      this.cartItems = [
        {
          photo: 'path/to/photo1.jpg',
          name: 'Item 1',
          color: 'Red',
          size: 'M',
          quantity: 2,
          price: 1500 // Price in cents
        },
        {
          photo: 'path/to/photo2.jpg',
          name: 'Item 2',
          color: 'Blue',
          size: 'L',
          quantity: 1,
          price: 2500 // Price in cents
        }
      ];
    }
  };
  </script>
  
  <style scoped>
  .cart-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .cart-item {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .cart-item img {
    width: 100px;
    height: 100px;
    margin-right: 20px;
  }
  
  .cart-item-details {
    flex-grow: 1;
  }
  </style>
  