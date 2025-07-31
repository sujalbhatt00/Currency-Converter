const Base_URL = "https://api.exchangerate-api.com/v4/latest";
const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("button");
const fromCurrency = document.querySelector(".from select");
const toCurrency = document.querySelector(".to select");
const msg = document.querySelector(".msg");

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    populateDropdowns();
    updateExchangeRate();
});

// Populate currency dropdowns
function populateDropdowns() {
    for(let select of dropdowns) {
        for(let currCode in countryList) {
            let newOption = document.createElement("option");
            newOption.innerText = currCode;
            newOption.value = currCode;
            
            // Set default selections
            if(select.name === "from" && currCode === "USD") {
                newOption.selected = true;
            } else if(select.name === "to" && currCode === "INR") {
                newOption.selected = true;
            }
            
            select.append(newOption);
        }
        
        // Add event listener for flag updates and rate calculation
        select.addEventListener("change", (evt) => {
            updateFlag(evt.target);
            updateExchangeRate();
        });
    }
}

// Update flag image based on selected currency
function updateFlag(element) {
    let currCode = element.value;
    let countryCode = countryList[currCode];
    let newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
    let img = element.parentElement.querySelector("img");
    img.src = newSrc;
    img.alt = `${currCode} Flag`;
}

// Update exchange rate automatically
async function updateExchangeRate() {
    try {
        const amount = document.querySelector(".amount input");
        let value = parseFloat(amount.value) || 1;
        
        if(value <= 0) {
            value = 1;
            amount.value = "1";
        }
        
        // Show loading state
        msg.classList.add('loading');
        msg.innerText = "Loading...";
        
        const URL = `${Base_URL}/${fromCurrency.value}`;
        let response = await fetch(URL);
        
        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let data = await response.json();
        let rate = data.rates[toCurrency.value];
        
        if(!rate) {
            throw new Error("Exchange rate not found");
        }
        
        let finalValue = (rate * value).toFixed(2);
        
        // Format numbers with commas for better readability
        const formattedValue = value.toLocaleString();
        const formattedFinalValue = parseFloat(finalValue).toLocaleString();
        
        // Remove loading state and show result
        msg.classList.remove('loading');
        msg.classList.remove('error');
        msg.innerText = `${formattedValue} ${fromCurrency.value} = ${formattedFinalValue} ${toCurrency.value}`;
        
    } catch(error) {
        console.error('Error fetching exchange rate:', error);
        msg.classList.remove('loading');
        msg.classList.add('error');
        msg.innerText = "Error: Unable to fetch exchange rate";
    }
}

// Handle form submission
btn.addEventListener("click", async (evt) => {
    evt.preventDefault();
    await updateExchangeRate();
});

// Handle amount input changes
document.querySelector(".amount input").addEventListener("input", () => {
    clearTimeout(window.exchangeRateTimeout);
    window.exchangeRateTimeout = setTimeout(updateExchangeRate, 500);
});
