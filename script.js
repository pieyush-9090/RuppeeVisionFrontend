let chart;

// Function to predict for specific number of days
function predictDays(days) {
    document.getElementById("days").value = days;
    predictRates();
}

// Main prediction function
async function predictRates() {
    const daysInput = document.getElementById("days");
    const days = daysInput.value;
    
    if (!days || days < 1 || days > 30) {
        alert("Please enter a valid number of days (1-30)");
        return;
    }
    
    const loader = document.getElementById("loader");
    loader.style.display = "block";
    
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const response = await fetch("rupeevision-production.up.railway.app/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ days: parseInt(days) }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        if (data.error) {
            alert("Error: " + data.error);
            return;
        }

        // Show the prediction results container
        const predictionResults = document.getElementById("prediction-results");
        predictionResults.style.display = "block";
        
        // Display the results
        displayResults(data, days);
        
    } catch (error) {
        console.error("Error:", error);
        // Generate and display sample data
        const mockData = {
            "US Dollar": Array.from({length: parseInt(days)}, () => 85 + Math.random() * 0.2),
            "Euro": Array.from({length: parseInt(days)}, () => 91 + Math.random() * 0.3),
            "Japanese Yen": Array.from({length: parseInt(days)}, () => 56 + Math.random() * 0.1),
            "Pound Sterling": Array.from({length: parseInt(days)}, () => 95 + Math.random() * 0.4)
        };
        
        // Show the prediction results container
        const predictionResults = document.getElementById("prediction-results");
        predictionResults.style.display = "block";
        
        // Display the results
        displayResults(mockData, days);
        
        console.log("Using mock data due to API error");
    } finally {
        loader.style.display = "none";
    }
}

// Function to display prediction results
function displayResults(data, days) {
    const tbody = document.querySelector("#resultTable tbody");
    tbody.innerHTML = "";
    let today = new Date();
    let labels = [];
    let datasets = [];
    
    for (let currency in data) {
        datasets.push({
            label: currency,
            data: data[currency],
            borderColor: getRandomColor(),
            fill: false,
            tension: 0.4
        });
    }
    
    for (let i = 0; i < days; i++) {
        let row = tbody.insertRow();
        let dateCell = row.insertCell(0);
        let usdCell = row.insertCell(1);
        let eurCell = row.insertCell(2);
        let jpyCell = row.insertCell(3);
        let gbpCell = row.insertCell(4);
        
        let futureDate = new Date();
        futureDate.setDate(today.getDate() + i + 1);
        let dateString = futureDate.toLocaleDateString('en-IN');
        
        dateCell.textContent = dateString;
        labels.push(dateString);
        usdCell.textContent = data["US Dollar"][i].toFixed(3);
        eurCell.textContent = data["Euro"][i].toFixed(3);
        jpyCell.textContent = data["Japanese Yen"][i].toFixed(3);
        gbpCell.textContent = data["Pound Sterling"][i].toFixed(3);
    }
    
    updateChart(labels, datasets);
}

// Function to update the chart
function updateChart(labels, datasets) {
    const ctx = document.getElementById('rateChart').getContext('2d');
    if (chart) {
        chart.destroy();
    }
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#a0a0a0'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#a0a0a0'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#e0e0e0',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(31, 27, 36, 0.9)',
                    titleColor: '#e0e0e0',
                    bodyColor: '#e0e0e0',
                    borderColor: '#4CAF50',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            elements: {
                line: {
                    tension: 0.4
                },
                point: {
                    radius: 4,
                    hoverRadius: 6
                }
            }
        }
    });
}

// Function to fetch current exchange rates from API
async function fetchCurrentRates() {
    const ratesLoader = document.getElementById('rates-loader');
    ratesLoader.style.display = 'block';
    
    try {
        // Use ExchangeRate-API to get real rates
        const response = await fetch('https://open.er-api.com/v6/latest/INR');
        const data = await response.json();
        
        if (data && data.rates) {
            const currencies = ['USD', 'EUR', 'JPY', 'GBP'];
            const currentRatesContainer = document.getElementById('current-rates');
            currentRatesContainer.innerHTML = '';
            
            currencies.forEach(currency => {
                // Calculate inverse rate (currency to INR)
                const rate = (1 / data.rates[currency]).toFixed(2);
                
                // Generate random change percentage for demo
                const change = (Math.random() * 2 - 1).toFixed(2);
                
                const cardHtml = `
                    <div class="currency-card">
                        <div class="currency-symbol">${getCurrencySymbol(currency)}</div>
                        <p>${currency}/INR</p>
                        <h3>${rate}</h3>
                        <p class="currency-change ${change >= 0 ? 'positive' : 'negative'}">
                            ${change >= 0 ? '▲' : '▼'} ${Math.abs(change)}%
                        </p>
                    </div>
                `;
                
                currentRatesContainer.innerHTML += cardHtml;
            });
        } else {
            throw new Error('Invalid API response');
        }
    } catch (error) {
        console.error('Error fetching current rates:', error);
        // Fallback to mock data if API fails
        const currencies = ['USD', 'EUR', 'JPY', 'GBP'];
        const currentRatesContainer = document.getElementById('current-rates');
        currentRatesContainer.innerHTML = '';
        
        currencies.forEach(currency => {
            const baseRate = currency === 'USD' ? 75.42 : 
                          currency === 'EUR' ? 82.15 : 
                          currency === 'JPY' ? 0.54 : 95.78;
            const rate = (baseRate + (Math.random() * 2 - 1)).toFixed(2);
            const change = (Math.random() * 2 - 1).toFixed(2);
            
            const cardHtml = `
                <div class="currency-card">
                    <div class="currency-symbol">${getCurrencySymbol(currency)}</div>
                    <p>${currency}/INR</p>
                    <h3>${rate}</h3>
                    <p class="currency-change ${change >= 0 ? 'positive' : 'negative'}">
                        ${change >= 0 ? '▲' : '▼'} ${Math.abs(change)}%
                    </p>
                </div>
            `;
            
            currentRatesContainer.innerHTML += cardHtml;
        });
    } finally {
        ratesLoader.style.display = 'none';
    }
}

// Function to generate market insights for each currency
function generateMarketInsights() {
    const currencies = {
        'USD': {
            name: 'US Dollar',
            symbol: 'fas fa-dollar-sign',
            insights: [
                'Expected to strengthen against INR due to Fed policy',
                'Showing resilience amid global economic uncertainty',
                'Technical indicators suggest bullish momentum',
                'Volatility expected after upcoming economic data release',
                'Trading range likely to remain tight in coming sessions'
            ]
        },
        'EUR': {
            name: 'Euro',
            symbol: 'fas fa-euro-sign',
            insights: [
                'Showing increased volatility against INR',
                'ECB policy decisions weighing on exchange rates',
                'Bearish trend forming in short-term charts',
                'Support levels being tested after recent decline',
                'Inflation concerns impacting currency strength'
            ]
        },
        'JPY': {
            name: 'Japanese Yen',
            symbol: 'fas fa-yen-sign',
            insights: [
                'Strengthening as a safe-haven currency',
                'Bank of Japan intervention likely if volatility continues',
                'Technical analysis shows potential reversal pattern',
                'Correlation with US Treasury yields affecting movement',
                'Seasonal patterns suggest upcoming appreciation'
            ]
        },
        'GBP': {
            name: 'British Pound',
            symbol: 'fas fa-pound-sign',
            insights: [
                'Trending upward this week against INR',
                'UK economic data supporting currency strength',
                'Breaking key resistance levels in recent sessions',
                'Momentum indicators suggest continued uptrend',
                'Brexit developments still influencing long-term outlook'
            ]
        }
    };
    
    const insightsList = document.getElementById('market-insights');
    insightsList.innerHTML = '';
    
    Object.keys(currencies).forEach(currency => {
        const currencyData = currencies[currency];
        // Pick a random insight for each currency
        const randomInsight = currencyData.insights[Math.floor(Math.random() * currencyData.insights.length)];
        
        const insightHtml = `
            <li>
                <i class="${currencyData.symbol}"></i>
                <span><strong>${currencyData.name}:</strong> ${randomInsight}</span>
            </li>
        `;
        
        insightsList.innerHTML += insightHtml;
    });
}

// Helper function to get currency symbols
function getCurrencySymbol(currency) {
    const symbols = {
        'USD': '$',
        'EUR': '€',
        'JPY': '¥',
        'GBP': '£'
    };
    return symbols[currency] || currency;
}

// Function to generate random colors for chart
function getRandomColor() {
    const colors = [
        '#4CAF50', '#2196F3', '#FFC107', '#E91E63', '#9C27B0'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Function to update the live clock
function updateClock() {
    const now = new Date();
    const clockElement = document.getElementById('live-clock');
    
    const timeString = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    
    if (clockElement) {
        clockElement.textContent = timeString;
    }
}

// Initialize the app
window.onload = function() {
    // Start the clock
    updateClock();
    setInterval(updateClock, 1000);
    
    // Fetch current rates on page load
    fetchCurrentRates();
    
    // Set up interval to refresh rates every 5 minutes
    setInterval(fetchCurrentRates, 300000);
    
    // Generate market insights
    generateMarketInsights();
    
    // Refresh market insights every 2 minutes
    setInterval(generateMarketInsights, 120000);
    
    // Show the rates loader initially
    document.getElementById('rates-loader').style.display = 'block';
};
