import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import Dashboardnavbar from "../app_components/Navbar";

const Accounts = () => {
  const [accountSummaries, setAccountSummaries] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState(''); // Added state for the new account name
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      try {
        // Fetch transactions for the logged-in user
        const resTransactions = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-transactions`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (resTransactions.status === 403) {
          navigate('/signin');
          return;
        }

        const transactionData = await resTransactions.json();
        if (Array.isArray(transactionData)) {
          // Aggregate transactions by account and calculate net balance
          const aggregatedData = transactionData.reduce((acc, tx) => {
            const { account_name, type_of_transaction, amount } = tx;
            if (!acc[account_name]) {
              acc[account_name] = { income: 0, expense: 0 };
            }
            if (type_of_transaction === 'Income') {
              acc[account_name].income += parseFloat(amount);
            } else if (type_of_transaction === 'Expense') {
              acc[account_name].expense += parseFloat(amount);
            }
            return acc;
          }, {});

          // Transform the aggregated data into an array format for easy rendering
          const summaries = Object.keys(aggregatedData).map(accountName => {
            const { income, expense } = aggregatedData[accountName];
            const netBalance = income - expense;
            return {
              accountName,
              income,
              expense,
              netBalance
            };
          });

          setAccountSummaries(summaries);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [isPopupOpen, navigate]);

  const handleSubmitAccount = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/add-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          account_name: newAccountName, // Stringify the body
        })
      });

      if(res.status === 403) {
        navigate('/signin');
        return;
      }

      if(res.ok) {
        setIsPopupOpen(false); // Close the popup after successful addition
        setNewAccountName(''); // Clear the input field
      }
    } catch (error) {
      console.error("Error saving the Account Name: ", error);
    }

  }

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <div className="dashboard-container">
      {/* <Dashboardnavbar /> */}
      <div className="account-container">
        <h2>Overall</h2>
        <div className="overall">
          <div className="expense-income">
            <div className="expense">
              <span className="label">EXPENSE SO FAR</span>
              <span className="value expense">
                &#8377;{accountSummaries
                  .reduce((sum, account) => sum + parseFloat(account.expense), 0)
                }
              </span>
            </div>
            <div className="total-balance">
              <span className="label">Net accounts balance</span>
              <span className="value">&#8377;
                {accountSummaries.reduce((sum, account) => {
                    return sum + parseFloat(account.income) - parseFloat(account.expense);
                }, 0)}
              </span>
            </div>
            <div className="income">
              <span className="label">INCOME SO FAR</span>
              <span className="value income">
                &#8377;{accountSummaries
                  .reduce((sum, account) => sum + parseFloat(account.income), 0)
                }
              </span>
            </div>
          </div>
        </div>
        <div className="accounts">
          <h2>Accounts</h2>
          {accountSummaries.map((summary, index) => (
            <div key={index} className="account">
              <span className="account-type">{summary.accountName}</span>
              <span className={`account-balance ${summary.netBalance < 0 ? 'negative' : 'positive'}`}>
                &#8377;{summary.netBalance.toLocaleString()}
              </span>
            </div>
          ))}
          <button className="add-account" onClick={handleOpenPopup}>+ ADD NEW ACCOUNT</button>
        </div>
        {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-popup" onClick={handleClosePopup}>Close</button>
            <h3>Add Accound</h3>
            <form onSubmit={handleSubmitAccount}>
              <div>
                <label>Account Name:</label>
                <input
                  type="text"
                  name="account"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)} // Update state on input change
                  required
                />
              </div>
              <button type="submit">✔ Save</button>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Accounts;
