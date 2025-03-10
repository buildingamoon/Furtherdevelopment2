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
                            <h1>Reset Password</h1>
                        </div>
                        <div class="alert alert-primary resetalert" role="alert">
                            Email verification success! You may reset your password below.
                        </div>
                        <div class='regiforminner part3'>
                            <div class="form-group">
                                <label>Password:</label>
                                <input v-model="password" type="password" class="form-control">
                            </div>
                            <div class="regiforminner form-group">
                                <label>Re-enter password:</label>
                                <input v-model="confirmPassword" type="password" class="form-control">
                            </div>
                            <br>
                            <button @click.prevent="resetpassword" type="submit" class="loginbtn btn-primary">Submit</button>
                            <br>
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
const route = useRoute();

const password = ref('');
const confirmPassword = ref('');
const token = route.query.token;

const resetpassword = async () => {
    if (!password.value || !confirmPassword.value) {
        alert('Please fill in all fields.');
        return;
    }
    
    if (password.value !== confirmPassword.value) {
        alert('Passwords do not match.');
        return;
    }

    if (password.value && token) {
        const { data, error } = await useFetch(runtimeConfig.public.apiBase + 'auth/reset-password', {
            method: "post",
            body: {
                "token": token,
                "newPassword": password.value
            }
        });

        if (data.value) {
            alert('Password Reset Successfully!');
            window.location.pathname = "/users/signin";
        } else if (error.value) {
            alert(error.value.data.message);
        }
    }
};
</script>
