import { useState } from 'react';
import { updatePassword } from '../utils/userAccounts';

interface PasswordChangeModalProps {
  username: string;
  currentPassword: string;
  onClose: () => void;
  onSuccess: () => void;
}

const PasswordChangeModal = ({ username, currentPassword, onClose, onSuccess }: PasswordChangeModalProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (newPassword === currentPassword) {
      setError('New password cannot be the same as current password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use the updatePassword function from userAccounts.ts
      const result = await updatePassword(username, currentPassword, newPassword);
      
      if (result.success) {
        // Password updated successfully
        onSuccess();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '5px',
        width: '90%',
        maxWidth: '450px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>Change Default Password</h2>
        <p style={{ color: 'gray', marginBottom: '20px' }}>
          For security reasons, please change your default password.
        </p>
        
        {error && (
          <div style={{ 
            color: '#000000', 
            backgroundColor: '#ffeeee', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="newPassword" style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold', 
              color: '#000000' 
            }}>
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                color: '#000000'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="confirmPassword" style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold', 
              color: '#000000' 
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                color: '#000000'
              }}
              required
            />
          </div>
          
          {isLoading && (
            <div style={{ marginBottom: '15px' }}>
              <div style={{
                width: '100%',
                height: '4px',
                backgroundColor: '#f0f0f0',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: '30%',
                  height: '100%',
                  backgroundColor: '#db0011',
                  borderRadius: '2px',
                  animation: 'loading 1s infinite linear'
                }}></div>
              </div>
              <style jsx>{`
                @keyframes loading {
                  0% {
                    transform: translateX(-100%);
                  }
                  100% {
                    transform: translateX(400%);
                  }
                }
              `}</style>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 15px',
                backgroundColor: '#f0f0f0',
                color: '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Remind Me Later
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '10px 15px',
                backgroundColor: isLoading ? '#666666' : '#000000',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChangeModal;