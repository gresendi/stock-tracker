import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Chart, registerables } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { parseISO } from 'date-fns';

Chart.register(...registerables);

function App() {
  const [data, setData] = useState(null);
  const [stockSymbol, setStockSymbol] = useState('AMC');
  const chartRef = useRef(null); // Ref to the chart
  const canvasRef = useRef(null); // Ref to the canvas

  const fetchData = async () => {
    try {
      const response = await axios.get(`/api/stock?symbol=${stockSymbol}`);
      if (response.status === 200) {
        setData(response.data);
      } else {
        throw new Error(`Invalid response: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error fetching data: ${error.message}`);
      setData(null); // Reset the data if an error occurs
    }
  };

  useEffect(() => {
    fetchData();
  }, [stockSymbol]);

  const handleInputChange = (event) => {
    setStockSymbol(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchData();
  };

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    if (data) {
      if (data.hasOwnProperty('Time Series (5min)')) {
        const timeSeriesData = Object.entries(data['Time Series (5min)']).map(([timestamp, values]) => ({
          x: parseISO(timestamp),
          y: parseFloat(values['4. close'])
        }));

        const ctx = canvasRef.current.getContext('2d');
        chartRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            datasets: [{
              label: 'Stock Price',
              data: timeSeriesData,
              borderColor: 'blue',
              fill: false
            }]
          },
          options: {
            responsive: true,
            scales: {
              x: {
                type: 'time',
                time: {
                  unit: 'minute',
                  displayFormats: {
                    minute: 'h:mm a'
                  }
                },
                title: {
                  display: true,
                  text: 'Time'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Closing Price'
                }
              }
            }
          }
        });
      } else {
        console.error('Invalid data format');
        setData(null); // Reset the data if the format is unexpected
      }
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, stockSymbol]);

  return (
    <div className="App">
      <h1>Stock Tracker</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" value={stockSymbol} onChange={handleInputChange} />
        <button type="submit">Get Stock Data</button>
      </form>
      <canvas ref={canvasRef} id="stockChart" />
    </div>
  );
}

export default App;
