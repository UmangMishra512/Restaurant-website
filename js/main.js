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

    // 6. Handle "Reserve a Table" clicks anywhere
    document.querySelectorAll('a[href="#reserve"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('reservationModal').classList.add('active');
            // Reset to step 1
            document.getElementById('step1').style.display = 'block';
            document.getElementById('step2').style.display = 'none';
            document.getElementById('step3').style.display = 'none';
        });
    });

    document.getElementById('closeReservationBtn').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('reservationModal').classList.remove('active');
    });

    // Handle Availability Check
    const checkBtn = document.getElementById('checkAvailabilityBtn');
    if (checkBtn) {
        checkBtn.addEventListener('click', async () => {
            const name = document.getElementById('resName').value.trim();
            const phone = document.getElementById('resPhone').value.trim();
            const date = document.getElementById('resDate').value;
            const time = document.getElementById('resTime').value;
            const guests = document.getElementById('resGuests').value;

            // Basic validation
            if (!name || !phone || !date || !time || !guests) {
                alert("Please fill in all required fields (Name, Phone, Date, Time, Guests).");
                return;
            }

            // Move to Step 2
            document.getElementById('step1').style.display = 'none';
            document.getElementById('step2').style.display = 'block';
            
            const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
            document.getElementById('displayDateTime').textContent = `${displayDate} at ${time}`;
            
            const statusDiv = document.getElementById('availabilityStatus');
            const payBtn = document.getElementById('proceedToPayBtn');
            
            statusDiv.textContent = 'Checking database...';
            statusDiv.style.color = '#ccc';
            payBtn.style.display = 'none';

            // Simulate slight network delay for premium feel
            await new Promise(r => setTimeout(r, 800));

            try {
                // Check Supabase for existing reservations at this date/time
                const { data, error } = await supabaseClient
                    .from('reservations')
                    .select('id')
                    .eq('reservation_date', date)
                    .eq('reservation_time', time);

                if (error) throw error;

                // Simple Capacity Logic: Assume max 10 reservations per time slot
                if (data && data.length >= 10) {
                    statusDiv.innerHTML = '<span style="color: #ff4444;">Sorry, this time slot is Fully Booked.</span><br><span style="font-size: 0.9rem; font-weight: normal; color: #aaa;">Please select a different time or date.</span>';
                } else {
                    statusDiv.innerHTML = '<span style="color: #4CAF50;">Table Available!</span>';
                    payBtn.style.display = 'inline-block';
                }
            } catch (err) {
                console.error("Availability check failed:", err);
                statusDiv.innerHTML = '<span style="color: #ff4444;">Error checking availability. Try again.</span>';
            }
        });
    }

    // Back button in Step 2
    document.getElementById('backToStep1Btn').addEventListener('click', () => {
        document.getElementById('step2').style.display = 'none';
        document.getElementById('step1').style.display = 'block';
    });

    // Handle Payment (Razorpay Test Mode Integration)
    const payBtn = document.getElementById('proceedToPayBtn');
    if (payBtn) {
        payBtn.addEventListener('click', () => {
            const name = document.getElementById('resName').value.trim();
            const phone = document.getElementById('resPhone').value.trim();
            const email = document.getElementById('resEmail').value.trim();
            const date = document.getElementById('resDate').value;
            const time = document.getElementById('resTime').value;
            const guests = document.getElementById('resGuests').value;
            const requests = document.getElementById('resRequests').value.trim();
            
            const bookingAmount = 100 * 100; // Razorpay expects paise (₹100)
            
            // Razorpay Options
            var options = {
                "key": "rzp_test_placeholderkey", // Test Key
                "amount": bookingAmount.toString(),
                "currency": "INR",
                "name": "The Sky Cafe",
                "description": "Table Reservation Advance",
                "image": "https://theskycafe.in/favicon.png",
                "handler": async function (response) {
                    // Payment Successful Callback
                    const paymentId = response.razorpay_payment_id;
                    const bookingId = 'TSC-' + Math.floor(100000 + Math.random() * 900000); // Generate Random ID

                    payBtn.textContent = 'Verifying & Reserving...';
                    payBtn.disabled = true;

                    try {
                        // 1. Save to Reservations table
                        const { data: resData, error: resErr } = await supabaseClient
                            .from('reservations')
                            .insert([{
                                booking_id: bookingId,
                                customer_name: name,
                                phone_number: phone,
                                email: email,
                                reservation_date: date,
                                reservation_time: time,
                                guests: guests,
                                special_requests: requests,
                                payment_id: paymentId,
                                payment_status: 'Paid',
                                status: 'Confirmed'
                            }])
                            .select();
                        
                        if (resErr) throw resErr;

                        // 2. Save to Payments table (if created, ignoring errors if table doesn't exist yet for backwards compatibility)
                        await supabaseClient.from('payments').insert([{
                            booking_id: bookingId,
                            razorpay_payment_id: paymentId,
                            amount: 100.00,
                            status: 'Success'
                        }]);

                        // Show Step 3 (Digital Receipt)
                        document.getElementById('step2').style.display = 'none';
                        document.getElementById('step3').style.display = 'block';
                        
                        // Populate Receipt
                        const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
                        document.getElementById('receiptBookingId').textContent = bookingId;
                        document.getElementById('receiptName').textContent = name;
                        document.getElementById('receiptDateTime').textContent = `${displayDate} at ${time}`;
                        document.getElementById('receiptGuests').textContent = guests;

                    } catch (err) {
                        console.error("Database save failed after payment:", err);
                        alert("Payment successful, but we had trouble saving the reservation. Please contact us with Payment ID: " + paymentId);
                    }
                },
                "prefill": {
                    "name": name,
                    "email": email || "customer@example.com",
                    "contact": phone
                },
                "theme": {
                    "color": "#d4af37"
                }
            };
            
            var rzp1 = new Razorpay(options);
            rzp1.on('payment.failed', function (response){
                alert("Payment Failed: " + response.error.description);
            });
            rzp1.open();
        });
    }

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

    // --- FAN CAROUSEL LOGIC ---
    const fanCarousel = document.getElementById('fanCarousel');
    if (fanCarousel) {
        const cards = Array.from(fanCarousel.querySelectorAll('.fan-card'));
        const prevBtn = document.getElementById('fanPrev');
        const nextBtn = document.getElementById('fanNext');
        const dotsContainer = document.getElementById('fanDots');
        
        let currentIndex = Math.floor(cards.length / 2);

        cards.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('fan-dot');
            if(i === currentIndex) dot.classList.add('active');
            dot.addEventListener('click', () => {
                currentIndex = i;
                updateCarousel();
            });
            dotsContainer.appendChild(dot);
        });

        function updateCarousel() {
            const dots = dotsContainer.querySelectorAll('.fan-dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });

            cards.forEach((card, i) => {
                const diff = i - currentIndex;
                const isMobile = window.innerWidth <= 600;
                
                const xOffset = isMobile ? 40 : 60; 
                const rotateOffset = isMobile ? 4 : 5;
                
                if (diff === 0) {
                    card.style.transform = `translateX(0) rotate(0deg) scale(1)`;
                    card.style.zIndex = 10;
                    card.style.opacity = 1;
                } else {
                    const absDiff = Math.abs(diff);
                    const direction = diff > 0 ? 1 : -1;
                    
                    const translateX = direction * (xOffset * absDiff);
                    const rotate = direction * (rotateOffset * absDiff);
                    const scale = 1 - (0.05 * absDiff);
                    
                    if (absDiff > 3) {
                        card.style.opacity = 0;
                    } else {
                        card.style.opacity = 1;
                    }

                    card.style.transform = `translateX(${translateX}%) rotate(${rotate}deg) scale(${scale})`;
                    card.style.zIndex = 10 - absDiff;
                }
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateCarousel();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentIndex < cards.length - 1) {
                    currentIndex++;
                    updateCarousel();
                }
            });
        }

        updateCarousel();
        window.addEventListener('resize', updateCarousel);
    }
});
