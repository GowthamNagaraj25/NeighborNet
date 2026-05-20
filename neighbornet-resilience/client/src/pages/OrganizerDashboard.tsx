import React, { useEffect, useState } from 'react';
import { aiAPI, initiativesAPI } from '../services/api';
import { TrendInsight, LogisticsPlan, ActionPlan, Initiative } from '../types';
import toast from 'react-hot-toast';

const severityColors: Record<string, string> = {
  critical: 'border-red-300 bg-red-50',
  high: 'border-orange-300 bg-orange-50',
  medium: 'border-yellow-300 bg-yellow-50',
  low: 'border-green-300 bg-green-50',
};
const severityBadge: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

export default function OrganizerDashboard() {
  const [trends, setTrends] = useState<TrendInsight[]>([]);
  const [logistics, setLogistics] = useState<LogisticsPlan | null>(null);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<TrendInsight | null>(null);
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(false);
  const [logisticsLoading, setLogisticsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'trends' | 'logistics' | 'initiatives'>('trends');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [trendsRes, initiativesRes] = await Promise.all([
        aiAPI.getTrends(),
        initiativesAPI.getAll(),
      ]);
      setTrends(trendsRes.data.data);
      setInitiatives(initiativesRes.data.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async (trend: TrendInsight) => {
    setSelectedTrend(trend);
    setPlanLoading(true);
    setActionPlan(null);
    try {
      const res = await aiAPI.generatePlan({
        category: trend.category,
        neighborhood: trend.affectedArea,
        urgency: trend.severity,
      });
      setActionPlan(res.data.data);
    } catch {
      toast.error('Failed to generate action plan');
    } finally {
      setPlanLoading(false);
    }
  };

  const handleLoadLogistics = async () => {
    setLogisticsLoading(true);
    try {
      const res = await aiAPI.getLogisticsPlan();
      setLogistics(res.data.data);
    } catch {
      toast.error('Failed to load logistics plan');
    } finally {
      setLogisticsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">📊 Organizer Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">AI-powered community intelligence and action planning</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {[
          { key: 'trends', label: '📈 Trend Detection' },
          { key: 'logistics', label: '🗺️ Logistics Intelligence' },
          { key: 'initiatives', label: '🏘️ Initiatives' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${activeTab === tab.key ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">AI Detected Trends (Last 7 Days)</h2>
              <button onClick={loadData} className="text-sm text-primary-600 font-medium hover:underline">Refresh</button>
            </div>
            {loading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-32 animate-pulse" />)}</div>
            ) : trends.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl">
                <p className="text-4xl mb-3">📊</p>
                <p>No significant trends detected yet.</p>
                <p className="text-sm mt-1">Trends appear when multiple similar posts are created.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trends.map((trend, i) => (
                  <div key={i} className={`rounded-2xl border-2 p-5 ${severityColors[trend.severity]}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-sm">{trend.title}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${severityBadge[trend.severity]}`}>
                        {trend.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{trend.summary}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>📊 {trend.evidenceCount} posts</span>
                        {trend.affectedArea && <span>📍 {trend.affectedArea}</span>}
                      </div>
                      <button
                        onClick={() => handleGeneratePlan(trend)}
                        className="text-xs bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        🤖 Generate Plan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Plan */}
          <div>
            <h2 className="font-bold text-gray-900 mb-4">🤖 AI Action Plan</h2>
            {planLoading ? (
              <div className="bg-blue-50 rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="animate-spin text-2xl">🔄</div>
                  <p className="text-blue-700 font-semibold">Generating action plan...</p>
                </div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => <div key={i} className="bg-blue-100 rounded h-4" />)}
                </div>
              </div>
            ) : actionPlan ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">📋</span>
                  <h3 className="font-bold text-gray-900">{actionPlan.title}</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Objective</p>
                    <p className="text-sm text-blue-900">{actionPlan.objective}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400">Volunteers Needed</p>
                      <p className="font-bold text-gray-900">{actionPlan.requiredVolunteers}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400">Duration</p>
                      <p className="font-bold text-gray-900">{actionPlan.estimatedDuration}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">3-Step Execution Plan</p>
                    <div className="space-y-2">
                      {actionPlan.executionSteps.map((step, i) => (
                        <div key={i} className="flex gap-3">
                          <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                          <p className="text-sm text-gray-700">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-yellow-700 mb-1">📢 Suggested Message</p>
                    <p className="text-xs text-yellow-800">{actionPlan.suggestedMessage}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Required Resources</p>
                    <div className="flex flex-wrap gap-1">
                      {actionPlan.requiredResources.map((r) => (
                        <span key={r} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl">
                <p className="text-4xl mb-3">🤖</p>
                <p>Select a trend to generate an AI action plan</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logistics Tab */}
      {activeTab === 'logistics' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-gray-900">🗺️ Smart Resource Routing Plan</h2>
              <p className="text-sm text-gray-500 mt-1">AI matches urgent requests to nearest available volunteers</p>
            </div>
            <button
              onClick={handleLoadLogistics}
              disabled={logisticsLoading}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
            >
              {logisticsLoading ? '⏳ Generating...' : '🤖 Generate Plan'}
            </button>
          </div>

          {!logistics ? (
            <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-2xl">
              <p className="text-5xl mb-4">🗺️</p>
              <p className="text-lg font-medium">Click "Generate Plan" to run logistics intelligence</p>
              <p className="text-sm mt-1">Analyzes urgent requests and available volunteers to suggest optimal routing</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-3">📊 Summary</h3>
                <p className="text-gray-300 mb-4">{logistics.summary}</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold">{logistics.totalRequests}</div>
                    <div className="text-xs text-gray-400">Total Requests</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-green-400">{logistics.assignedCount}</div>
                    <div className="text-xs text-gray-400">Assigned</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-red-400">{logistics.unassignedCount}</div>
                    <div className="text-xs text-gray-400">Need Volunteers</div>
                  </div>
                </div>
              </div>

              {/* Routes */}
              {logistics.routes.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">🚀 Volunteer Assignments</h3>
                  <div className="space-y-3">
                    {logistics.routes.map((route, i) => (
                      <div key={i} className={`bg-white rounded-2xl border shadow-sm p-5 ${route.priority === 'critical' ? 'border-red-200' : route.priority === 'high' ? 'border-orange-200' : 'border-gray-100'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">{route.suggestedOrder}</span>
                            <div>
                              <p className="font-semibold text-gray-900">{route.volunteer}</p>
                              <p className="text-xs text-gray-500">{route.volunteerSkills.slice(0, 2).join(', ')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${severityBadge[route.priority] || 'bg-gray-100 text-gray-600'}`}>
                              {route.priority}
                            </span>
                            <span className="text-xs text-gray-400">📍 {route.distanceKm}km</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">→ <strong>{route.assignedTo}</strong></p>
                        <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-1.5">🧠 {route.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gaps */}
              {logistics.gaps.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                  <h3 className="font-bold text-red-800 mb-3">⚠️ Coverage Gaps</h3>
                  <ul className="space-y-1">
                    {logistics.gaps.map((gap, i) => (
                      <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                        <span>•</span><span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {logistics.recommendations.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                  <h3 className="font-bold text-green-800 mb-3">💡 Recommendations</h3>
                  <ul className="space-y-1">
                    {logistics.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                        <span>✓</span><span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Initiatives Tab */}
      {activeTab === 'initiatives' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900">🏘️ Community Initiatives</h2>
            <a href="/initiatives" className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
              + New Initiative
            </a>
          </div>
          {initiatives.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl">
              <p className="text-4xl mb-3">🏘️</p>
              <p>No initiatives yet. Create one to mobilize the community!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {initiatives.map((init) => (
                <div key={init._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{init.title}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${init.status === 'active' ? 'bg-green-100 text-green-700' : init.status === 'completed' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-700'}`}>
                      {init.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{init.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>👥 {init.requiredVolunteers} volunteers needed</span>
                    {init.targetCategory && <span>📂 {init.targetCategory}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
