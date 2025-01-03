// Import translations
import translations from './translations.js';

// Add language selector at the top of the existing code
let currentLang = 'en';

function createLanguageSelector() {
  const languageSelector = document.createElement('select');
  languageSelector.id = 'language-selector';
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' }
  ];

  languages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.code;
    option.textContent = lang.name;
    languageSelector.appendChild(option);
  });

  languageSelector.addEventListener('change', (e) => {
    currentLang = e.target.value;
    updateUILanguage();
  });

  document.querySelector('#chat-container').insertBefore(
    languageSelector,
    document.querySelector('#chat-messages')
  );
}

function updateUILanguage() {
  const t = translations[currentLang];
  
  document.querySelector('#message-input').placeholder = t.placeholder;
  document.querySelector('#send-button').textContent = t.send;
  document.querySelector('#clear-button').textContent = t.clear;
}

// In your initialization code (usually at the bottom or in window.onload)
createLanguageSelector();
updateUILanguage();

// Add this function to show app details popup
function showAppDetails(app) {
    console.log('Showing details for app:', app);
    const modal = document.createElement('div');
    modal.className = 'detail-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'detail-modal-content';
    
    modalContent.innerHTML = `
        <span class="close">&times;</span>
        <div class="app-details">
            <div class="detail-header">
                <h2>${app.name}</h2>
                <span class="platform-badge platform-${app.platform}">${app.platform}</span>
            </div>
            
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Version</label>
                    <span>${app.version}</span>
                </div>
                <div class="detail-item">
                    <label>Status</label>
                    <span class="status-${app.status}">${app.status}</span>
                </div>
                <div class="detail-item">
                    <label>Release Date</label>
                    <span>${app.releaseDate}</span>
                </div>
            </div>

            <div class="qr-section">
                <h3>Install App</h3>
                <div id="qrcode-${app.id}"></div>
                <p class="install-hint">Scan with your mobile device to install</p>
            </div>
        </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Generate QR code
    new QRCode(document.getElementById(`qrcode-${app.id}`), {
        text: app.installUrl,
        width: 256,
        height: 256
    });

    // Close modal functionality
    const closeBtn = modalContent.querySelector('.close');
    closeBtn.onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

// Update the renderApps function to make rows clickable
function renderApps() {
    console.log('Rendering apps:', apps);
    const tbody = document.getElementById('appTableBody');
    const platformFilter = document.getElementById('platformFilter').value;
    
    tbody.innerHTML = '';
    
    const filteredApps = platformFilter === 'all' 
        ? apps 
        : apps.filter(app => app.platform === platformFilter);

    filteredApps.forEach((app) => {
        const row = tbody.insertRow();
        row.className = 'clickable-row';
        row.innerHTML = `
            <td>${app.name}</td>
            <td><span class="platform-badge platform-${app.platform}">${app.platform}</span></td>
            <td>${app.version}</td>
            <td>${app.releaseDate}</td>
            <td><span class="status-${app.status}">${app.status}</span></td>
            <td>
                <button class="btn btn-install">
                    <i class="fas fa-qrcode"></i> Install
                </button>
            </td>
            <td>
                <button class="btn btn-edit">Edit</button>
                <button class="btn btn-delete">Delete</button>
            </td>
        `;

        // Add click handler to the entire row
        row.addEventListener('click', (e) => {
            // Don't trigger on button clicks
            if (!e.target.closest('.btn')) {
                editApp(app);
            }
        });

        // Add specific button handlers
        row.querySelector('.btn-edit').addEventListener('click', (e) => {
            e.stopPropagation();
            editApp(app);
        });

        row.querySelector('.btn-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            confirmDelete(app.id);
        });

        row.querySelector('.btn-install').addEventListener('click', (e) => {
            e.stopPropagation();
            showQRCode(app.installUrl, app.name);
        });
    });
} 

// Add to your API fetch
async function fetchApps(platform = 'all') {
    try {
        setLoading(true);
        const response = await fetch(`${API_URL}/apps?platform=${platform}`);
        if (!response.ok) throw new Error('Failed to fetch apps');
        const data = await response.json();
        console.log('Fetched apps:', data);
        apps = data;
        renderApps();
    } catch (error) {
        console.error('Error fetching apps:', error);
        showError(error.message);
    } finally {
        setLoading(false);
    }
} 