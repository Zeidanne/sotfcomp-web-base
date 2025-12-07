document.addEventListener("DOMContentLoaded", function () {
    const tspForm = document.getElementById("tspForm");

    if (tspForm) {
        tspForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            // Collect parameters
            const pop_size = document.getElementById("pop_size").value;
            const generations = document.getElementById("generations").value;
            const tournament_k = document.getElementById("tournament_k").value;
            const crossover_rate = document.getElementById("crossover_rate").value;
            const mutation_rate = document.getElementById("mutation_rate").value;
            const elite_size = document.getElementById("elite_size").value;

            // Show loading message
            const hasilSection = document.getElementById("hasilSection");
            const hasilContainer = document.getElementById("hasilContainer");
            hasilSection.style.display = "block";
            hasilContainer.innerHTML = `
                <div class="loading-message">
                    Menjalankan Algoritma Genetika... Mohon tunggu...
                </div>
            `;

            // Expand hasil section
            const hasilCollapsible = hasilSection.querySelector(".collapsible-content");
            const hasilParent = hasilSection;
            if (!hasilCollapsible.classList.contains("active")) {
                hasilCollapsible.classList.add("active");
                hasilParent.classList.add("active");
            }
            setTimeout(() => {
                hasilCollapsible.style.maxHeight = "none";
            }, 10);

            // Scroll to loading
            hasilSection.scrollIntoView({ behavior: "smooth", block: "nearest" });

            const submitBtn = tspForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '⏳ Memproses...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';

            try {
                const response = await fetch("/hitung-tsp", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        pop_size: pop_size,
                        generations: generations,
                        tournament_k: tournament_k,
                        crossover_rate: crossover_rate,
                        mutation_rate: mutation_rate,
                        elite_size: elite_size,
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    displayHasilTSP(data);
                } else {
                    hasilContainer.innerHTML = `
                        <div class="error-message">
                            ❌ Error: ${data.error}
                        </div>
                    `;
                }
            } catch (error) {
                console.error("Error:", error);
                hasilContainer.innerHTML = `
                    <div class="error-message">
                        ❌ Terjadi kesalahan dalam perhitungan
                    </div>
                `;
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
            }
        });
    }
});

function displayHasilTSP(data) {
    const hasilSection = document.getElementById("hasilSection");
    const hasilContainer = document.getElementById("hasilContainer");

    const totalGenerations = data.generations[data.generations.length - 1].generation + 1;
    const improvement = data.history.length > 0 
        ? ((data.history[0] - data.final_result.distance) / data.history[0] * 100).toFixed(1)
        : 0;

    let html = `
        <div class="hasil-box" style="animation-delay: 0.1s">
            <h3>📊 Ringkasan Evolusi</h3>
            <div class="hasil-item">
                <span class="hasil-label">Jumlah Kota</span>
                <span class="hasil-value">${data.cities.length} kota</span>
            </div>
            <div class="hasil-item">
                <span class="hasil-label">Total Generasi</span>
                <span class="hasil-value">${totalGenerations}</span>
            </div>
            <div class="hasil-item">
                <span class="hasil-label">Kota</span>
                <span class="hasil-value" style="font-size: 0.85rem">${data.cities.join(", ")}</span>
            </div>
        </div>
        
        <div class="hasil-box" style="animation-delay: 0.2s">
            <h3>🧬 Proses Evolusi (Sample)</h3>
            <div class="generations-container">
    `;

    // Display selected generations with animations
    data.generations.forEach(function (gen, index) {
        html += `
            <div class="generation-box-tsp" style="animation-delay: ${0.1 * index}s">
                <div class="generation-header">
                    Generasi ${gen.generation}
                </div>
                <div class="tsp-route">
                    <strong>🗺️ Rute:</strong> ${gen.best_route.join(" → ")} → ${gen.best_route[0]}
                </div>
                <div class="hasil-item">
                    <span class="hasil-label">Jarak Total</span>
                    <span class="hasil-value">${gen.best_distance} km</span>
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    // Display final result with trophy animation
    html += `
        <div class="final-result-box">
            <h3>Rute Optimal (Solusi Terbaik)</h3>
            <div class="tsp-final-route">
                <strong>🗺️ Rute Lengkap:</strong><br>
                ${data.final_result.full_route.join(" → ")}
            </div>
            <div class="result-item">
                <strong>📏 Total Jarak:</strong>
                <span>${data.final_result.distance} km</span>
            </div>
            <div class="result-item">
                <strong>🏙️ Jumlah Kota:</strong>
                <span>${data.final_result.route.length} kota</span>
            </div>
            ${improvement > 0 ? `
            <div class="result-item">
                <strong>📈 Peningkatan:</strong>
                <span>${improvement}% dari generasi awal</span>
            </div>
            ` : ''}
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
