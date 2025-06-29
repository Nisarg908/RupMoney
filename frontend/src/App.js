import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AppProvider } from './layouts/AppProvider'; // Adjust the path
import SignIn from './pages/Signin';
import Register from './pages/Register';
import Records from './pages/Records';
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import Budgets from './pages/Budgets';
import Accounts from './pages/Accounts';
import Categories from './pages/Categories';
import PrivateRoute from './auth_components/PrivateRoute';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Unprotected Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <AppProvider>
              <Routes>
                <Route
                  path="/records"
                  element={
                    <PrivateRoute>
                      <DashboardLayout>
                        <Records />
                      </DashboardLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/analysis"
                  element={
                    <PrivateRoute>
                      <DashboardLayout>
                        <Analysis />
                      </DashboardLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/budgets"
                  element={
                    <PrivateRoute>
                      <DashboardLayout>
                        <Budgets />
                      </DashboardLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/accounts"
                  element={
                    <PrivateRoute>
                      <DashboardLayout>
                        <Accounts />
                      </DashboardLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <PrivateRoute>
                      <DashboardLayout>
                        <Categories />
                      </DashboardLayout>
                    </PrivateRoute>
                  }
                />
              </Routes>
            </AppProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
