document.addEventListener('DOMContentLoaded', function() {
    const readMoreBtns = document.querySelectorAll('.read-more-btn');

    readMoreBtns.forEach(btn => {
        // Correctly selects the text wrapper relative to the button
        const textWrapper = btn.previousElementSibling; 
        const textContent = textWrapper.querySelector('.quote-card-text');

        // Check if the content is taller than the wrapper's collapsed height
        if (textContent.scrollHeight > textWrapper.clientHeight) {
            btn.style.display = 'block'; // Ensure the button is visible
            textWrapper.classList.add('is-truncated'); // Add class to apply the fade
        } else {
            btn.style.display = 'none'; // Hide button if not needed
        }

        btn.addEventListener('click', () => {
            const isExpanded = textWrapper.classList.contains('expanded');
            textWrapper.classList.toggle('expanded');
            btn.textContent = isExpanded ? 'Read More' : 'Read Less';
        });
    });
});