import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Transaction, User, Plan, TransactionStatus } from '../types';

enum AdminTab {
  PendingPayments,
  AllTransactions,
  Users,
}

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>(AdminTab.PendingPayments);
  const { users, transactions, plans, updateTransactionStatus, updateUserCredits } = useAuth();
  const [userToAdjust, setUserToAdjust] = useState<User | null>(null);
  const [creditAmount, setCreditAmount] = useState<number | ''>('');


  const handleApprove = (transactionId: string) => {
    updateTransactionStatus(transactionId, 'approved');
  };
  
  const handleReject = (transactionId: string) => {
    updateTransactionStatus(transactionId, 'rejected');
  };

  const handleCreditChange = () => {
    if (userToAdjust && creditAmount !== '') {
        const amount = Number(creditAmount);
        if (!isNaN(amount) && amount !== 0) {
            updateUserCredits(userToAdjust.id, Math.abs(amount), amount > 0 ? 'add' : 'subtract');
        }
    }
    setUserToAdjust(null);
    setCreditAmount('');
  };

  const pendingTransactions = useMemo(() => transactions.filter(t => t.status === 'pending'), [transactions]);
  const sortedTransactions = useMemo(() => [...transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [transactions]);
  const sortedUsers = useMemo(() => [...users].sort((a,b) => a.email.localeCompare(b.email)), [users]);

  const renderContent = () => {
    switch (activeTab) {
      case AdminTab.PendingPayments:
        return <TransactionsTable title="Pending Payments" transactions={pendingTransactions} showActions={true} />;
      case AdminTab.AllTransactions:
        return <TransactionsTable title="All Transactions" transactions={sortedTransactions} showActions={false} />;
      case AdminTab.Users:
        return <UsersTable />;
      default:
        return null;
    }
  };

  const TransactionsTable: React.FC<{ title: string, transactions: Transaction[], showActions: boolean }> = ({ title, transactions, showActions }) => (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold mb-4">{title} ({transactions.length})</h2>
      <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-card overflow-hidden border border-light-border dark:border-dark-border">
        <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="p-4 font-semibold text-sm">Date</th>
              <th className="p-4 font-semibold text-sm">User Email</th>
              <th className="p-4 font-semibold text-sm">Plan</th>
              <th className="p-4 font-semibold text-sm">Amount</th>
              <th className="p-4 font-semibold text-sm">UTR</th>
              <th className="p-4 font-semibold text-sm">Status</th>
              {showActions && <th className="p-4 font-semibold text-sm text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? transactions.map(t => {
                const user = users.find(u => u.id === t.userId);
                const plan = plans.find(p => p.id === t.planId);
                return (
                    <tr key={t.id} className="border-t border-light-border dark:border-dark-border">
                        <td className="p-4 text-sm whitespace-nowrap">{new Date(t.createdAt).toLocaleString()}</td>
                        <td className="p-4 text-sm">{user?.email || 'N/A'}</td>
                        <td className="p-4 text-sm">{plan?.name || 'N/A'}</td>
                        <td className="p-4 text-sm">₹{t.amountINR}</td>
                        <td className="p-4 font-mono text-xs">{t.utr}</td>
                        <td className="p-4 text-sm capitalize">{t.status}</td>
                        {showActions && (
                            <td className="p-4 space-x-2 text-right">
                                <button onClick={() => handleApprove(t.id)} className="px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 text-xs font-semibold transition-colors">Approve</button>
                                <button onClick={() => handleReject(t.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold transition-colors">Reject</button>
                            </td>
                        )}
                    </tr>
                );
            }) : <tr><td colSpan={showActions ? 7 : 6} className="text-center p-8 text-light-subtle dark:text-dark-subtle">No transactions found.</td></tr>}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );

  const UsersTable: React.FC = () => (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold mb-4">Users ({users.length})</h2>
       <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-card overflow-hidden border border-light-border dark:border-dark-border">
        <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="p-4 font-semibold text-sm">Email</th>
              <th className="p-4 font-semibold text-sm">Role</th>
              <th className="p-4 font-semibold text-sm">Credits</th>
              <th className="p-4 font-semibold text-sm">Joined At</th>
              <th className="p-4 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map(u => (
              <tr key={u.id} className="border-t border-light-border dark:border-dark-border">
                <td className="p-4 text-sm">{u.email}</td>
                <td className="p-4 text-sm capitalize">{u.role}</td>
                <td className="p-4 font-bold text-sm">{u.role === 'admin' ? '∞' : u.credits}</td>
                <td className="p-4 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <button onClick={() => setUserToAdjust(u)} className="px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-xs font-semibold transition-colors">Adjust Credits</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
  
  const getTabClass = (tab: AdminTab) => {
      return `px-4 py-2 font-semibold rounded-t-lg transition-colors border-b-2 ${activeTab === tab ? 'border-primary-500 text-primary-500' : 'border-transparent text-light-subtle dark:text-dark-subtle hover:text-light-text dark:hover:text-dark-text'}`;
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in-up">
       {userToAdjust && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-card p-8 max-w-sm w-full border border-light-border dark:border-dark-border">
                    <h3 className="text-lg font-bold mb-2">Adjust Credits</h3>
                    <p className="text-light-subtle dark:text-dark-subtle mb-4">
                       For user: <strong>{userToAdjust.email}</strong>
                    </p>
                    <p className="text-sm text-light-subtle dark:text-dark-subtle mb-1">Current Credits: {userToAdjust.role === 'admin' ? '∞' : userToAdjust.credits}</p>
                     {creditAmount !== '' && userToAdjust.role !== 'admin' &&
                         <p className="text-sm text-light-subtle dark:text-dark-subtle mb-4">New Credits: {userToAdjust.credits + Number(creditAmount)}</p>
                     }
                    <input
                        type="number"
                        value={creditAmount}
                        onChange={(e) => setCreditAmount(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        placeholder="e.g., 50 or -25"
                        className="w-full p-3 border border-light-border dark:border-dark-border bg-transparent rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex justify-end space-x-3 mt-6">
                        <button onClick={() => setUserToAdjust(null)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                        <button onClick={handleCreditChange} className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors">Confirm</button>
                    </div>
                </div>
            </div>
        )}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8">Admin Dashboard</h1>
      <div className="border-b border-light-border dark:border-dark-border mb-6">
        <div className="flex space-x-2">
            <button className={getTabClass(AdminTab.PendingPayments)} onClick={() => setActiveTab(AdminTab.PendingPayments)}>Pending ({pendingTransactions.length})</button>
            <button className={getTabClass(AdminTab.AllTransactions)} onClick={() => setActiveTab(AdminTab.AllTransactions)}>All Transactions</button>
            <button className={getTabClass(AdminTab.Users)} onClick={() => setActiveTab(AdminTab.Users)}>Users</button>
        </div>
      </div>
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPage;