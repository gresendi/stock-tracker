require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

app.get('/api/stock', async (req, res) => {
    try {
        const symbol = req.query.symbol || 'AMC'; // Use the symbol from the request, or default to 'AMC'
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&outputsize=full&apikey=${process.env.API_KEY}`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (err) {
        res.json({ message: err.message });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
