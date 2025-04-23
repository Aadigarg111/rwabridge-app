document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('nav');
    const ctaButtons = document.querySelector('.cta-buttons');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            nav.style.display = nav.style.display === 'block' ? 'none' : 'block';
            ctaButtons.style.display = ctaButtons.style.display === 'flex' ? 'none' : 'flex';
        });
    }
    
    // Tab Functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding tab pane
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for header height
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Scroll Animation for Elements
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.value-card, .process-step, .category, .feature');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.classList.add('animate');
            }
        });
    };
    
    // Add animation class to CSS
    const style = document.createElement('style');
    style.innerHTML = `
        .value-card, .process-step, .category, .feature {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .value-card.animate, .process-step.animate, .category.animate, .feature.animate {
            opacity: 1;
            transform: translateY(0);
        }
        
        .process-step:nth-child(2), .value-card:nth-child(2), .category:nth-child(2), .feature:nth-child(2) {
            transition-delay: 0.2s;
        }
        
        .process-step:nth-child(3), .value-card:nth-child(3), .category:nth-child(3), .feature:nth-child(3) {
            transition-delay: 0.4s;
        }
        
        .process-step:nth-child(4), .value-card:nth-child(4), .category:nth-child(4), .feature:nth-child(4) {
            transition-delay: 0.6s;
        }
        
        .process-step:nth-child(5), .value-card:nth-child(5), .category:nth-child(5) {
            transition-delay: 0.8s;
        }
        
        /* Gradient text effect for headings */
        .gradient-text {
            background: linear-gradient(90deg, #9945FF, #14F195);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            display: inline-block;
        }
        
        /* Animated background gradient */
        .animated-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, rgba(153, 69, 255, 0.05), rgba(20, 241, 149, 0.05), rgba(253, 132, 213, 0.05));
            background-size: 400% 400%;
            animation: gradientBG 15s ease infinite;
            z-index: 0;
        }
        
        @keyframes gradientBG {
            0% {
                background-position: 0% 50%;
            }
            50% {
                background-position: 100% 50%;
            }
            100% {
                background-position: 0% 50%;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add animated background to sections
    document.querySelectorAll('section').forEach(section => {
        const animatedBg = document.createElement('div');
        animatedBg.className = 'animated-bg';
        section.appendChild(animatedBg);
    });
    
    // Add gradient text effect to some headings
    document.querySelectorAll('h1, h2').forEach(heading => {
        // Only apply to some headings for visual interest
        if (Math.random() > 0.5) {
            heading.classList.add('gradient-text');
        }
    });
    
    // Run on load and scroll
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on page load
    
    // Form Submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                // Show success message
                const successMessage = document.createElement('p');
                successMessage.textContent = 'Thank you for subscribing!';
                successMessage.style.color = 'white';
                successMessage.style.marginTop = '1rem';
                
                // Replace form with success message
                this.innerHTML = '';
                this.appendChild(successMessage);
            }
        });
    }
    
    // Demo Video Modal
    const demoButton = document.querySelector('a[href="#"].btn-secondary.btn-large');
    if (demoButton) {
        demoButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h3>RWABridge Demo</h3>
                    <div class="video-container">
                        <p>Demo video will be available soon.</p>
                    </div>
                </div>
            `;
            
            // Add modal styles
            const modalStyle = document.createElement('style');
            modalStyle.innerHTML = `
                .modal {
                    display: block;
                    position: fixed;
                    z-index: 1001;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(7, 7, 17, 0.9);
                    overflow: auto;
                }
                
                .modal-content {
                    background-color: var(--dark-color);
                    margin: 10% auto;
                    padding: 2rem;
                    border-radius: 0.5rem;
                    max-width: 800px;
                    position: relative;
                    border: 1px solid rgba(153, 69, 255, 0.2);
                    box-shadow: 0 0 30px rgba(153, 69, 255, 0.1);
                }
                
                .close-modal {
                    position: absolute;
                    top: 1rem;
                    right: 1.5rem;
                    font-size: 2rem;
                    font-weight: bold;
                    color: var(--gray-400);
                    cursor: pointer;
                    transition: color 0.3s ease;
                }
                
                .close-modal:hover {
                    color: white;
                }
                
                .video-container {
                    margin-top: 1.5rem;
                    text-align: center;
                    padding: 3rem;
                    background-color: rgba(255, 255, 255, 0.03);
                    border-radius: 0.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
            `;
            document.head.appendChild(modalStyle);
            
            // Add modal to body
            document.body.appendChild(modal);
            
            // Close modal functionality
            const closeModal = modal.querySelector('.close-modal');
            closeModal.addEventListener('click', function() {
                document.body.removeChild(modal);
            });
            
            // Close when clicking outside modal content
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        });
    }
    
    // Header scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Add scrolled class styles
    const headerStyle = document.createElement('style');
    headerStyle.innerHTML = `
        header.scrolled {
            box-shadow: var(--shadow-md);
            padding: 0.75rem 0;
            background-color: rgba(7, 7, 17, 0.98);
        }
    `;
    document.head.appendChild(headerStyle);
    
    // Add particle effect to hero section
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles-container';
        heroSection.appendChild(particlesContainer);
        
        // Create particles
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            particlesContainer.appendChild(particle);
        }
        
        // Add particle styles
        const particleStyle = document.createElement('style');
        particleStyle.innerHTML = `
            .particles-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: 1;
            }
            
            .particle {
                position: absolute;
                width: 6px;
                height: 6px;
                background: linear-gradient(90deg, #9945FF, #14F195);
                border-radius: 50%;
                opacity: 0.3;
                animation: float linear infinite;
            }
            
            @keyframes float {
                0% {
                    transform: translateY(0) translateX(0) scale(1);
                    opacity: 0;
                }
                10% {
                    opacity: 0.3;
                }
                90% {
                    opacity: 0.3;
                }
                100% {
                    transform: translateY(-100px) translateX(100px) scale(0);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(particleStyle);
    }
});
