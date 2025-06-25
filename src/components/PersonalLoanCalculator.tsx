import React, { useState, useEffect, useCallback } from 'react';

interface PersonalLoanCalculatorProps {
  onCalculationChange?: (result: LoanCalculationResult) => void;
}

interface LoanCalculationResult {
  monthlyPayment: number;
  totalInterest: number;
  annualPercentageRate: number;
  loanAmount: number;
  repaymentPeriod: number;
  flatRate: number;
}

const PersonalLoanCalculator: React.FC<PersonalLoanCalculatorProps> = ({ onCalculationChange }) => {
  const [loanAmount, setLoanAmount] = useState(5000);
  const [repaymentPeriod, setRepaymentPeriod] = useState(6);
  const [flatRate, setFlatRate] = useState(0.01);
  const [isDragging, setIsDragging] = useState<string | null>(null);

  // Calculate loan details
  const calculateLoan = useCallback(() => {
    const monthlyFlatRate = flatRate / 100;
    const totalInterest = loanAmount * monthlyFlatRate * repaymentPeriod;
    const totalAmount = loanAmount + totalInterest;
    const monthlyPayment = totalAmount / repaymentPeriod;
    const annualPercentageRate = monthlyFlatRate * 12 * 100;

    return {
      monthlyPayment,
      totalInterest,
      annualPercentageRate,
      loanAmount,
      repaymentPeriod,
      flatRate
    };
  }, [loanAmount, repaymentPeriod, flatRate]);

  const [calculation, setCalculation] = useState<LoanCalculationResult>(() => calculateLoan());

  useEffect(() => {
    const newCalculation = calculateLoan();
    setCalculation(newCalculation);
    onCalculationChange?.(newCalculation);
  }, [calculateLoan, onCalculationChange]);

  // Handle dragging for sliders
  const handleMouseDown = (type: string) => {
    setIsDragging(type);
  };

  const handleMouseMove = (e: React.MouseEvent, type: string, min: number, max: number) => {
    if (isDragging !== type) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const value = min + (max - min) * percentage;
    
    switch (type) {
      case 'amount':
        setLoanAmount(Math.round(value / 1000) * 1000);
        break;
      case 'period':
        setRepaymentPeriod(Math.round(value));
        break;
      case 'rate':
        setFlatRate(Math.round(value * 100) / 100);
        break;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(null);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const formatCurrency = (amount: number) => {
    return `HKD ${amount.toLocaleString('en-HK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getSliderPosition = (value: number, min: number, max: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg max-w-4xl mx-auto my-4" style={{ fontFamily: 'Arial, sans-serif' }}>
      <h2 className="text-2xl font-light text-gray-800 mb-2">Calculate your monthly repayments</h2>
      <p className="text-gray-600 mb-8">Enter your loan amount, repayment period and flat rate per month and we&apos;ll calculate your monthly repayment amount.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Input Controls */}
        <div className="space-y-8">
          {/* Loan Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loan amount</label>
            <p className="text-xs text-gray-500 mb-4">Enter an amount between HKD5,000 and HKD3,000,000</p>
            <input
              type="text"
              value={`HKD ${loanAmount.toLocaleString()}`}
              onChange={(e) => {
                const value = parseInt(e.target.value.replace(/[^0-9]/g, ''));
                if (!isNaN(value) && value >= 5000 && value <= 3000000) {
                  setLoanAmount(value);
                }
              }}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <div 
              className="relative mt-4 h-2 bg-gray-200 rounded cursor-pointer"
              onMouseDown={() => handleMouseDown('amount')}
              onMouseMove={(e) => handleMouseMove(e, 'amount', 5000, 3000000)}
              onMouseUp={handleMouseUp}
            >
              <div 
                className="absolute top-0 h-2 bg-red-600 rounded"
                style={{ width: `${getSliderPosition(loanAmount, 5000, 3000000)}%` }}
              />
              <div 
                className="absolute top-1/2 w-4 h-4 bg-white border-2 border-red-600 rounded-full transform -translate-y-1/2 cursor-grab active:cursor-grabbing"
                style={{ left: `${getSliderPosition(loanAmount, 5000, 3000000)}%`, marginLeft: '-8px' }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>HKD 5,000</span>
              <span>HKD 3,000,000</span>
            </div>
          </div>

          {/* Repayment Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Repayment period</label>
            <p className="text-xs text-gray-500 mb-4">Set your repayment period</p>
            <input
              type="number"
              value={repaymentPeriod}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 6 && value <= 60) {
                  setRepaymentPeriod(value);
                }
              }}
              min="6"
              max="60"
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <div 
              className="relative mt-4 h-2 bg-gray-200 rounded cursor-pointer"
              onMouseDown={() => handleMouseDown('period')}
              onMouseMove={(e) => handleMouseMove(e, 'period', 6, 60)}
              onMouseUp={handleMouseUp}
            >
              <div 
                className="absolute top-0 h-2 bg-red-600 rounded"
                style={{ width: `${getSliderPosition(repaymentPeriod, 6, 60)}%` }}
              />
              <div 
                className="absolute top-1/2 w-4 h-4 bg-white border-2 border-red-600 rounded-full transform -translate-y-1/2 cursor-grab active:cursor-grabbing"
                style={{ left: `${getSliderPosition(repaymentPeriod, 6, 60)}%`, marginLeft: '-8px' }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>6 months</span>
              <span>60 months</span>
            </div>
          </div>

          {/* Flat Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Flat rate per month</label>
            <p className="text-xs text-gray-500 mb-4">Enter a value between 0.01%-2.00%</p>
            <input
              type="text"
              value={`${flatRate.toFixed(2)}%`}
              onChange={(e) => {
                const value = parseFloat(e.target.value.replace('%', ''));
                if (!isNaN(value) && value >= 0.01 && value <= 2.00) {
                  setFlatRate(value);
                }
              }}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <div 
              className="relative mt-4 h-2 bg-gray-200 rounded cursor-pointer"
              onMouseDown={() => handleMouseDown('rate')}
              onMouseMove={(e) => handleMouseMove(e, 'rate', 0.01, 2.00)}
              onMouseUp={handleMouseUp}
            >
              <div 
                className="absolute top-0 h-2 bg-red-600 rounded"
                style={{ width: `${getSliderPosition(flatRate, 0.01, 2.00)}%` }}
              />
              <div 
                className="absolute top-1/2 w-4 h-4 bg-white border-2 border-red-600 rounded-full transform -translate-y-1/2 cursor-grab active:cursor-grabbing"
                style={{ left: `${getSliderPosition(flatRate, 0.01, 2.00)}%`, marginLeft: '-8px' }}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-6">Repayment summary</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly repayment amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculation.monthlyPayment)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">Total interest amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculation.totalInterest)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">Annualised percentage rate (APR)</p>
              <p className="text-2xl font-bold text-gray-900">{calculation.annualPercentageRate.toFixed(2)}%</p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button className="w-full bg-red-600 text-white py-3 px-6 rounded font-medium hover:bg-red-700 transition-colors">
              Apply for Personal Loan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalLoanCalculator;