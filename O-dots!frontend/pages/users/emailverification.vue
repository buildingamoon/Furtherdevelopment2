<template>
    <div>
        <main class="register">
            <section class="login">
                <div class="container">
                    <div class="regformuouter">
                        <div class='verifyemail regiforminner part1'>
                            
                            <img src="/public/picture/logonobg.png">
                            
                            <div class='verifyemailtext col-md-12 text-center'>
			                       <p>E-mail verification is in progress</p>
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
    const route=useRoute();


    console.log(route.query.token);

    const verifyemail= async()=>{



    const  { data,error }  = await useFetch(runtimeConfig.public.apiBase+'auth/verify-email?token='+route.query.token);


    if(data.value) {
        alert('Registration Success. You can log in to the account now')
        window.location.href='/users/signin';
    }
    else if(error.value){
        alert(error.value.data.message);
    }

    }

    if(route.query.token){
        verifyemail();
    }


</script>