let apps = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadApps();
    setupEventListeners();
});

function setupEventListeners() {
    // Add app button
    document.getElementById('addAppBtn').addEventListener('click', () => showModal());
    
    // Close modal
    document.querySelector('.close').addEventListener('click', () => hideModal());
    
    // Form submission
    document.getElementById('appForm').addEventListener('submit', handleFormSubmit);
    
    // Platform filter
    document.getElementById('platformFilter').addEventListener('change', filterApps);
}

function loadApps() {
    // In a real application, this would be an API call
    // For now, we'll use localStorage
    const savedApps = localStorage.getItem('apps');
    apps = savedApps ? JSON.parse(savedApps) : [];
    renderApps();
}

function renderApps() {
    const tbody = document.getElementById('appTableBody');
    const platformFilter = document.getElementById('platformFilter').value;
    
    tbody.innerHTML = '';
    
    const filteredApps = platformFilter === 'all' 
        ? apps 
        : apps.filter(app => app.platform === platformFilter);

    filteredApps.forEach((app, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${app.name}</td>
            <td><span class="platform-badge platform-${app.platform}">${app.platform}</span></td>
            <td>${app.version}</td>
            <td>${app.releaseDate}</td>
            <td><span class="status-${app.status}">${app.status}</span></td>
            <td>
                <button onclick="editApp(${index})" class="btn">Edit</button>
                <button onclick="deleteApp(${index})" class="btn" style="background-color: #f44336;">Delete</button>
            </td>
        `;
    });
}

function showModal(app = null) {
    const modal = document.getElementById('appModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('appForm');
    
    modalTitle.textContent = app ? 'Edit App' : 'Add New App';
    
    if (app) {
        form.dataset.editIndex = app.index;
        document.getElementById('appName').value = app.name;
        document.getElementById('platform').value = app.platform;
        document.getElementById('version').value = app.version;
        document.getElementById('releaseDate').value = app.releaseDate;
        document.getElementById('status').value = app.status;
    } else {
        form.reset();
        delete form.dataset.editIndex;
    }
    
    modal.style.display = 'block';
}

function hideModal() {
    document.getElementById('appModal').style.display = 'none';
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('appName').value,
        platform: document.getElementById('platform').value,
        version: document.getElementById('version').value,
        releaseDate: document.getElementById('releaseDate').value,
        status: document.getElementById('status').value
    };
    
    const editIndex = e.target.dataset.editIndex;
    
    if (editIndex !== undefined) {
        apps[editIndex] = formData;
    } else {
        apps.push(formData);
    }
    
    localStorage.setItem('apps', JSON.stringify(apps));
    renderApps();
    hideModal();
}

function editApp(index) {
    showModal({ ...apps[index], index });
}

function deleteApp(index) {
    if (confirm('Are you sure you want to delete this app?')) {
        apps.splice(index, 1);
        localStorage.setItem('apps', JSON.stringify(apps));
        renderApps();
    }
}

function filterApps() {
    renderApps();
} 