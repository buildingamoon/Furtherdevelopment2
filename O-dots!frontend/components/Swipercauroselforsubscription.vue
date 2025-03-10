<template>
    <div class="swiper-container">
      <div class="swiper-wrapper">
        <div v-for="(item, index) in items" :key="index" class="swiper-slide">
          <img :src="item.course_id?.photos?.[0] || '/public/picture/inner.png'" alt="Product Photo">
          <h3>{{ item.productName }}</h3>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { onMounted} from 'vue';
  import Swiper from 'swiper/bundle';
  import 'swiper/swiper-bundle.css';
  
  export default {
  name: 'Swipercaurouselforsubscription',
  setup() {
    onMounted(() => {
      new Swiper('.swiper-container', {
        loop: true,
        grabCursor: true,
        spaceBetween: 30,
        keyboard: {
          enabled: true,
        },
        mousewheel: {
          thresholdDelta: 70,
        },
        breakpoints: {
          0: {
            slidesPerView: 3,
          },
          780: {
            slidesPerView: 3,
          },
          1200: {
            slidesPerView: 8,
          },
        },
      });
    });
  },
};
  </script>
  
  <style scoped>
  :root {
  --swiper-pagination-bullet-size: 1.5rem;
  --swiper-pagination-bullet-width: 1.5rem;
  --swiper-pagination-bullet-height: 0.25rem;
  --swiper-pagination-color: yellow;
  --swiper-pagination-bullet-inactive-color: #CCC200;
  --swiper-pagination-bullet-opacity: 1;
  --swiper-pagination-bullet-inactive-opacity: 0.2;
}
  .swiper-container {
    width: 100%;
    height: 100%;
  }
  .swiper-slide {
    display: flex;
    flex-direction: column;
    text-align: center;
    font-size: 18px;
    background: #fff;
    justify-content: center;
    align-items: center;
  }
  .swiper-slide img {
    width: 100%;
    height: 150px;
  }
  </style>
  