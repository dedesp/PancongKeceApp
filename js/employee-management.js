// Pancong Kece - Employee Management Module
// Handles employee CRUD, attendance, schedules, and payroll

let employees = [
    { id: 1, name: 'Andi Pratama', email: 'andi@pancongkece.com', phone: '081234567890', position: 'manager', startDate: '2024-01-15', salary: 5000000, address: 'Jl. Sudirman No. 123, Jakarta', active: true, isWorking: true, clockInTime: '08:00' },
    { id: 2, name: 'Sari Dewi', email: 'sari@pancongkece.com', phone: '081234567891', position: 'cashier', startDate: '2024-02-01', salary: 3500000, address: 'Jl. Thamrin No. 456, Jakarta', active: true, isWorking: true, clockInTime: '08:15' },
    { id: 3, name: 'Budi Santoso', email: 'budi@pancongkece.com', phone: '081234567892', position: 'barista', startDate: '2024-03-01', salary: 3000000, address: 'Jl. Gatot Subroto No. 789, Jakarta', active: true, isWorking: false, clockInTime: null },
    { id: 4, name: 'Maya Indira', email: 'maya@pancongkece.com', phone: '081234567893', position: 'server', startDate: '2024-03-15', salary: 2800000, address: 'Jl. Kemang No. 321, Jakarta', active: true, isWorking: true, clockInTime: '08:30' },
    { id: 5, name: 'Rizki Fauzan', email: 'rizki@pancongkece.com', phone: '081234567894', position: 'barista', startDate: '2024-04-01', salary: 3200000, address: 'Jl. Senayan No. 654, Jakarta', active: false, isWorking: false, clockInTime: null }
];

let attendanceData = [];
let scheduleData = {};
let currentWeek = new Date();
let filteredEmployees = [];
let currentEditingEmployee = null;

// Initialize Employee Management
function initEmployees() {
    loadEmployeeData();
    updateEmployeeSummary();
    showEmployeeTab('list');
    initClockTime();
}

// Load employee data
function loadEmployeeData() {
    filteredEmployees = [...employees];
    renderEmployeeGrid();
    populateEmployeeSelectors();
}

// Update employee summary
function updateEmployeeSummary() {
    const totalEmployees = employees.filter(emp => emp.active).length;
    const activeEmployees = employees.filter(emp => emp.active && emp.isWorking).length;
    const monthlyPayroll = employees.filter(emp => emp.active).reduce((sum, emp) => sum + emp.salary, 0);

    document.getElementById('totalEmployees').textContent = totalEmployees;
    document.getElementById('activeEmployees').textContent = activeEmployees;
    document.getElementById('monthlyPayroll').textContent = `Rp ${monthlyPayroll.toLocaleString('id-ID')}`;
}

// Show employee tab
function showEmployeeTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.employee-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab and activate button
    document.getElementById(`employee${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`).classList.add('active');
    document.querySelector(`[onclick="showEmployeeTab('${tabName}')"]`).classList.add('active');
    
    // Load tab-specific data
    switch(tabName) {
        case 'list':
            filterEmployees();
            break;
        case 'schedule':
            loadScheduleData();
            break;
        case 'attendance':
            loadAttendanceData();
            break;
        case 'payroll':
            loadPayrollData();
            break;
    }
}

// Filter employees
function filterEmployees() {
    const statusFilter = document.getElementById('employeeStatus').value;
    const roleFilter = document.getElementById('employeeRole').value;
    
    filteredEmployees = employees.filter(emp => {
        let statusMatch = statusFilter === 'all' || 
                         (statusFilter === 'active' && emp.active) ||
                         (statusFilter === 'inactive' && !emp.active);
        let roleMatch = roleFilter === 'all' || emp.position === roleFilter;
        
        return statusMatch && roleMatch;
    });
    
    renderEmployeeGrid();
}

// Search employees
function searchEmployees() {
    const searchTerm = document.getElementById('employeeSearch').value.toLowerCase();
    
    if (searchTerm === '') {
        filterEmployees();
        return;
    }
    
    filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm) ||
        emp.email.toLowerCase().includes(searchTerm) ||
        emp.phone.includes(searchTerm) ||
        getPositionName(emp.position).toLowerCase().includes(searchTerm)
    );
    
    renderEmployeeGrid();
}

// Render employee grid
function renderEmployeeGrid() {
    const employeeGrid = document.getElementById('employeeGrid');
    
    if (filteredEmployees.length === 0) {
        employeeGrid.innerHTML = `
            <div class="empty-state">
                <i class="hgi-stroke hgi-users-01"></i>
                <h3>Tidak ada karyawan ditemukan</h3>
                <p>Coba ubah filter atau tambah karyawan baru</p>
            </div>
        `;
        return;
    }
    
    employeeGrid.innerHTML = filteredEmployees.map(employee => `
        <div class="employee-card ${!employee.active ? 'inactive' : ''}">
            <div class="employee-card-header">
                <div class="employee-avatar">
                    <i class="hgi-stroke hgi-user-01"></i>
                </div>
                <div class="employee-status ${employee.isWorking ? 'working' : 'offline'}">
                    ${employee.isWorking ? 'Sedang Bekerja' : 'Offline'}
                </div>
            </div>
            <div class="employee-card-content">
                <h3 class="employee-name">${employee.name}</h3>
                <p class="employee-position">${getPositionName(employee.position)}</p>
                <div class="employee-details">
                    <div class="detail-item">
                        <i class="hgi-stroke hgi-mail-01"></i>
                        <span>${employee.email || 'Tidak ada email'}</span>
                    </div>
                    <div class="detail-item">
                        <i class="hgi-stroke hgi-call-01"></i>
                        <span>${employee.phone}</span>
                    </div>
                    <div class="detail-item">
                        <i class="hgi-stroke hgi-currency-dollar-circle"></i>
                        <span>Rp ${employee.salary.toLocaleString('id-ID')}/bulan</span>
                    </div>
                    ${employee.isWorking ? `
                        <div class="detail-item">
                            <i class="hgi-stroke hgi-time-01"></i>
                            <span>Masuk: ${employee.clockInTime}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="employee-card-actions">
                <button class="btn-sm btn-secondary" onclick="editEmployee(${employee.id})" title="Edit">
                    <i class="hgi-stroke hgi-edit-01"></i>
                </button>
                <button class="btn-sm ${employee.active ? 'btn-warning' : 'btn-success'}" onclick="toggleEmployeeStatus(${employee.id})" title="${employee.active ? 'Non-aktifkan' : 'Aktifkan'}">
                    <i class="hgi-stroke ${employee.active ? 'hgi-user-minus-01' : 'hgi-user-check-01'}"></i>
                </button>
                <button class="btn-sm btn-danger" onclick="deleteEmployee(${employee.id})" title="Hapus">
                    <i class="hgi-stroke hgi-delete-01"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Get position display name
function getPositionName(position) {
    const positions = {
        'manager': 'Manager',
        'cashier': 'Kasir',
        'barista': 'Barista',
        'server': 'Pelayan'
    };
    return positions[position] || position;
}

// Show add employee modal
function showAddEmployeeModal() {
    document.getElementById('employeeModalTitle').textContent = 'Tambah Karyawan Baru';
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeId').value = '';
    document.getElementById('employeeActive').checked = true;
    currentEditingEmployee = null;
    document.getElementById('employeeModal').classList.add('active');
}

// Close employee modal
function closeEmployeeModal() {
    document.getElementById('employeeModal').classList.remove('active');
    currentEditingEmployee = null;
}

// Save employee
function saveEmployee() {
    const form = document.getElementById('employeeForm');
    const formData = new FormData(form);
    
    // Validate required fields
    const requiredFields = ['name', 'phone', 'position', 'startDate', 'salary'];
    for (let field of requiredFields) {
        if (!formData.get(field)) {
            showError(`Field ${field} harus diisi`);
            return;
        }
    }
    
    const employeeData = {
        name: formData.get('name'),
        email: formData.get('email') || '',
        phone: formData.get('phone'),
        position: formData.get('position'),
        startDate: formData.get('startDate'),
        salary: parseInt(formData.get('salary')),
        address: formData.get('address') || '',
        active: formData.get('active') === 'on',
        isWorking: false,
        clockInTime: null
    };
    
    const employeeId = document.getElementById('employeeId').value;
    
    if (employeeId) {
        // Update existing employee
        const index = employees.findIndex(emp => emp.id === parseInt(employeeId));
        if (index !== -1) {
            employees[index] = { ...employees[index], ...employeeData };
            showSuccess('Data karyawan berhasil diperbarui');
        }
    } else {
        // Add new employee
        const newId = Math.max(...employees.map(emp => emp.id), 0) + 1;
        employees.push({ id: newId, ...employeeData });
        showSuccess('Karyawan baru berhasil ditambahkan');
    }
    
    updateEmployeeSummary();
    filterEmployees();
    populateEmployeeSelectors();
    closeEmployeeModal();
}

// Edit employee
function editEmployee(employeeId) {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    currentEditingEmployee = employee;
    
    document.getElementById('employeeModalTitle').textContent = 'Edit Data Karyawan';
    document.getElementById('employeeId').value = employee.id;
    document.getElementById('employeeName').value = employee.name;
    document.getElementById('employeeEmail').value = employee.email;
    document.getElementById('employeePhone').value = employee.phone;
    document.getElementById('employeePosition').value = employee.position;
    document.getElementById('employeeStartDate').value = employee.startDate;
    document.getElementById('employeeSalary').value = employee.salary;
    document.getElementById('employeeAddress').value = employee.address;
    document.getElementById('employeeActive').checked = employee.active;
    
    document.getElementById('employeeModal').classList.add('active');
}

// Toggle employee status
function toggleEmployeeStatus(employeeId) {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    const action = employee.active ? 'non-aktifkan' : 'aktifkan';
    if (confirm(`Yakin ingin ${action} karyawan ${employee.name}?`)) {
        employee.active = !employee.active;
        if (!employee.active) {
            employee.isWorking = false;
            employee.clockInTime = null;
        }
        
        updateEmployeeSummary();
        filterEmployees();
        showSuccess(`Karyawan ${employee.name} berhasil di${action}`);
    }
}

// Delete employee
function deleteEmployee(employeeId) {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    if (confirm(`Yakin ingin menghapus karyawan ${employee.name}? Aksi ini tidak dapat dibatalkan.`)) {
        employees = employees.filter(emp => emp.id !== employeeId);
        updateEmployeeSummary();
        filterEmployees();
        populateEmployeeSelectors();
        showSuccess(`Karyawan ${employee.name} berhasil dihapus`);
    }
}

// Populate employee selectors
function populateEmployeeSelectors() {
    const clockSelect = document.getElementById('clockEmployee');
    if (clockSelect) {
        clockSelect.innerHTML = '<option value="">Pilih Karyawan</option>' +
            employees.filter(emp => emp.active).map(emp => 
                `<option value="${emp.id}">${emp.name} (${getPositionName(emp.position)})</option>`
            ).join('');
    }
}

// Initialize clock time display
function initClockTime() {
    updateClockTime();
    setInterval(updateClockTime, 1000);
}

// Update clock time
function updateClockTime() {
    const now = new Date();
    const timeElement = document.getElementById('currentTime');
    const dateElement = document.getElementById('currentDate');
    
    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
    }
    
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
}

// Show attendance modal
function showAttendanceModal() {
    document.getElementById('clockModal').classList.add('active');
}

// Show clock in modal
function showClockInModal() {
    showAttendanceModal();
}

// Close clock modal
function closeClockModal() {
    document.getElementById('clockModal').classList.remove('active');
}

// Clock in
function clockIn() {
    const employeeId = document.getElementById('clockEmployee').value;
    if (!employeeId) {
        showError('Mohon pilih karyawan');
        return;
    }
    
    const employee = employees.find(emp => emp.id === parseInt(employeeId));
    if (!employee) return;
    
    if (employee.isWorking) {
        showError(`${employee.name} sudah clock in`);
        return;
    }
    
    const now = new Date();
    employee.isWorking = true;
    employee.clockInTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    // Record attendance
    attendanceData.push({
        employeeId: employee.id,
        employeeName: employee.name,
        date: now.toDateString(),
        clockIn: now.toLocaleTimeString('id-ID'),
        clockOut: null,
        duration: null
    });
    
    updateEmployeeSummary();
    filterEmployees();
    closeClockModal();
    showSuccess(`${employee.name} berhasil clock in`);
}

// Clock out
function clockOut() {
    const employeeId = document.getElementById('clockEmployee').value;
    if (!employeeId) {
        showError('Mohon pilih karyawan');
        return;
    }
    
    const employee = employees.find(emp => emp.id === parseInt(employeeId));
    if (!employee) return;
    
    if (!employee.isWorking) {
        showError(`${employee.name} belum clock in`);
        return;
    }
    
    const now = new Date();
    employee.isWorking = false;
    
    // Update attendance record
    const todayAttendance = attendanceData.find(att => 
        att.employeeId === employee.id && 
        att.date === now.toDateString() &&
        !att.clockOut
    );
    
    if (todayAttendance) {
        todayAttendance.clockOut = now.toLocaleTimeString('id-ID');
        const clockInTime = new Date(`${todayAttendance.date} ${todayAttendance.clockIn}`);
        const duration = Math.round((now - clockInTime) / (1000 * 60 * 60 * 100)) / 100; // hours
        todayAttendance.duration = `${duration} jam`;
    }
    
    employee.clockInTime = null;
    
    updateEmployeeSummary();
    filterEmployees();
    closeClockModal();
    showSuccess(`${employee.name} berhasil clock out`);
}

// Load schedule data
function loadScheduleData() {
    const scheduleTable = document.getElementById('scheduleTable');
    scheduleTable.innerHTML = `
        <div class="schedule-placeholder">
            <i class="hgi-stroke hgi-calendar-01"></i>
            <p>Fitur jadwal shift akan segera hadir</p>
        </div>
    `;
}

// Load attendance data
function loadAttendanceData() {
    const attendanceTable = document.getElementById('attendanceTable');
    
    if (attendanceData.length === 0) {
        attendanceTable.innerHTML = `
            <div class="attendance-placeholder">
                <i class="hgi-stroke hgi-time-01"></i>
                <p>Belum ada data absensi</p>
            </div>
        `;
        return;
    }
    
    attendanceTable.innerHTML = `
        <table class="attendance-data-table">
            <thead>
                <tr>
                    <th>Karyawan</th>
                    <th>Tanggal</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Durasi</th>
                </tr>
            </thead>
            <tbody>
                ${attendanceData.map(att => `
                    <tr>
                        <td>${att.employeeName}</td>
                        <td>${new Date(att.date).toLocaleDateString('id-ID')}</td>
                        <td>${att.clockIn}</td>
                        <td>${att.clockOut || '-'}</td>
                        <td>${att.duration || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Load payroll data
function loadPayrollData() {
    const payrollTable = document.getElementById('payrollTable');
    const activeEmployees = employees.filter(emp => emp.active);
    
    payrollTable.innerHTML = `
        <table class="payroll-data-table">
            <thead>
                <tr>
                    <th>Karyawan</th>
                    <th>Posisi</th>
                    <th>Gaji Pokok</th>
                    <th>Bonus</th>
                    <th>Potongan</th>
                    <th>Total</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${activeEmployees.map(emp => {
                    const bonus = 0; // Sample bonus
                    const deduction = 0; // Sample deduction
                    const total = emp.salary + bonus - deduction;
                    return `
                        <tr>
                            <td>${emp.name}</td>
                            <td>${getPositionName(emp.position)}</td>
                            <td>Rp ${emp.salary.toLocaleString('id-ID')}</td>
                            <td>Rp ${bonus.toLocaleString('id-ID')}</td>
                            <td>Rp ${deduction.toLocaleString('id-ID')}</td>
                            <td><strong>Rp ${total.toLocaleString('id-ID')}</strong></td>
                            <td><span class="status-badge adequate-stock">Belum Dibayar</span></td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

// Generate payroll
function generatePayroll() {
    showSuccess('Payroll berhasil di-generate untuk bulan ini');
}

// Utility functions
function showError(message) {
    if (typeof showSuccess === 'function') {
        showSuccess(message, 'error');
    } else {
        alert(message);
    }
}

// Make functions available globally
if (typeof window !== 'undefined') {
    window.initEmployees = initEmployees;
    window.showEmployeeTab = showEmployeeTab;
    window.filterEmployees = filterEmployees;
    window.searchEmployees = searchEmployees;
    window.showAddEmployeeModal = showAddEmployeeModal;
    window.closeEmployeeModal = closeEmployeeModal;
    window.saveEmployee = saveEmployee;
    window.editEmployee = editEmployee;
    window.toggleEmployeeStatus = toggleEmployeeStatus;
    window.deleteEmployee = deleteEmployee;
    window.showAttendanceModal = showAttendanceModal;
    window.showClockInModal = showClockInModal;
    window.closeClockModal = closeClockModal;
    window.clockIn = clockIn;
    window.clockOut = clockOut;
    window.loadAttendanceData = loadAttendanceData;
    window.generatePayroll = generatePayroll;
}

// Initialize when employees section becomes active
document.addEventListener('DOMContentLoaded', function() {
    const employeesSection = document.getElementById('employees');
    if (employeesSection) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (employeesSection.classList.contains('active')) {
                        setTimeout(initEmployees, 100);
                    }
                }
            });
        });
        
        observer.observe(employeesSection, { attributes: true });
    }
});
