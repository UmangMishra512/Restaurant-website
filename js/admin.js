// --- SUPABASE CONFIGURATION ---
// IMPORTANT: Replace the placeholder below with your actual Supabase Anon Key
const SUPABASE_URL = 'https://fvalanmygolufcclltrp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2YWxhbm15Z29sdWZjY2xsdHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODQ1MjQsImV4cCI6MjA5NzM2MDUyNH0.vC_j1NP2kC2asH8r0qP2DlWc7nlONeFq_md3xVtNF-0';

// Initialize Supabase Client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const authView = document.getElementById('auth-view');
    const dashboardView = document.getElementById('dashboard-view');
    const adminNav = document.getElementById('admin-nav');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logout-btn');
    const loading = document.getElementById('loading');
    const tbody = document.querySelector('#reservationsTable tbody');
    
    // Check if already logged in
    checkSession();

    // --- AUTHENTICATION ---
    async function checkSession() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            showDashboard();
        } else {
            showAuth();
        }
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        
        loginError.textContent = 'Logging in...';
        loginError.classList.add('show');
        
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            loginError.textContent = error.message;
        } else {
            loginForm.reset();
            loginError.classList.remove('show');
            showDashboard();
        }
    });

    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await supabaseClient.auth.signOut();
        showAuth();
    });

    // --- DASHBOARD DATA ---
    async function showDashboard() {
        authView.style.display = 'none';
        dashboardView.style.display = 'block';
        adminNav.style.display = 'block';
        fetchReservations();
    }

    function showAuth() {
        authView.style.display = 'flex';
        dashboardView.style.display = 'none';
        adminNav.style.display = 'none';
    }

    async function fetchReservations() {
        loading.style.display = 'block';
        tbody.innerHTML = '';
        
        // Fetch all reservations ordered by date descending
        const { data, error } = await supabaseClient
            .from('reservations')
            .select('*')
            .order('reservation_date', { ascending: false })
            .order('reservation_time', { ascending: false });

        loading.style.display = 'none';

        if (error) {
            console.error('Error fetching reservations:', error);
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #ff6b6b;">Error loading data: ${error.message}</td></tr>`;
            return;
        }

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No reservations found.</td></tr>';
            return;
        }

        updateStats(data);
        
        data.forEach(res => {
            const tr = document.createElement('tr');
            
            // Format date and time
            const dateObj = new Date(res.reservation_date + 'T00:00:00');
            const dateStr = dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
            
            const [hours, minutes] = res.reservation_time.split(':');
            const timeObj = new Date();
            timeObj.setHours(hours, minutes);
            const timeStr = timeObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

            // Determine Status Badge
            let statusBadge = '';
            if(res.status === 'Pending' || res.status === 'Payment Pending') statusBadge = `<span class="status-badge status-pending">${res.status}</span>`;
            else if(res.status === 'Confirmed') statusBadge = `<span class="status-badge status-confirmed">Confirmed</span>`;
            else if(res.status === 'Cancelled') statusBadge = `<span class="status-badge status-cancelled">Cancelled</span>`;
            else statusBadge = `<span class="status-badge status-confirmed">${res.status}</span>`; // Completed
            
            const paymentStatus = res.payment_status || 'Unpaid';
            const bookingId = res.booking_id || 'N/A';

            tr.innerHTML = `
                <td>${dateStr} <br><small style="color:#aaa;">${timeStr}</small></td>
                <td>
                    <strong>${res.customer_name}</strong><br>
                    <small style="color:#aaa;">${res.phone_number}</small>
                </td>
                <td>${res.guests}</td>
                <td>
                    ID: ${bookingId}<br>
                    <small style="color:${paymentStatus === 'Paid' ? '#4CAF50' : '#ff9800'};">${paymentStatus}</small>
                </td>
                <td>${statusBadge}</td>
                <td>
                    <button class="action-btn btn-confirm" onclick="updateStatus('${res.id}', 'Completed')" title="Mark Completed">✓</button>
                    <button class="action-btn btn-cancel" onclick="updateStatus('${res.id}', 'Cancelled')" title="Cancel Booking">✕</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function updateStats(data) {
        const todayStr = new Date().toISOString().split('T')[0];
        
        const todayCount = data.filter(res => res.reservation_date === todayStr).length;
        const pendingCount = data.filter(res => res.status === 'Pending').length;
        
        document.getElementById('stat-today').textContent = todayCount;
        document.getElementById('stat-pending').textContent = pendingCount;
    }

    // Global function for buttons
    window.updateStatus = async function(id, newStatus) {
        if(confirm(`Are you sure you want to mark this reservation as ${newStatus}?`)) {
            const { error } = await supabaseClient
                .from('reservations')
                .update({ status: newStatus })
                .eq('id', id);
                
            if (error) {
                alert('Error updating: ' + error.message);
            } else {
                fetchReservations(); // Refresh data
            }
        }
    }
});
