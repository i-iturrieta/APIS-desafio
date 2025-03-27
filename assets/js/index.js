const amountInput = document.getElementById("amount");
const currencySelect = document.getElementById("currency");
const convertButton = document.getElementById("convert");
const resultParagraph = document.getElementById("result");
const chartCanvas = document.getElementById("chart");
let chartInstance;

convertButton.addEventListener("click", async () => {
    const amount = parseFloat(amountInput.value);
    const currency = currencySelect.value;

    if (isNaN(amount) || amount <= 0) {
        resultParagraph.textContent = "Por favor, ingresa un monto válido";
        return;
    }

    try{
        const res = await fetch("https://mindicador.cl/api");
        if (!res.ok) throw new Error('Error al obtener los datos de la API');
        const data = await res.json(); 
        const currencyMap = {
            dolar: "dolar",
            euro: "euro",
        };

        const rate = data[currencyMap[currency]]?.valor;
        if (!rate) throw new Error("la moneda seleccionada no está disponible.");

        const convertedAmount = (amount / rate).toFixed(2);
        resultParagraph.textContent = `Equivalente: ${convertedAmount} ${currency.toUpperCase()}`;

        const history = data[currencyMap[currency]]?.serie;
        if (history && Array.isArray(history)) {
            const last10Days = history.slice(0, 10).reverse();
            renderChart(last10Days, currency);
        } else {
            resultParagraph.textContent += 
            `\nNo hay datos históricos disponibles para graficar.`
        };

    } catch (error) {
        resultParagraph.textContent = `Error: ${error.message}`
    }
});

function renderChart(history, currency) {
    const labels = history.map((entry) => entry.fecha.split("T")[0]);
    const values = history.map((entry) => entry.valor);

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(chartCanvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: `Historial de ${currency.toUpperCase()}`,
                    data: values,
                    borderColor: "blue", 
                    fill: false,
                },
            ],
        },
    });
}