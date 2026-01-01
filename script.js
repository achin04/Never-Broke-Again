const nameInput = document.getElementById("expense-name");
const amountInput = document.getElementById("expense-amount");
const addBtn = document.getElementById("add-btn");
const expenseList = document.getElementById("expense-list");
const totalDisplay = document.getElementById("total");
const categoryInput = document.getElementById("expense-category");
const filterCategory = document.getElementById("filter-category");
const dateInput = document.getElementById("expense-date")
const filterMonth = document.getElementById("filter-month")

let expenses = [];
let editingExpenses = null;

loadExpenses();

//#region Event listeners
addBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const amount = Number(amountInput.value.trim());
    const category = categoryInput.value;

    if (!name || amount <= 0) {
        nameInput.focus();
        return;
    }

    const date = dateInput.value || new Date().toISOString().split("T")[0];

    if (editingExpenses == null) {
        expenses.push({name, amount, category, date});
    } else {
        expenses[editingExpenses] = {name, amount, category, date};
        editingExpenses = null;
        addBtn.textContent = "Add Expense";
    }

    saveExpenses();
    renderExpenses();
    updateTotal();
    populateMonthFilter();

    //clear inputs
    nameInput.value = "";
    amountInput.value = "";
});

expenseList.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;

    const index = Number(li.dataset.index);

    if(e.target.classList.contains("delete-btn")) {
        expenses.splice(index, 1);
        saveExpenses();
        renderExpenses();
        updateTotal();
        populateMonthFilter();
        return;
    }

    if(e.target.classList.contains("edit-btn")) {
        const expense = expenses[index];
        nameInput.value = expense.name;
        amountInput.value = expense.amount;
        categoryInput.value = expense.category;
        dateInput.value = expense.date;

        editingExpenses = index;
        addBtn.textContent = "Save Changes";
        return;
    }
})

filterCategory.addEventListener("change", () => {
    renderExpenses();
    updateTotal();
});

filterMonth.addEventListener("change", () => {
    renderExpenses();
    updateTotal();
})
//#endregion

function loadExpenses() {
    const stored = localStorage.getItem("expenses");
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            
            expenses = parsed.map(exp => ({
                ...exp,
                date: exp.date || new Date().toISOString().split("T")[0],
            }));
        } catch (err) {
            expenses = [];
            console.error("Failed to parse stored expenses:", err);
        }
        renderExpenses();
        updateTotal();
        populateMonthFilter();
    }
}

function populateMonthFilter() {
    const months = new Set(
        expenses
            .map(expense => (expense && expense.date ? expense.date.slice(0,7) : null))
            .filter(Boolean)
    );

    filterMonth.innerHTML =`<option value="All">All Months</option>`;

    months.forEach(month => {
        const option = document.createElement("option");
        option.value = month;
        option.textContent = month;
        filterMonth.appendChild(option);
    });
}

function getFilteredExpenses() {
    const selectedCategory = filterCategory.value;
    const selectedMonth = filterMonth.value;

    return expenses.filter(item => {
            const matchesCategory =
                selectedCategory === "All" || item.category === selectedCategory;

            const itemDate = item.date || "";
            const matchesMonth =
                selectedMonth ==="All" || itemDate.startsWith(selectedMonth);

            return matchesCategory && matchesMonth
        });
}

//#region CRUD
function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function renderExpenses() {
    expenseList.innerHTML = "";
    const filteredExpenses = getFilteredExpenses().map((item, index) => ({...item, index}));

    filteredExpenses.forEach(item => {
        const { name, amount, category, date, index } = item;

        const li = document.createElement("li");

        li.innerHTML = `
            <div class="expense-info">
                <span>${name}</span>
                <span class="amount">$${amount}</span>
                <span class="category">${category}</span>
                <span class="date">${date}</span>
            </div>
            <div class="actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">X</button>
            </div>
        `;

        li.dataset.index = index;
        li.dataset.amount = amount;
        li.dataset.name = name;
        li.dataset.category = category;

        expenseList.appendChild(li);
    });
}

function updateTotal() {
    const filteredExpenses = getFilteredExpenses();
    const total = filteredExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

    totalDisplay.textContent = total;
}
//#endregion