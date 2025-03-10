<template>
    <Mainheader />
    <div class="paymentfail">
        <div class='failnotice'>
            <img class='failnoticelogo' src="/public/picture/logowordbg.png" />
            <h1>Payment failed... <img src='/public/picture/cry.png' class=failimg></h1>
            <p>Please try again later. If the problem persists, please contact us @ <a href="mailto:hello@o-dots.com">hello@o-dots.com</a></p>
        </div>
    </div>
  </template>
  
 
  <style>
  .paymentfail {
    height: 90vh;
    width: 100%;
    padding: 0;
  }
  
  .paymentfail a {
    text-decoration: none;
    color: orange;
    font-size: 1.5em;
    font-weight: 600;
  }
  .failnoticelogo{
    height:10vh;
  }
  .secondnav{
    display:none;
  }
  .failnotice{
    margin-top: 8%;
    padding: 5%;
  }
  .failimg{
    height:3vh;
  }

  @media (max-width: 600px){
    .paymentfail{
    margin-top: 20%;
    }
    .failnotice {
    margin-top: 20%;
    padding: 5%;
}
.failnotice img{
    height:5vh;
  }
  }
  </style>
  