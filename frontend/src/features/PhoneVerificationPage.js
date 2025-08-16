import React, { useState } from 'react';

const PhoneVerificationPage = ({ onSubmit, onBack, onSendAgain }) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim()) {
      onSubmit && onSubmit(code);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <button 
          onClick={onBack}
          className="mb-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Phone verification</h1>
          <p className="text-gray-600">Please enter your code that send to your phone</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Enter Your code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength="6"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Submit
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-6">
          Code not receive?{' '}
          <button
            onClick={onSendAgain}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Send again
          </button>
        </p>
      </div>
    </div>
  );
};

export default PhoneVerificationPage;
