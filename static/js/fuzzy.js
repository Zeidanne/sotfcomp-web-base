document.addEventListener("DOMContentLoaded", function () {
    const fuzzyForm = document.getElementById("fuzzyForm");

    if (fuzzyForm) {
        fuzzyForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const permintaan = document.getElementById("permintaan").value;
            const persediaan = document.getElementById("persediaan").value;

            // Get selected rules
            const selectedRules = [];
            for (let i = 1; i <= 4; i++) {
                const checkbox = document.getElementById(`rule${i}`);
                if (checkbox && checkbox.checked) {
                    selectedRules.push(i);
                }
            }

            // Validate at least one rule is selected
            if (selectedRules.length === 0) {
                showAlert("Pilih minimal satu aturan fuzzy!", "warning");
                return;
            }

            const submitBtn = fuzzyForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = 'Menghitung...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';

            try {
                const response = await fetch("/hitung-fuzzy", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        permintaan: permintaan,
                        persediaan: persediaan,
                        selected_rules: selectedRules,
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    displayHasil(data);
                } else {
                    showAlert("Terjadi kesalahan: " + (data.error || "Unknown error"), "error");
                }
            } catch (error) {
                console.error("Error:", error);
                showAlert("Terjadi kesalahan dalam perhitungan", "error");
            } finally {
                // Restore button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
            }
        });
    }
});

function showAlert(message, type = "info") {
    // Create alert element
    const alertDiv = document.createElement("div");
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    switch(type) {
        case "error":
            alertDiv.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
            break;
        case "warning":
            alertDiv.style.background = "linear-gradient(135deg, #f59e0b, #d97706)";
            break;
        case "success":
            alertDiv.style.background = "linear-gradient(135deg, #10b981, #059669)";
            break;
        default:
            alertDiv.style.background = "linear-gradient(135deg, #3b82f6, #2563eb)";
    }
    
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.opacity = "0";
        alertDiv.style.transform = "translateX(100px)";
        alertDiv.style.transition = "all 0.3s ease";
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

function displayHasil(data) {
    const hasilSection = document.getElementById("hasilSection");
    const hasilContainer = document.getElementById("hasilContainer");

    let html = `
        <div class="hasil-box" style="animation-delay: 0.1s">
            <h3>Input Data</h3>
            <div class="hasil-item">
                <span class="hasil-label">Permintaan</span>
                <span class="hasil-value">${Number(data.permintaan).toLocaleString()}</span>
            </div>
            <div class="hasil-item">
                <span class="hasil-label">Persediaan</span>
                <span class="hasil-value">${Number(data.persediaan).toLocaleString()}</span>
            </div>
        </div>

        <div class="hasil-box" style="animation-delay: 0.2s">
            <h3>Derajat Keanggotaan</h3>
            <div class="hasil-item">
                <span class="hasil-label">Permintaan TURUN (μ)</span>
                <span class="hasil-value">${data.derajat_keanggotaan.permintaan_turun.toFixed(4)}</span>
            </div>
            <div class="hasil-item">
                <span class="hasil-label">Permintaan NAIK (μ)</span>
                <span class="hasil-value">${data.derajat_keanggotaan.permintaan_naik.toFixed(4)}</span>
            </div>
            <div class="hasil-item">
                <span class="hasil-label">Persediaan SEDIKIT (μ)</span>
                <span class="hasil-value">${data.derajat_keanggotaan.persediaan_sedikit.toFixed(4)}</span>
            </div>
            <div class="hasil-item">
                <span class="hasil-label">Persediaan BANYAK (μ)</span>
                <span class="hasil-value">${data.derajat_keanggotaan.persediaan_banyak.toFixed(4)}</span>
            </div>
        </div>

        <div class="hasil-box" style="animation-delay: 0.3s">
            <h3>Rules yang Aktif</h3>
            <div class="rule-list">
    `;

    if (data.rules.length === 0) {
        html += `
            <div class="rule-item" style="background: #fef3c7; border-left-color: #f59e0b;">
                <em>Tidak ada rule yang aktif untuk kombinasi input ini</em>
            </div>
        `;
    } else {
        data.rules.forEach((rule, index) => {
            html += `
                <div class="rule-item">
                    <strong>${rule}</strong><br>
                    <span style="color: var(--primary); font-family: monospace;">
                        Z${index + 1} = ${data.z_values[index].toFixed(2)}
                    </span>
                </div>
            `;
        });
    }

    html += `
            </div>
        </div>

        <div class="hasil-box" style="animation-delay: 0.4s">
            <h3>Defuzzifikasi (Weighted Average)</h3>
            <div class="hasil-item">
                <span class="hasil-label">∑(α × Z)</span>
                <span class="hasil-value">${data.sum_alpha_z ? data.sum_alpha_z.toFixed(2) : (data.alpha_predikat.reduce((sum, a, i) => sum + a * data.z_values[i], 0)).toFixed(2)}</span>
            </div>
            <div class="hasil-item">
                <span class="hasil-label">∑α</span>
                <span class="hasil-value">${data.alpha_predikat.reduce((a, b) => a + b, 0).toFixed(4)}</span>
            </div>
        </div>

        <div class="hasil-produksi">
            Jumlah Produksi yang Direkomendasikan: <strong>${Number(data.hasil_produksi).toLocaleString()}</strong> unit
        </div>
    `;

    hasilContainer.innerHTML = html;
    hasilSection.style.display = "block";

    // Expand hasil section if collapsed
    const hasilCollapsible = hasilSection.querySelector(".collapsible-content");
    const hasilParent = hasilSection;

    if (hasilCollapsible) {
        if (!hasilCollapsible.classList.contains("active")) {
            hasilCollapsible.classList.add("active");
            hasilParent.classList.add("active");
        }

        // Update maxHeight after content is added - use 'none' for dynamic content
        setTimeout(() => {
            hasilCollapsible.style.maxHeight = "none";
        }, 10);
    }

    // Scroll to hasil
    hasilSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
