const modal = {
  toggle() {
    document.querySelector(".modal-overlay").classList.toggle("active");
  },
};

const storage = {
  get() {
    return JSON.parse(localStorage.getItem("transactions")) || [];
  },

  set(transactions) {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  },
};

const transactions = {
  all: storage.get(),

  add(transaction) {
    transactions.all.push(transaction);

    app.reload();
  },

  remove(index) {
    transactions.all.splice(index, 1);

    app.reload();
  },

  incomes() {
    let income = 0;

    transactions.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    });

    return income;
  },

  expenses() {
    let expense = 0;

    transactions.all.forEach((transaction) => {
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    });

    return expense;
  },

  total() {
    return transactions.incomes() + transactions.expenses();
  },
};

const DOM = {
  transactionsContainer: document.querySelector("table tbody"),

  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const cssClass = transaction.amount > 0 ? "income" : "expense";

    const amount = utils.formatCurrency(transaction.amount);

    const html = `
    <td class="description">${transaction.description}</td>
    <td class="${cssClass}">${amount}</td>
    <td class="date">${transaction.date}</td>
    <td>
        <img
        onclick="transactions.remove(${index})"
        src="./assets/images/minus-circle.svg"
        alt="Remover transação"
        />
    </td>
    `;

    return html;
  },

  updateBalanceDisplay() {
    document.querySelector("#income-display").innerHTML = utils.formatCurrency(
      transactions.incomes()
    );

    document.querySelector("#expense-display").innerHTML = utils.formatCurrency(
      transactions.expenses()
    );

    document.querySelector("#total-display").innerHTML = utils.formatCurrency(
      transactions.total()
    );
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

const utils = {
  formatAmount(value) {
    value = Number(value) * 100;

    return value;
  },

  formatDate(date) {
    const splittedDate = date.split("-");

    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return signal + value;
  },
};

const form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: form.description.value,
      amount: form.amount.value,
      date: form.date.value,
    };
  },

  validateFields() {
    const { description, amount, date } = form.getValues();

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor, preencha todos os campos");
    }
  },

  formatValues() {
    let { description, amount, date } = form.getValues();

    amount = utils.formatAmount(amount);

    date = utils.formatDate(date);

    return { description, amount, date };
  },

  clearFields() {
    form.description.value = "";
    form.amount.value = "";
    form.date.value = "";
  },

  submit(event) {
    event.preventDefault();

    try {
      form.validateFields();

      const transaction = form.formatValues();

      transactions.add(transaction);

      form.clearFields();

      modal.toggle();
    } catch (error) {
      alert(error.message);
    }
  },
};

const app = {
  init() {
    transactions.all.forEach(DOM.addTransaction);

    DOM.updateBalanceDisplay();

    storage.set(transactions.all);
  },

  reload() {
    DOM.clearTransactions();
    app.init();
  },
};

app.init();
