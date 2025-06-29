import React from 'react';
import Dashboardnavbar from '../app_components/Navbar';

const Header = ({ selectedMonthYear, handleMonthYearChange, transactions }) => {
  const totalIncome = transactions.reduce(
    (sum, tx) => (tx.type_of_transaction === 'Income' ? sum + parseFloat(tx.amount) : sum),
    0
  );
  const totalExpense = transactions.reduce(
    (sum, tx) => (tx.type_of_transaction === 'Expense' ? sum + parseFloat(tx.amount) : sum),
    0
  );
  const total = transactions.reduce((sum, tx) => {
    if (tx.type_of_transaction === 'Income') {
      return sum + parseFloat(tx.amount);
    } else if (tx.type_of_transaction === 'Expense') {
      return sum - parseFloat(tx.amount);
    }
    return sum;
  }, 0);

  const formattedMonthYear = new Date(selectedMonthYear).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className='parent-header'>
    <Dashboardnavbar />
    <header className="dashboard-header">
      <div className="header-title">
        <input
          type="month"
          value={selectedMonthYear}
          placeholder=""
          onChange={handleMonthYearChange}
        />
      </div>
      <div className="header-totals">
        <div>
          <p className="selected-month">
            Showing totals for: <strong>{formattedMonthYear}</strong>
          </p>
        </div>
        <div className="total-item">
          <p>EXPENSE</p>
          <p className="amount expense">{totalExpense}</p>
        </div>
        <div className="total-item">
          <p>INCOME</p>
          <p className="amount income">{totalIncome}</p>
        </div>
        <div className="total-item">
          <p>TOTAL</p>
          <p className="amount total">{total}</p>
        </div>
      </div>
    </header>
    </div>
  );
};

export default Header;
