// Add Payment Method Modal with Stripe Elements
// Allows users to add a new credit card using Stripe's secure card input

import React, { useState } from 'react';
import { X, CreditCard, Lock } from 'lucide-react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { stripeClient } from '../api/stripe';
import apiClient from '../api/client';

// Wild Things brand colors
const colors = {
  darkBlue: '#0e181f',
  aqua: '#86dbdf',
  yellow: '#ffcf00',
  orange: '#ec874c',
};

// Initialize Stripe
const stripePromise = loadStripe(stripeClient.getPublishableKey());

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Card Form Component (uses Stripe Elements)
 */
const CardForm: React.FC<{
  onSuccess: () => void;
  onClose: () => void;
}> = ({ onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setAsDefault, setSetAsDefault] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get CardElement
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method');
      }

      console.log('Payment method created:', paymentMethod.id);

      // Save payment method to authenticated user's account
      const response = await apiClient.savePaymentMethod(paymentMethod.id, setAsDefault);

      if (!response.success) {
        throw new Error('Failed to save payment method');
      }

      console.log('Payment method saved successfully');

      // Success!
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error adding payment method:', err);
      setError(err.message || 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Element */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.darkBlue }}>
          Card Details
        </label>
        <div
          className="border-2 rounded-lg p-4"
          style={{ borderColor: colors.aqua }}
        >
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: colors.darkBlue,
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#fa755a',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Set as Default Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="setAsDefault"
          checked={setAsDefault}
          onChange={(e) => setSetAsDefault(e.target.checked)}
          className="w-4 h-4 rounded"
          style={{ accentColor: colors.aqua }}
        />
        <label htmlFor="setAsDefault" className="ml-2 text-sm" style={{ color: colors.darkBlue }}>
          Set as default payment method
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Security Notice */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
        <Lock className="w-4 h-4 mt-0.5" style={{ color: colors.darkBlue }} />
        <p className="text-xs" style={{ color: colors.darkBlue }}>
          Your card details are encrypted and securely stored by Stripe. Wild Things never sees or stores your full card number.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="flex-1 px-4 py-2 border-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          style={{
            borderColor: colors.darkBlue,
            color: colors.darkBlue,
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: colors.aqua }}
        >
          {loading ? 'Adding...' : 'Add Card'}
        </button>
      </div>
    </form>
  );
};

/**
 * Add Payment Method Modal
 */
export const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const elementsOptions: StripeElementsOptions = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: colors.aqua,
        colorBackground: '#ffffff',
        colorText: colors.darkBlue,
        colorDanger: '#fa755a',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: colors.aqua }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${colors.aqua}20` }}
            >
              <CreditCard className="w-5 h-5" style={{ color: colors.aqua }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: colors.darkBlue }}>
              Add Payment Method
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" style={{ color: colors.darkBlue }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <Elements stripe={stripePromise} options={elementsOptions}>
            <CardForm onSuccess={onSuccess} onClose={onClose} />
          </Elements>
        </div>
      </div>
    </div>
  );
};

