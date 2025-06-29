import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  console.log("AppProvider")
  // const [selectedMonthYear, setSelectedMonthYear] = useState('');
  const [selectedMonthYear, setSelectedMonthYear] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
      const fetchData = async () => {
        const token = localStorage.getItem('token');
  
        try {
          // Fetch transactions for the logged-in user and selected month-year
          const resTransactions = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-transactions?monthYear=${selectedMonthYear}`, {
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
    }, [selectedMonthYear]);
  const handleMonthYearChange = (e) => {
    setSelectedMonthYear(e.target.value); // This should be in YYYY-MM format
  };

  return (
    <AppContext.Provider
      value={{ selectedMonthYear, handleMonthYearChange, transactions, setTransactions, setSelectedMonthYear }}
    >
      {children}
    </AppContext.Provider>
  );
};
