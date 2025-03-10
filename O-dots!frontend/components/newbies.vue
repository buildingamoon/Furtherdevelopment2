<template>
  <main class="card-container card-container2 ">
    <Swiper
    :breakpoints="{
        602: {
          slidesPerView: 6,
          spaceBetween: 10
        },
        768: {
          slidesPerView: 6,
          spaceBetween: 20
        },
        1024: {
          slidesPerView: 6,
          spaceBetween: 30
        }
      }"
      mousewheel
      class="mySwiper2"
    >
      <SwiperSlide v-for="(image, index) in images" :key="index" class="Sliderwrap2">
        <div class="card2">
          <a>hi</a>
          <img :src="image.src" :alt="image.alt">
        </div>
      </SwiperSlide>
    </Swiper>
  </main>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/swiper-bundle.css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/mousewheel';

const images = [
  { src: '/public/picture/ADDBG.png', alt: 'Image 1' },
  { src: '/public/picture/cry.png', alt: 'Image 2' },
  { src: '/public/picture/ADDBG.png', alt: 'Image 3' },
  { src: '/public/picture/cry.png', alt: 'Image 4' },
  { src: '/public/picture/cry.png', alt: 'Image 5' },
  { src: '/public/picture/cry.png', alt: 'Image 6' },
];
</script>

<style>
.card-container2 {
  width: 100%;
  height:40vh;
  margin: auto;
  background:rgba(277,277,277,0);
  position: relative;
  min-height: 40vh;
}
.swiper-slide2{
  height:40vh;
}

.card2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.253);
  justify-content: center;
  color: white;
  height: 40vh;
  padding: 0vh 0vh;
}

.mySwiper2 img {
  width: 45vh;
  height: 35vh;
  background:rgba(0, 0, 0, 0.171);
}

.mySwiper2 {
  width: 90%;
  height: 60vh;
  background:rgba(277,277,277,0);
  color:white;
  font-weight:500;
  font-size:1.5em;
  height: 40vh;
  padding: 0vh 0vh;
}

.Sliderwrap2 {
  display: flex;
  justify-content: center;
  align-items: center;
  height:40vh;
  background:rgba(277,277,277,0.3);
  position:relative;
  overflow:hidden;
  
}
.swiper-button-prev{
  /*opacity: 0;*/
  color: yellow;
  size:2vh;
}
.swiper-button-next{
  /*opacity: 0;*/
  color: yellow;
  size:2vh;
}
</style>
