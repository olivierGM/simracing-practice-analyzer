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

    // COPIE PROD: Grouper les laps en sessions de 10 (ligne 251-308 de progression-chart.js)
    const sessionsPerGroup = 10;
    const groupedSessions = [];
    
    for (let i = 0; i < driver.lapTimes.length; i += sessionsPerGroup) {
      const sessionLaps = driver.lapTimes.slice(i, i + sessionsPerGroup);
      const lapTimes = sessionLaps
        .map(lap => lap.laptime || lap.time || 0)
        .filter(time => time > 0);
      
      if (lapTimes.length > 0) {
        groupedSessions.push({
          bestTime: Math.min(...lapTimes),
          averageTime: lapTimes.reduce((sum, t) => sum + t, 0) / lapTimes.length,
          dryTimes: sessionLaps
            .filter(lap => !lap.isWet && (lap.laptime || lap.time))
            .map(lap => lap.laptime || lap.time || 0)
            .filter(time => time > 0),
          wetTimes: sessionLaps
            .filter(lap => lap.isWet && (lap.laptime || lap.time))
            .map(lap => lap.laptime || lap.time || 0)
            .filter(time => time > 0),
        });
      }
    }
    
    if (groupedSessions.length === 0) return null;
    
    const labels = groupedSessions.map((_, i) => `Session ${i + 1}`);
    
    // 1. Meilleur temps cumulatif (ligne 377-382)
    let cumulativeBest = null;
    const bestTimes = groupedSessions.map(item => {
      if (cumulativeBest === null || item.bestTime < cumulativeBest) {
        cumulativeBest = item.bestTime;
      }
      return cumulativeBest;
    });
    
    // 2. Temps moyens (ligne 385-387)
    const averageTimes = groupedSessions.map(item => item.averageTime);
    
    // 3. Meilleur temps sec par session (ligne 390-407)
    const dryTimes = groupedSessions.map(item => 
      item.dryTimes.length > 0 ? Math.min(...item.dryTimes) : null
    );
    
    // 4. Meilleur temps wet par session (ligne 410-426)
    const wetTimes = groupedSessions.map(item =>
      item.wetTimes.length > 0 ? Math.min(...item.wetTimes) : null
    );

    return {
      labels,
      datasets: [
        {
          label: '🏆 Meilleurs Temps',
          data: bestTimes,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.1,
          pointRadius: 0,
        },
        {
          label: '📊 Temps Moyens',
          data: averageTimes,
          borderColor: '#6b7280',
          backgroundColor: 'rgba(107, 114, 128, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.1,
          pointRadius: 4,
          borderDash: [2, 2]
        },
        {
          label: '🌞 Tours Sec',
          data: dryTimes,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.1,
          pointRadius: 4,
        },
        {
          label: '🌧️ Tours Wet',
          data: wetTimes,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.1,
          pointRadius: 4,
        },
      ],
    };
  }, [driver.lapTimes]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      title: {
        display: true,
        text: 'Évolution des Temps de Tour',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#6366f1',
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const timeInMs = context.parsed.y;
            const datasetLabel = context.dataset.label;
            
            if (!timeInMs || timeInMs === 0) {
              return `${datasetLabel}: 00:00.000`;
            }
            
            const minutes = Math.floor(timeInMs / 60000);
            const seconds = Math.floor((timeInMs % 60000) / 1000);
            const milliseconds = Math.floor(timeInMs % 1000);
            
            const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
            
            return `${datasetLabel}: ${formattedTime}`;
          }
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Sessions'
        },
        ticks: {
          maxTicksLimit: 10,
          maxRotation: 45,
          minRotation: 0,
          padding: 10
        },
        grid: {
          display: true
        }
      },
      y: {
        title: {
          display: true,
          text: 'Temps'
        },
        reverse: true,
        ticks: {
          callback: function(value) {
            if (!value || value === 0) return '00:00.000';
            
            const minutes = Math.floor(value / 60000);
            const seconds = Math.floor((value % 60000) / 1000);
            const milliseconds = Math.floor(value % 1000);
            
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
          },
          stepSize: 1000,
          maxTicksLimit: 8
        },
        type: 'linear',
        beginAtZero: false
      }
    }
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
      
      {/* Légende custom comme la prod */}
      <div className="chart-legend">
        {chartData.datasets.map((dataset, index) => (
          <div key={index} className="legend-item">
            <span className="legend-color" style={{ borderColor: dataset.borderColor, borderDash: dataset.borderDash }}></span>
            <span className="legend-label">{dataset.label}</span>
          </div>
        ))}
      </div>
      
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
