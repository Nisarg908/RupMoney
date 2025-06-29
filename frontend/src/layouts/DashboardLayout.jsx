import React, { useContext } from 'react';
import Header from '../app_components/Header';
import { AppContext } from './AppProvider';

const DashboardLayout = ({ children }) => {
  // const { selectedMonthYear, handleMonthYearChange, transactions } = useContext(AppContext);
  const {
    selectedMonthYear,
    handleMonthYearChange,
    transactions,
  } = useContext(AppContext);
  return (
    <div>
      {/* Header is rendered at the top of every protected page */}
      <Header
        selectedMonthYear={selectedMonthYear}
        handleMonthYearChange={handleMonthYearChange}
        transactions={transactions}
      />
      <main>{children}</main>
    </div>
  );
};

export default DashboardLayout;
