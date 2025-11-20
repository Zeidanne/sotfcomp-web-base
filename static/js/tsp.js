document.addEventListener("DOMContentLoaded", function () {
    const tspForm = document.getElementById("tspForm");

    if (tspForm) {
        tspForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            // Collect parameters
            const pop_size = document.getElementById("pop_size").value;
            const generations = document.getElementById("generations").value;
            const tournament_k = document.getElementById("tournament_k").value;
            const crossover_rate =
                document.getElementById("crossover_rate").value;
            const mutation_rate =
                document.getElementById("mutation_rate").value;
            const elite_size = document.getElementById("elite_size").value;

            // Show loading message
            const hasilSection = document.getElementById("hasilSection");
            const hasilContainer = document.getElementById("hasilContainer");
            hasilSection.style.display = "block";
            hasilContainer.innerHTML =
                '<div class="loading-message">⏳ Menjalankan Algoritma Genetika... Mohon tunggu...</div>';

            // Expand hasil section
            const hasilCollapsible = hasilSection.querySelector(
                ".collapsible-content"
            );
            const hasilParent = hasilSection;
            if (!hasilCollapsible.classList.contains("active")) {
                hasilCollapsible.classList.add("active");
                hasilParent.classList.add("active");
            }
            setTimeout(() => {
                hasilCollapsible.style.maxHeight =
                    hasilCollapsible.scrollHeight + "px";
            }, 10);

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
                    hasilContainer.innerHTML = `<div class="error-message">❌ Error: ${data.error}</div>`;
                }
            } catch (error) {
                console.error("Error:", error);
                hasilContainer.innerHTML =
                    '<div class="error-message">❌ Terjadi kesalahan dalam perhitungan</div>';
            }
        });
    }
});

function displayHasilTSP(data) {
    const hasilSection = document.getElementById("hasilSection");
    const hasilContainer = document.getElementById("hasilContainer");

    let html = `
        <h3>📈 Proses Evolusi:</h3>
        <div class="evolution-summary">
            <p><strong>Jumlah Kota:</strong> ${data.cities.length}</p>
            <p><strong>Total Generasi:</strong> ${
                data.generations[data.generations.length - 1].generation + 1
            }</p>
        </div>
    `;

    // Display selected generations
    html += `<div class="generations-container">`;
    data.generations.forEach(function (gen) {
        html += `
            <div class="generation-box-tsp">
                <div class="generation-header">Generasi ${gen.generation}</div>
                <div class="tsp-route">
                    <strong>Rute:</strong> ${gen.best_route.join(" → ")} → ${
            gen.best_route[0]
        }
                </div>
                <div class="hasil-item">
                    <span class="hasil-label">Jarak Total:</span>
                    <span class="hasil-value">${gen.best_distance} km</span>
                </div>
            </div>
        `;
    });
    html += `</div>`;

    // Display final result
    html += `
        <div class="final-result-box">
            <h3>🏆 Rute Optimal (Solusi Terbaik)</h3>
            <div class="tsp-final-route">
                <strong>Rute Lengkap:</strong><br>
                ${data.final_result.full_route.join(" → ")}
            </div>
            <div class="result-item">
                <strong>Total Jarak:</strong> ${data.final_result.distance} km
            </div>
            <div class="result-item">
                <strong>Jumlah Kota Dikunjungi:</strong> ${
                    data.final_result.route.length
                } kota
            </div>
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

        // Update maxHeight after content is added
        setTimeout(() => {
            hasilCollapsible.style.maxHeight =
                hasilCollapsible.scrollHeight + "px";
        }, 10);
    }

    // Scroll to hasil
    hasilSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
