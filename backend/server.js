const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (re, res)=> {
    return res.json("From backend side");
});

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Aniket@123',
    database: 'budget_app'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
});
//////////////////////

/// retrive data

app.get('/amountlist', (req, res)=> {
    const sql = "SELECT * FROM amount";
    db.query(sql, (err, amountdata)=> {
        if(err) {
            return res.json({ success: false, message: "Error retrieving total amount data", error: err });
        } else {
            return res.json({ success: true, message: "total amount data retrieved successfully", amountdata: amountdata });
        }
    });
});

app.get('/expenseslist', (req, res)=> {
    const sql = "SELECT * FROM expenses";
    db.query(sql, (err, data)=> {
        if(err) {
            return res.json({ success: false, message: "Error retrieving expenses data", error: err });
        }
        return res.json(data);
    });
});

/////////////

// insert expenses list

app.post('/sendexpensesValues', (req, res) => {
    const sql = "INSERT INTO expenses (title, amount) VALUES (?, ?)";
    const values = [
        req.body.sendtitle,
        req.body.sendamount, 
    ];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).json({ error: 'An error occurred while processing your request.' });
            return;
        }
        console.log('Data inserted successfully');
        res.json({ success: true });
    });
});

//////// end 

// add amounts

app.put('/initialValues', (req, res) => {
    const id  = 1;
    const { sendtotalamount, sendbalance } = req.body;
    
    if (!sendtotalamount || !sendbalance) {
        res.status(400).json({ error: 'Missing required fields.' });
        return;
    }
    db.query('UPDATE amount SET totalamount = ?, balance = ? WHERE id = ?', [sendtotalamount, sendbalance, id], (err, result) => {
        if (err) {
            console.error('Error updating data:', err);
            res.status(500).json({ error: 'An error occurred while processing your request.' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'No rows were updated.' });
            return;
        }
        console.log('Amount Stored Successfully !!');
        res.json({ success: true });
    });
});

app.put('/updatedValues', (req, res) => {
    const id  = 1;
    const { sendexpenses, sendexpensebalance } = req.body;
    
    if (!sendexpenses || !sendexpensebalance) {
        res.status(400).json({ error: 'Missing required fields.' });
        return;
    }

    db.query('UPDATE amount SET expenses = ?, balance = ? WHERE id = ?', [sendexpenses, sendexpensebalance, id], (err, result) => {
        if (err) {
            console.error('Error updating data:', err);
            res.status(500).json({ error: 'An error occurred while processing your request.' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'No rows were updated.' });
            return;
        }
        console.log('Amount Stored Successfully !!');
        res.json({ success: true });
    });
});

//////end 

// update expenses list

app.put('/updatedexpenseslist/:id', (req, res) => {
    const id = req.params.id;
    const { sendtitle, sendamount } = req.body;

    if (!sendtitle || !sendamount) {
        res.status(400).json({ error: 'Missing required fields.' });
        return;
    }

    db.query('UPDATE expenses SET title = ?, amount = ? WHERE id = ?', [sendtitle, sendamount, id], (err, result) => {
        if (err) {
            console.error('Error updating data:', err);
            res.status(500).json({ error: 'An error occurred while processing your request.' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'No rows were updated.' });
            return;
        }
        console.log('Amount Updated Successfully !!');
        res.json({ success: true });
    });


});

//////// update expenses list end

/// delete expenses

// app.delete('/deleteExpenses/:id', (req, res) => {
//     const id = req.params.id;
//     const sql = 'DELETE FROM expenses WHERE id = ?';
  
//     db.query(sql, [id], (err, result) => {
//       if (err) {
//         console.error('Error deleting record:', err);
//         res.status(500).send({ message: 'Error deleting record' });
//         return;
//       }
//       console.log('Record deleted successfully');
//       res.status(200).send({ message: 'Record deleted successfully' });
//     });
// });

//////////// end delete expenses


/////////////////////

app.listen(8081, ()=> {
    console.log("listining");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
