import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { aiAPI, postsAPI } from '../services/api';
import { Post, AIMatch } from '../types';
import { useAuth } from '../context/AuthContext';
import MatchCard from '../components/MatchCard';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';

export default function AIMatches() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedPostId = searchParams.get('postId');

  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [matches, setMatches] = useState<AIMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);
  const [algorithm, setAlgorithm] = useState('');

  useEffect(() => {
    loadMyPosts();
  }, []);

  useEffect(() => {
    if (preselectedPostId && myPosts.length > 0) {
      const post = myPosts.find((p) => p._id === preselectedPostId);
      if (post) handleSelectPost(post);
    }
  }, [preselectedPostId, myPosts]);

  const loadMyPosts = async () => {
    try {
      const res = await postsAPI.getMyPosts();
      setMyPosts(res.data.data.filter((p: Post) => p.status !== 'completed' && p.status !== 'cancelled'));
    } catch {
      toast.error('Failed to load your posts');
    } finally {
      setPostsLoading(false);
    }
  };

  const handleSelectPost = async (post: Post) => {
    setSelectedPost(post);
    setLoading(true);
    setMatches([]);
    try {
      const res = await aiAPI.getMatches(post._id);
      setMatches(res.data.data.matches);
      setAlgorithm(res.data.data.algorithm);
    } catch {
      toast.error('Failed to get AI matches');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">🧠 AI Semantic Matchmaking</h1>
        <p className="text-gray-500 text-sm mt-1">
          Our AI connects your posts to relevant helpers and offers — even without exact keyword matches
        </p>
      </div>

      {/* Algorithm explanation */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 mb-8">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h3 className="font-semibold text-blue-900">How AI Matching Works</h3>
            <p className="text-sm text-blue-700 mt-1">
              The engine uses <strong>synonym expansion</strong> (e.g. "leaky sink" → plumbing, pipe, repair),
              <strong> semantic scoring</strong>, category matching, distance boost, and verified user boost
              to find the most relevant matches — no exact keywords needed.
            </p>
            {algorithm && <p className="text-xs text-blue-500 mt-2">Algorithm: {algorithm}</p>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Post selector */}
        <div className="lg:col-span-1">
          <h2 className="font-semibold text-gray-900 mb-4">Select a Post to Match</h2>
          {postsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-24 animate-pulse" />)}
            </div>
          ) : myPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-2xl">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm">No active posts found.</p>
              <a href="/create-post" className="text-primary-600 text-sm font-medium hover:underline mt-1 block">Create a post first →</a>
            </div>
          ) : (
            <div className="space-y-3">
              {myPosts.map((post) => (
                <button
                  key={post._id}
                  onClick={() => handleSelectPost(post)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${selectedPost?._id === post._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${post.type === 'request' ? 'bg-primary-100 text-primary-700' : 'bg-community-100 text-community-700'}`}>
                      {post.type}
                    </span>
                    <span className="text-xs text-gray-400">{post.category}</span>
                  </div>
                  <p className="font-medium text-sm text-gray-900 line-clamp-2">{post.title}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Matches */}
        <div className="lg:col-span-2">
          {!selectedPost ? (
            <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-2xl">
              <p className="text-5xl mb-4">🎯</p>
              <p className="text-lg font-medium">Select a post to see AI matches</p>
              <p className="text-sm mt-1">The AI will find the most relevant helpers and offers</p>
            </div>
          ) : loading ? (
            <div>
              <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 rounded-2xl">
                <div className="animate-spin text-2xl">🔄</div>
                <div>
                  <p className="font-semibold text-blue-900">AI is analyzing your post...</p>
                  <p className="text-sm text-blue-600">Expanding synonyms, scoring candidates, ranking by distance</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-48 animate-pulse" />)}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">
                  {matches.length > 0 ? `${matches.length} AI Matches Found` : 'No matches found'}
                </h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  For: {selectedPost.title.substring(0, 30)}...
                </span>
              </div>

              {matches.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl">
                  <p className="text-4xl mb-3">🔍</p>
                  <p>No matches found in your vicinity.</p>
                  <p className="text-sm mt-1">Try increasing the vicinity radius on your post.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {matches.map((match, i) => (
                    <MatchCard key={i} match={match} currentUserId={user?._id} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
