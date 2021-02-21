const Modal = {
  modalOverlay: document.querySelector('.modal-overlay'),

  open() {
    Modal.modalOverlay.classList.add('active')
  },
  close() {
    Modal.modalOverlay.classList.remove('active')
  },
}

const Storage = {
  get() {
    const transactions =
      JSON.parse(localStorage.getItem('dev.finances:transactions')) || []

    return transactions
  },

  set() {
    localStorage.setItem(
      'dev.finances:transactions',
      JSON.stringify(Transaction.all)
    )
  },
}

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    this.all.push(transaction)

    App.reload()
  },

  remove(index) {
    this.all.splice(index, 1)

    App.reload()
  },

  incomes() {
    let income = 0

    const filteredTransactions = this.all.filter(
      (transaction) => transaction.amount > 0
    )

    income = filteredTransactions.reduce(
      (acumulator, transaction) => acumulator + transaction.amount,
      0
    )

    return income
  },

  expenses() {
    let expense = 0

    const filteredTransactions = this.all.filter(
      (transaction) => transaction.amount < 0
    )

    expense = filteredTransactions.reduce(
      (acumulator, transaction) => acumulator + transaction.amount,
      0
    )

    return expense
  },

  total() {
    const total = this.incomes() + this.expenses()

    return total
  },
}

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr)
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? 'income' : 'expense'

    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img
          src="assets/minus.svg"
          alt="Remover transação"
          onclick="Transaction.remove(${index})" />
      </td>`

    return html
  },

  updateBalance() {
    const incomeDisplay = document.querySelector('#income-display')
    const expenseDisplay = document.querySelector('#expense-display')
    const totalDisplay = document.querySelector('#total-display')

    incomeDisplay.innerHTML = Utils.formatCurrency(Transaction.incomes())
    expenseDisplay.innerHTML = Utils.formatCurrency(Transaction.expenses())
    totalDisplay.innerHTML = Utils.formatCurrency(Transaction.total())
  },

  clearTransactions() {
    this.transactionsContainer.innerHTML = ''
  },
}

const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : ''

    value = String(value).replace(/\D/g, '')
    value = Number(value) / 100
    value = value.toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL',
    })

    const valueFormatted = signal + value

    return valueFormatted
  },

  formatAmount(value) {
    const formattedValue = Number(value) * 100

    return formattedValue
  },

  formatDate(date) {
    const splittedDate = date.split('-')
    const formattedDate = `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`

    return formattedDate
  },
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    const newTransaction = {
      description: this.description.value,
      amount: this.amount.value,
      date: this.date.value,
    }

    return newTransaction
  },

  validateFields() {
    const { description, amount, date } = this.getValues()

    if (
      description.trim() === '' ||
      amount.trim() === '' ||
      date.trim() === ''
    ) {
      throw new Error('Por favor, preencha todos os campos')
    }
  },

  formatValues() {
    let { description, amount, date } = this.getValues()

    amount = Utils.formatAmount(amount)
    date = Utils.formatDate(date)

    const formattedValues = {
      description,
      amount,
      date,
    }

    return formattedValues
  },

  clearFields() {
    this.description.value = ''
    this.amount.value = ''
    this.date.value = ''
  },

  submit(event) {
    event.preventDefault()

    try {
      this.validateFields()
      const transaction = this.formatValues()
      Transaction.add(transaction)
      this.clearFields()
      Modal.close()
    } catch (error) {
      alert(error.message)
    }
  },
}

const App = {
  init() {
    /*
    Transaction.all.forEach((transaction, index) =>
      DOM.addTransaction(transaction, index)
    )
    */

    // Desse modo a função addTransaction recebe os argumentos do forEach(value, index)
    Transaction.all.forEach(DOM.addTransaction)

    DOM.updateBalance()

    Storage.set(Transaction.all)
  },

  reload() {
    DOM.clearTransactions()

    this.init()
  },
}

App.init()
