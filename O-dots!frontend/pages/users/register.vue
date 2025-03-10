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
                        <div class='part2'>
                            <h1>Register</h1>
                        </div>
                        <div class='regiforminner part3'>
                            <div class="form-group">
                                <label>E-mail:</label>
                                <input v-model="email" type="email" class="form-control">
                            </div>
                            <div class="regiforminner form-group">
                                <label>Name:</label>
                                <input v-model="name" type="name" class="form-control">
                            </div>
                            <div class="regiforminner form-group">
                                <label>Password:</label>
                                <input v-model="password" type="password" class="form-control">
                            </div>
                            <small id="emailHelp" class="regiforminner form-text text-muted">By clicking Agree & Join or Continue, you agree to the O-dots! User Agreement, Privacy Policy, and Cookie Policy. <a href='#'>Terms and conditions</a></small>
                            <br><br>
                            <button @click.prevent="register" type="submit" class="btn btn-primary">Agree & Register</button>
                            <br>
                            <div class="alert alert-primary regiforminner" role="alert">
                                Already on O-dots!? <a href='/users/signin'>Login Now</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup>
    const runtimeConfig = useRuntimeConfig();
    const route = useRoute();

    const email = ref('');
    const name = ref('');
    const password = ref('');

    const register = async () => {
        const { data, error } = await useFetch(runtimeConfig.public.apiBase + 'auth/register', {
            method: "post",
            body: {
                "email": email.value,
                "password": password.value,
                "name":name.value
            }
        });

        if (data.value) {
            alert('Please check your inbox to verify the email for account registration.');
            window.location.href = '/';
        } else if (error.value) {
            if (error.value.data.message.indexOf("users index: email_1 dup key") != -1) {
                alert("This email has already been registered.");
            } else if (error.value.data.message.indexOf("password: Minimum length is") != -1) {
                alert("Password must meet the minimum length requirement.");
            } else if (error.value.data.message.indexOf("Please fill in all fields") != -1) {
                alert("Please fill in all fields.");
            } else {
                alert(error.value.data.message);
            }
        }
    };
</script>

<style>
    a{
        text-decoration: none;
        color: gray;
    }
    .register{
        background: black;
    }
</style>
