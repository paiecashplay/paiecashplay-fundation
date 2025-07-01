export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaymentMethod {
  id: string;
  type: 'STRIPE' | 'PAYPAL';
  last4?: string;
  expiryDate?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  paymentMethod: PaymentMethod;
}