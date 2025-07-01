// components/WallAndImpact.jsx
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function WallAndImpact() {
  const impactChartRef = useRef(null);
  const donationChartRef = useRef(null);

  useEffect(() => {
    let impactChartInstance = null;
    let donationChartInstance = null;

    if (impactChartRef.current) {
      impactChartInstance = new Chart(impactChartRef.current, {
        type: 'line',
        data: {
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
          datasets: [{
            label: 'Enfants Soutenus',
            data: [1200, 1580, 1890, 2150, 2450, 2847],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
    if (donationChartRef.current) {
      donationChartInstance = new Chart(donationChartRef.current, {
        type: 'doughnut',
        data: {
          labels: [
            'License & Dream',
            'Champion Equipment',
            'Daily Energy',
            'Talent Journey',
            'Tomorrow\'s Training'
          ],
          datasets: [{
            data: [35, 25, 20, 12, 8],
            backgroundColor: [
              '#3b82f6',
              '#ea580c',
              '#10b981',
              '#8b5cf6',
              '#6366f1'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  return () => {
      impactChartInstance?.destroy();
      donationChartInstance?.destroy();
    };
  }, []);

  return (
    <>
      {/* Wall of Champions */}
      <section className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-4">Mur des Champions</h3>
        <p className="text-lg text-gray-600 text-center mb-12">
          Célébrons nos généreux supporters qui font vivre les rêves
        </p>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-6 rounded-xl text-center">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">JD</span>
            </div>
            <h4 className="font-bold text-lg">John D.</h4>
            <p className="text-yellow-600 font-medium">Champion Platine</p>
            <p className="text-sm text-gray-600 mt-2">€2,500 donnés</p>
          </div>

          <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-xl text-center">
            <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">SM</span>
            </div>
            <h4 className="font-bold text-lg">Sarah M.</h4>
            <p className="text-gray-600 font-medium">Supporter Or</p>
            <p className="text-sm text-gray-600 mt-2">€1,800 donnés</p>
          </div>

          <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-xl text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">MR</span>
            </div>
            <h4 className="font-bold text-lg">Mike R.</h4>
            <p className="text-orange-600 font-medium">Héros Argent</p>
            <p className="text-sm text-gray-600 mt-2">€950 donnés</p>
          </div>

          <div className="bg-gradient-to-br from-red-100 to-red-200 p-6 rounded-xl text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">AK</span>
            </div>
            <h4 className="font-bold text-lg">Anna K.</h4>
            <p className="text-red-600 font-medium">Amie Bronze</p>
            <p className="text-sm text-gray-600 mt-2">€420 donnés</p>
          </div>
        </div>
      </section>

      {/* Impact Chart */}
      <section className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-4">Suivi d'Impact Transparent</h3>
        <p className="text-lg text-gray-600 text-center mb-12">
          Voyez exactement comment vos dons font la différence
        </p>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Impact Growth Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg h-[350px]">
            <h4 className="text-xl font-bold mb-4">Croissance de l'Impact Mensuel</h4>
            <div className="relative h-[calc(100%-2rem)]">
              <canvas ref={impactChartRef} className="w-full h-full" />
            </div>
          </div>

            {/* Donation Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-lg h-[350px]">
            <h4 className="text-xl font-bold mb-4">Répartition des Dons</h4>
            <div className="relative h-[calc(100%-2rem)]">
              <canvas ref={donationChartRef} className="w-full h-full" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
