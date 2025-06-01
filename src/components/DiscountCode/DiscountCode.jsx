import React, { useState } from 'react';
import { validateCoupon } from '../../services/couponService';
import styles from './DiscountCode.module.css';

const DiscountCode = ({ onApplyDiscount, cartTotal, onMessage }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Digite um código de desconto.');
      if (onMessage) {
        onMessage('Digite um código de desconto.', 'error');
      }
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await validateCoupon(code.trim(), cartTotal || 0);
      
      if (result.isValid) {
        setAppliedCoupon(result.coupon);
        setError('');
        
        if (onApplyDiscount) {
          onApplyDiscount({
            code: result.coupon.code,
            discount: result.coupon.discountValue,
            freeShipping: result.coupon.freeShipping,
            couponData: result.coupon
          });
        }
        
        if (onMessage) {
          onMessage(`Cupom "${result.coupon.code}" aplicado com sucesso!`, 'success');
        }
        
      } else {
        setError(result.error);
        setAppliedCoupon(null);
        if (onMessage) {
          onMessage(result.error, 'error');
        }
      }
    } catch (err) {
      console.error('Error applying discount:', err);
      const errorMsg = 'Erro ao aplicar cupom. Tente novamente.';
      setError(errorMsg);
      setAppliedCoupon(null);
      if (onMessage) {
        onMessage(errorMsg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCode('');
    setAppliedCoupon(null);
    setError('');
    
    if (onApplyDiscount) {
      onApplyDiscount({
        code: null,
        discount: 0,
        freeShipping: false,
        couponData: null
      });
    }

    if (onMessage) {
      onMessage('Cupom removido', 'info');
    }
  };

  return (
    <div className={styles.discountContainer}>
      <div className={styles.discountHeader}>
        <h3 className={styles.discountTitle}>Cupom de desconto</h3>
      </div>
      
      {!appliedCoupon ? (
        <form onSubmit={handleSubmit} className={styles.discountForm}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Insira seu código"
            className={styles.discountInput}
            aria-label="Código de desconto"
            disabled={loading}
          />
          <button 
            type="submit" 
            className={styles.discountButton}
            disabled={loading || !code.trim()}
          >
            {loading ? '...' : 'OK'}
          </button>
        </form>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">
                Cupom "{appliedCoupon.code}" aplicado
              </p>
              <p className="text-xs text-green-600">
                Desconto: R$ {appliedCoupon.discountValue.toFixed(2).replace('.', ',')}
                {appliedCoupon.freeShipping && ' + Frete Grátis'}
              </p>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-red-600 hover:text-red-800 text-sm underline"
              disabled={loading}
            >
              Remover
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default DiscountCode;