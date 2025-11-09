import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plan, Transaction, TransactionStatus } from '../types';
import { UPI_ID, UPI_QR_IMAGE_URL } from '../constants';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '../components/Icons';

const StatusBadge: React.FC<{ status: TransactionStatus }> = ({ status }) => {
  const baseClasses = "px-3 py-1 text-xs font-medium rounded-full inline-flex items-center";
  if (status === 'approved') {
    return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300`}><CheckCircleIcon className="w-4 h-4 mr-1.5"/> Approved</span>;
  }
  if (status === 'rejected') {
    return <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300`}><XCircleIcon className="w-4 h-4 mr-1.5"/> Rejected</span>;
  }
  return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300`}><ClockIcon className="w-4 h-4 mr-1.5"/> Pending</span>;
};

const PurchaseModal: React.FC<{ plan: Plan; onClose: () => void; onSubmit: (utr: string) => void }> = ({ plan, onClose, onSubmit }) => {
  const [utr, setUtr] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (utr.trim()) {
      onSubmit(utr.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
      <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-card p-6 md:p-8 max-w-4xl w-full relative border border-light-border dark:border-dark-border">
        <button onClick={onClose} className="absolute top-4 right-4 text-light-subtle hover:text-light-text dark:hover:text-dark-text text-3xl font-light">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-center">Purchase {plan.name}</h2>
        <div className="md:grid md:grid-cols-2 md:gap-8">
          {/* Left Side: Payment Info */}
          <div className="text-center flex flex-col items-center p-4 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
            <h3 className="font-semibold text-lg mb-2">Step 1: Complete Payment</h3>
            <p className="text-sm text-light-subtle dark:text-dark-subtle mb-4">Pay ₹{plan.priceINR} by scanning the QR code below.</p>
            <img src={UPI_QR_IMAGE_URL} alt="UPI QR Code" className="w-48 h-48 rounded-lg border dark:border-slate-700 shadow-md" />
            <p className="mt-4 text-sm text-light-subtle dark:text-dark-subtle">Or use UPI ID:</p>
            <p className="font-mono bg-slate-200 dark:bg-slate-800 py-2 px-3 rounded-md inline-block mt-1 text-sm">{UPI_ID}</p>
          </div>

          {/* Right Side: Instructions & UTR Form */}
          <div className="mt-6 md:mt-0">
            <h3 className="font-semibold text-lg mb-2">Step 2: Submit Transaction ID</h3>
             <div className="text-sm text-light-subtle dark:text-dark-subtle space-y-2 mb-4 p-4 bg-blue-500/10 rounded-lg border border-primary-500/20">
                <p className="font-bold text-base text-primary-500 dark:text-blue-300">Where to find the Transaction ID (UTR)?</p>
                <p>After paying, you MUST copy the transaction ID from your UPI app to verify your payment.</p>
                <ol className="list-decimal list-inside space-y-1 pl-2">
                    <li>Open your UPI app (Google Pay, PhonePe, etc.) and go to the <strong>'History'</strong> or <strong>'Transactions'</strong> section.</li>
                    <li>Select the payment you just made to us.</li>
                    <li>Look for a 12-digit number called <strong>UTR</strong>, <strong>Transaction ID</strong>, or <strong>Reference No.</strong></li>
                    <li><strong>Tap to copy</strong> this ID, then paste it in the box below.</li>
                </ol>
            </div>
            <form onSubmit={handleSubmit}>
              <label htmlFor="utr-input" className="font-medium mb-2 block">Enter UTR / Transaction ID</label>
              <input
                id="utr-input"
                type="text"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="Paste your 12-digit UTR here"
                required
                className="w-full p-3 border border-light-border dark:border-dark-border bg-transparent rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 transition-all transform hover:-translate-y-0.5 duration-300 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                disabled={!utr.trim()}
              >
                Submit for Verification
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};


const CreditsPage: React.FC = () => {
  const { user, plans, transactions, addTransaction } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const userTransactions = useMemo(() => {
    return transactions
      .filter(t => t.userId === user?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions, user]);

  const handleBuy = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handleSubmitUtr = async (utr: string) => {
    if (selectedPlan) {
      await addTransaction(selectedPlan, utr);
      setSelectedPlan(null);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in-up">
      {selectedPlan && <PurchaseModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} onSubmit={handleSubmitUtr} />}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2">Buy Credits</h1>
        <p className="text-lg text-light-subtle dark:text-dark-subtle">Choose a pack that suits your creative needs.</p>
      </div>
      
      {showSuccessMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 mb-8 rounded-md shadow-subtle dark:bg-green-500/20 dark:text-green-200 dark:border-green-400" role="alert">
          <p className="font-bold">Success!</p>
          <p>Your transaction has been submitted. It will be verified by an admin shortly.</p>
        </div>
      )}

      {/* How it works section */}
      <div className="max-w-4xl mx-auto bg-light-card dark:bg-dark-card p-8 rounded-2xl shadow-card mb-16 border border-light-border dark:border-dark-border">
          <h2 className="text-2xl font-bold mb-4 text-center">How It Works: A Simple Guide to Getting Credits</h2>
          <ol className="list-decimal list-inside space-y-4 text-light-subtle dark:text-dark-subtle">
              <li>
                  <strong>Pick Your Perfect Plan:</strong> Browse the credit packs below and click "Buy Now" on the one that fits your needs.
              </li>
              <li>
                  <strong>Pay with Ease via UPI:</strong> A payment popup will appear. Simply scan the QR code using your favorite UPI app (like Google Pay, PhonePe, Paytm) or use the UPI ID to complete the payment.
              </li>
              <li>
                  <strong>Find Your Transaction ID:</strong> After your payment is successful, open your UPI app and go to your transaction history. Find the payment you just made and look for a 12-digit number called the <strong>UTR</strong>, <strong>Transaction ID</strong>, or <strong>Reference ID</strong>. Copy this number.
              </li>
              <li>
                  <strong>Verify and Get Your Credits:</strong> Paste the copied ID into the submission box in our payment popup and click 'Submit'. Our team will verify it, and the credits will be added to your account, ready for you to create!
              </li>
          </ol>
      </div>

      {/* Plans Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {plans.filter(p => p.isActive).map(plan => (
          <div key={plan.id} className="bg-light-card dark:bg-dark-card p-8 rounded-2xl shadow-card text-center flex flex-col border border-light-border dark:border-dark-border transform hover:-translate-y-2 transition-transform duration-300">
            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            <p className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-500">{plan.credits}</p>
            <p className="text-light-subtle dark:text-dark-subtle mb-6 uppercase tracking-wider text-sm font-semibold">Credits</p>
            <p className="text-light-subtle dark:text-dark-subtle mb-8 flex-grow">{plan.description}</p>
            <button
              onClick={() => handleBuy(plan)}
              className="w-full mt-auto bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 duration-300"
            >
              Buy Now for ₹{plan.priceINR}
            </button>
          </div>
        ))}
      </div>

      {/* Transaction History Section */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Your Payment History</h2>
        <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-card overflow-hidden border border-light-border dark:border-dark-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="p-4 font-semibold text-sm">Date</th>
                  <th className="p-4 font-semibold text-sm">Plan</th>
                  <th className="p-4 font-semibold text-sm">Amount</th>
                  <th className="p-4 font-semibold text-sm">UTR</th>
                  <th className="p-4 font-semibold text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {userTransactions.length > 0 ? userTransactions.map(t => (
                  <tr key={t.id} className="border-t border-light-border dark:border-dark-border">
                    <td className="p-4 text-sm">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-sm">{plans.find(p => p.id === t.planId)?.name || 'N/A'}</td>
                    <td className="p-4 text-sm">₹{t.amountINR}</td>
                    <td className="p-4 font-mono text-xs">{t.utr}</td>
                    <td className="p-4"><StatusBadge status={t.status} /></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-light-subtle dark:text-dark-subtle">No transactions yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditsPage;