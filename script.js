const nameInput = document.getElementById("expense-name");
const amountInput = document.getElementById("expense-amount");
const addBtn = document.getElementById("add-btn");
const expenseList = document.getElementById("expense-list");
const totalDisplay = document.getElementById("total");
const categoryInput = document.getElementById("expense-category");
const filterCategory = document.getElementById("filter-category");

let expenses = [];
let editingExpenses = null;

loadExpenses();

addBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const amount = Number(amountInput.value.trim());
    const category = categoryInput.value;

    if (!name || amount <= 0) {
        nameInput.focus();
        return;
    }

    if (editingExpenses == null) {
        expenses.push({name, amount, category});
    } else {
        expenses[editingExpenses] = {name, amount, category};
        editingExpenses = null;
        addBtn.textContent = "Add Expense";
    }

    const expense = { name, amount, category };
    expenses.push(expense);

    saveExpenses();
    renderExpenses();
    updateTotal();

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
        return;
    }

    if(e.target.classList.contains("edit-btn")) {
        const expense = expenses[index];
        nameInput.value = expense.name;
        amountInput.value = expense.amount;
        categoryInput.value = expense.category;

        editingExpenses = index;
        addBtn.textContent = "Save Changes";
        return;
    }
})

filterCategory.addEventListener("change", () => {
    renderExpenses();
    updateTotal();
});

function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function loadExpenses() {
    const stored = localStorage.getItem("expenses");
    if (stored) {
        expenses = JSON.parse(stored);
        renderExpenses();
        updateTotal();
    }
}

function renderExpenses() {
    expenseList.innerHTML = "";

    const selectedCategory = filterCategory.value;

    const filteredExpenses = expenses
        .map((exp, index) => ({ ...exp, index }))
        .filter(item => selectedCategory === "All" || item.category === selectedCategory);

    filteredExpenses.forEach(item => {
        const { name, amount, category, index } = item;

        const li = document.createElement("li");

        li.innerHTML = `
            <div class="expense-info">
                <span>${name}</span>
                <span class="amount">$${amount}</span>
                <span class="category">${category}</span>
            </div>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">X</button>
        `;

        li.dataset.index = index;
        li.dataset.amount = amount;
        li.dataset.name = name;
        li.dataset.category = category;

        expenseList.appendChild(li);
    });
}


function updateTotal() {
    const selectedCategory = filterCategory.value;

    const filteredExpenses = selectedCategory === "All" ? expenses : expenses.filter(exp => exp.category === selectedCategory);

    const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    totalDisplay.textContent = total;
}