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
let editingIndex = null;

loadExpenses();

//#region Event listeners
addBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const amount = Number(amountInput.value.trim());
    const category = categoryInput.value;

    //vaidation to ensure name is not emplty and amount is positive
    if (!name || amount <= 0) {
        nameInput.focus();
        return;
    }

    //assigns current date if no date is provided
    const date = dateInput.value || new Date().toISOString().split("T")[0];

    // uses editingIndex to determine if adding new or editing existing
    if (editingIndex == null) {
        expenses.push({name, amount, category, date});
    } else {
        expenses[editingIndex] = {name, amount, category, date};
        editingIndex = null;
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
    // finds closest li element to determine which expense was clicked
    const li = e.target.closest("li");
    if (!li) return;

    // gets index from data attribute
    const index = Number(li.dataset.index);

    //delete expense
    if(e.target.classList.contains("delete-btn")) {
        //removes (1) expense from array at given index
        expenses.splice(index, 1);
        saveExpenses();
        renderExpenses();
        updateTotal();
        populateMonthFilter();
        return;
    }

    //edit expense
    if(e.target.classList.contains("edit-btn")) {
        const expense = expenses[index];
        nameInput.value = expense.name;
        amountInput.value = expense.amount;
        categoryInput.value = expense.category;
        dateInput.value = expense.date;

        // Enter edit mode so the selected expense is overwritten on save
        editingIndex = index;

        // Signal to the user that the form will save changes
        addBtn.textContent = "Save Changes";
        return;
    }
});

//filters categories and months to render expenses and update total based on user selection in dropdowns
filterCategory.addEventListener("change", () => {
    renderExpenses();
    updateTotal();
})

filterMonth.addEventListener("change", () => {
    renderExpenses();
    updateTotal();
})
//#endregion

function loadExpenses() {
    // retrieves stored expenses from localStorage
    const stored = localStorage.getItem("expenses");
    if (stored) {
        try {
            // parses stored JSON string back into array
            const parsed = JSON.parse(stored);
            
            // ensures each expense has a date property
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
    //creates a set of unique months from expenses
    const months = new Set(
        expenses
            .map(expense => (expense && expense.date ? expense.date.slice(0,7) : null)) //YYYY-MM
            .filter(Boolean) //removes null/undefined
    );

    filterMonth.innerHTML =`<option value="All">All Months</option>`;

    //adds each unique month as an option in the month filter dropdown
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
        // Allow all categories when "All" is selected, otherwise restrict to the chosen category
        const matchesCategory =
            selectedCategory === "All" || item.category === selectedCategory;

        const itemDate = item.date || "";
        // Allow all months when "All" is selected, otherwise match by YYYY-MM prefix
        const matchesMonth =
            selectedMonth ==="All" || itemDate.startsWith(selectedMonth);

        return matchesCategory && matchesMonth
    });
}

//#region CRUD
function saveExpenses() {
    // stores expenses array as JSON string in localStorage
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function renderExpenses() {
    expenseList.innerHTML = "";
    const filteredExpenses = getFilteredExpenses();

    filteredExpenses.forEach(item => {
        const originalIndex = expenses.indexOf(item);
        const { name, amount, category, date } = item;
        const li = document.createElement("li");

        // sets inner HTML of list item with expense details and action buttons
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

        // Store index and other details as data attributes for easy access during edit/delete
        li.dataset.index = originalIndex;
        li.dataset.amount = amount;
        li.dataset.name = name;
        li.dataset.category = category;

        expenseList.appendChild(li);
    });
}

function updateTotal() {
    const filteredExpenses = getFilteredExpenses();
    const total = filteredExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0); //Add up all visible expenses, but treat anything invalid as zero so the total always stays usable.

    totalDisplay.textContent = total;
}
//#endregion