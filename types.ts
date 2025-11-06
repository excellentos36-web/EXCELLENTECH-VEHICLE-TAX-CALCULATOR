
export enum VehicleType {
  Motorcycle = 'Motorcycle',
  Car = 'Car',
}

export interface TaxCalculationResult {
  estimatedTax: number;
  calculationDetails: string;
  disclaimer: string;
}
