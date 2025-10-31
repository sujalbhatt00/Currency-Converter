const BASE_URL = "https://api.exchangerate-api.com/v4/latest";

const dropdowns = document.querySelectorAll(".dropdown select");
const amountInput = document.querySelector(".amount input");
const fromCurrency = document.querySelector(".from select");
const toCurrency = document.querySelector(".to select");
const converterBtn = document.querySelector("button");
const msg = document.querySelector(".msg");

// Init
document.addEventListener("DOMContentLoaded", () => {
  populateCurrencyDropdowns();
  updateExchangeRate();
});

// Fill dropdowns dynamically from countryList
function populateCurrencyDropdowns() {
  dropdowns.forEach(select => {
    Object.keys(countryList).forEach(currency => {
      const option = new Option(currency, currency);
      select.append(option);

      if (select.name === "from" && currency === "USD") option.selected = true;
      if (select.name === "to" && currency === "INR") option.selected = true;
    });

    select.addEventListener("change", (e) => {
      updateFlag(e.target);
      updateExchangeRate();
    });
  });
}

// Update flag based on selected currency
function updateFlag(selectElement) {
  const countryCode = countryList[selectElement.value];
  const img = selectElement.parentElement.querySelector("img");
  img.src = `https://flagsapi.com/${countryCode}/flat/64.png`;
  img.alt = `${selectElement.value} Flag`;
}

// Fetch and update exchange rate
async function updateExchangeRate() {
  const amount = parseFloat(amountInput.value) || 1;
  amountInput.value = amount;

  setLoading(true);

  try {
    const response = await fetch(`${BASE_URL}/${fromCurrency.value}`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

    const data = await response.json();
    const rate = data.rates[toCurrency.value];

    if (!rate) throw new Error("Rate not available");

    const converted = (amount * rate).toFixed(2);

    msg.textContent = `${amount.toLocaleString()} ${fromCurrency.value} = ${parseFloat(converted).toLocaleString()} ${toCurrency.value}`;
    msg.classList.remove("error");

  } catch (err) {
    console.error(err);
    msg.textContent = "Unable to fetch exchange rate.";
    msg.classList.add("error");

  } finally {
    setLoading(false);
  }
}

// Show loading state
function setLoading(isLoading) {
  msg.classList.toggle("loading", isLoading);
  msg.textContent = isLoading ? "Loading..." : msg.textContent;
}

// Convert on button click
converterBtn.addEventListener("click", (e) => {
  e.preventDefault();
  updateExchangeRate();
});

// Auto convert while typing (debounced)
let typingTimeout;
amountInput.addEventListener("input", () => {
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(updateExchangeRate, 400);
});
