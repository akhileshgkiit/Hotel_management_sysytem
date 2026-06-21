import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { api } from '../context/AuthContext';
import { Wallet, CheckCircle2, AlertTriangle, ArrowLeft, ShieldAlert, Lock, Check } from 'lucide-react';

const Checkout = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Booking states
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Payment UI states
  const [paymentMethod, setPaymentMethod] = useState(''); // 'eSewa' or 'Khalti'
  const [paymentMode, setPaymentMode] = useState(''); // 'simulated' or 'sandbox'
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionCode, setTransactionCode] = useState('');

  // Simulated portal states
  const [simStep, setSimStep] = useState(1); // 1: login, 2: OTP
  const [mobileNumber, setMobileNumber] = useState('');
  const [pin, setPin] = useState('');
  const [otp, setOtp] = useState('');
  const [portalError, setPortalError] = useState('');

  // Check if we are handling a callback redirect
  const isCallback = window.location.pathname.includes('/checkout/success-');

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/bookings/${bookingId}`);
      if (data.success) {
        setBooking(data.booking);
        if (data.booking.paymentStatus === 'Paid') {
          setSuccess(true);
          setTransactionCode(data.booking.transactionId);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to retrieve booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If not a callback, fetch booking details normally
    if (bookingId && !isCallback) {
      fetchBooking();
    }
  }, [bookingId]);

  // Handle UAT Redirect Success Callback
  useEffect(() => {
    const handleRedirectCallbacks = async () => {
      // 1. eSewa callback
      if (window.location.pathname === '/checkout/success-esewa') {
        const base64Data = searchParams.get('data');
        if (!base64Data) {
          setError('Invalid eSewa callback payload');
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          // Decode enough to get transaction UUID which contains booking ID
          const decoded = JSON.parse(atob(base64Data));
          const actualBookingId = decoded.transaction_uuid.split('-')[0];
          
          const { data } = await api.post(`/bookings/${actualBookingId}/verify-esewa`, {
            data: base64Data,
          });

          if (data.success) {
            setBooking(data.booking);
            setSuccess(true);
            setTransactionCode(data.booking.transactionId);
          }
        } catch (err) {
          console.error('eSewa verification failed:', err);
          setError(err.response?.data?.message || 'eSewa payment verification failed');
        } finally {
          setLoading(false);
        }
      }

      // 2. Khalti callback
      if (window.location.pathname === '/checkout/success-khalti') {
        const pidx = searchParams.get('pidx');
        const purchaseOrderId = searchParams.get('purchase_order_id');
        
        if (!pidx || !purchaseOrderId) {
          setError('Invalid Khalti callback parameters');
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          const { data } = await api.post(`/bookings/${purchaseOrderId}/verify-khalti`, {
            pidx,
          });

          if (data.success) {
            setBooking(data.booking);
            setSuccess(true);
            setTransactionCode(data.booking.transactionId);
          }
        } catch (err) {
          console.error('Khalti verification failed:', err);
          setError(err.response?.data?.message || 'Khalti payment verification failed');
        } finally {
          setLoading(false);
        }
      }
    };

    if (isCallback) {
      handleRedirectCallbacks();
    }
  }, [searchParams]);

  // Handle Mock Payment Submission
  const handleMockPaySubmit = async (e) => {
    e.preventDefault();
    if (simStep === 1) {
      if (!mobileNumber || mobileNumber.length < 10) {
        setPortalError('Please enter a valid 10-digit mobile number');
        return;
      }
      if (!pin || pin.length < 4) {
        setPortalError('Please enter a valid PIN');
        return;
      }
      setPortalError('');
      setSimStep(2); // Go to OTP screen
      return;
    }

    if (simStep === 2) {
      if (!otp) {
        setPortalError('Please enter OTP');
        return;
      }

      setProcessing(true);
      setPortalError('');

      try {
        const { data } = await api.post(`/bookings/${bookingId}/pay-mock`, {
          paymentMethod,
        });

        if (data.success) {
          setBooking(data.booking);
          setSuccess(true);
          setTransactionCode(data.booking.transactionId);
        }
      } catch (err) {
        console.error(err);
        setPortalError(err.response?.data?.message || 'Simulated payment processing failed');
      } finally {
        setProcessing(false);
      }
    }
  };

  // Handle Sandbox/UAT Gateways
  const handleSandboxInitiate = async () => {
    setProcessing(true);
    setError(null);

    try {
      if (paymentMethod === 'eSewa') {
        const { data } = await api.post(`/bookings/${bookingId}/initiate-esewa`);
        if (data.success) {
          // eSewa requires submitting a form POST to their gateway
          const form = document.createElement('form');
          form.setAttribute('method', 'POST');
          form.setAttribute('action', data.gatewayUrl);

          Object.keys(data.paymentData).forEach((key) => {
            const input = document.createElement('input');
            input.setAttribute('type', 'hidden');
            input.setAttribute('name', key);
            input.setAttribute('value', data.paymentData[key]);
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
        }
      } else if (paymentMethod === 'Khalti') {
        const { data } = await api.post(`/bookings/${bookingId}/initiate-khalti`);
        if (data.success && data.payment_url) {
          // khalti returns a direct payment URL to redirect
          window.location.href = data.payment_url;
        } else {
          throw new Error('Khalti checkout URL not generated');
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to initiate payment gateway session');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col justify-center items-center py-32 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <span className="text-slate-500 font-medium">Loading checkout details...</span>
        </div>
      </MainLayout>
    );
  }

  if (error && !booking) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl text-center space-y-4 shadow-md">
          <ShieldAlert className="h-12 w-12 mx-auto text-red-500" />
          <h3 className="text-xl font-bold">Checkout Error</h3>
          <p className="text-slate-500 text-sm">{error}</p>
          <button
            onClick={() => navigate('/user-dashboard')}
            className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-750"
          >
            Go to Dashboard
          </button>
        </div>
      </MainLayout>
    );
  }

  const nights = booking ? Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to details
        </button>

        <h1 className="text-3xl font-extrabold tracking-tight mb-8">Secure Booking Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Payment Section */}
          <div className="lg:col-span-2 space-y-6">
            {!paymentMethod ? (
              // 1. Choose Gateway
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-xl font-bold">Select Payment Gateway</h3>
                  <p className="text-slate-500 text-sm">Choose Nepalese payment system to complete transaction</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* eSewa */}
                  <button
                    onClick={() => {
                      setPaymentMethod('eSewa');
                      setPaymentMode('simulated');
                      setSimStep(1);
                      setPortalError('');
                    }}
                    className="flex flex-col items-center justify-between border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 text-center transition-all bg-slate-50/50 dark:bg-slate-905 hover:bg-emerald-50/10 hover:scale-[1.01]"
                  >
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-2xl font-black tracking-tight text-emerald-600">
                        eSewa <span className="text-xs align-super bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md ml-1">EPAY</span>
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Pay via eSewa Portal</h4>
                      <p className="text-xs text-slate-500">Nepal's first digital wallet</p>
                    </div>
                  </button>

                  {/* Khalti */}
                  <button
                    onClick={() => {
                      setPaymentMethod('Khalti');
                      setPaymentMode('simulated');
                      setSimStep(1);
                      setPortalError('');
                    }}
                    className="flex flex-col items-center justify-between border-2 border-slate-200 dark:border-slate-700 hover:border-violet-600 dark:hover:border-violet-650 rounded-2xl p-6 text-center transition-all bg-slate-50/50 dark:bg-slate-905 hover:bg-violet-50/10 hover:scale-[1.01]"
                  >
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-2xl font-black tracking-tight text-violet-600 dark:text-violet-400">
                        khalti <span className="text-xs align-super bg-violet-100 text-violet-800 font-bold px-1.5 py-0.5 rounded-md ml-1">WALLET</span>
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Pay via Khalti SDK</h4>
                      <p className="text-xs text-slate-500">Fast & Secure digital payments</p>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              // 2. Choose Mode & Pay
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 md:p-8 space-y-6 shadow-md">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-500 font-medium">Gateway:</span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      paymentMethod === 'eSewa' ? 'bg-emerald-100 text-emerald-800' : 'bg-violet-100 text-violet-800'
                    }`}>
                      {paymentMethod}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setPaymentMethod('');
                      setPaymentMode('');
                    }}
                    className="text-xs text-primary-650 font-bold hover:underline"
                  >
                    Change Gateway
                  </button>
                </div>

                {/* Mode tabs */}
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMode('simulated');
                      setSimStep(1);
                      setPortalError('');
                    }}
                    className={`flex-1 text-center py-2.5 rounded-lg text-sm font-bold transition-all ${
                      paymentMode === 'simulated'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    High-Fidelity Simulation (Offline/Fast)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('sandbox')}
                    className={`flex-1 text-center py-2.5 rounded-lg text-sm font-bold transition-all ${
                      paymentMode === 'sandbox'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Real Sandbox UAT Redirect
                  </button>
                </div>

                {paymentMode === 'sandbox' ? (
                  // Sandbox Mode trigger
                  <div className="space-y-4 text-center py-6">
                    <AlertTriangle className="h-10 w-10 mx-auto text-amber-500" />
                    <div className="max-w-md mx-auto space-y-2">
                      <h4 className="font-bold text-lg">Official Gateway Redirect</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        You will be redirected to the secure UAT Sandbox environment of {paymentMethod} to enter test payment credentials. After successful authorization, you will be redirected back here to confirm booking.
                      </p>
                    </div>

                    <button
                      onClick={handleSandboxInitiate}
                      disabled={processing}
                      className={`mt-4 w-full max-w-sm mx-auto flex items-center justify-center space-x-2 text-white p-3.5 rounded-xl font-bold shadow-md transition-colors ${
                        paymentMethod === 'eSewa' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-violet-600 hover:bg-violet-700'
                      }`}
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                          <span>Contacting payment gateway...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          <span>Initiate {paymentMethod} Sandbox</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  // Simulated Mode Interface
                  <div className="max-w-md mx-auto border border-slate-200 dark:border-slate-705 rounded-3xl overflow-hidden shadow-md">
                    {/* Simulated Portal Brand Header */}
                    <div className={`p-4 text-white flex items-center justify-between ${
                      paymentMethod === 'eSewa' ? 'bg-emerald-600' : 'bg-violet-750'
                    }`}>
                      <span className="font-extrabold tracking-tight">
                        {paymentMethod === 'eSewa' ? 'eSewa Secure Checkout' : 'Khalti Payment Gateway'}
                      </span>
                      <span className="text-[10px] font-mono border border-white/50 px-2 py-0.5 rounded uppercase font-bold tracking-wider opacity-90">
                        SIMULATED
                      </span>
                    </div>

                    {/* Simulated Portal Content */}
                    <div className="p-6 bg-white dark:bg-slate-900/20">
                      <form onSubmit={handleMockPaySubmit} className="space-y-5">
                        {portalError && (
                          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-start space-x-2">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>{portalError}</span>
                          </div>
                        )}

                        {simStep === 1 ? (
                          <>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">
                                  {paymentMethod === 'eSewa' ? 'eSewa ID (Mobile)' : 'Khalti Mobile Number'}
                                </label>
                                <input
                                  type="tel"
                                  required
                                  maxLength="10"
                                  placeholder="98XXXXXXXX"
                                  value={mobileNumber}
                                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium"
                                />
                              </div>

                              <div>
                                <label className="block text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">
                                  {paymentMethod === 'eSewa' ? 'Password / MPIN' : 'Transaction PIN'}
                                </label>
                                <input
                                  type="password"
                                  required
                                  maxLength="6"
                                  placeholder="••••"
                                  value={pin}
                                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent tracking-widest text-lg font-bold"
                                />
                              </div>
                            </div>

                            <div className="text-[11px] text-slate-400 leading-relaxed text-center">
                              For simulation, you can enter any valid 10-digit mobile number and PIN code.
                            </div>

                            <button
                              type="submit"
                              className={`w-full text-white p-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-sm ${
                                paymentMethod === 'eSewa' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-violet-750 hover:bg-violet-800'
                              }`}
                            >
                              <span>Proceed to Pay Rs. {booking?.totalAmount}</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="space-y-4">
                              <div className="text-center">
                                <span className="text-xs text-slate-500 font-medium">OTP has been sent to your phone</span>
                                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1">{mobileNumber}</div>
                              </div>

                              <div>
                                <label className="block text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider text-center">
                                  ENTER ONE-TIME PASSWORD (OTP)
                                </label>
                                <input
                                  type="text"
                                  required
                                  maxLength="6"
                                  placeholder="123456"
                                  value={otp}
                                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                  className="w-full text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xl font-extrabold tracking-widest"
                                />
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400">Didn't receive code?</span>
                              <button
                                type="button"
                                onClick={() => setOtp('123456')}
                                className="text-primary-600 hover:underline font-bold"
                              >
                                Auto-fill Code
                              </button>
                            </div>

                            <button
                              type="submit"
                              disabled={processing}
                              className={`w-full text-white p-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-sm ${
                                paymentMethod === 'eSewa' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-violet-750 hover:bg-violet-800'
                              }`}
                            >
                              {processing ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                  <span>Verifying Payment...</span>
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4" />
                                  <span>Verify OTP & Complete Stay Booking</span>
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Summary Column */}
          {booking && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="text-lg font-bold">Booking Details Summary</h3>

                {/* Hotel header */}
                <div className="flex space-x-4">
                  <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0">
                    <img
                      src={booking.hotelId?.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80'}
                      alt={booking.hotelId?.hotelName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {booking.hotelId?.hotelName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {booking.hotelId?.city}, {booking.hotelId?.state}
                    </p>
                  </div>
                </div>

                {/* Stay specifics */}
                <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Room Category</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{booking.roomId?.roomType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Check-in</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(booking.checkInDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Check-out</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(booking.checkOutDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Duration</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{nights} night(s)</span>
                  </div>
                </div>

                {/* Total Cost card */}
                <div className="border-t border-slate-100 dark:border-slate-700 pt-4 flex justify-between items-center">
                  <span className="text-slate-800 dark:text-slate-200 font-bold">Total Amount Due</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary-600">Rs. {booking.totalAmount}</span>
                    <p className="text-[10px] text-slate-400">All local taxes included</p>
                  </div>
                </div>
              </div>

              {/* Security Shield Card */}
              <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl flex items-start space-x-3 text-slate-500">
                <Lock className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary-500" />
                <div className="space-y-1">
                  <h5 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Secured Payment Process
                  </h5>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    This reservation and payment process is secured. Under simulation, no actual transaction charges or real banking balances are deducted.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;
