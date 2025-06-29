import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import Dashboardnavbar from "../app_components/Navbar";
// import Header from '../app_components/Header';

const Budget = () => {
  const [monthYear, setMonthYear] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState({ category_id: '', budget_limit: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      try {
        // Fetch transactions for the logged-in user and selected month-year
        const resTransactions = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-transactions?monthYear=${monthYear}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (resTransactions.status === 403) {
          navigate('/signin');
          return;
        }

        const transactionData = await resTransactions.json();
        setTransactions(Array.isArray(transactionData) ? transactionData : []);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [monthYear, navigate]);

  useEffect(() => {
    const fetchBudgetAndTransactions = async () => {
      const token = localStorage.getItem('token');

      try {
        const resBudgets = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-budgets?monthYear=${monthYear}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (resBudgets.status === 403) {
          navigate('/signin');
          return;
        }

        const budgetsData = await resBudgets.json();
        setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
      } catch (error) {
        console.error("Error fetching budget data:", error);
      }
    };

    fetchBudgetAndTransactions();
  }, [monthYear, isPopupOpen, navigate]);

  useEffect(() => {
    if (isPopupOpen) {
      const fetchCategories = async () => {
        const token = localStorage.getItem('token');

        try {
          const resCategories = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-unused-categories?monthYear=${monthYear}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (resCategories.status === 403) {
            navigate('/signin');
            return;
          }

          const categoriesData = await resCategories.json();
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
      };

      fetchCategories();
    }
  }, [monthYear, isPopupOpen, navigate]);

  const handleMonthChange = (event) => {
    setMonthYear(event.target.value);
  };

  const handleOpenPopup = () => {
    setPopupContent({ category_id: '', budget_limit: '' });
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handlePopupInputChange = (e) => {
    const { name, value } = e.target;
    setPopupContent({ ...popupContent, [name]: value });
  };

  const handleSubmitBudget = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/add-budget`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category_id: popupContent.category_id,
          monthYear,
          budget_limit: popupContent.budget_limit
        })
      });

      if (res.status === 201) {
        handleClosePopup();
      } else {
        console.error("Error saving budget");
      }
    } catch (error) {
      console.error("Error saving budget:", error);
    }
  };

  return (
    <div className="dashboard-container">
      {/* <Dashboardnavbar /> */}
      <main className="main-content">
      {/* <Header
        selectedMonthYear={selectedMonthYear}
        handleMonthYearChange={handleMonthYearChange}
        transactions={transactions}
      /> */}

        {budgets.length > 0 && (
          <div className="budgeted-categories">
            <h2>Budgeted categories: {monthYear}</h2>
            {budgets.map((item, index) => (
              <div key={index} className="category">
                <h3>{item.category_name}</h3>
                <div className="details">
                  <div>Limit: ₹{item.budget_limit}</div>
                  <div>Spend: ₹{item.spend}</div>
                  <div>Remaining: ₹{Math.max(0, item.budget_limit - item.spend).toFixed(2)}</div>
                </div>
                <div className="progress-bar-container">
                  <div
                    className={`progress-bar ${item.spend >= item.budget_limit ? 'progress-bar-red' : 'progress-bar-green'}`}
                    style={{
                      width: `${Math.min(100, (item.spend / item.budget_limit) * 100)}%`
                    }}
                  ></div>
                  <div className={`limit-label ${item.spend >= item.limit ? 'label-red' : 'label-green'}`}>
                    ₹{item.limit}
                  </div>
                </div>
                {item.spend >= item.limit && <div className="limit-exceeded">*limit exceeded</div>}
              </div>
            ))}
          </div>
        )}

        <button className="add-budget-btn" onClick={handleOpenPopup}>+</button>
      </main>

      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-popup" onClick={handleClosePopup}>×</button>
            <h3>Add Budget</h3>
            <form onSubmit={handleSubmitBudget}>
              <div>
                <label>Category:</label>
                <select className='input-group' name="category_id" value={popupContent.category_id} onChange={handlePopupInputChange}>
                  <option value="" disabled>Select a category</option>
                  {categories.map((category) => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Limit:</label>
                <input
                  type="number"
                  name="budget_limit"
                  value={popupContent.budget_limit}
                  onChange={handlePopupInputChange}
                  required
                />
              </div>
              <button type="submit">Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;

