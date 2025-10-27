/**
 * Composant ProgressionChart
 * 
 * Affiche l'évolution des temps de tour avec Chart.js
 * COPIE de la prod
 */

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './ProgressionChart.css';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function ProgressionChart({ driver }) {
  const chartData = useMemo(() => {
    if (!driver.lapTimes || driver.lapTimes.length === 0) {
      return null;
    }

    const labels = driver.lapTimes.map((_, index) => `Tour ${index + 1}`);
    const bestTimes = [];
    const averageTimes = [];
    const validLaps = [];
    const wetLaps = [];
    
    let runningBest = Infinity;
    let runningTotal = 0;
    let runningCount = 0;

    driver.lapTimes.forEach((lap, index) => {
      const lapTime = lap.laptime || 0;
      
      // Meilleur temps jusqu'à maintenant
      if (lap.isValid && lapTime > 0 && lapTime < runningBest) {
        runningBest = lapTime;
      }
      bestTimes.push(runningBest === Infinity ? null : runningBest / 1000);
      
      // Moyenne cumulative
      if (lap.isValid && lapTime > 0) {
        runningTotal += lapTime;
        runningCount++;
      }
      averageTimes.push(runningCount > 0 ? runningTotal / runningCount / 1000 : null);
      
      // Marquer les tours valides et wet
      if (lap.isValid) validLaps.push({ x: index, y: lapTime / 1000 });
      if (lap.isWetSession) wetLaps.push({ x: index, y: lapTime / 1000 });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Meilleurs Temps',
          data: bestTimes,
          borderColor: 'rgb(76, 175, 80)',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.1,
          fill: true,
        },
        {
          label: 'Temps Moyens',
          data: averageTimes,
          borderColor: 'rgb(33, 150, 243)',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.1,
          fill: true,
        },
        {
          label: 'Tours Sec',
          data: validLaps,
          borderColor: 'rgba(255, 152, 0, 0.8)',
          backgroundColor: 'rgba(255, 152, 0, 0.3)',
          pointRadius: 3,
          pointHoverRadius: 5,
          showLine: false,
        },
        {
          label: 'Tours Wet',
          data: wetLaps,
          borderColor: 'rgba(33, 150, 243, 0.8)',
          backgroundColor: 'rgba(33, 150, 243, 0.3)',
          pointRadius: 3,
          pointHoverRadius: 5,
          showLine: false,
        },
      ],
    };
  }, [driver.lapTimes]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--text-primary)',
          usePointStyle: true,
          padding: 15,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(3) + 's';
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(128, 128, 128, 0.1)',
        },
        ticks: {
          color: 'var(--text-secondary)',
        },
      },
      y: {
        grid: {
          color: 'rgba(128, 128, 128, 0.1)',
        },
        ticks: {
          color: 'var(--text-secondary)',
          callback: function(value) {
            return value.toFixed(1) + 's';
          }
        },
      },
    },
  };

  if (!chartData) {
    return (
      <div className="chart-section">
        <h3>📈 Évolution des Temps de Tour</h3>
        <p>Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="chart-section">
      <h3>📈 Évolution des Temps de Tour</h3>
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
