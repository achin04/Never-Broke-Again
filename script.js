const nameInput = document.getElementById("expense-name");
const amountInput = document.getElementById("expense-amount");
const addBtn = document.getElementById("add-btn");
const expenseList = document.getElementById("expense-list");
const totalDisplay = document.getElementById("total");
const categoryInput = document.getElementById("expense-catagory");
const filterCategory = document.getElementById("filter-catagory");

let expenses = [];

loadExpenses();

addBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const amount = Number(amountInput.value.trim());
    const category = categoryInput.value;

    if (!name || amount <= 0) {
        nameInput.focus();
        return;
    }

    //add to array
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
    if(!e.target.classList.contains("delete-btn")) return;
    
    const li = e.target.parentElement;
    const name = li.dataset.name;
    const amount = Number(li.dataset.amount);
    const category = li.dataset.category;

    expenses = expenses.filter(exp => !(exp.name === name && exp.amount === amount && exp.category === category));
    saveExpenses();
    renderExpenses();
    updateTotal();
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

    const filteredExpenses = selectedCategory === "All" ? expenses : expenses.filter(exp => exp.category === selectedCategory);

    filteredExpenses.forEach(exp => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="expense-info">
                <span>${exp.name}</span>
                <span class="amount">$${exp.amount}</span>
            </div>
            <button class="delete-btn">X</button>
        `;

        li.dataset.amount = exp.amount;
        li.dataset.name = exp.name;
        li.dataset.category = exp.category;

        expenseList.appendChild(li);
    })
}

function updateTotal() {
    const selectedCategory = filterCategory.value;

    const filteredExpenses = selectedCategory === "All" ? expenses : expenses.filter(exp => exp.category === selectedCategory);

    const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    totalDisplay.textContent = total;
}