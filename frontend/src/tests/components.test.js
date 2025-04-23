import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import InvestmentSimulator from '../components/investment/InvestmentSimulator';
import TokenizationSimulator from '../components/tokenization/TokenizationSimulator';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Authentication Components', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  test('LoginForm renders correctly', () => {
    render(<LoginForm />);
    expect(screen.getByText('Login to RWABridge')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  test('RegisterForm renders correctly', () => {
    render(<RegisterForm />);
    expect(screen.getByText('Create an Account')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Account Type')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  test('LoginForm handles submission', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        token: 'test-token',
        user: { id: '1', name: 'Test User', email: 'test@example.com' }
      }),
    });

    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });
    });
  });
});

describe('Investment Components', () => {
  const mockAsset = {
    _id: '123',
    title: 'Test Asset',
    description: 'Test description',
    assetType: 'real-estate',
    tokenPrice: 100,
    totalTokens: 1000,
    minInvestment: 500,
    currency: 'INR',
    expectedYield: 8,
  };

  test('InvestmentSimulator renders correctly', () => {
    render(<InvestmentSimulator asset={mockAsset} />);
    expect(screen.getByText('Investment Simulator')).toBeInTheDocument();
    expect(screen.getByLabelText('Number of Tokens')).toBeInTheDocument();
    expect(screen.getByLabelText('Investment Amount (INR)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Invest Now' })).toBeInTheDocument();
  });

  test('TokenizationSimulator renders correctly', () => {
    render(<TokenizationSimulator asset={mockAsset} />);
    expect(screen.getByText('Asset Tokenization')).toBeInTheDocument();
    expect(screen.getByText('This process will tokenize your asset on the Solana blockchain, creating a smart contract and minting tokens that represent ownership shares.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start Tokenization' })).toBeInTheDocument();
  });
});
