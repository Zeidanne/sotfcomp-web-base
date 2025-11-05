document.addEventListener('DOMContentLoaded', function() {
    const fuzzyForm = document.getElementById('fuzzyForm');
    
    if (fuzzyForm) {
        fuzzyForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const permintaan = document.getElementById('permintaan').value;
            const persediaan = document.getElementById('persediaan').value;
            
            try {
                const response = await fetch('/hitung-fuzzy', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        permintaan: permintaan,
                        persediaan: persediaan
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    displayHasil(data);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan dalam perhitungan');
            }
        });
    }
});

function displayHasil(data) {
    const hasilSection = document.getElementById('hasilSection');
    const hasilContainer = document.getElementById('hasilContainer');
    
    let html = `
        <div class="hasil-box">
            <h3>Input Data:</h3>
            <div class="hasil-item">
                <span class="hasil-label">Permintaan:</span>
                <span class="hasil-value">${data.permintaan}</span>
            </div>
            <div class="hasil-item">
                <span class="hasil-label">Persediaan:</span>
                <span class="hasil-value">${data.persediaan}</span>
            </div>
        </div>

        <div class="hasil-box">
            <h3>Derajat Keanggotaan:</h3>
            <div class="hasil-item">
                <span class="hasil-label">Permintaan TURUN:</span>
                <span class="hasil-value">${data.derajat_keanggotaan.permintaan_turun.toFixed(3)}</span>
            </div>
            <div class="hasil-item">
                <span class="hasil-label">Permintaan NAIK:</span>
                <span class="hasil-value">${data.derajat_keanggotaan.permintaan_naik.toFixed(3)}</span>
            </div>
            <div class="hasil-item">
                <span class="hasil-label">Persediaan SEDIKIT:</span>
                <span class="hasil-value">${data.derajat_keanggotaan.persediaan_sedikit.toFixed(3)}</span>
            </div>
            <div class="hasil-item">
                <span class="hasil-label">Persediaan BANYAK:</span>
                <span class="hasil-value">${data.derajat_keanggotaan.persediaan_banyak.toFixed(3)}</span>
            </div>
        </div>

        <div class="hasil-box">
            <h3>Evaluasi Rules:</h3>
            <div class="rule-list">
    `;
    
    data.rules.forEach((rule, index) => {
        html += `
            <div class="rule-item">
                <strong>${rule}</strong><br>
                Z${index + 1} = ${data.z_values[index].toFixed(2)}
            </div>
        `;
    });
    
    html += `
            </div>
        </div>

        <div class="hasil-produksi">
            Jumlah Produksi yang Direkomendasikan: ${data.hasil_produksi}
        </div>
    `;
    
    hasilContainer.innerHTML = html;
    hasilSection.style.display = 'block';
    
    // Scroll to hasil
    hasilSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}