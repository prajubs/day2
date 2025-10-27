// ===== LOGIN PAGE HANDLER =====
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    const username = document.getElementById('username').value.trim();
    if (username === '') {
      alert('Please enter your name!');
      return;
    }

    // Mock gym ID for now
    const gymId = 'S'+15+'-'+41+'/'+601;
    localStorage.setItem('gymUser', JSON.stringify({ username, gymId }));

    // Redirect to dashboard
    window.location.href = 'dashboard.html';
  });
}

// ===== COMMON: LOAD USER INFO =====
window.addEventListener('DOMContentLoaded', () => {
  const userData = JSON.parse(localStorage.getItem('gymUser'));
  if (!userData) return;
  const { username, gymId } = userData;

  if (document.getElementById('displayName')) {
    document.getElementById('displayName').textContent = username;
    document.getElementById('gymId').textContent = `Gym ID: ${gymId}`;
  }

  if (document.getElementById('userWelcome'))
    document.getElementById('userWelcome').textContent = username;

  if (document.getElementById('currentDate')) {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = now.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    document.getElementById('currentDate').textContent = `${dayName}, ${dateStr}`;
  }

  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('gymUser');
      window.location.href = 'index.html';
    });
  }
});

// ===== DASHBOARD PAGE: SAVE ENTRY 🔥 =====
const saveBtn = document.getElementById('saveEntryBtn');
if (saveBtn) {
  saveBtn.addEventListener('click', () => {
    const weightBefore = document.getElementById('weightBefore').value;
    const warmupTime = document.getElementById('warmupTime').value;
    const exercisesDone = document.getElementById('exercisesDone').value;
    const repsWeight = document.getElementById('repsWeight').value;
    const weightAfter = document.getElementById('weightAfter').value;
    const foodMorning = document.getElementById('foodMorning').value;
    const foodAfternoon = document.getElementById('foodAfternoon').value;
    const foodNight = document.getElementById('foodNight').value;
    

    if (!weightBefore || !exercisesDone || !weightAfter) {
      alert('Please fill at least weight and exercise details.');
      return;
    }

    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = now.toLocaleDateString('en-GB'); // DD/MM/YYYY

    const entry = {
      date: dateStr,
      day: dayName,
      weightBefore,
      warmupTime,
      exercisesDone,
      repsWeight,
      weightAfter,
      foodMorning,
      foodAfternoon,
      foodNight
    };
    

    // Get existing data
    const existing = JSON.parse(localStorage.getItem('gymProgress')) || [];
    existing.push(entry);
    localStorage.setItem('gymProgress', JSON.stringify(existing));

    alert('Entry saved successfully ✅');
    // Optionally clear inputs
    document.querySelectorAll('.dashboard-card input').forEach(i => i.value = '');
  });
}

// ===== PROGRESS PAGE: DISPLAY DATA 🔥 =====
if (window.location.pathname.includes('progress.html')) {
  const tableBody = document.querySelector('#progressTable tbody');
  const data = JSON.parse(localStorage.getItem('gymProgress')) || [];

  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No records yet 💪</td></tr>`;
  } else {
    tableBody.innerHTML = data.map(entry => `
      <tr>
        <td>${entry.date}</td>
        <td>${entry.day}</td>
        <td>${entry.weightBefore} kg</td>
        <td>${entry.warmupTime || '-'}</td>
        <td>${entry.exercisesDone}</td>
        <td>${entry.repsWeight || '-'}</td>
        <td>${entry.weightAfter} kg</td>
        <td>
  <strong>Morning:</strong> ${entry.foodMorning || '-'}<br>
  <strong>Afternoon:</strong> ${entry.foodAfternoon || '-'}<br>
  <strong>Night:</strong> ${entry.foodNight || '-'}
</td>

      </tr>
    `).join('');
  }
}
// ===== PERSONAL INFO PAGE: LOAD + SAVE 🔥 =====
if (window.location.pathname.includes('personal.html')) {
    const userData = JSON.parse(localStorage.getItem('gymUser'));
    const storedMobile = localStorage.getItem('gymMobile') || '';
  
    document.getElementById('personName').value = userData.username;
    document.getElementById('personGymId').value = userData.gymId;
    document.getElementById('personMobile').value = storedMobile;
  
    document.getElementById('savePersonalBtn').addEventListener('click', () => {
      const mobile = document.getElementById('personMobile').value.trim();
      if (mobile === '') {
        alert('Please enter a valid mobile number.');
        return;
      }
      localStorage.setItem('gymMobile', mobile);
      alert('Personal info saved ✅');
    });
  }
  
  // ===== EXPORT TO PDF 🔥 =====
  const exportBtn = document.getElementById('exportPdfBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'landscape' });
  
      const userData = JSON.parse(localStorage.getItem('gymUser')) || {};
      const mobile = localStorage.getItem('gymMobile') || '-';
      const records = JSON.parse(localStorage.getItem('gymProgress')) || [];
  
      if (records.length === 0) {
        alert('No data available to export!');
        return;
      }
  
      // Header
      doc.setFontSize(18);
      doc.text('🏋️‍♂️ GymTrack Progress Report', 14, 15);
      doc.setFontSize(12);
      doc.text(`Name: ${userData.username || '-'}`, 14, 25);
      doc.text(`Gym ID: ${userData.gymId || '-'}`, 14, 32);
      doc.text(`Mobile: ${mobile}`, 14, 39);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 46);
  
      // Table Data
      const headers = ['Date', 'Day', 'Weight Before', 'Warm-up', 'Exercises', 'Reps/Weight', 'Weight After', 'Food Eaten'];
      const tableData = records.map(r => [
        r.date, r.day, r.weightBefore + 'kg', r.warmupTime || '-', r.exercisesDone,
        r.repsWeight || '-', r.weightAfter + 'kg', r.foodEaten || '-'
      ]);
  
      doc.autoTable({
        startY: 55,
        head: [headers],
        body: tableData,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [75, 0, 130] },
        alternateRowStyles: { fillColor: [245, 240, 255] }
      });
  
      doc.save(`GymTrack_Report_${userData.username || 'user'}.pdf`);
    });
  }
  // ====== CLEAR ALL DATA 🔥 ======
if (document.getElementById('clearDataBtn')) {
    document.getElementById('clearDataBtn').addEventListener('click', () => {
      if (confirm('Are you sure you want to delete all progress data? This cannot be undone.')) {
        localStorage.removeItem('gymProgress');
        alert('All progress data cleared ✅');
        window.location.reload();
      }
    });
  }
  
  // ====== CHART DISPLAY 🔥 ======
  if (window.location.pathname.includes('progress.html')) {
    const progressData = JSON.parse(localStorage.getItem('gymProgress')) || [];
  
    if (progressData.length > 0) {
      const labels = progressData.map(e => e.date);
      const weightBefore = progressData.map(e => parseFloat(e.weightBefore));
      const weightAfter = progressData.map(e => parseFloat(e.weightAfter));
  
      const ctx = document.getElementById('weightChart').getContext('2d');
  
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Weight Before (kg)',
              data: weightBefore,
              borderColor: 'rgba(255,99,132,1)',
              backgroundColor: 'rgba(255,99,132,0.2)',
              tension: 0.3,
              fill: true
            },
            {
              label: 'Weight After (kg)',
              data: weightAfter,
              borderColor: 'rgba(54,162,235,1)',
              backgroundColor: 'rgba(54,162,235,0.2)',
              tension: 0.3,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: false,
              title: {
                display: true,
                text: 'Weight (kg)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Workout Dates'
              }
            }
          }
        }
      });
    }
  }
  
  
