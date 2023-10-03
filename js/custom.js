$(function() {

    const container = document.querySelector('.backToTop');

    const handleScroll = () => {
        // Number of pixels currently scrolled vertically
        const scrollTop = window.scrollY;
        // Determine whether or not to show our 'Back to Top' button
        container.style.display = scrollTop > 100 ? 'block' : 'none';
    };
    
    // Attach an on-scroll listener
    $(window).on('scroll', handleScroll);

    // Attach an on-click listener to animate the page moving back to the top
    $(".backToTopBtn").on('click', function() { $("HTML, BODY").animate({ scrollTop: 0 }, 1000); }); 
});