const nameInput = document.getElementById("expense-name");
const amountInput = document.getElementById("expense-amount");
const addBtn = document.getElementById("add-btn");
const expenseList = document.getElementById("expense-list");
const totalDisplay = document.getElementById("total");

let expenses = [];

addBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const amount = Number(amountInput.value.trim());

    if (!name || !amount || amount <= 0) {
        alert("Enter a valid name and amount");
        return;
    }

    //add to array
    const expense = { name, amount };
    expenses.push(expense);
    saveExpenses();

    addExpenseToUI(expense);

    updateTotal();

    //clear inputs
    nameInput.value = "";
    amountInput.value = "";
});

expenseList.addEventListener("click", (e) => {
    if(e.target.classList.contains("delete-btn")) {
        const li = e.target.parentElement;
        const amount = Number(li.dataset.amount) || 0;

        //Update total
        total -= amount;
        totalDisplay.textContent = total;

        li.remove();
    }
})

function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function loadExpenses() {
    const stored = localStorage.getItem("expenses");
    if (stored) {
        expenses = JSON.parse(stored);
        expenses.forEach(exp => addExpenseToUI(exp));
        updateTotal();
    }
}

function addExpenseToUI(expense) {
    const li = document.createElement("li");
    li.innerHTML = `${expense.name}: $${expense.amount} <button class="delete-btn">X</button>`;
    li.dataset.amount = expense.amount;
    li.dataset.name = expense.name;

    expenseList.appendChild(li);
}

function updateTotal() {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    totalDisplay.textcontext = total;
}