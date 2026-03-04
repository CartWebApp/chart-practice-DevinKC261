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
const regionSelect = document.getElementById("regionSelect");

let currentChart = null;

// --- Populate dropdowns from data ---
const genre = [...new Set(chartData.map(r => r.genre))];
const platform = [...new Set(chartData.map(r => r.platform))];
const publisher = [...new Set(chartData.map(r => r.publisher))];
const year = [...new Set(chartData.map(r => r.year))];
const region = [...new Set(chartData.map(r => r.region))];
const metrics = [...new Set(chartData.map(r => r.metrics))];

genre.forEach(g => genreSelect.add(new Option(g, g)));
platform.forEach(p => platformSelect.add(new Option(p, p)));
publisher.forEach(p => publisherSelect.add(new Option(p, p)));
region.forEach(r => regionSelect.add(new Option(r, r)));
year.forEach(y => yearSelect.add(new Option(y, y)))
metrics.forEach(m => metricSelect.add(new Option(m, m)))

genreSelect.value = genre[0];
platformSelect.value = platform[0];
publisherSelect.value = genre[0];
regionSelect.value = platform[0];
yearSelect.value = year[0];
metricSelect.value = metrics[0];

// Preview first 6 rows
dataPreview.textContent = JSON.stringify(chartData.slice(0, 6), null, 2);

// --- Main render ---
renderBtn.addEventListener("click", () => {
  const chartType = chartTypeSelect.value;
  const genre = genreSelect.value;
  const platform = platformSelect.value;
  const year = Number(yearSelect.value);
  const metric = metricSelect.value;
  const publisher = publisherSelect.value;
  const region = regionSelect.value;

  // Destroy old chart if it exists (common Chart.js gotcha)
  if (currentChart) currentChart.destroy();

  // Build chart config based on type
  const config = buildConfig(chartType, { genre, platform, publisher, region, year, metric });

  currentChart = new Chart(canvas, config);
});

// --- Students: you’ll edit / extend these functions ---
function buildConfig(type, { genre, platform, publisher, region, year, metrics}) {
  if (type === "bar") return barByNeighborhood(genre, metrics);
  if (type === "line") return lineOverTime(publisher, metrics);
  if (type === "scatter") return scatterTripsVsTemp(metrics);
  if (type === "doughnut") return doughnutMemberVsCasual(genre, platform);
  if (type === "radar") return radarCompareNeighborhoods(genre);
  return barByNeighborhood(platform, metrics);
}

// Task A: BAR — compare platforms for a given metrics
function barByNeighborhood(genre, metrics) {
  const rows = chartData.filter(r => r.genre === genre);

  const labels = rows.map(r => r.genre);
  const values = rows.map(r => Number(r[metrics]));

  return {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${metrics} in ${genre}`,
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Platform comparison (${genre})` }
      },
      scales: {
        y: { title: { display: true, text: metrics } },
        x: { title: { display: true, text: [platform] } }
      }
    }
  };
}

// Task B: LINE — trend over time for one neighborhood (2 datasets)
function lineOverTime(publisher, metrics) {
  const rows = chartData.filter(r => r.publisher === publisher);
  const labels = rows.map(r => r.year);

  const datasets = metrics.map(m => ({
    label: m,
    data: rows.map(r => Number(r[m]))
  }));

  return {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Trends over time: ${publisher}` }
      },
      scales: {
        y: { title: { display: true, text: "Value" } },
        x: { title: { display: true, text: "Years" } }
      }
    }
  };
}


// SCATTER — relationship between temperature and trips
function scatterTripsVsTemp (metrics) {
  const rows = chartData.filter(r => r.metrics === metrics);

  const points = rows.map(r => ({ x: r.reviewScore, y: r.revenueUSD }));

  return {
    type: "scatter",
    data: {
      datasets: [{
        label: `Review Score Vs. (${metrics})`,
        data: points
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Whats the relatioship between review scores and (${metrics})` }
      },
      scales: {
        x: { title: { display: true, text: "Review Scores" } },
        y: { title: { display: true, text: metrics } }
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
function radarCompareNeighborhoods(publisher) {
  const rows = chartData.filter(r => r.publisher === publisher);

  const metrics = ["trips", "revenueUSD", "avgDurationMin", "incidents"];
  const labels = metrics;

  const datasets = rows.map(r => ({
    label: r.genre,
    data: metrics.map(m => r[m])
  }));

  return {
    type: "radar",
    data: { labels, datasets },
    options: {
      plugins: {
        title: { display: true, text: `Multi-metrics comparison (${publisher})` }
      }
    }
  };
}