"use client";

import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { DataSourceBadge } from "@/components/shared/data-source-badge";
import { OBJECTIONS } from "@/lib/mock-data/connected";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Calendar, Users, Video, AlertTriangle } from "lucide-react";

const BLUE = "#0358F1";

const MOCK_MEETINGS = [
  { id: 1, type: 'Demo', company: 'Biocenter Antwerp', owner: 'Dorian', date: '2025-12-02', status: 'completed', outcome: 'Positive', nextStep: 'Send proposal' },
  { id: 2, type: 'Discovery', company: 'Organic Hub Madrid', owner: 'Joaquin', date: '2025-12-03', status: 'completed', outcome: 'Interested', nextStep: 'Demo booked' },
  { id: 3, type: 'Follow-up', company: 'Green Garden Den Haag', owner: 'Giuseppe', date: '2025-12-04', status: 'completed', outcome: 'In negotiation', nextStep: 'Final pricing call' },
  { id: 4, type: 'Demo', company: 'The Herbivore Brussels', owner: 'Dorian', date: '2025-12-05', status: 'completed', outcome: 'Needs time', nextStep: 'Follow up Dec 12' },
  { id: 5, type: 'Investor', company: 'Potential Investor NL', owner: 'Giuseppe', date: '2025-12-05', status: 'completed', outcome: 'Interested', nextStep: 'Send deck' },
  { id: 6, type: 'Demo', company: 'CitySales Demo NL', owner: 'Giuseppe', date: '2025-12-06', status: 'scheduled', outcome: '', nextStep: '' },
  { id: 7, type: 'Discovery', company: 'Kale & Roots Eindhoven', owner: 'Niels', date: '2025-12-07', status: 'scheduled', outcome: '', nextStep: '' },
];

const TYPE_COLORS: Record<string, string> = {
  Demo:      BLUE,
  Discovery: '#16a34a',
  'Follow-up': '#f59e0b',
  Investor:  '#7c3aed',
};

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

const OBJECTION_RESPONSES: Record<string, string> = {
  'We already use stamp cards': 'Show digital advantage: loss protection, analytics, customer data ownership',
  'Too expensive': 'Compare ROI: 1 retained customer > monthly cost. Offer trial.',
  'We need POS integration': 'QR-based, no POS needed. Show live demo.',
  'We need to think about it': 'Set a follow-up call within 5 days. Send case study.',
  'Not now': 'Ask "what would need to change?" — qualify timeline.',
  'We already use another loyalty system': 'Ask about switch costs and pain points. Offer comparison.',
};

export default function MeetingsPage() {
  const completed = MOCK_MEETINGS.filter(m => m.status === 'completed').length;
  const demos = MOCK_MEETINGS.filter(m => m.type === 'Demo').length;
  const followups = MOCK_MEETINGS.filter(m => m.type === 'Follow-up').length;

  const objectionChartData = OBJECTIONS.map(o => ({
    name: o.text.length > 30 ? o.text.slice(0, 30) + '…' : o.text,
    fullText: o.text,
    count: o.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Meetings & Objections</h1>
          <p className="text-sm text-gray-500 mt-0.5">Week of Dec 2–7, 2025</p>
        </div>
        <DataSourceBadge status="mock" />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Meetings This Week" value={MOCK_MEETINGS.length} subvalue="total scheduled/completed" icon={<Calendar className="h-5 w-5" />} />
        <KpiCard title="Demos" value={demos} subvalue="product demos" icon={<Video className="h-5 w-5" />} />
        <KpiCard title="Follow-ups" value={followups} subvalue="existing pipeline" icon={<Users className="h-5 w-5" />} />
        <KpiCard title="No-show Rate" value="8%" subvalue="mock estimate" icon={<AlertTriangle className="h-5 w-5" />} />
      </div>

      {/* Meetings Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">This Week&apos;s Meetings</h2>
          <DataSourceBadge status="mock" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3 text-left font-medium">Type</th>
                <th className="px-6 py-3 text-left font-medium">Company</th>
                <th className="px-6 py-3 text-left font-medium">Owner</th>
                <th className="px-6 py-3 text-left font-medium">Date</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Outcome</th>
                <th className="px-6 py-3 text-left font-medium">Next Step</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_MEETINGS.map((m) => (
                <tr key={m.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-3">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                      style={{ background: TYPE_COLORS[m.type] ?? '#94a3b8' }}
                    >
                      {m.type}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-900">{m.company}</td>
                  <td className="px-6 py-3 text-gray-500">{m.owner}</td>
                  <td className="px-6 py-3 text-gray-500">{m.date}</td>
                  <td className="px-6 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[m.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-700">{m.outcome || '—'}</td>
                  <td className="px-6 py-3 text-gray-500 text-xs">{m.nextStep || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Objections Section */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">Most Common Objections</h2>
          <DataSourceBadge status="mock" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="Objection Frequency" description="How often each objection is encountered">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={objectionChartData} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={160} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                  formatter={(v: unknown) => [`${v} times`, "Frequency"]}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {objectionChartData.map((_, i) => (
                    <Cell key={i} fill={`rgba(3,88,241,${1 - i * 0.12})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Objection Responses</p>
            </div>
            <div className="divide-y divide-gray-50">
              {OBJECTIONS.map((obj, i) => (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">{obj.text}</p>
                    <span className="flex-shrink-0 text-xs font-bold text-gray-400">{obj.count}x</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{OBJECTION_RESPONSES[obj.text] ?? 'Response TBD'}</p>
                  <div className="flex gap-2 flex-wrap">
                    {obj.partners.map(p => (
                      <span key={p} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Call Insights */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-semibold text-gray-900">Call Insights</h2>
          <DataSourceBadge status="mock" />
          <span className="text-xs text-gray-400">(Fathom not yet connected)</span>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Buying Signals</p>
            <ul className="space-y-1.5">
              {['Interested in multi-location', 'Asked about pricing tiers', 'Wants to start in January'].map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Competitor Mentions</p>
            <ul className="space-y-1.5">
              {['Stamp&Go x2', 'Piggy x1', 'Stamp cards x8'].map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Feature Requests</p>
            <ul className="space-y-1.5">
              {['POS integration', 'WhatsApp notifications', 'Multi-language support'].map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
