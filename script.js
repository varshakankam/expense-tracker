/* =====================================================
   EXPENSE TRACKER - STEP 10
===================================================== */


/* =========================
   DATA
========================= */

let expenses =
    JSON.parse(localStorage.getItem("expenses")) || [];

let budgets =
    JSON.parse(localStorage.getItem("budgets")) || {};

let editingIndex = null;

let categoryChart = null;
let incomeExpenseChart = null;
let monthlyExpenseChart = null;


/* =========================
   ELEMENTS
========================= */

const expenseForm =
    document.getElementById("expenseForm");

const descriptionInput =
    document.getElementById("description");

const amountInput =
    document.getElementById("amount");

const categoryInput =
    document.getElementById("category");

const dateInput =
    document.getElementById("date");

const typeInput =
    document.getElementById("type");

const submitBtn =
    document.getElementById("submitBtn");

const cancelEdit =
    document.getElementById("cancelEdit");

const transactionList =
    document.getElementById("transactionList");

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const typeFilter =
    document.getElementById("typeFilter");

const monthFilter =
    document.getElementById("monthFilter");

const clearFilter =
    document.getElementById("clearFilter");


/* =========================
   DEFAULT DATE
========================= */

const today = new Date();

dateInput.value =
    today.toISOString().split("T")[0];

document.getElementById("budgetMonth").value =
    today.toISOString().slice(0, 7);


/* =========================
   NORMALIZE OLD DATA
========================= */

expenses = expenses.map(item => {

    if (!item.type) {
        item.type = "expense";
    }

    return item;
});

localStorage.setItem(
    "expenses",
    JSON.stringify(expenses)
);


/* =========================
   SAVE DATA
========================= */

function saveExpenses() {

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

}


function saveBudgets() {

    localStorage.setItem(
        "budgets",
        JSON.stringify(budgets)
    );

}


/* =========================
   CURRENCY
========================= */

function formatCurrency(amount) {

    return "₹" + Number(amount).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });

}


/* =========================
   TOAST
========================= */

let toastTimer;

function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


/* =========================
   DATE HELPERS
========================= */

function getCurrentMonth() {

    return new Date().toISOString().slice(0, 7);

}


function getMonthFromDate(date) {

    return date.slice(0, 7);

}


/* =========================
   ADD / EDIT TRANSACTION
========================= */

expenseForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const description =
        descriptionInput.value.trim();

    const amount =
        Number(amountInput.value);

    const category =
        categoryInput.value;

    const date =
        dateInput.value;

    const type =
        typeInput.value;


    if (
        !description ||
        !amount ||
        amount <= 0 ||
        !category ||
        !date
    ) {

        showToast("Please enter valid transaction details.");

        return;
    }


    const transaction = {

        description,
        amount,
        category,
        date,
        type

    };


    if (editingIndex !== null) {

        expenses[editingIndex] =
            transaction;

        showToast("Transaction updated successfully.");

        editingIndex = null;

        submitBtn.textContent =
            "Add Transaction";

        cancelEdit.style.display =
            "none";

    } else {

        expenses.push(transaction);

        showToast("Transaction added successfully.");

    }


    saveExpenses();

    expenseForm.reset();

    dateInput.value =
        new Date().toISOString().split("T")[0];

    typeInput.value =
        "expense";

    updateEverything();

});


/* =========================
   EDIT TRANSACTION
========================= */

function editTransaction(index) {

    const transaction =
        expenses[index];

    descriptionInput.value =
        transaction.description;

    amountInput.value =
        transaction.amount;

    categoryInput.value =
        transaction.category;

    dateInput.value =
        transaction.date;

    typeInput.value =
        transaction.type;

    editingIndex = index;

    submitBtn.textContent =
        "Update Transaction";

    cancelEdit.style.display =
        "inline-block";

    document.getElementById("transactions")
        .scrollIntoView({
            behavior: "smooth"
        });

}


cancelEdit.addEventListener("click", function() {

    editingIndex = null;

    expenseForm.reset();

    dateInput.value =
        new Date().toISOString().split("T")[0];

    typeInput.value =
        "expense";

    submitBtn.textContent =
        "Add Transaction";

    cancelEdit.style.display =
        "none";

});


/* =========================
   DELETE
========================= */

function deleteTransaction(index) {

    const transaction =
        expenses[index];

    const confirmDelete =
        confirm(
            `Delete "${transaction.description}"?`
        );

    if (!confirmDelete) {
        return;
    }

    expenses.splice(index, 1);

    saveExpenses();

    showToast("Transaction deleted.");

    updateEverything();

}


/* =========================
   FILTER TRANSACTIONS
========================= */

function getFilteredExpenses() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();

    const selectedCategory =
        categoryFilter.value;

    const selectedType =
        typeFilter.value;

    const selectedMonth =
        monthFilter.value;


    return expenses.filter(transaction => {

        const matchesSearch =
            transaction.description
                .toLowerCase()
                .includes(search)

            ||

            transaction.category
                .toLowerCase()
                .includes(search);


        const matchesCategory =
            selectedCategory === "all"
            ||
            transaction.category === selectedCategory;


        const matchesType =
            selectedType === "all"
            ||
            transaction.type === selectedType;


        const matchesMonth =
            !selectedMonth
            ||
            getMonthFromDate(transaction.date)
                === selectedMonth;


        return (
            matchesSearch &&
            matchesCategory &&
            matchesType &&
            matchesMonth
        );

    });

}


searchInput.addEventListener(
    "input",
    renderTransactions
);

categoryFilter.addEventListener(
    "change",
    renderTransactions
);

typeFilter.addEventListener(
    "change",
    renderTransactions
);

monthFilter.addEventListener(
    "change",
    function() {

        renderTransactions();
        updateMonthlyReport();

    }
);


clearFilter.addEventListener(
    "click",
    function() {

        searchInput.value = "";
        categoryFilter.value = "all";
        typeFilter.value = "all";
        monthFilter.value = "";

        renderTransactions();
        updateMonthlyReport();

        showToast("Filters cleared.");

    }
);


/* =========================
   RENDER TRANSACTIONS
========================= */

function renderTransactions() {

    const filtered =
        getFilteredExpenses();


    if (filtered.length === 0) {

        transactionList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📭
                </div>

                <h3>No transactions found</h3>

                <p>
                    Try changing your filters
                    or add a new transaction.
                </p>

            </div>

        `;

        return;
    }


    transactionList.innerHTML =
        filtered.map(transaction => {

            const realIndex =
                expenses.indexOf(transaction);

            const amountClass =
                transaction.type === "income"
                ? "income-text"
                : "expense-text";

            const sign =
                transaction.type === "income"
                ? "+"
                : "-";


            return `

                <div class="transaction-item">

                    <div class="transaction-left">

                        <h3>
                            ${escapeHTML(transaction.description)}
                        </h3>

                        <p>
                            ${escapeHTML(transaction.category)}
                            •
                            ${transaction.date}
                            •
                            ${transaction.type}
                        </p>

                    </div>


                    <div class="transaction-right">

                        <div class="transaction-amount ${amountClass}">
                            ${sign}${formatCurrency(transaction.amount)}
                        </div>

                        <div class="transaction-actions">

                            <button
                                class="edit-btn"
                                onclick="editTransaction(${realIndex})"
                            >
                                Edit
                            </button>

                            <button
                                class="delete-btn"
                                onclick="deleteTransaction(${realIndex})"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </div>

            `;

        }).join("");

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* =========================
   MAIN SUMMARY
========================= */

function updateSummary() {

    let income = 0;
    let expense = 0;

    expenses.forEach(transaction => {

        if (transaction.type === "income") {

            income += Number(transaction.amount);

        } else {

            expense += Number(transaction.amount);

        }

    });


    const balance =
        income - expense;


    document.getElementById("totalIncome")
        .textContent =
        formatCurrency(income);

    document.getElementById("totalExpense")
        .textContent =
        formatCurrency(expense);

    document.getElementById("balance")
        .textContent =
        formatCurrency(balance);

    document.getElementById("transactionCount")
        .textContent =
        expenses.length;


    const currentMonth =
        getCurrentMonth();


    let currentMonthExpense = 0;

    expenses.forEach(transaction => {

        if (
            transaction.type === "expense"
            &&
            getMonthFromDate(transaction.date)
                === currentMonth
        ) {

            currentMonthExpense +=
                Number(transaction.amount);

        }

    });


    document.getElementById("monthlyExpense")
        .textContent =
        formatCurrency(currentMonthExpense);

}


/* =========================
   QUICK OVERVIEW
========================= */

function updateDashboard() {

    const currentMonth =
        getCurrentMonth();

    let monthlyIncome = 0;
    let monthlyExpense = 0;

    let expenseTotal = 0;
    let expenseCount = 0;


    expenses.forEach(transaction => {

        if (transaction.type === "income") {

            if (
                getMonthFromDate(transaction.date)
                === currentMonth
            ) {

                monthlyIncome +=
                    Number(transaction.amount);

            }

        } else {

            expenseTotal +=
                Number(transaction.amount);

            expenseCount++;


            if (
                getMonthFromDate(transaction.date)
                === currentMonth
            ) {

                monthlyExpense +=
                    Number(transaction.amount);

            }

        }

    });


    const savings =
        monthlyIncome - monthlyExpense;


    const averageExpense =
        expenseCount > 0
        ? expenseTotal / expenseCount
        : 0;


    document.getElementById("currentMonthIncome")
        .textContent =
        formatCurrency(monthlyIncome);

    document.getElementById("currentMonthExpenses")
        .textContent =
        formatCurrency(monthlyExpense);

    document.getElementById("currentMonthSavings")
        .textContent =
        formatCurrency(savings);

    document.getElementById("averageExpense")
        .textContent =
        formatCurrency(averageExpense);


    /* Highest category */

    const categoryTotals = {};


    expenses.forEach(transaction => {

        if (transaction.type !== "expense") {
            return;
        }

        categoryTotals[transaction.category] =
            (categoryTotals[transaction.category] || 0)
            + Number(transaction.amount);

    });


    const categories =
        Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1]);


    if (categories.length > 0) {

        document.getElementById("highestCategory")
            .textContent =
            `${categories[0][0]} (${formatCurrency(categories[0][1])})`;

    } else {

        document.getElementById("highestCategory")
            .textContent =
            "No data";

    }


    document.getElementById("expenseTransactionCount")
        .textContent =
        expenseCount;


    updateDashboardBudget();

}


/* =========================
   DASHBOARD BUDGET %
========================= */

function updateDashboardBudget() {

    const month =
        getCurrentMonth();

    const budget =
        Number(budgets[month]) || 0;


    if (budget <= 0) {

        document.getElementById(
            "dashboardBudgetPercent"
        ).textContent = "No budget";

        return;

    }


    let spent = 0;

    expenses.forEach(transaction => {

        if (
            transaction.type === "expense"
            &&
            getMonthFromDate(transaction.date)
                === month
        ) {

            spent +=
                Number(transaction.amount);

        }

    });


    const percent =
        (spent / budget) * 100;


    document.getElementById(
        "dashboardBudgetPercent"
    ).textContent =
        Math.round(percent) + "%";

}


/* =========================
   MONTHLY REPORT
========================= */

function updateMonthlyReport() {

    const selectedMonth =
        monthFilter.value || getCurrentMonth();


    let income = 0;
    let expense = 0;
    let count = 0;


    expenses.forEach(transaction => {

        if (
            getMonthFromDate(transaction.date)
            !== selectedMonth
        ) {

            return;

        }


        count++;


        if (transaction.type === "income") {

            income +=
                Number(transaction.amount);

        } else {

            expense +=
                Number(transaction.amount);

        }

    });


    document.getElementById("reportIncome")
        .textContent =
        formatCurrency(income);

    document.getElementById("reportExpense")
        .textContent =
        formatCurrency(expense);

    document.getElementById("reportBalance")
        .textContent =
        formatCurrency(income - expense);

    document.getElementById("reportCount")
        .textContent =
        count;

}


/* =========================
   CATEGORY SUMMARY
========================= */

function updateCategorySummary() {

    const categoryTotals = {};

    expenses.forEach(transaction => {

        if (transaction.type !== "expense") {
            return;
        }

        categoryTotals[transaction.category] =
            (categoryTotals[transaction.category] || 0)
            + Number(transaction.amount);

    });


    const container =
        document.getElementById("categoryBreakdown");


    const entries =
        Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1]);


    if (entries.length === 0) {

        container.innerHTML = `

            <div class="empty-state">
                <p>No expense data available.</p>
            </div>

        `;

        return;
    }


    const total =
        entries.reduce(
            (sum, item) => sum + item[1],
            0
        );


    container.innerHTML =
        entries.map(([category, amount]) => {

            const percent =
                total > 0
                ? (amount / total) * 100
                : 0;


            return `

                <div class="category-row">

                    <div class="category-title">

                        <span>
                            ${escapeHTML(category)}
                        </span>

                        <strong>
                            ${formatCurrency(amount)}
                            (${percent.toFixed(1)}%)
                        </strong>

                    </div>

                    <div class="category-bar">

                        <div
                            class="category-fill"
                            style="width:${percent}%"
                        ></div>

                    </div>

                </div>

            `;

        }).join("");

}


/* =========================
   ADVANCED ANALYTICS
========================= */

function updateAdvancedAnalytics() {

    const expenseTransactions =
        expenses.filter(
            item => item.type === "expense"
        );


    /* Categories */

    const categories =
        new Set(
            expenseTransactions.map(
                item => item.category
            )
        );

    document.getElementById(
        "analyticsCategories"
    ).textContent =
        categories.size;


    /* Largest expense */

    let largest = 0;

    expenseTransactions.forEach(transaction => {

        if (Number(transaction.amount) > largest) {

            largest =
                Number(transaction.amount);

        }

    });


    document.getElementById(
        "largestExpense"
    ).textContent =
        formatCurrency(largest);


    /* Monthly totals */

    const monthlyTotals = {};


    expenseTransactions.forEach(transaction => {

        const month =
            getMonthFromDate(transaction.date);

        monthlyTotals[month] =
            (monthlyTotals[month] || 0)
            + Number(transaction.amount);

    });


    const monthlyValues =
        Object.values(monthlyTotals);


    const averageMonthly =
        monthlyValues.length > 0
        ?
        monthlyValues.reduce(
            (a, b) => a + b,
            0
        ) / monthlyValues.length
        : 0;


    document.getElementById(
        "averageMonthlyExpense"
    ).textContent =
        formatCurrency(averageMonthly);


    /* Expense change */

    const months =
        Object.keys(monthlyTotals)
            .sort();


    if (months.length >= 2) {

        const current =
            monthlyTotals[
                months[months.length - 1]
            ];

        const previous =
            monthlyTotals[
                months[months.length - 2]
            ];


        if (previous === 0) {

            document.getElementById(
                "expenseChange"
            ).textContent =
                "New";

        } else {

            const change =
                ((current - previous) / previous)
                * 100;


            document.getElementById(
                "expenseChange"
            ).textContent =
                `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;

        }

    } else {

        document.getElementById(
            "expenseChange"
        ).textContent =
            "Not enough data";

    }


    updateMonthComparison(monthlyTotals);

}


/* =========================
   MONTH COMPARISON
========================= */

function updateMonthComparison(monthlyTotals) {

    const container =
        document.getElementById("monthComparison");


    const entries =
        Object.entries(monthlyTotals)
            .sort((a, b) => a[0].localeCompare(b[0]));


    if (entries.length === 0) {

        container.innerHTML = `

            <div class="empty-state">
                <p>No monthly data available.</p>
            </div>

        `;

        return;
    }


    const maximum =
        Math.max(
            ...entries.map(item => item[1])
        );


    container.innerHTML =
        entries.map(([month, amount]) => {

            const percent =
                maximum > 0
                ? (amount / maximum) * 100
                : 0;


            return `

                <div class="month-row">

                    <strong>
                        ${month}
                    </strong>

                    <div class="month-bar">

                        <div
                            class="month-fill"
                            style="width:${percent}%"
                        ></div>

                    </div>

                    <strong>
                        ${formatCurrency(amount)}
                    </strong>

                </div>

            `;

        }).join("");

}


/* =========================
   CHARTS
========================= */

function updateCharts() {

    const categoryTotals = {};


    expenses.forEach(transaction => {

        if (transaction.type !== "expense") {
            return;
        }

        categoryTotals[transaction.category] =
            (categoryTotals[transaction.category] || 0)
            + Number(transaction.amount);

    });


    const categoryLabels =
        Object.keys(categoryTotals);

    const categoryValues =
        Object.values(categoryTotals);


    /* Category chart */

    if (categoryChart) {
        categoryChart.destroy();
    }


    categoryChart =
        new Chart(
            document.getElementById("categoryChart"),
            {
                type: "doughnut",

                data: {
                    labels: categoryLabels,
                    datasets: [{
                        data: categoryValues
                    }]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }

            }
        );


    /* Income vs Expense */

    let income = 0;
    let expense = 0;


    expenses.forEach(transaction => {

        if (transaction.type === "income") {

            income += Number(transaction.amount);

        } else {

            expense += Number(transaction.amount);

        }

    });


    if (incomeExpenseChart) {
        incomeExpenseChart.destroy();
    }


    incomeExpenseChart =
        new Chart(
            document.getElementById("incomeExpenseChart"),
            {
                type: "bar",

                data: {
                    labels: [
                        "Income",
                        "Expense"
                    ],

                    datasets: [{
                        label: "Amount",
                        data: [
                            income,
                            expense
                        ]
                    }]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }

            }
        );


    /* Monthly expenses */

    const monthlyTotals = {};


    expenses.forEach(transaction => {

        if (transaction.type !== "expense") {
            return;
        }

        const month =
            getMonthFromDate(transaction.date);

        monthlyTotals[month] =
            (monthlyTotals[month] || 0)
            + Number(transaction.amount);

    });


    const months =
        Object.keys(monthlyTotals)
            .sort();


    const monthlyValues =
        months.map(
            month => monthlyTotals[month]
        );


    if (monthlyExpenseChart) {
        monthlyExpenseChart.destroy();
    }


    monthlyExpenseChart =
        new Chart(
            document.getElementById("monthlyExpenseChart"),
            {
                type: "line",

                data: {
                    labels: months,

                    datasets: [{
                        label: "Monthly Expenses",
                        data: monthlyValues,
                        tension: 0.3
                    }]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }

            }
        );

}


/* =========================
   BUDGET
========================= */

document.getElementById("saveBudget")
    .addEventListener("click", function() {

        const month =
            document.getElementById("budgetMonth")
                .value;

        const amount =
            Number(
                document.getElementById("budgetAmount")
                    .value
            );


        if (!month || amount <= 0) {

            showToast(
                "Enter a valid budget and month."
            );

            return;

        }


        budgets[month] =
            amount;

        saveBudgets();

        document.getElementById("budgetAmount")
            .value = "";


        showToast(
            "Monthly budget saved."
        );

        updateBudget();

        updateDashboard();

    });


function updateBudget() {

    const month =
        document.getElementById("budgetMonth")
            .value || getCurrentMonth();


    const budget =
        Number(budgets[month]) || 0;


    let spent = 0;


    expenses.forEach(transaction => {

        if (
            transaction.type === "expense"
            &&
            getMonthFromDate(transaction.date)
                === month
        ) {

            spent +=
                Number(transaction.amount);

        }

    });


    const remaining =
        budget - spent;


    const percent =
        budget > 0
        ? (spent / budget) * 100
        : 0;


    document.getElementById("budgetDisplay")
        .textContent =
        formatCurrency(budget);

    document.getElementById("budgetSpent")
        .textContent =
        formatCurrency(spent);

    document.getElementById("budgetRemaining")
        .textContent =
        formatCurrency(remaining);


    document.getElementById("budgetPercent")
        .textContent =
        Math.round(percent) + "%";


    const progress =
        document.getElementById("budgetProgress");


    progress.style.width =
        Math.min(percent, 100) + "%";


    const message =
        document.getElementById("budgetMessage");


    if (budget === 0) {

        message.textContent =
            "Set a monthly budget to start tracking.";

        message.className =
            "budget-message";

    } else if (spent > budget) {

        message.textContent =
            `⚠ Budget exceeded by ${formatCurrency(spent - budget)}.`;

        message.className =
            "budget-message budget-warning";

    } else {

        message.textContent =
            `You have ${formatCurrency(remaining)} remaining.`;

        message.className =
            "budget-message budget-safe";

    }

}


document.getElementById("budgetMonth")
    .addEventListener(
        "change",
        updateBudget
    );


/* =========================
   CSV EXPORT
========================= */

document.getElementById("exportCSV")
    .addEventListener("click", function() {

        if (expenses.length === 0) {

            showToast(
                "No transactions to export."
            );

            return;

        }


        let csv =
            "Description,Amount,Category,Date,Type\n";


        expenses.forEach(transaction => {

            csv +=
                `"${transaction.description.replace(/"/g, '""')}",` +
                `${transaction.amount},` +
                `"${transaction.category}",` +
                `${transaction.date},` +
                `${transaction.type}\n`;

        });


        const blob =
            new Blob(
                [csv],
                {
                    type: "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "expense-tracker.csv";

        link.click();

        URL.revokeObjectURL(url);


        showToast(
            "CSV downloaded successfully."
        );

    });


/* =========================
   BACKUP
========================= */

document.getElementById("backupData")
    .addEventListener("click", function() {

        const backup = {

            appName:
                "Expense Tracker",

            version:
                "Step 10",

            exportedAt:
                new Date().toISOString(),

            expenses:
                expenses,

            budgets:
                budgets

        };


        const blob =
            new Blob(
                [
                    JSON.stringify(
                        backup,
                        null,
                        2
                    )
                ],
                {
                    type: "application/json"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "expense-tracker-backup.json";

        link.click();

        URL.revokeObjectURL(url);


        document.getElementById(
            "dataMessage"
        ).textContent =
            "Backup downloaded successfully.";

        showToast(
            "Backup downloaded."
        );

    });


/* =========================
   RESTORE
========================= */

document.getElementById("restoreFile")
    .addEventListener("change", function(event) {

        const file =
            event.target.files[0];

        if (!file) {
            return;
        }


        const reader =
            new FileReader();


        reader.onload = function(e) {

            try {

                const backup =
                    JSON.parse(e.target.result);


                if (
                    !Array.isArray(
                        backup.expenses
                    )
                ) {

                    throw new Error(
                        "Invalid backup"
                    );

                }


                expenses =
                    backup.expenses.map(item => ({

                        description:
                            item.description || "Unknown",

                        amount:
                            Number(item.amount) || 0,

                        category:
                            item.category || "Other",

                        date:
                            item.date || getCurrentMonth() + "-01",

                        type:
                            item.type || "expense"

                    }));


                budgets =
                    backup.budgets || {};


                saveExpenses();
                saveBudgets();


                updateEverything();


                document.getElementById(
                    "dataMessage"
                ).textContent =
                    "Backup restored successfully.";


                showToast(
                    "Backup restored successfully."
                );


            } catch (error) {

                showToast(
                    "Invalid backup file."
                );

            }

        };


        reader.readAsText(file);

        event.target.value = "";

    });


/* =========================
   DELETE ALL TRANSACTIONS
========================= */

document.getElementById("deleteTransactions")
    .addEventListener("click", function() {

        if (expenses.length === 0) {

            showToast(
                "There are no transactions to delete."
            );

            return;

        }


        const firstConfirm =
            confirm(
                "Delete ALL transactions?"
            );


        if (!firstConfirm) {
            return;
        }


        const secondConfirm =
            confirm(
                "This cannot be undone. Continue?"
            );


        if (!secondConfirm) {
            return;
        }


        expenses = [];

        saveExpenses();

        updateEverything();

        showToast(
            "All transactions deleted."
        );

    });


/* =========================
   RESET APP
========================= */

document.getElementById("resetApp")
    .addEventListener("click", function() {

        const firstConfirm =
            confirm(
                "Reset the entire Expense Tracker?"
            );


        if (!firstConfirm) {
            return;
        }


        const secondConfirm =
            confirm(
                "This will delete transactions, budgets and settings. Continue?"
            );


        if (!secondConfirm) {
            return;
        }


        localStorage.clear();

        expenses = [];

        budgets = {};

        editingIndex = null;


        expenseForm.reset();

        dateInput.value =
            new Date().toISOString().split("T")[0];

        typeInput.value =
            "expense";


        submitBtn.textContent =
            "Add Transaction";

        cancelEdit.style.display =
            "none";


        document.body.classList.remove("dark");


        updateEverything();


        showToast(
            "App has been completely reset."
        );

    });


/* =========================
   DARK MODE
========================= */

const darkModeBtn =
    document.getElementById("darkModeBtn");


const savedTheme =
    localStorage.getItem("darkMode");


if (savedTheme === "true") {

    document.body.classList.add("dark");

    darkModeBtn.textContent =
        "☀️ Light Mode";

}


darkModeBtn.addEventListener(
    "click",
    function() {

        document.body.classList.toggle("dark");


        const isDark =
            document.body.classList.contains("dark");


        localStorage.setItem(
            "darkMode",
            isDark
        );


        darkModeBtn.textContent =
            isDark
            ? "☀️ Light Mode"
            : "🌙 Dark Mode";

    }
);


/* =========================
   LAST UPDATED
========================= */

function updateLastUpdated() {

    const now =
        new Date();


    const time =
        now.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    document.getElementById(
        "lastUpdated"
    ).textContent =
        `Last updated: ${time}`;

}


/* =========================
   UPDATE EVERYTHING
========================= */

function updateEverything() {

    updateSummary();

    updateDashboard();

    renderTransactions();

    updateMonthlyReport();

    updateCategorySummary();

    updateAdvancedAnalytics();

    updateCharts();

    updateBudget();

    updateLastUpdated();

}


/* =========================
   START APP
========================= */

updateEverything();