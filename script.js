let apiData;

// Fetch initial data
fetch('https://script.google.com/macros/s/AKfycbyOevP0KWS4xg5-s8fxKQUkbsD3a5rvME78UTzhD5DUrXe0JRnFHDfvuYUk0bmSFN58qg/exec')
    .then(res => res.json())
    .then(data => {
        apiData = data;
        renderResults();
    })
    .catch(error => {
        console.error('Error fetching initial data:', error);
    });

// Global selectors
const khasraInputEle = document.getElementById('khasraInput');
const khataInputEle = document.getElementById('khataInput');
const resultsContainer = document.getElementById('results');

// Event listeners with debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedRenderResults = debounce(renderResults, 300);
khasraInputEle.addEventListener('input', debouncedRenderResults);
khataInputEle.addEventListener('input', debouncedRenderResults);

// Highlight matching text
function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.toString().replace(regex, '<span class="highlight">$1</span>');
}

function renderResults() {
    const khasraInput = khasraInputEle.value.trim();
    const khataInput = khataInputEle.value.trim();
    resultsContainer.innerHTML = '';

    if (khasraInput === '' && khataInput === '') {
        resultsContainer.innerHTML = '<p class="no-results">Please enter a Khasra No or Khata No.</p>';
        return;
    }

    // Filter results based on khasra or khata input
    const results = apiData.filter(record =>
        (khasraInput && String(record.khasra_no).includes(khasraInput)) ||
        (khataInput && String(record.khata_no).includes(khataInput))
    );

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No results found.</p>';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('result-table');

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
          <th>Raiyat Name</th>
          <th>Father/Husband Name</th>
          <th>Khata No</th>
          <th>Khasra No</th>
          <th>Link</th>
        </tr>
      `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    results.forEach(record => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${record.raiyat_name}</td>
          <td>${record.father_or_husband_name}</td>
          <td>${highlightText(record.khata_no, khataInput)}</td>
          <td>${highlightText(record.khasra_no, khasraInput)}</td>
          <td><a href="${record.link}" target="_blank">View Record</a></td>
        `;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    resultsContainer.appendChild(table);
}