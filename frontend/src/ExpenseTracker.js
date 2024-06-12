import React, { useEffect, useState } from 'react';
import axios from 'axios';

function BudgetApp() {
  const [totalAmount, setTotalAmount] = useState(0);
  const [userAmount, setUserAmount] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [productTitleError, setProductTitleError] = useState('');
  const [expensedata, setExpensedata] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [amountdata, setAmountData] = useState({
    totalamount: 0,
    expenses: 0,
    balance: 0
  });

  /////// retrive data

  useEffect(() => {
    fetchExpenses();
    fetchAmountData();
  }, []);

  const fetchExpenses = () => {
    fetch('http://localhost:3001/expenseslist')
      .then(res => {
        if (!res.ok) {
        throw new Error('Failed to fetch');
      }
      return res.json();
     })
      .then(data => {
        console.log('expenses data fetched successfully:', data);
        setExpensedata(data)
      })
      .catch(err => console.error('Error fetching expenses:', err));
  };

  const fetchAmountData = () => {
    fetch('http://localhost:3001/amountlist')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch');
        }
        return res.json();
      })
      .then(data => {
        data = data.amountdata[0];
        console.log('Amount data fetched successfully:', data);
        setAmountData(data);
      })
      .catch(err => console.error('Error fetching amount data:', err));
  };

  /////// retrive data end 

  ////// set total amount

  const handleTotalAmountButtonClick = () => {
    const newTotalAmount = parseInt(totalAmount);
    if (isNaN(newTotalAmount) || newTotalAmount <= 0) {
      setErrorMessage('Value cannot be empty or negative');
      return;
    }

    const updatedInitialValues = {
      sendtotalamount: amountdata.totalamount + newTotalAmount,
      sendbalance: amountdata.balance + newTotalAmount
    };

    axios.put('http://localhost:8081/initialValues', updatedInitialValues)
      .then(response => {
        console.log('total amount stored Successfully !!:', response.data);
        fetchAmountData(); 
      })
      .catch(error => console.error('Error:', error));

    setTotalAmount('');
  };
  
  ////// set total amount end

  ////// set expenses

  const handleCheckAmountButtonClick = async () => {
    try {
      if (!userAmount || !productTitle) {
          setProductTitleError('Values cannot be empty');
          return;
      }

      const newuserAmount = parseInt(userAmount);
      if (isNaN(newuserAmount) || newuserAmount <= 0) {
          setProductTitleError('Amount should be a positive number');
          return;
      }

      let requests;

      if (!selectedExpense) {
          const updatedValues = {
              sendexpenses: amountdata.expenses + newuserAmount,
              sendexpensebalance: amountdata.balance - newuserAmount
          };

          requests = [
              axios.put('http://localhost:8081/updatedValues', updatedValues),
              axios.post('http://localhost:8081/sendexpensesValues', {
                  sendtitle: productTitle,
                  sendamount: newuserAmount
              })
          ];
      } else {
          const diff = newuserAmount - selectedExpense.amount;
          const updatedexpensesValues = {
              sendexpenses: amountdata.expenses + diff,
              sendexpensebalance: amountdata.balance - diff
          };

          requests = [
              axios.put(`http://localhost:8081/updatedValues`, updatedexpensesValues),
              axios.put(`http://localhost:8081/updatedexpenseslist/${selectedExpense.id}`, {
                  sendtitle: productTitle,
                  sendamount: newuserAmount
              })
          ];
      }

      await Promise.all(requests);
      
      fetchAmountData();
      fetchExpenses();
      setProductTitle('');
      setUserAmount('');
      setSelectedExpense(null);
  } catch (error) {
      console.error('Error:', error);

      // Check error.response for more details
      if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
      }

      // Handle error gracefully (e.g., display error message to user)
      setProductTitleError('An error occurred while processing your request. Please try again.');
  }
  };
  
   ////// set expenses end

   ///// update expenses

   const handleEditExpense = (data) => {
    setSelectedExpense(data);
    setProductTitle(data.title);
    setUserAmount(data.amount.toString());
  };
  
  ///// end

  ////// delete expenses

  // const handleDeleteExpense = (expense) => {
  //   const deleteexpenseUpdatevalues = {
  //     sendexpenses: amountdata.expenses - expense.amount,
  //     sendexpensebalance: amountdata.balance + expense.amount
  //   };
  
  //   const requests = [
  //     axios.put('http://localhost:8081/updatedValues', deleteexpenseUpdatevalues),
  //     axios.delete(`http://localhost:8081/deleteExpenses/${expense.id}`)
  //   ];
  
  //   Promise.all(requests)
  //     .then(responses => {
  //       console.log('Update success:', responses[0].data);
  //       console.log('Delete success');
  //       fetchAmountData(); 
  //       fetchExpenses(); 
  //     })
  //     .catch(errors => {
  //       console.error('Error:', errors);
  //     });
  // };

  ////// delete expense end

  return (
    <div className="wrapper">
      <div className="container">
        <div className="sub-container">
          <div className="total-amount-container">
            <h3>Budget</h3>
            <p className={errorMessage ? '' : 'hide'}>{errorMessage}</p>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Enter Total Amount"
            />
            <button className="submit" onClick={handleTotalAmountButtonClick}>
              Set Budget
            </button>
          </div>

          <div className="user-amount-container">
            <h3>Expenses</h3>
            <p className={productTitleError ? '' : 'hide'}>{productTitleError}</p>
            <input
              type="text"
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              placeholder="Enter Title of Product"
            />
            <input
              type="number"
              value={userAmount}
              onChange={(e) => setUserAmount(e.target.value)}
              placeholder="Enter Cost of Product"
            />
            <button className="submit" onClick={handleCheckAmountButtonClick}>
              {selectedExpense ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </div>

        <div className="output-container flex-space">
          <div>
            <p>Total Budget</p>
            <span id="amount">{amountdata.totalamount}</span>
          </div>
          <div>
            <p>Expenses</p>
            <span id="expenditure-value">{amountdata.expenses}</span>
          </div>
          <div>
            <p>Balance</p>
            <span id="balance-amount">{amountdata.balance}</span>
          </div>
        </div>
      </div>

      <div className="list">
        <h3>Expense List</h3>
        <div className="list-container" id="list">
          <div className='sublist-title flex-space'>
            <p>Sr No.</p>
            <p>ID</p>
            <p>Title</p>
            <p>Amount</p>
            <p>Edit</p>
          </div>
        {expensedata.slice().reverse().map((data, i) => (
            <div key={i} className="sublist-content flex-space">
              <p>{i+1}</p>
              <p className="id">{data.id}</p>
              <p className="product">{data.title}</p>
              <p className="amount">{data.amount}</p>
              <button onClick={() => handleEditExpense(data)} className='submit'>Edit</button>
              {/* <button onClick={() => handleDeleteExpense(data)} className='submit'>Delete</button> */}
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}

export default BudgetApp;
