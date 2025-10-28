document.addEventListener('DOMContentLoaded', () => {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const body = document.body;

    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', () => {
            body.classList.toggle('nav-active');
        });
    }

    // Carousel functionality
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length > 0) {
        const dotsContainer = document.querySelector('.carousel-dots');
        const prevButton = document.querySelector('.carousel-control.prev');
        const nextButton = document.querySelector('.carousel-control.next');
        let currentSlide = 0;
        let slideInterval;

        const showSlide = (index) => {
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
                if (i === index) {
                    slide.classList.add('active');
                }
            });
            document.querySelector('.carousel-slides').style.transform = `translateX(-${index * 100}%)`;
            updateDots(index);
        };

        const nextSlide = () => {
            currentSlide = (currentSlide < slides.length - 1) ? currentSlide + 1 : 0;
            showSlide(currentSlide);
        };

        const startSlideShow = () => {
            // To change speed, adjust the '7000'. (e.g., 5000 for 5s, 10000 for 10s)
            slideInterval = setInterval(nextSlide, 7000);
        };

        const stopSlideShow = () => {
            clearInterval(slideInterval);
        };
        
        const updateDots = (index) => {
            const dots = document.querySelectorAll('.dot');
            dots.forEach((dot, i) => {
                dot.classList.remove('active');
                if (i === index) {
                    dot.classList.add('active');
                }
            });
        };
        
        const createDots = () => {
            slides.forEach((_, i) => {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    stopSlideShow(); // Stop autoplay on interaction
                    showSlide(i);
                    currentSlide = i;
                    startSlideShow(); // Restart autoplay
                });
                dotsContainer.appendChild(dot);
            });
        };

        prevButton.addEventListener('click', () => {
            stopSlideShow(); // Stop autoplay on interaction
            currentSlide = (currentSlide > 0) ? currentSlide - 1 : slides.length - 1;
            showSlide(currentSlide);
            startSlideShow(); // Restart autoplay
        });

        nextButton.addEventListener('click', () => {
            stopSlideShow(); // Stop autoplay on interaction
            nextSlide();
            startSlideShow(); // Restart autoplay
        });
        
        createDots();
        showSlide(0);
        startSlideShow(); // Start the slideshow automatically
    }
});

/*
 * ===============================================
 * Accordion Script
 * ===============================================
 */
document.addEventListener('DOMContentLoaded', function () {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            // Toggle the 'active' class on the clicked header
            this.classList.toggle('active');

            // Get the content panel that is the next element
            const content = this.nextElementSibling;

            // If the panel is open, close it. If it's closed, open it.
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            } 
        });
    });
});