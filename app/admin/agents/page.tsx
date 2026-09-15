'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check admin session
    const session = localStorage.getItem('sk_active_session');
    if (!session || JSON.parse(session).role !== 'admin') {
      router.push('/auth');
      return;
    }

    // Fetch agents (mocked for now)
    setAgents([]);
  }, [router]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Agent Management</h1>
          <p className="text-sm text-muted mt-1">Manage partner agents, view outstanding payments, and configure markup rules.</p>
        </div>
        <button className="bg-primary text-primary-contrast px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity">
          Add Agent
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/10 border-b border-border">
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Agent Code</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Business Name</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Contact</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {agents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted">
                    No agents registered yet.
                  </td>
                </tr>
              ) : (
                agents.map((agent: any) => (
                  <tr key={agent.id} className="hover:bg-muted/5 transition-colors">
                    <td className="p-4 text-sm font-medium">{agent.agentCode}</td>
                    <td className="p-4 text-sm">{agent.businessName}</td>
                    <td className="p-4 text-sm">{agent.contactName} <br /><span className="text-muted text-xs">{agent.email}</span></td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                        Active
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <button className="text-primary hover:underline">Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
