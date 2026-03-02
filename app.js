// change this to reference the dataset you chose to work with.
import { gameSales as chartData } from "./data/gameSales.js";

// --- DOM helpers ---
const genreSelect = document.getElementById("genreSelect");
const platformSelect = document.getElementById("platformSelect");
const metricSelect = document.getElementById("metricSelect");
const chartTypeSelect = document.getElementById("chartType");
const renderBtn = document.getElementById("renderBtn");
const dataPreview = document.getElementById("dataPreview");
const canvas = document.getElementById("chartCanvas");
const publisherSelect = document.getElementById("publisherSelect");
const yearSelect = document.getElementById("yearSelect");

let currentChart = null;

// --- Populate dropdowns from data ---
const genre = [...new Set(chartData.map(r => r.genre))];
const platform = [...new Set(chartData.map(r => r.platform))];
const publisher = [...new Set(chartData.map(r => r.publisher))];
const year = [...new Set(chartData.map(r => r.year))];

genre.forEach(m => genreSelect.add(new Option(m, m)));
platform.forEach(h => platformSelect.add(new Option(h, h)));
publisher.forEach(p => publisherSelect.add(new Option(p, p)));
year.forEach(p => yearSelect.add(new Option(p, p)));

genreSelect.value = genre[0];
platformSelect.value = platform[0];

// Preview first 6 rows
dataPreview.textContent = JSON.stringify(chartData.slice(0, 6), null, 2);

// --- Main render ---
renderBtn.addEventListener("click", () => {
  const chartType = chartTypeSelect.value;
  const genre = genreSelect.value;
  const platform = platformSelect.value;
  const metric = metricSelect.value;
  const publisher = publisherSelectSelect.value;
  const year = yearSelectSelect.value;

  // Destroy old chart if it exists (common Chart.js gotcha)
  if (currentChart) currentChart.destroy();

  // Build chart config based on type
  const config = buildConfig(chartType, { genre, platform, metric, publisher, year });

  currentChart = new Chart(canvas, config);
});

// --- Students: you’ll edit / extend these functions ---
function buildConfig(type, { genre, platform, metric, publisher, year }) {
  if (type === "bar") return barByNeighborhood(genre, metric);
  if (type === "line") return lineOverTime(publisher, ["priceUSD", "revenueUSD"]);
  if (type === "scatter") return scatterTripsVsTemp(platform);
  if (type === "doughnut") return doughnutMemberVsCasual(genre, platform);
  if (type === "radar") return radarCompareNeighborhoods(genre);
  return barByNeighborhood(genre, metric);
}

// Task A: BAR — compare neighborhoods for a given genre
function barByNeighborhood(genre, metric) {
  const rows = chartData.filter(r => r.genre === genre);

  const labels = rows.map(r => r.platform);
  const values = rows.map(r => r[metric]);

  return {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${metric} in ${genre}`,
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Neighborhood comparison (${genre})` }
      },
      scales: {
        y: { title: { display: true, text: metric } },
        x: { title: { display: true, text: "Neighborhood" } }
      }
    }
  };
}

// Task B: LINE — trend over time for one neighborhood (2 datasets)
function lineOverTime(platform, metrics) {
  const rows = chartData.filter(r => r.platform === platform);

  const labels = rows.map(r => r.genre);

  const datasets = metrics.map(m => ({
    label: m,
    data: rows.map(r => r[m])
  }));

  return {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Trends over time: ${platform}` }
      },
      scales: {
        y: { title: { display: true, text: "Value" } },
        x: { title: { display: true, text: "genre" } }
      }
    }
  };
}

// SCATTER — relationship between temperature and trips
function scatterTripsVsTemp(platform) {
  const rows = chartData.filter(r => r.platform === platform);

  const points = rows.map(r => ({ x: r.tempC, y: r.trips }));

  return {
    type: "scatter",
    data: {
      datasets: [{
        label: `Trips vs Temp (${platform})`,
        data: points
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Does temperature affect trips? (${platform})` }
      },
      scales: {
        x: { title: { display: true, text: "Temperature (C)" } },
        y: { title: { display: true, text: "Trips" } }
      }
    }
  };
}

// DOUGHNUT — member vs casual share for one platform + genre
function doughnutMemberVsCasual(genre, platform) {
  const row = chartData.find(r => r.genre === genre && r.platform === platform);

  const member = Math.round(row.memberShare * 100);
  const casual = 100 - member;

  return {
    type: "doughnut",
    data: {
      labels: ["Members (%)", "Casual (%)"],
      datasets: [{ label: "Rider mix", data: [member, casual] }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Rider mix: ${platform} (${genre})` }
      }
    }
  };
}

// RADAR — compare neighborhoods across multiple metrics for one genre
function radarCompareNeighborhoods(genre) {
  const rows = chartData.filter(r => r.genre === genre);

  const metrics = ["trips", "revenueUSD", "avgDurationMin", "incidents"];
  const labels = metrics;

  const datasets = rows.map(r => ({
    label: r.platform,
    data: metrics.map(m => r[m])
  }));

  return {
    type: "radar",
    data: { labels, datasets },
    options: {
      plugins: {
        title: { display: true, text: `Multi-metric comparison (${genre})` }
      }
    }
  };
}