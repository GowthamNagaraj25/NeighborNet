import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  { icon: '🤝', title: 'Mutual Aid Marketplace', desc: 'Post requests and offers for help. Groceries, repairs, transport, childcare — your neighbors have you covered.' },
  { icon: '🧠', title: 'AI Semantic Matching', desc: 'Our AI connects vague requests to relevant skills. "Leaky sink" matches "plumbing hobbyist" automatically.' },
  { icon: '🗺️', title: 'Interactive Community Map', desc: 'See all active requests and offers on a live map. Filter by urgency, category, and distance.' },
  { icon: '💬', title: 'Real-time Messaging', desc: 'Chat directly with matched neighbors. Get instant alerts for critical needs nearby.' },
  { icon: '🩸', title: 'Blood Donor Network', desc: 'Find blood donors by blood group and proximity. Critical requests trigger immediate alerts.' },
  { icon: '📊', title: 'Community Intelligence', desc: 'AI detects neighborhood trends and generates action plans for organizers.' },
];

const steps = [
  { step: '01', title: 'Sign Up & Verify', desc: 'Create your account and complete community verification to build trust.' },
  { step: '02', title: 'Post or Browse', desc: 'Share what you need or what you can offer. Be specific or vague — AI handles the matching.' },
  { step: '03', title: 'Connect & Help', desc: 'Chat with matched neighbors, coordinate help, and build community resilience together.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏘️</span>
          <span className="font-bold text-gray-900 text-xl">NeighborNet <span className="text-primary-500">Resilience</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2">Login</Link>
          <Link to="/signup" className="text-sm font-bold bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
          
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Your neighborhood,<br />
          <span className="text-primary-500">stronger together</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          NeighborNet connects verified residents for mutual aid, emergency support, and community resilience — powered by AI that understands your real needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup" className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all shadow-lg hover:shadow-xl">
            Join Your Neighborhood →
          </Link>
          <Link to="/login" className="border-2 border-gray-200 hover:border-primary-300 text-gray-700 font-bold px-8 py-4 rounded-2xl text-lg transition-all">
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
          {[
            { value: '500+', label: 'Verified Residents' },
            { value: '1,200+', label: 'Helps Completed' },
            { value: '98%', label: 'Match Accuracy' },
            { value: '< 2min', label: 'Emergency Response' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-extrabold text-primary-500">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem Statement */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">The Problem We're Solving</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            In every neighborhood, people need help and people want to help — but they can't find each other. 
            Elderly residents need medicine pickup. Families face sudden financial emergencies. 
            Skilled neighbors don't know who needs their expertise. 
            <strong className="text-gray-900"> NeighborNet bridges this gap with AI-powered community intelligence.</strong>
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.step} className="text-center">
              <div className="w-16 h-16 bg-primary-500 text-white rounded-2xl flex items-center justify-center text-2xl font-extrabold mx-auto mb-4">
                {step.step}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gradient-to-br from-primary-50 to-warm-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Built for Real Community Resilience</h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">Every feature is designed to make your neighborhood stronger, safer, and more connected.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-10 text-white">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
              🧠 AI-Powered Community Intelligence
            </div>
            <h2 className="text-3xl font-bold mb-4">AI that understands your community</h2>
            <p className="text-gray-300 text-lg mb-6">
              Our semantic matching engine connects "pipe leaking under kitchen sink" with "plumbing hobbyist" — no exact keywords needed. 
              It detects neighborhood trends, generates action plans, and routes volunteers intelligently.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: '🔍', title: 'Semantic Matching', desc: 'Synonym expansion + TF-IDF scoring' },
                { icon: '📈', title: 'Trend Detection', desc: 'Analyzes 7-day post patterns' },
                { icon: '🗺️', title: 'Logistics Intelligence', desc: 'Optimal volunteer routing' },
              ].map((item) => (
                <div key={item.title} className="bg-white/10 rounded-xl p-4">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="font-semibold text-sm">{item.title}</div>
                  <div className="text-gray-400 text-xs mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-500 py-16 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to strengthen your neighborhood?</h2>
        <p className="text-primary-100 mb-8 text-lg">Join thousands of verified residents building community resilience.</p>
        <Link to="/signup" className="bg-white text-primary-600 font-bold px-10 py-4 rounded-2xl text-lg hover:bg-primary-50 transition-colors shadow-lg">
          Join NeighborNet Today →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-gray-400 text-sm">
        <p>🏘️ NeighborNet Resilience — Built for the community, by the community</p>
        <p className="mt-1">Gowtham Preethi</p>
      </footer>
    </div>
  );
}
