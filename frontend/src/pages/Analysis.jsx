import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// import Dashboardnavbar from "../app_components/Navbar";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { AppContext } from '../layouts/AppProvider';
import 'chart.js/auto';

ChartJS.register(ArcElement, Tooltip, Legend);

function Analysis() {
  const [chartData, setChartData] = useState(null);
  // const [monthYear, setMonthYear] = useState(() => {
  //   const now = new Date();
  //   return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  // }); // Default to current month/year
  // console.log(monthYear)
  const [transactionType, setTransactionType] = useState("Expense"); // Default to Expense
  // const [transactions, setTransactions] = useState([]);
  const { selectedMonthYear } = useContext(AppContext);
  const navigate = useNavigate();

  const fetchCategorySummary = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-category-summary?monthYear=${selectedMonthYear}&type_of_transaction=${transactionType}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        // params: {
        //   monthYear,
        //   type_of_transaction: transactionType
        // }
      });
      console.log(response);
      if (response.status === 403) {
        navigate('/signin');
        return;
      }
      // const categories = response.data.map(item => item.category_name);
      // const amounts = response.data.map(item => item.total_amount);
      // const colors = categories.map(() => `#${Math.floor(Math.random()*16777215).toString(16)}`);
      const data = await response.json(); // Assuming the response is in JSON format
      const categories = data.map(item => item.category_name);
      const amounts = data.map(item => item.total_amount);
      const colors = categories.map(() => `#${Math.floor(Math.random()*16777215).toString(16)}`);

      setChartData({
        labels: categories,
        datasets: [
          {
            data: amounts,
            backgroundColor: colors,
            hoverBackgroundColor: colors,
            borderWidth: 0
          }
        ]
      });

    } catch (error) {
      console.error("Error fetching category summary:", error);
    }
  }, [selectedMonthYear, transactionType]);

  useEffect(() => {
    fetchCategorySummary();
  }, [fetchCategorySummary]);

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="dashboard-container">
      {/* <Dashboardnavbar /> */}
      <main className="main-content">
        <h2>Analysis</h2>
        <div className="toggle-buttons">
          <button 
            onClick={() => setTransactionType("Expense")} 
            className={transactionType === "Expense" ? "active" : ""}
          >
            Expense Overview
          </button>
          <button 
            onClick={() => setTransactionType("Income")} 
            className={transactionType === "Income" ? "active" : ""}
          >
            Income Overview
          </button>
        </div>
        {chartData && (
          <>
            <h3>{transactionType} Overview</h3>
            <section className="expense-overview">
              <div className='flexer'>
                <div className="chart-container" style={{ position: 'relative', width: '50%', height: '250px' }}>
                  <Doughnut data={chartData} options={options} />
                </div>
                <div className="legend">
                  {chartData.labels.map((label, index) => (
                    <div key={index} className="legend-item">
                      <span
                        className="legend-color"
                        style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
                      ></span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <div className="expense-bars">
              {chartData.labels.map((label, index) => (
                <div key={index} className="expense-bar">
                  <span className="bar-label">{label}</span>
                  <div className="bar">
                    <div
                      className="fill"
                      style={{ 
                        width: `${(chartData.datasets[0].data[index] / chartData.datasets[0].data.reduce((a, b) => a + b, 0)) * 100}%`, 
                        backgroundColor: chartData.datasets[0].backgroundColor[index] 
                      }}
                    ></div>
                  </div>
                  <span className="bar-percentage">{chartData.datasets[0].data[index]}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Analysis;

