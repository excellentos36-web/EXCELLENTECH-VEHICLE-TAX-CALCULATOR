
import React, { useState, useCallback } from 'react';
import { VehicleType, TaxCalculationResult } from './types';
import { calculateTax } from './services/geminiService';
import Card from './components/Card';
import Input from './components/Input';
import Select from './components/Select';
import Button from './components/Button';
import Spinner from './components/Spinner';

const IndianRupeeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12" />
        <path d="M6 8h12" />
        <path d="m15 13-9 8" />
        <path d="M6 21h12" />
    </svg>
);

const CalendarIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);


const App: React.FC = () => {
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.Car);
  const [vehicleCost, setVehicleCost] = useState<string>('');
  const [vehicleAge, setVehicleAge] = useState<string>('');
  const [taxResult, setTaxResult] = useState<TaxCalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = useCallback(async () => {
    const cost = Number(vehicleCost);
    const age = Number(vehicleAge);

    if (isNaN(cost) || cost <= 0) {
      setError("Please enter a valid vehicle cost.");
      return;
    }
    if (isNaN(age) || age < 0) {
      setError("Please enter a valid vehicle age.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTaxResult(null);

    try {
      const result = await calculateTax(vehicleType, cost, age);
      setTaxResult(result);
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [vehicleType, vehicleCost, vehicleAge]);

  const ResultDisplay: React.FC = () => {
    if (isLoading) {
      return (
        <Card className="mt-8 flex flex-col items-center justify-center gap-4">
            <Spinner />
            <p className="text-slate-300">Calculating your estimated tax...</p>
        </Card>
      );
    }
    if (error) {
        return <Card className="mt-8 bg-red-900/50 border-red-700"><p className="text-red-300 text-center">{error}</p></Card>
    }
    if (taxResult) {
      return (
        <Card className="mt-8 animate-fade-in">
          <h2 className="text-xl font-bold text-cyan-300 mb-4">Estimation Result</h2>
          <div className="text-center bg-slate-900 p-6 rounded-lg mb-6 border border-slate-700">
            <p className="text-slate-400 text-sm">Estimated Lifetime Tax</p>
            <p className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              ₹ {taxResult.estimatedTax.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-200">Calculation Breakdown</h3>
            <p className="text-slate-300 whitespace-pre-wrap bg-slate-900/80 p-4 rounded-md border border-slate-700 text-sm">{taxResult.calculationDetails}</p>
            <p className="text-xs text-slate-500 italic pt-2">{taxResult.disclaimer}</p>
          </div>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-900">
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
        `}</style>
      <main className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Karnataka Vehicle Tax Estimator</h1>
          <p className="text-slate-400 mt-2">For vehicles registered in other states</p>
        </header>

        <Card>
          <form onSubmit={(e) => { e.preventDefault(); handleCalculate(); }} className="space-y-6">
            <Select
              id="vehicleType"
              label="Vehicle Type"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value as VehicleType)}
              options={[
                { value: VehicleType.Car, label: 'Motor Car / Jeep / Omni' },
                { value: VehicleType.Motorcycle, label: 'Motorcycle / Two-Wheeler' },
              ]}
            />
            <Input
              id="vehicleCost"
              label="Original Vehicle Cost (Invoice Price in INR)"
              value={vehicleCost}
              onChange={(e) => setVehicleCost(e.target.value)}
              placeholder="e.g., 850000"
              icon={<IndianRupeeIcon />}
              min="1"
              required
            />
            <Input
              id="vehicleAge"
              label="Age of Vehicle (in years, from first registration)"
              value={vehicleAge}
              onChange={(e) => setVehicleAge(e.target.value)}
              placeholder="e.g., 5"
              icon={<CalendarIcon />}
              min="0"
              required
            />
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={!vehicleCost || !vehicleAge}
            >
              Calculate Tax
            </Button>
          </form>
        </Card>

        <ResultDisplay />
      </main>
      <footer className="text-center mt-12 text-slate-600 text-sm">
        <p>This tool provides an estimate only. All calculations are performed by an AI model based on public RTO data.</p>
      </footer>
    </div>
  );
};

export default App;
