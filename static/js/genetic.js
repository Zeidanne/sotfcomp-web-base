let itemCount = 4;

document.addEventListener("DOMContentLoaded", function () {
    const geneticForm = document.getElementById("geneticForm");
    const addItemBtn = document.getElementById("addItem");
    const removeItemBtn = document.getElementById("removeItem");

    // Add item button
    if (addItemBtn) {
        addItemBtn.addEventListener("click", function (e) {
            e.preventDefault();

            const itemsContainer = document.getElementById("itemsContainer");
            const newItemDiv = document.createElement("div");
            newItemDiv.className = "item-input";
            newItemDiv.setAttribute("data-item", itemCount);

            const itemLetter = String.fromCharCode(65 + itemCount);

            newItemDiv.innerHTML = `
                <h4>Item ${itemLetter}</h4>
                <div class="item-fields">
                    <div class="form-group">
                        <label>Nama Item</label>
                        <input type="text" class="item-name" value="${itemLetter}" required />
                    </div>
                    <div class="form-group">
                        <label>Berat (kg)</label>
                        <input type="number" class="item-weight" value="1" min="1" step="1" required />
                    </div>
                    <div class="form-group">
                        <label>Nilai ($)</label>
                        <input type="number" class="item-value" value="1" min="1" step="1" required />
                    </div>
                </div>
            `;

            // Add animation
            newItemDiv.style.opacity = "0";
            newItemDiv.style.transform = "translateY(-10px)";
            itemsContainer.appendChild(newItemDiv);
            
            // Trigger animation
            setTimeout(() => {
                newItemDiv.style.transition = "all 0.3s ease";
                newItemDiv.style.opacity = "1";
                newItemDiv.style.transform = "translateY(0)";
            }, 10);

            itemCount++;
            updateCollapsibleHeight();
        });
    }

    // Remove item button
    if (removeItemBtn) {
        removeItemBtn.addEventListener("click", function (e) {
            e.preventDefault();

            const itemsContainer = document.getElementById("itemsContainer");
            const items = itemsContainer.querySelectorAll(".item-input");

            if (items.length > 1) {
                const lastItem = items[items.length - 1];
                lastItem.style.transition = "all 0.3s ease";
                lastItem.style.opacity = "0";
                lastItem.style.transform = "translateX(20px)";
                
                setTimeout(() => {
                    lastItem.remove();
                    itemCount--;
                    updateCollapsibleHeight();
                }, 300);
            } else {
                showAlert("Minimal harus ada 1 item!", "warning");
            }
        });
    }

    // Function to update collapsible content height
    function updateCollapsibleHeight() {
        const activeCollapsibles = document.querySelectorAll(
            ".collapsible.active .collapsible-content"
        );
        activeCollapsibles.forEach((content) => {
            content.style.maxHeight = content.scrollHeight + "px";
        });
    }

    // Form submit
    if (geneticForm) {
        geneticForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            // Collect items data
            const items = [];
            const itemInputs = document.querySelectorAll(".item-input");

            itemInputs.forEach(function (itemDiv) {
                const name = itemDiv.querySelector(".item-name").value;
                const weight = itemDiv.querySelector(".item-weight").value;
                const value = itemDiv.querySelector(".item-value").value;

                items.push({
                    name: name,
                    weight: parseInt(weight),
                    value: parseInt(value),
                });
            });

            // Collect parameters
            const capacity = document.getElementById("capacity").value;
            const pop_size = document.getElementById("pop_size").value;
            const generations = document.getElementById("generations").value;
            const crossover_rate = document.getElementById("crossover_rate").value;
            const mutation_rate = document.getElementById("mutation_rate").value;

            // Validate
            if (items.length === 0) {
                showAlert("Minimal harus ada 1 item!", "warning");
                return;
            }

            const submitBtn = geneticForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = 'Memproses...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';

            try {
                const response = await fetch("/hitung-genetic", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        items: items,
                        capacity: capacity,
                        pop_size: pop_size,
                        generations: generations,
                        crossover_rate: crossover_rate,
                        mutation_rate: mutation_rate,
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    displayHasilGenetic(data, parseInt(capacity));
                } else {
                    showAlert("Terjadi kesalahan: " + (data.error || "Unknown error"), "error");
                }
            } catch (error) {
                console.error("Error:", error);
                showAlert("Terjadi kesalahan dalam perhitungan", "error");
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
            }
        });
    }
});

function showAlert(message, type = "info") {
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

function displayHasilGenetic(data, capacity) {
    const hasilSection = document.getElementById("hasilSection");
    const hasilContainer = document.getElementById("hasilContainer");

    let html = `
        <div class="hasil-box" style="animation-delay: 0.1s">
            <h3>Ringkasan Evolusi</h3>
            <div class="hasil-item">
                <span class="hasil-label">Kapasitas Tas</span>
                <span class="hasil-value">${capacity} kg</span>
            </div>
            <div class="hasil-item">
                <span class="hasil-label">Total Generasi</span>
                <span class="hasil-value">${data.generations.length}</span>
            </div>
        </div>
        
        <div class="hasil-box" style="animation-delay: 0.2s">
            <h3>Proses Evolusi</h3>
            <div class="generations-container">
    `;

    // Display generations
    data.generations.forEach(function (gen, index) {
        html += `
            <div class="generation-box" style="animation-delay: ${0.1 * index}s">
                <div class="generation-header">Generasi ${gen.generation}</div>
                <div class="chromosome-display">
                    Kromosom: [${gen.best_chromosome.join(", ")}]
                </div>
                <div class="hasil-item">
                    <span class="hasil-label">Item Terpilih</span>
                    <span class="hasil-value">${gen.best_items.join(", ") || "Tidak ada"}</span>
                </div>
                <div class="hasil-item">
                    <span class="hasil-label">Berat / Nilai</span>
                    <span class="hasil-value">${gen.weight} kg / $${gen.value}</span>
                </div>
                <div class="hasil-item">
                    <span class="hasil-label">Fitness</span>
                    <span class="hasil-value">${gen.fitness}</span>
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    // Display final result
    html += `
        <div class="final-result-box">
            <h3>Hasil Akhir (Solusi Optimal)</h3>
            <div class="chromosome-display" style="background: rgba(255,255,255,0.15); color: white;">
                Kromosom Terbaik: [${data.final_result.chromosome.join(", ")}]
            </div>
            <div class="result-item">
                <strong>Item yang Dipilih:</strong>
                <span>${data.final_result.items.join(", ") || "Tidak ada"}</span>
            </div>
            <div class="result-item">
                <strong>Total Berat:</strong>
                <span>${data.final_result.weight} kg</span>
            </div>
            <div class="result-item">
                <strong>Total Nilai:</strong>
                <span>$${data.final_result.value}</span>
            </div>
            <div class="result-item">
                <strong>Fitness Akhir:</strong>
                <span>${data.final_result.fitness}</span>
            </div>
        </div>
    `;

    hasilContainer.innerHTML = html;
    hasilSection.style.display = "block";

    // Expand hasil section if collapsed
    const hasilCollapsible = hasilSection.querySelector(".collapsible-content");
    const hasilParent = hasilSection;

    if (!hasilCollapsible.classList.contains("active")) {
        hasilCollapsible.classList.add("active");
        hasilParent.classList.add("active");
    }

    // Update maxHeight after content is added - use 'none' for dynamic content
    setTimeout(() => {
        hasilCollapsible.style.maxHeight = "none";
    }, 10);

    // Scroll to hasil
    hasilSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
