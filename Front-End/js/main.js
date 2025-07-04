document.addEventListener('DOMContentLoaded', () => {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const body = document.body;

    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', () => {
            body.classList.toggle('nav-active');
        });
    }
});