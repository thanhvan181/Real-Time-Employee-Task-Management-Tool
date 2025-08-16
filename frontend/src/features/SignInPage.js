import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createOwnerAccessCode,
  validateOwnerAccessCode,
  loginEmail,
  validateEmployeeAccessCode,
} from "../service/api";

export default function SignInPage() {
  const [method, setMethod] = useState("phone"); 
  const [step, setStep] = useState("phone"); 


  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const [email, setEmail] = useState("");
  const [emailStep, setEmailStep] = useState("email");

  const navigate = useNavigate();

 
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!phone) {
      alert("Please enter your phone number");
      return;
    }
    try {
      await createOwnerAccessCode(phone);
      setStep("code");
    } catch (err) {
      alert(err.message || "Failed to send code");
    }
  };

 
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code) {
      alert("Please enter access code");
      return;
    }
    try {
      await validateOwnerAccessCode(code, phone);
      alert("Login successful!");
      localStorage.setItem("phone", phone);
      localStorage.removeItem("email");
      navigate('/manage');
    } catch (err) {
      alert(err.message || "Invalid code");
    }
  };


  const handleSendEmailCode = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter your email");
      return;
    }
    try {
      await loginEmail(email);
      setEmailStep("code");
    } catch (err) {
      alert(err.message || "Failed to send email code");
    }
  };

 
  const handleVerifyEmailCode = async (e) => {
    e.preventDefault();
    if (!code) {
      alert("Please enter access code");
      return;
    }
    try {
      await validateEmployeeAccessCode(code, email);
      alert("Login successful!");
      localStorage.setItem("email", email);
      localStorage.removeItem("phone");
      navigate('/messages');
    } catch (err) {
      alert(err.message || "Invalid email code");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow">
  
        <div className="flex mb-4">
          <button
            onClick={() => {
              setMethod("phone");
              setStep("phone");
            }}
            className={`flex-1 py-2 ${
              method === "phone"
                ? "border-b-2 border-blue-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            Phone Login
          </button>
          <button
            onClick={() => {
              setMethod("email");
              setEmailStep("email");
            }}
            className={`flex-1 py-2 ${
              method === "email"
                ? "border-b-2 border-blue-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            Email Login
          </button>
        </div>

    
        {method === "phone" && (
          <>
            {step === "phone" && (
              <form onSubmit={handleSendCode} className="space-y-4">
                <h2 className="text-xl font-bold text-center">
                  Sign In with Phone
                </h2>
                <input
                  type="tel"
                  placeholder="Your Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Send Code
                </button>
              </form>
            )}

            {step === "code" && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <h2 className="text-xl font-bold text-center">
                  Phone Verification
                </h2>
                <input
                  type="text"
                  placeholder="Enter Your Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Verify
                </button>
                <p className="text-sm text-center text-gray-500">
                  Didn’t receive code?{" "}
                  <button
                    type="button"
                    onClick={handleSendCode}
                    className="text-blue-600 hover:underline"
                  >
                    Send again
                  </button>
                </p>
              </form>
            )}
          </>
        )}

    
        {method === "email" && (
          <>
            {emailStep === "email" && (
              <form onSubmit={handleSendEmailCode} className="space-y-4">
                <h2 className="text-xl font-bold text-center">Sign In with Email</h2>
                <input
                  type="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Send Code
                </button>
              </form>
            )}

            {emailStep === "code" && (
              <form onSubmit={handleVerifyEmailCode} className="space-y-4">
                <h2 className="text-xl font-bold text-center">Email Verification</h2>
                <input
                  type="text"
                  placeholder="Enter Your Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Verify
                </button>
                <p className="text-sm text-center text-gray-500">
                  Didn’t receive code?{" "}
                  <button
                    type="button"
                    onClick={handleSendEmailCode}
                    className="text-blue-600 hover:underline"
                  >
                    Send again
                  </button>
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
