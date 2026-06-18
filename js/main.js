// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = 'https://fvalanmygolufcclltrp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2YWxhbm15Z29sdWZjY2xsdHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODQ1MjQsImV4cCI6MjA5NzM2MDUyNH0.vC_j1NP2kC2asH8r0qP2DlWc7nlONeFq_md3xVtNF-0';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const spans = mobileBtn.querySelectorAll('span');
            if (navLinks.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Close mobile menu when a link is clicked
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const spans = mobileBtn.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }

    // 2. Sticky Navbar & Scroll Styling
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // 3. Scroll Reveal Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Initial load animations (Hero section)
    document.querySelectorAll('.fade-in-up').forEach(el => {
        setTimeout(() => el.classList.add('visible'), 100);
    });

    // Scroll reveal elements
    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });

    // 4. Form Validation Helpers
    function showError(inputId, errorId, message) {
        const input = document.getElementById(inputId);
        const error = document.getElementById(errorId);
        if (input && error) {
            input.classList.add('input-error');
            input.classList.remove('input-success');
            error.textContent = message;
            error.classList.add('show');
        }
    }

    function clearError(inputId, errorId) {
        const input = document.getElementById(inputId);
        const error = document.getElementById(errorId);
        if (input && error) {
            input.classList.remove('input-error');
            input.classList.add('input-success');
            error.textContent = '';
            error.classList.remove('show');
        }
    }

    function clearAllErrors() {
        document.querySelectorAll('.error-msg').forEach(el => {
            el.textContent = '';
            el.classList.remove('show');
        });
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        document.querySelectorAll('.input-success').forEach(el => el.classList.remove('input-success'));
    }

    // 5. Set minimum date to today
    const dateInput = document.getElementById('resDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    // 6. Reservation Form Submission with Validation
    const resForm = document.getElementById('reservationForm');
    if (resForm) {
        resForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearAllErrors();

            const name = document.getElementById('resName').value.trim();
            const phone = document.getElementById('resPhone').value.trim();
            const date = document.getElementById('resDate').value;
            const time = document.getElementById('resTime').value;
            const guests = document.getElementById('resGuests').value;
            const requests = document.getElementById('resRequests').value.trim();

            let isValid = true;

            // Name validation
            if (!name || name.length < 2) {
                showError('resName', 'nameError', 'Please enter your full name (at least 2 characters).');
                isValid = false;
            } else {
                clearError('resName', 'nameError');
            }

            // Phone validation (Indian 10-digit number starting with 6-9)
            const phoneRegex = /^[6-9][0-9]{9}$/;
            if (!phone) {
                showError('resPhone', 'phoneError', 'Please enter your phone number.');
                isValid = false;
            } else if (!phoneRegex.test(phone)) {
                showError('resPhone', 'phoneError', 'Enter a valid 10-digit Indian phone number.');
                isValid = false;
            } else {
                clearError('resPhone', 'phoneError');
            }

            // Date validation
            const today = new Date().toISOString().split('T')[0];
            if (!date) {
                showError('resDate', 'dateError', 'Please select a date.');
                isValid = false;
            } else if (date < today) {
                showError('resDate', 'dateError', 'Date cannot be in the past.');
                isValid = false;
            } else {
                clearError('resDate', 'dateError');
            }

            // Time validation
            if (!time) {
                showError('resTime', 'timeError', 'Please select a time.');
                isValid = false;
            } else {
                clearError('resTime', 'timeError');
            }

            // Guests validation
            if (!guests) {
                showError('resGuests', 'guestsError', 'Please select the number of guests.');
                isValid = false;
            } else {
                clearError('resGuests', 'guestsError');
            }

            // If all valid, save to Supabase and send to WhatsApp
            if (isValid) {
                // Change button text to show loading
                const submitBtn = resForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;
                submitBtn.textContent = 'Booking...';
                submitBtn.disabled = true;

                // 1. Save to Supabase
                const { error } = await supabaseClient
                    .from('reservations')
                    .insert([
                        {
                            customer_name: name,
                            phone_number: phone,
                            reservation_date: date,
                            reservation_time: time,
                            guests: guests,
                            special_requests: requests
                        }
                    ]);

                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;

                if (error) {
                    console.error('Error saving reservation:', error);
                    alert('There was an error saving your reservation. Please try again.');
                    return; // Stop if database save fails
                }

                // 2. Format nicely for WhatsApp
                const dateObj = new Date(date + 'T00:00:00');
                const formattedDate = dateObj.toLocaleDateString('en-IN', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                });

                const [hours, minutes] = time.split(':');
                const timeObj = new Date();
                timeObj.setHours(parseInt(hours), parseInt(minutes));
                const formattedTime = timeObj.toLocaleTimeString('en-IN', {
                    hour: '2-digit', minute: '2-digit', hour12: true
                });

                const message = encodeURIComponent(
                    `Hello The Sky Cafe! I would like to reserve a table.\n\n` +
                    `*Name:* ${name}\n` +
                    `*Phone:* ${phone}\n` +
                    `*Date:* ${formattedDate}\n` +
                    `*Time:* ${formattedTime}\n` +
                    `*Guests:* ${guests}\n` +
                    `*Special Requests:* ${requests || 'None'}\n\n` +
                    `Please confirm my booking. Thank you!`
                );

                const whatsappNumber = '918986056280';
                const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
                
                // Show success to user and clear form
                resForm.reset();
                window.open(whatsappURL, '_blank');
            }
        });

        // Real-time validation on blur
        document.getElementById('resPhone').addEventListener('blur', function() {
            const phoneRegex = /^[6-9][0-9]{9}$/;
            if (this.value && !phoneRegex.test(this.value.trim())) {
                showError('resPhone', 'phoneError', 'Enter a valid 10-digit Indian phone number.');
            } else if (this.value) {
                clearError('resPhone', 'phoneError');
            }
        });

        document.getElementById('resName').addEventListener('blur', function() {
            if (this.value && this.value.trim().length < 2) {
                showError('resName', 'nameError', 'Name must be at least 2 characters.');
            } else if (this.value) {
                clearError('resName', 'nameError');
            }
        });
    }
});
