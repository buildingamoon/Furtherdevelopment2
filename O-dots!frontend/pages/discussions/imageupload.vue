<template>

   <div>

              {{ uploadedImages }}

       

               <div v-for="(image, index) in uploadedImages" :key="index" >

                   <img v-if="image"  :src="image" >



                   <div>

                    

            

                           <label :for="`upload${index}`" >

                                   <span >上傳圖片 (1張) </span>

                                   <p>(相片最大為2MB)</p>

                           </label>



                           <input type="file"   @change="(e) => uploadImage(e, index)"  :name="`upload${index}`" :id="`upload${index}`">

                           <p v-if='uploading[index]'>上傳中...</p>

                    



                           <button   @click="removeImage(index)">刪除相片</button>

                  

                   </div>

               </div>



               <br>

               <button   @click="addImageUploadField">增加更多圖片</button>

    

 

   </div>

</template>



<script setup>



const runtimeConfig = useRuntimeConfig();

const route = useRoute();

const user = getUser();



let uploading = ref([false]);

let uploadedImages = ref([null]);



function validateFile(file) {

     // Validate file type

     const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif'];

     if (!allowedFileTypes.includes(file.type)) {

       alert('無效的檔案類型。只允許上傳JPEG、PNG和GIF圖像');

       return false;

     }



     // Validate file size (e.g., 5 MB limit)

     const maxSizeInMB = 2;

     const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

     if (file.size > maxSizeInBytes) {

       alert(`檔案大小過大。最大允許大小為${maxSizeInMB} MB`);

       return false;

     }



     // If file passes all validation checks

     return true;

}







async function uploadImage(e, index) {



   const file = e.target.files[0];

       if (!file) return;



     if (validateFile(e.target.files[0])) {





         const formData = new FormData();

         formData.append('image', file);



       uploading.value[index] = true;





         try {

           const response = await useFetch(runtimeConfig.public.apiBase + 'courses/imageupload/', {

             "method": "post",

             "body": formData,

             "headers": {

                 "Authorization": "Bearer " + user?.accessToken

              }

           });

           uploadedImages.value[index] = response.data.value.url;

           uploading.value[index] = false;

          

         } catch (error) {

           console.error('Error uploading image:', error);

           uploading.value[index] = false;

         }



     } else {

         // alert('Error! Only JPEG, PNG, and GIF images are allowed. Maximum allowed size is 2MB.');

     }



}

   function removeImage(index) {

       uploadedImages.value.splice(index, 1);

       uploading.value.splice(index, 1);

   }



   function addImageUploadField() {

       uploadedImages.value.push(null);

       uploading.value.push(false);

   }



</script>