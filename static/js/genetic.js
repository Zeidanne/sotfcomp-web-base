let itemCount = 4;

document.addEventListener("DOMContentLoaded", function () {
    const geneticForm = document.getElementById("geneticForm");
    const addItemBtn = document.getElementById("addItem");
    const removeItemBtn = document.getElementById("removeItem");

    // Add item button
    if (addItemBtn) {
        addItemBtn.addEventListener("click", function (e) {
            e.preventDefault(); // Prevent any default behavior

            const itemsContainer = document.getElementById("itemsContainer");
            const newItemDiv = document.createElement("div");
            newItemDiv.className = "item-input";
            newItemDiv.setAttribute("data-item", itemCount);

            const itemLetter = String.fromCharCode(65 + itemCount); // A, B, C, D, E, ...

            newItemDiv.innerHTML = `
                <h4>Item ${itemLetter}</h4>
                <div class="item-fields">
                    <div class="form-group">
                        <label>Nama Item:</label>
                        <input type="text" class="item-name" value="${itemLetter}" required />
                    </div>
                    <div class="form-group">
                        <label>Berat (kg):</label>
                        <input type="number" class="item-weight" value="1" min="1" step="1" required />
                    </div>
                    <div class="form-group">
                        <label>Nilai ($):</label>
                        <input type="number" class="item-value" value="1" min="1" step="1" required />
                    </div>
                </div>
            `;

            itemsContainer.appendChild(newItemDiv);
            itemCount++;

            // Update the collapsible content height
            updateCollapsibleHeight();

            console.log("Item added:", itemLetter); // Debug log
        });
    }

    // Remove item button
    if (removeItemBtn) {
        removeItemBtn.addEventListener("click", function (e) {
            e.preventDefault(); // Prevent any default behavior

            const itemsContainer = document.getElementById("itemsContainer");
            const items = itemsContainer.querySelectorAll(".item-input");

            if (items.length > 1) {
                items[items.length - 1].remove();
                itemCount--;

                // Update the collapsible content height
                updateCollapsibleHeight();

                console.log("Item removed. Current count:", itemCount); // Debug log
            } else {
                alert("Minimal harus ada 1 item!");
            }
        });
    }

    // Function to update collapsible content height
    function updateCollapsibleHeight() {
        const activeCollapsibles = document.querySelectorAll(
            ".collapsible.active .collapsible-content"
        );
        activeCollapsibles.forEach((content) => {
            // Reset maxHeight to recalculate
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
            const crossover_rate =
                document.getElementById("crossover_rate").value;
            const mutation_rate =
                document.getElementById("mutation_rate").value;

            // Validate
            if (items.length === 0) {
                alert("Minimal harus ada 1 item!");
                return;
            }

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
                    displayHasilGenetic(data);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Terjadi kesalahan dalam perhitungan");
            }
        });
    }
});

function displayHasilGenetic(data) {
    const hasilSection = document.getElementById("hasilSection");
    const hasilContainer = document.getElementById("hasilContainer");

    let html = `
        <h3>Proses Evolusi:</h3>
    `;

    // Display generations
    data.generations.forEach(function (gen) {
        html += `
            <div class="generation-box">
                <div class="generation-header">Generasi ${gen.generation}</div>
                <div class="chromosome-display">
                    Kromosom: [${gen.best_chromosome.join(", ")}]
                </div>
                <div class="hasil-item">
                    <span class="hasil-label">Item Terpilih:</span>
                    <span class="hasil-value">${
                        gen.best_items.join(", ") || "Tidak ada"
                    }</span>
                </div>
                <div class="hasil-item">
                    <span class="hasil-label">Total Berat:</span>
                    <span class="hasil-value">${gen.weight} kg</span>
                </div>
                <div class="hasil-item">
                    <span class="hasil-label">Total Nilai:</span>
                    <span class="hasil-value">$${gen.value}</span>
                </div>
                <div class="hasil-item">
                    <span class="hasil-label">Fitness:</span>
                    <span class="hasil-value">${gen.fitness}</span>
                </div>
            </div>
        `;
    });

    // Display final result
    html += `
        <div class="final-result-box">
            <h3>🏆 Hasil Akhir (Solusi Optimal)</h3>
            <div class="chromosome-display">
                Kromosom Terbaik: [${data.final_result.chromosome.join(", ")}]
            </div>
            <div class="result-item">
                <strong>Item yang Dipilih:</strong> ${
                    data.final_result.items.join(", ") || "Tidak ada"
                }
            </div>
            <div class="result-item">
                <strong>Total Berat:</strong> ${data.final_result.weight} kg
            </div>
            <div class="result-item">
                <strong>Total Nilai:</strong> $${data.final_result.value}
            </div>
            <div class="result-item">
                <strong>Fitness Akhir:</strong> ${data.final_result.fitness}
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

    // Update maxHeight after content is added
    setTimeout(() => {
        hasilCollapsible.style.maxHeight = hasilCollapsible.scrollHeight + "px";
    }, 10);

    // Scroll to hasil
    hasilSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
