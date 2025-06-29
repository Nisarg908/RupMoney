import React, { useState, useEffect } from 'react';

const Categories = () => {
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [categoryType, setCategoryType] = useState('');

  useEffect(() => {
    // Fetch categories from backend
    fetch(`${process.env.REACT_APP_BACKEND_URL}/get-categories`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        setIncomeCategories(data.incomeCategories);
        setExpenseCategories(data.expenseCategories);
      })
      .catch(error => console.error('Error fetching categories:', error));
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleAddCategory = () => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/add-category`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        category_name: newCategory,
        type_of_category: categoryType,
      }),
    })
      .then(response => {
        if (response.ok) {
          setShowPopup(false);
          setNewCategory('');
          setCategoryType('');
          return response.json();
        } else {
          throw new Error('Failed to add category');
        }
      })
      .then(() => {
        // Refresh categories
        return fetch('/get-categories', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      })
      .then(response => response.json())
      .then(data => {
        setIncomeCategories(data.incomeCategories);
        setExpenseCategories(data.expenseCategories);
      })
      .catch(error => console.error('Error adding category:', error));
  };

  return (
    <div className="dashboard-container">
      <div className="category-container">
        <div className="income-categories">
          <h2>Income Categories</h2>
          <div className="category-grid">
            {incomeCategories.map(category => (
              <div key={category.id} className="category-item">
                {category.category_name}
              </div>
            ))}
          </div>
        </div>
        <div className="expense-categories">
          <h2>Expense Categories</h2>
          <div className="category-grid">
            {expenseCategories.map(category => (
              <div key={category.id} className="category-item">
                {category.category_name}
              </div>
            ))}
          </div>
        </div>
        <button className="add-category" onClick={() => setShowPopup(true)}>
          + Add New Category
        </button>
      </div>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button class="close-popup" onClick={handleClosePopup}>X Close</button>
            <h3>Add New Category</h3>
            <form onSubmit={handleAddCategory}>
            <div>
              <label>Category Name</label>
              <input
                type="text"
                placeholder="Enter Category Name"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
              />
            </div>
            <div>
              <label>Select Transaction Type:</label>
              <select
                value={categoryType}
                onChange={e => setCategoryType(e.target.value)}
              >
                <option value="">Select Type</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
            
            <div className="popup-buttons">
              <button type="submit">✔ Save</button>
            </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
