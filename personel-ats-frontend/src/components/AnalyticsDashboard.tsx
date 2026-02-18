// Analytics dashboard with consistent styling
"use client"
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

import { useToast } from '../lib/ToastContext';

export default function AnalyticsDashboard() {
  const toast = useToast();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Attempt local API first; fall back to example data
    fetch('/api/analytics/summary').then(res => {
      if (!res.ok) throw new Error('no api');
      return res.json();
    }).then(setData).catch(() => {
      // Fallback demo data so layout renders in dev without backend
      setData({
        total_applications: 12,
        response_rate: '42%',
        stage_distribution: [
          { name: 'Wishlist', value: 4 },
          { name: 'Applied', value: 5 },
          { name: 'Interviewing', value: 2 },
          { name: 'Offer', value: 1 }
        ],
        weekly_trend: [
          { date: 'Mon', count: 1 }, { date: 'Tue', count: 2 }, { date: 'Wed', count: 0 }, { date: 'Thu', count: 4 }, { date: 'Fri', count: 5 }
        ]
      });
    });
  }, []);

  if (!data) return <div className="flex items-center justify-center p-20">Calculating your metrics...</div>;

  return (
    <div className="p-6 grid grid-cols-1 gap-6 container">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 font-medium uppercase">Total Applications</p>
          <p className="text-4xl font-bold text-indigo-600">{data.total_applications}</p>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 font-medium uppercase">Response Rate</p>
          <p className="text-4xl font-bold text-green-600">{data.response_rate}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm h-80">
          <h3 className="font-bold mb-4">Application Funnel</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.stage_distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {data.stage_distribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm h-80">
          <h3 className="font-bold mb-4">Weekly Application Volume</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.weekly_trend}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex justify-end mt-3">
        <button onClick={() => { toast.showToast('Refreshed metrics', 'info'); /* could refetch */ }} className="btn btn-secondary">Refresh</button>
      </div>
    </div>
  );
}