<template>
  <div class="swiper-container">
    <div class="swiper-wrapper">
      <router-link v-for="(item, index) in items" :key="index" :to="`/courses/${item.course_id._id}/watch`" class="swiper-slide router-link-item">
        <img :src="item.course_id && item.course_id.photos && item.course_id.photos.length ? item.course_id.photos[0] : '/public/picture/inner.png'" alt="Product Photo">
        <h3>{{ item.productName }}</h3>
      </router-link>
    </div>
    <div class="swiper-pagination"></div>
  </div>
</template>


<script>
import Swiper from 'swiper/bundle';
import 'swiper/swiper-bundle.css';
import { watch, onMounted } from 'vue';

export default {
  name: 'Swipercarouselsub',
  props: {
    items: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  setup(props) {
    const initializeSwiper = () => {
      new Swiper('.swiper-container', {
        loop: true,
        grabCursor: true,
        spaceBetween: 10,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
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
            slidesPerView: 5,
          },
        },
      });
    };

    watch(() => props.items, (newItems) => {
      if (newItems.length > 0) {
        initializeSwiper();
      }
    });

    onMounted(() => {
      if (props.items.length > 0) {
        initializeSwiper();
      }
    });
  }
};

</script>

<style scoped>
.swiper-container {
  width: 100%;
  height: 96%;
}
.swiper-slide {
  display: flex;
  flex-direction: column;
  text-align: center;
  font-size: 0.7em;
  background: rgba(200, 196, 196, 0.4);
  justify-content: center;
  align-items: center;
  text-decoration: none;
  height: 145px;
  padding: vh 0vh;
  color: white;
  border-radius: 5px;
  overflow: hidden;
}
.swiper-slide img {
  width: 100%;
  height: 150px;
}
.swiper-slide h3 {
  color: inherit; /* Inherit text color from parent */
}
.swiper-slide > router-link {
  background:red;
}
.swiper-pagination-bullet-active{
  color: white;
  font-size: 0.5em;
}

</style>
