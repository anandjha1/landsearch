<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Land Records Search | Kushouthar</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f0f2f5;
      padding: 1rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem;
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }

    h1 {
      text-align: center;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 1.5rem;
    }

    .search-container {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .input-group {
      flex: 1;
    }

    .input-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #4a5568;
      margin-bottom: 0.5rem;
    }

    .search-input {
      width: 100%;
      padding: 0.625rem 1rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
    }

    .table-container {
      overflow-x: auto;
      margin: 0 -1.5rem;
      padding: 0 1.5rem;
    }

    .result-table {
      width: 100%;
      min-width: 800px;
      border-collapse: separate;
      border-spacing: 0;
      background-color: white;
    }

    .result-table th,
    .result-table td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }

    .result-table th {
      background-color: #f8fafc;
      font-weight: 600;
      color: #4a5568;
      font-size: 0.875rem;
      position: sticky;
      top: 0;
    }

    .result-table tbody tr:hover {
      background-color: #f8fafc;
    }

    .result-table a {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
    }

    .result-table a:hover {
      text-decoration: underline;
    }

    .no-results {
      text-align: center;
      color: #64748b;
      padding: 2rem;
      font-size: 0.875rem;
    }

    .highlight {
      background-color: #fef08a;
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
    }

    @media (max-width: 640px) {
      .search-container {
        flex-direction: column;
      }
      
      .container {
        padding: 1rem;
      }
      
      h1 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Kushouthar Land Records Search</h1>
    <div class="search-container">
      <div class="input-group">
        <label for="khasraInput">Search by Khasra No:</label>
        <input type="text" id="khasraInput" class="search-input" placeholder="Enter Khasra No">
      </div>
      <div class="input-group">
        <label for="khataInput">Search by Khata No:</label>
        <input type="text" id="khataInput" class="search-input" placeholder="Enter Khata No">
      </div>
    </div>
    <div class="table-container">
      <div id="results"></div>
    </div>
    
    <p class="no-results">Design and Developed By Anand Jha, for any feedback or suggession mail on skill.jha@gmail.com</p>
  </div>

  <script>
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
  </script>
</body>
</html>
