/* loader */
$(document).ready(function() {
    var loading = gsap.timeline();
    loading.fromTo(".loaderwrap", 0.2, {
        autoAlpha: 0
    }, {
        autoAlpha: 1
    }).fromTo([".eyesloader"], 0.2, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        ease: "power1.inOut"
    }).fromTo([".eyesloader"], 0.7, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        ease: "power2.inOut"
    }).to(".loader", 0.5, {
        y: '-100%'
    }).fromTo(["header",".page1"], 1, {
        autoAlpha: 0
    }, {
        autoAlpha: 1
    });
});

$(document).ready(function() {

    // Handle menu item click
    $(".secondnav a").click(function(event) {
        event.preventDefault();
        var targetPage = $(this).data("target");
        
        $(".page").removeClass("active"); // Hide all pages
        $("." + targetPage).addClass("active"); // Show the target page
    });
});



//
$(document).ready(function() {
    var loading = gsap.timeline();
    loading.fromTo(".loaderwrap", 0.2, {
        autoAlpha: 0
    }, {
        autoAlpha: 1
    }).fromTo([".eyesloader"], 0.2, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        ease: "power1.inOut"
    }).fromTo([".eyesloader"], 0.7, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        ease: "power2.inOut"
    }).to(".loader", 0.5, {
        y: '-100%'
    }).fromTo(["header", ".page1"], 1, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        onComplete: function() {
            $(".page").not(".page1").removeClass("active"); // Ensure only page1 is active
        }
    });

    // Handle menu item click
    $(".secondnav a").click(function(event) {
        event.preventDefault();
        var targetPage = $(this).data("target");
        
        $(".page").removeClass("active"); // Hide all pages
        $("." + targetPage).addClass("active"); // Show the target page
        
        if (targetPage === 'page3') {
            animateBalls(); // Start animating balls on page3
        }
    });

    function animateBalls() {
        $('.ball').each(function() {
            var ball = $(this);
            ball.on('mouseenter', function() {
                gsap.killTweensOf(ball); // Stop the animation when hovered
            });
            ball.on('mouseleave', function() {
                moveBall(ball); // Resume the animation when not hovered
            });
            moveBall(ball); // Start the initial animation
        });
    }

    function moveBall(ball) {
        var ballSize = ball.width();
        var newX, newY;
        var tries = 0;
        var maxTries = 100;

        // Try to find a non-overlapping position
        do {
            newX = Math.random() * (window.innerWidth - ballSize);
            newY = Math.random() * (window.innerHeight - ballSize);
            var overlapping = false;

            $('.ball').each(function() {
                if (this !== ball[0]) { // Don't check itself
                    var otherBall = $(this);
                    var otherBallX = otherBall.offset().left;
                    var otherBallY = otherBall.offset().top;
                    if (Math.abs(newX - otherBallX) < ballSize && Math.abs(newY - otherBallY) < ballSize) {
                        overlapping = true;
                        return false; // Exit loop early
                    }
                }
            });

            tries++;
        } while (overlapping && tries < maxTries);

        gsap.to(ball, {
            duration: Math.random() * 5 + 1, // Random duration between 1 to 6 seconds
            x: newX,
            y: newY,
            ease: "power1.inOut",
            onComplete: function() {
                moveBall(ball); // Repeat the animation
            }
        });
    }
});

//singleblog

function animateText(element, delay) {
    const words = element.innerHTML.split(' ');
    element.innerHTML = '';
    words.forEach((word, index) => {
        const span = document.createElement('span');
        span.innerHTML = word + '&nbsp;'; // Add a non-breaking space after each word
        span.className = 'animated-word';
        element.appendChild(span);
        setTimeout(() => {
            span.style.opacity = '1';
            span.style.transform = 'translateY(0)';
        }, index * delay);
    });
    
    setTimeout(() => {
        document.getElementById('scroll-arrow').style.opacity = '1';
    }, words.length * delay + 50); // Adjust delay to wait for all words to finish
}



window.addEventListener('load', () => {
    const title = document.getElementById('title');
    animateText(title, 300); // Adjust delay as needed
});

document.getElementById('scroll-arrow').addEventListener('click', function() {
    document.getElementById('cover').classList.add('hidden');
    document.getElementById('content').classList.add('active');
    setTimeout(() => {
        document.getElementById('cover').classList.add('permanently-hidden');
    }, 500); // Delay to ensure the transition completes
});

window.addEventListener('scroll', function() {
    if (!document.getElementById('cover').classList.contains('permanently-hidden')) {
        if (window.scrollY > 100) {
            document.getElementById('cover').classList.add('hidden');
            document.getElementById('content').classList.add('active');
            setTimeout(() => {
                document.getElementById('cover').classList.add('permanently-hidden');
            }, 500); // Delay to ensure the transition completes
        }
    }
});


function updateContent(category) { 
document.querySelector('.lower .box2').innerHTML = `<p>Subtitles for ${category}</p>`;}










