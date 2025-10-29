document.addEventListener("DOMContentLoaded", function () {
    const collapsibles = document.querySelectorAll(".collapsible-header");

    collapsibles.forEach((header) => {
        header.addEventListener("click", function () {
            const content = this.nextElementSibling;
            const parent = this.parentElement;

            // Toggle active class
            parent.classList.toggle("active");

            // Toggle content visibility
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    const methodsWithSE = ["opening", "closing", "boundary"];

    const sePlaceholders = {
        disk: "5",
        diamond: "3",
        line: "[10, 45]",
        rectangle: "[5, 10]",
        square: "4",
        octagon: "3",
        sphere: "3",
    };

    const seLabelHints = {
        disk: "Ukuran Elemen (radius, contoh: 5)",
        diamond: "Ukuran Elemen (radius, contoh: 3)",
        line: "Ukuran Elemen ([panjang, sudut], contoh: [10, 45])",
        rectangle: "Ukuran Elemen ([tinggi, lebar], contoh: [5, 10])",
        square: "Ukuran Elemen (panjang sisi, contoh: 4)",
        octagon: "Ukuran Elemen (radius, contoh: 3)",
        sphere: "Ukuran Elemen (radius, contoh: 3)",
    };

    function toggleSeOptions() {
        const selectedMethod = methodSelect.value;
        if (methodsWithSE.includes(selectedMethod)) {
            seOptionsDiv.style.display = "block";
            seTypeSelect.setAttribute("required", "required");
            seSizeInput.setAttribute("required", "required");
        } else {
            seOptionsDiv.style.display = "none";
            seTypeSelect.removeAttribute("required");
            seSizeInput.removeAttribute("required");
        }
    }

    if (methodSelect && seOptionsDiv) {
        methodSelect.addEventListener("change", function () {
            toggleSeOptions();
        });
        if (methodSelect.value) {
            toggleSeOptions();
        }
    }

    if (seTypeSelect && seSizeLabel && seSizeInput) {
        seTypeSelect.addEventListener("change", function () {
            const sel = seTypeSelect.value;
            seSizeLabel.innerText = seLabelHints[sel] || "Ukuran Elemen:";
            seSizeInput.placeholder = sePlaceholders[sel] || "5";
            seSizeInput.value = sePlaceholders[sel] || "";
        });
        if (seTypeSelect.value) {
            seTypeSelect.dispatchEvent(new Event("change"));
        }
    }
});
