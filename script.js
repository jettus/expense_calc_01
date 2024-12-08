// script.js

async function submitExpense() {
    const date = document.getElementById("date").value;
    const expenseName = document.getElementById("expenseName").value;
    const category = document.getElementById("category").value;
    const amount = document.getElementById("amount").value;

    if (!date || !expenseName || !category || !amount) {
        alert("All fields are required.");
        return;
    }

    const sheetId = "1UxbmDQ07EWTADuFcecBe180Snxai4DFGgm6P8jJyTC8"; // Replace with your actual sheet ID
    const apiKey = "AIzaSyA-SC7BLxz3O6E8ujhcm-DNzw2OID7pP_8"; // Replace with your API Key
    const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Daily_Expenses!A1:D1:append?valueInputOption=USER_ENTERED&key=${apiKey}`;

    const data = {
        values: [[date, expenseName, category, parseFloat(amount)]]
    };

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert("Expense added successfully!");
        } else {
            const error = await response.json();
            console.error("Error:", error);
            alert("Failed to add expense.");
        }
    } catch (err) {
        console.error("Fetch Error:", err);
        alert("An error occurred while submitting the data.");
    }
}
