import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler
);

const JourneyGraph = () => {
  const data = {
    labels: [
      "Start",
      "Struggle",
      "Doubt",
      "Consistency",
      "Growth",
      "Breakthrough",
    ],
    datasets: [
      {
        label: "Your Journey",
        data: [10, 5, 8, 15, 12, 25],
        fill: true,
        borderColor: "#ff2d2d",
        backgroundColor: "rgba(255, 45, 45, 0.15)",
        tension: 0.4,
        pointBackgroundColor: "#ff2d2d",
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: { color: "#aaa" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        ticks: { color: "#aaa" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default JourneyGraph;
