(() => {
    "use strict";

    const $ = (id) => document.getElementById(id);

    const state = {
        photoDataUrl: "",
        fileName: "",
        occasion: "",
        outfitType: "",
        color: ""
    };

    // ---------- PAGE NAVIGATION ----------
    window.showPage = function (pageId) {
        document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));

        const page = $(pageId);
        if (page) {
            page.classList.add("active");
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // ---------- LOGIN ----------
    $("loginForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const email = $("email").value.trim();
        const password = $("password").value.trim();

        if (!email || !password) {
            alert("Please enter email and password.");
            return;
        }

        showPage("dashboard");
    });

    // ---------- PHOTO UPLOAD ----------
    $("outfitFile").addEventListener("change", function () {
        const file = this.files && this.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image.");
            this.value = "";
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert("Please select an image smaller than 10 MB.");
            this.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {
            state.photoDataUrl = event.target.result;
            state.fileName = file.name;

            $("outfitImage").src = state.photoDataUrl;
            $("outfitImage").style.display = "block";
            $("outfitPlaceholder").style.display = "none";
            $("fileStatus").textContent = file.name;

            updateSummary();
        };

        reader.readAsDataURL(file);
    });

    // ---------- OUTFIT TYPE ----------
    document.querySelectorAll("#outfitTypes .choice-btn").forEach(button => {
        button.addEventListener("click", function () {
            document.querySelectorAll("#outfitTypes .choice-btn").forEach(btn => {
                btn.classList.remove("selected");
                btn.setAttribute("aria-pressed", "false");
            });

            this.classList.add("selected");
            this.setAttribute("aria-pressed", "true");

            state.outfitType = this.dataset.value;
            $("outfitType").value = state.outfitType;

            updateSummary();
        });
    });

    // ---------- SELECTS ----------
    $("occasion").addEventListener("change", function () {
        state.occasion = this.value;
        updateSummary();
    });

    $("outfitColor").addEventListener("change", function () {
        state.color = this.value;
        updateSummary();
    });

    function updateSummary() {
        const occasion = state.occasion || "—";
        const type = state.outfitType || "—";
        const color = state.color || "—";

        $("selectionSummary").innerHTML = `
            <strong>Your selections</strong>
            <span>${escapeHtml(occasion)} · ${escapeHtml(type)} · ${escapeHtml(color)}</span>
        `;
    }

    // ---------- RECOMMENDATION ENGINE ----------
    /*
      This is a deterministic client-side recommendation engine.
      IMPORTANT: every user selection is read at submit time, so changing
      one field can never leave the result using an old/default value.
    */
    const recommendationRules = {
        "Casual": {
            "T-Shirt": ["T-Shirt + Jeans", "A relaxed T-shirt with well-fitted jeans is a natural casual combination."],
            "Shirt": ["Casual Shirt + Jeans", "A casual shirt with jeans keeps the look comfortable while still looking polished."],
            "Jacket": ["Light Jacket + Jeans", "A light jacket over a simple base layer works well for a casual outing."],
            "Jeans": ["Jeans + T-Shirt", "Jeans are paired with a simple T-shirt to keep the outfit balanced and casual."],
            "Traditional": ["Casual Traditional Wear", "A simple traditional outfit keeps the look comfortable without becoming too formal."],
            "Formal": ["Smart Casual Formal Look", "A clean formal-inspired combination gives casual occasions a sharper finish."]
        },
        "College": {
            "T-Shirt": ["T-Shirt + Jeans", "A comfortable T-shirt and jeans combination is practical for everyday college wear."],
            "Shirt": ["Casual Shirt + Jeans", "A casual shirt with jeans gives a neat college-ready appearance."],
            "Jacket": ["Jacket + Jeans", "A lightweight jacket and jeans create a modern college look."],
            "Jeans": ["Jeans + T-Shirt", "Jeans with a simple top create an easy everyday college combination."],
            "Traditional": ["Modern Traditional Wear", "A contemporary traditional combination can keep the look distinctive and comfortable."],
            "Formal": ["Smart Shirt + Trousers", "A smart shirt and trousers create a clean look for presentations or formal college events."]
        },
        "Office": {
            "T-Shirt": ["Premium Polo / T-Shirt + Chinos", "A clean, structured top with chinos gives a polished business-casual appearance."],
            "Shirt": ["Formal Shirt + Trousers", "A well-fitted shirt with trousers is a classic office combination."],
            "Jacket": ["Blazer + Trousers", "A structured jacket with trousers creates a professional office-ready appearance."],
            "Jeans": ["Dark Jeans + Smart Shirt", "Dark jeans paired with a smart shirt create a more office-appropriate casual look."],
            "Traditional": ["Elegant Traditional Wear", "A clean, understated traditional combination works for offices that allow ethnic wear."],
            "Formal": ["Formal Shirt + Trousers", "A formal shirt and trousers provide a professional office combination."]
        },
        "Party": {
            "T-Shirt": ["Statement T-Shirt + Dark Jeans", "A statement top with dark jeans creates a simple but party-ready look."],
            "Shirt": ["Stylish Shirt + Dark Jeans", "A stylish shirt with dark jeans balances comfort and a sharper party appearance."],
            "Jacket": ["Statement Jacket + Dark Jeans", "A statement jacket adds visual interest and works well for an evening party."],
            "Jeans": ["Dark Jeans + Statement Top", "Dark jeans create a versatile base for a party outfit."],
            "Traditional": ["Festive Traditional Wear", "Traditional clothing can create a distinctive festive party look."],
            "Formal": ["Formal Party Suit Look", "A formal combination gives an evening party a polished appearance."]
        },
        "Wedding": {
            "T-Shirt": ["Dressy Top + Tailored Trousers", "For a wedding, upgrade the casual top choice with dressier fabric and tailored trousers."],
            "Shirt": ["Dress Shirt + Tailored Trousers", "A dress shirt with tailored trousers creates a wedding-appropriate formal look."],
            "Jacket": ["Blazer + Tailored Trousers", "A blazer and tailored trousers create a polished wedding guest look."],
            "Jeans": ["Tailored Trousers + Dress Shirt", "Jeans are replaced with tailored trousers to suit the wedding setting."],
            "Traditional": ["Traditional Wedding Wear", "Traditional clothing is a natural choice for a wedding and can be styled elegantly."],
            "Formal": ["Formal Suit / Blazer Look", "A structured formal look is suitable for a wedding's dressier setting."]
        },
        "Date": {
            "T-Shirt": ["Premium T-Shirt + Clean Jeans", "A fitted, clean T-shirt with jeans creates a relaxed but intentional date look."],
            "Shirt": ["Smart Shirt + Chinos", "A smart shirt and chinos create a balanced, polished date outfit."],
            "Jacket": ["Jacket + Chinos", "A clean jacket over a simple base creates a stylish date-night look."],
            "Jeans": ["Clean Jeans + Smart Top", "Well-fitted jeans provide a versatile base for a date outfit."],
            "Traditional": ["Elegant Traditional Look", "A neat traditional outfit can create a distinctive and refined date look."],
            "Formal": ["Smart Formal Look", "A refined formal combination gives the outfit a polished date-night finish."]
        }
    };

    const colorSuggestions = {
        "Any Color": "Choose a color that complements your existing wardrobe and personal preference.",
        "Black": "Black is versatile and easy to coordinate with neutral bottoms and shoes.",
        "White": "White creates a clean, versatile base and pairs easily with darker bottoms.",
        "Blue": "Blue is easy to coordinate and works especially well with neutral bottoms.",
        "Green": "Green adds color while still working well with neutral supporting pieces.",
        "Red": "Red creates a stronger accent, so neutral supporting pieces help balance it.",
        "Beige": "Beige gives the look a soft neutral base and works well with darker or earthy tones."
    };

    function getRecommendation(occasion, type, color) {
        const rules = recommendationRules[occasion] || recommendationRules.Casual;
        const result = rules[type] || rules["T-Shirt"];

        let title = result[0];
        let note = result[1];

        // Use the selected color in the actual recommendation text.
        if (color !== "Any Color") {
            title = `${color} ${title}`;
            note += ` Your selected ${color.toLowerCase()} color is included in the recommendation.`;
        }

        return {
            title,
            note,
            colorNote: colorSuggestions[color] || colorSuggestions["Any Color"]
        };
    }

    // ---------- FORM SUBMIT ----------
    $("outfitForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const file = $("outfitFile").files[0];
        const occasion = $("occasion").value;
        const outfitType = $("outfitType").value;
        const color = $("outfitColor").value;

        // Read and validate ALL fields every time the button is clicked.
        if (!file || !state.photoDataUrl) {
            alert("Please upload your photo first.");
            return;
        }

        if (!occasion) {
            alert("Please select an occasion.");
            $("occasion").focus();
            return;
        }

        if (!outfitType) {
            alert("Please select an outfit type.");
            $("outfitTypes .choice-btn").forEach(btn => btn.classList.add("required-hint"));
            setTimeout(() => {
                $("outfitTypes .choice-btn").forEach(btn => btn.classList.remove("required-hint"));
            }, 1200);
            return;
        }

        if (!color) {
            alert("Please select a preferred color.");
            $("outfitColor").focus();
            return;
        }

        state.occasion = occasion;
        state.outfitType = outfitType;
        state.color = color;

        const recommendation = getRecommendation(occasion, outfitType, color);

        $("resultPerson").src = state.photoDataUrl;
        $("resultOutfit").textContent = recommendation.title;
        $("resultDescription").textContent = recommendation.note;
        $("resultOccasion").textContent = occasion;
        $("resultType").textContent = outfitType;
        $("resultColor").textContent = color;
        $("resultNote").textContent = recommendation.colorNote;
        $("resultMatch").textContent = `✨ Personalized match: ${occasion} + ${outfitType} + ${color}`;

        showPage("outfitResult");
    });

    // ---------- SECURITY / HTML ESCAPING ----------
    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    updateSummary();
})();
