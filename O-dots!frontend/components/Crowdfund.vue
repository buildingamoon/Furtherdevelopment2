<template>
  <main class="card-container">
    <Swiper
    :breakpoints="{
        0: {
          slidesPerView: 3,
          spaceBetween: 10
        },
        602: {
          slidesPerView: 3,
          spaceBetween: 10
        },
        768: {
          slidesPerView: 4,
          spaceBetween: 20
        },
        1024: {
          slidesPerView: 4,
          spaceBetween: 30
        }
      }"
      navigation
      mousewheel
      class="mySwiper"
    >
      <SwiperSlide v-for="(image, index) in images" :key="index" class="Sliderwrap">
        <div class="card">
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
.card-container {
  width: 100%;
  height:60vh;
  margin: auto;
  background:rgba(277,277,277,0);
  position: relative;
  min-height: 59vh;
}
.swiper-slide{
  height:70vh;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.253);
  justify-content: center;
  color: white;
  height: 70vh;
  padding: 0vh 0vh;
}

.mySwiper img {
  width: 45vh;
  height: 40vh;
  background:rgba(0, 0, 0, 0.171);
}

.mySwiper {
  width: 90%;
  height: 60vh;
  background:rgba(277,277,277,0);
  color:white;
  font-weight:500;
  font-size:1.5em;
  height: 75vh;
  padding: 0vh 0vh;
}

.Sliderwrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height:60vh;
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

@media (max-width: 600px) {
  .card-container {
    height: 11vh;
    min-height: 0vh;
}
.Sliderwrap {
    height: 23vh;
}
.mySwiper {
    width: 90%;
    height: 60vh;
    background: rgba(277, 277, 277, 0);
    color: white;
    font-weight: 500;
    font-size: 1.5em;
    height: 26vh;
    padding: 0vh 0vh;
}
}
</style>
