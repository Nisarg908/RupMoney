import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBackspace } from "react-icons/fa";
import { AppContext } from '../layouts/AppProvider';
// import Header from '../app_components/Header';

function Dashboard() {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null); // Track selected transaction
  const [showTransactionPopup, setShowTransactionPopup] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    from_account: '',
    category: '',
    to_account: '',
    notes: '',
    amount: '',
    transaction_date: '', // Add date
    transaction_time: ''  // Add time
  });
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [calcInput, setCalcInput] = useState('0');
  const { transactions, setTransactions } = useContext(AppContext);
  const [allCategories, setAllCategories] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    // Set initial date and time
    const now = new Date();
    setFormData(prevData => ({
      ...prevData,
      transaction_date: now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }).split('/').reverse().map(part => part.padStart(2, '0')).join('-'), // YYYY-MM-DD format
      transaction_time: now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) // HH:MM format
      // const istDate = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
      // const istTime = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
      // const formattedDate = istDate.split('/').reverse().join('-');
    }));
  }, [showPopup]);

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);

    if (event.target.value === 'Expense') {
      // Filter and show only expense categories
      setCategories(allCategories.filter(category => category.type_of_category === 'Expense'));
    } else if (event.target.value === 'Income') {
      // Filter and show only income categories
      setCategories(allCategories.filter(category => category.type_of_category === 'Income'));
    } else if (event.target.value === 'Transfer') {
      // Show all categories for transfers
      setCategories(allCategories);
    }
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionPopup(true);
  };

  const handlePopupOpen = async () => {
    const token = localStorage.getItem('token');

    try {
      // Fetch accounts and categories metadata
      const resMetadata = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-metadata`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(formData.transaction_date)
      if (resMetadata.status === 403) {
        navigate('/signin'); // Redirect to sign-in if token is expired/invalid
        return;
      }

      const metadata = await resMetadata.json();

      setAccounts(metadata.accounts || []);

      // Set categories
      const filteredCategories = metadata.categories.filter(category => category.type_of_category === 'Expense');
      setAllCategories(metadata.categories || []);
      setCategories(filteredCategories || []); // Default to expense categories
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
    setShowPopup(true);
    setSelectedType('Expense');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value)
    setFormData({ ...formData, [name]: value });
    console.log(formData)
  };

  const handleCalcButtonClick = useCallback(async (value) => {
    if (value === 'C') {
      setCalcInput('0');
    } else if (value === '=' || value === 'Enter') {
      try {
        setCalcInput(eval(calcInput).toString());
      } catch {
        setCalcInput('0');
      }
    } else if (value === 'Backspace') {
      setCalcInput(calcInput.slice(0, -1) || '0');
    } else {
      setCalcInput(calcInput === '0' ? value.toString() : calcInput + value);
    }
  }, [calcInput]);  // Dependency on calcInput  

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if the focus is not on the notes field
      if (document.activeElement.name === 'amount' || document.activeElement.type === 'button') {
        if (/^[0-9+\-*/.]$/.test(event.key)) {
          handleCalcButtonClick(event.key);
        } else if (event.key === 'Enter' || event.key === '=') {
          handleCalcButtonClick('=');
        } else if (event.key === 'Backspace') {
          handleCalcButtonClick('Backspace');
        } else if (event.key === 'Escape') {
          handleCalcButtonClick('C');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCalcButtonClick]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    console.log(formData)
    await handleCalcButtonClick('=')
    const transaction = {
      from_account_id: formData.from_account,
      category_id: formData.category,
      to_account_id: formData.to_account,
      type_of_transaction: selectedType,
      notes: formData.notes,
      amount: calcInput,
      transaction_date: formData.transaction_date,
      transaction_time: formData.transaction_time
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/save-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(transaction)
      });

      if (res.ok) {
        setShowPopup(false);
        setFormData({
          from_account: '',
          to_account: '',
          notes: '',
          amount: ''
        });
        setCalcInput('0');
      } else if (res.status === 403) {
        navigate('/signin');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };


  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/delete-transaction/${selectedTransaction.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 403) {
        navigate('/signin');
        return;
      }

      if (res.ok) {
        setShowTransactionPopup(false);
        setTransactions(transactions.filter(tx => tx.id !== selectedTransaction.id));
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const handleOverlayClick = (e) => {
    // Close the popup if the clicked target is the overlay
    if (e.target.classList.contains('popup-overlay')) {
      setShowTransactionPopup(false);
      setShowPopup(false);
    }
  };

  // Sort transactions by date, with the latest date first
  const sortedTransactions = transactions.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

  // Group transactions by date
  const groupedTransactions = sortedTransactions.reduce((groups, transaction) => {
    const date = transaction.transaction_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});


  return (
    <div className="dashboard-container">
      {/* <Dashboardnavbar /> */}
      <main className="main-content">
        {/* <Header
        selectedMonthYear={selectedMonthYear}
        handleMonthYearChange={handleMonthYearChange}
        transactions={transactions}
      /> */}
        <h2>Records</h2>
        <section className="transaction-list">
          {Object.keys(groupedTransactions).map(date => (
            <table key={date} className="transaction-group">
              <thead>
                <tr>
                  <th colSpan="4" className="transaction-date">{date}</th>
                </tr>
              </thead>
              <tbody>
                {groupedTransactions[date].map((transaction, index) => (
                  <tr key={index} className="transaction" onClick={() => handleTransactionClick(transaction)}>
                    <td className="transaction-time">{transaction.transaction_time}</td>
                    {/* <td className="transaction-title">
                      { transaction.category_name ||transaction.type_of_transaction }
                    </td> */}
                    <td className="transaction-title">
                      {transaction.category_name ||
                        (transaction.type_of_transaction.includes("Transfer")
                          ? (transaction.notes
                            ? `${transaction.type_of_transaction} [${transaction.notes.length > 15 ? transaction.notes.slice(0, 15) + '...' : transaction.notes}]`
                            : transaction.type_of_transaction)
                          : transaction.notes.slice(0, 15) + '...')}
                    </td>
                    <td className="transaction-type">{transaction.account_name || transaction.type_of_transaction}</td>
                    <td className={`transaction-amount ${transaction.type_of_transaction === 'Expense' || transaction.type_of_transaction === 'Transfer (Debited)' ? 'expense' : 'income'}`}>
                      {transaction.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </section>
      </main>
      <button className="add-transaction-btn" onClick={handlePopupOpen}>+</button>

      {showPopup && (
        <div className="popup-overlay" onClick={handleOverlayClick}>
          <div className="popup">
            {/* Popup form */}
            <div className="popup-header">
              <button type="button" className="popup-close" onClick={() => setShowPopup(false)}>X Cancel</button>
              <button type="button" className="popup-save" onClick={handleSubmit}>✔ Save</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="popup-body">
                <div className="add-transaction-type">
                  <label>
                    <input
                      type="radio"
                      name="transactionType"
                      value="Income"
                      checked={selectedType === 'Income'}
                      onChange={handleTypeChange}
                      className="transaction-type-radio"
                    />
                    <span className={`transaction-type-btn ${selectedType === 'Income' ? 'active' : ''}`}>INCOME</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="transactionType"
                      value="Expense"
                      checked={selectedType === 'Expense'}
                      onChange={handleTypeChange}
                      className="transaction-type-radio"
                    />
                    <span className={`transaction-type-btn ${selectedType === 'Expense' ? 'active' : ''}`}>EXPENSE</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="transactionType"
                      value="TRANSFER"
                      checked={selectedType === 'TRANSFER'}
                      onChange={handleTypeChange}
                      className="transaction-type-radio"
                    />
                    <span className={`transaction-type-btn ${selectedType === 'TRANSFER' ? 'active' : ''}`}>TRANSFER</span>
                  </label>
                </div>
                {selectedType === 'TRANSFER'
                  ?
                  <div className="input-group-wrapper">
                    <div className="input-group">
                      <label>From Account</label>
                      <select
                        id="from_account"
                        name="from_account"
                        value={formData.from_account || ''}
                        onChange={handleInputChange}
                      >
                        <option value="">Select From Account</option>
                        {accounts.map((from_account) => (
                          <option
                            key={from_account.id}
                            value={from_account.id}
                            disabled={String(formData.to_account) === String(from_account.id)}
                          >
                            {from_account.account_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="input-group">
                      <label>To Account</label>
                      <select
                        id="to_account"
                        name="to_account"
                        value={formData.to_account || ''}
                        onChange={handleInputChange}
                      >
                        <option value="">Select To Account</option>
                        {accounts.map((to_account) => (
                          <option
                            key={to_account.id}
                            value={to_account.id}
                            disabled={String(formData.from_account) === String(to_account.id)}
                          >
                            {to_account.account_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  :
                  <div className="input-group-wrapper">
                    <div className="input-group">
                      <label>Account</label>
                      <select id="from_account" name="from_account" value={formData.from_account} onChange={handleInputChange}>
                        <option value="">Select Account</option>
                        {accounts.map(from_account => (
                          <option key={from_account.id} value={from_account.id}>{from_account.account_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Category</label>
                      <select id="category" name="category" value={formData.category} onChange={handleInputChange}>
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>{category.category_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                }


                <div className='input-group-wrapper'>
                  <div className="input-group">
                    <label htmlFor="transaction_date">Transaction Date</label>
                    <input
                      type="date"
                      id="transaction_date"
                      name="transaction_date"
                      value={formData.transaction_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="transaction_time">Transaction Time</label>
                    <input
                      type="time"
                      id="transaction_time"
                      name="transaction_time"
                      value={formData.transaction_time}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <textarea name="notes" value={formData.notes} placeholder='Add Notes' onChange={handleInputChange} />
                </div>
                <div className="input-group calculator-display">
                  {/* <input
                      type="number"
                      step="any"
                      value={calcInput}
                      onChange={(e) => setCalcInput(parseFloat(e.target.value) || '')}
                      placeholder="Enter amount"
                    /><div> */}
                  <label htmlFor='amount'>
                    Amount
                    &nbsp;
                    &nbsp;
                    &nbsp;
                  </label>
                  <div>
                    <input className='calculator-display-input'
                      type="text"
                      name="amount"
                      value={calcInput}
                      readOnly
                    />
                    <FaBackspace style={{ width: '24px', height: '3rem', cursor: 'pointer' }} onClick={() => handleCalcButtonClick('Backspace')} />
                  </div>
                </div>
                <div className="calculator">
                  {['+', '7', '8', '9', '-', '4', '5', '6', '*', '1', '2', '3', '/', '0', '.', '='].map((btn) => (
                    <button
                      type="button"
                      key={btn}
                      className={btn === '=' ? 'equal' : ['+', '-', '*', '/'].includes(btn) ? 'operation' : 'number'}
                      onClick={() => handleCalcButtonClick(btn)}
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {showTransactionPopup && selectedTransaction && (
        <div className="popup-overlay" onClick={handleOverlayClick}>
          <div className="popup">
            <div className="popup-header">
              <button className="popup-close" onClick={() => setShowTransactionPopup(false)}>X Close</button>
              <button className="popup-delete" onClick={handleDelete}>Delete</button>
            </div>
            <div className="popup-body">
              <table>
                <tbody>
                  <tr>
                    <td><strong>Type:</strong></td> <td>{selectedTransaction.type_of_transaction}</td>
                  </tr>
                  <tr>
                    <td><strong>Account:</strong></td> <td>{selectedTransaction.account_name}</td>
                  </tr>
                  {
                    selectedTransaction.category_name && 
                    <tr>
                      <td><strong>Category:</strong></td> <td>{selectedTransaction.category_name}</td>
                    </tr>
                  }
                  <tr>
                    <td><strong>Notes:</strong></td> <td>{selectedTransaction.notes || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Date:</strong></td> <td>{selectedTransaction.transaction_date}</td>
                  </tr>
                  <tr>
                    <td><strong>Time:</strong></td> <td>{selectedTransaction.transaction_time}</td>
                  </tr>
                  <tr>
                    <td><strong>Amount:</strong></td> <td>{selectedTransaction.amount}</td>
                  </tr>
                </tbody>
              </table>
              {/* <p><strong>Type:</strong> {selectedTransaction.type_of_transaction}</p>
              <p><strong>Account:</strong> {selectedTransaction.account_name}</p>
              <p><strong>Category:</strong> {selectedTransaction.category_name}</p>
              <p><strong>Notes:</strong> {selectedTransaction.notes || 'N/A'}</p>
              <p><strong>Date:</strong> {selectedTransaction.transaction_date}</p>
              <p><strong>Time:</strong> {selectedTransaction.transaction_time}</p>
              <p><strong>Amount:</strong> {selectedTransaction.amount}</p> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
