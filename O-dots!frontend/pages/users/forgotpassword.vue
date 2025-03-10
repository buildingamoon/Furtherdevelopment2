<template>
    <div>
      <main class="register">
        <section class="login">
          <div class="container">
            <div class="regformuouter">
              <div class='regiforminner part1'>
                <img src="/public/picture/logonobg.png">
                <div class="alert alert-primary regiforminner" role="alert">
                  <br>
                  <br>
                </div>
              </div>
              <br>
              <div class='part2'>
                <h1>Forgot password</h1>
              </div>
              <div class='regiforminner part3'>
                <div class="form-group">
                  <label>E-mail:</label>
                  <input v-model="email" type="email" class="form-control">
                  <div class="alert alert-primary forgetpasswordalert" role="alert">
                    We’ll send a verification code to this email <br>
                         if it matches an existing account.
                  </div>
                  <button @click.prevent="forgotpassword" type="submit" class="forgetpasswordbtn btn-primary">Submit</button>
                  <br>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRuntimeConfig, useRoute, useFetch, useSession } from '#imports';
  
  const runtimeConfig = useRuntimeConfig();
  const email = ref('');
  const session = useSession();
  
  const forgotpassword = async () => {
    console.log('Forgot password email:', email.value); // Debug log
    const { data, error } = await useFetch(runtimeConfig.public.apiBase + 'auth/forgot-password', {
      method: "post",
      body: {
        "email": email.value
      }
    });
  
    if (data.value) {
      alert('Please set your email to reset your password!');
      useSetSession(data.value);
      window.location.pathname = "/";
    } else if (error.value) {
      console.error('Error in forgotpassword:', error.value); // Debug log
      alert(error.value.data.message);
    }
  };
  </script>
  