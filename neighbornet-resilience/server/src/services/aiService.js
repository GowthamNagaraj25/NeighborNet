/**
 * AI Service — Semantic Matchmaking & Trend Detection
 * Works fully offline using synonym expansion + TF-IDF-style scoring.
 * Optional: set OPTIONAL_AI_API_KEY in .env for enhanced AI (not required).
 */

const SYNONYM_MAP = {
  plumbing: ['leak', 'pipe', 'tap', 'sink', 'water', 'repair', 'faucet', 'drain', 'clog', 'plumber'],
  'elderly-care': ['senior', 'old', 'grandmother', 'grandfather', 'isolation', 'lonely', 'medicine', 'elder', 'aged', 'geriatric', 'companionship', 'check-in'],
  groceries: ['food', 'ration', 'vegetables', 'milk', 'essentials', 'grocery', 'provisions', 'supplies', 'fruits', 'bread'],
  transport: ['ride', 'pickup', 'drop', 'vehicle', 'bike', 'car', 'auto', 'travel', 'commute', 'drive', 'lift'],
  medical: ['medicine', 'doctor', 'hospital', 'pharmacy', 'tablet', 'prescription', 'health', 'clinic', 'nurse', 'treatment', 'injection'],
  blood: ['donor', 'blood', 'plasma', 'emergency', 'transfusion', 'donate', 'group', 'type'],
  tools: ['drill', 'hammer', 'ladder', 'equipment', 'wrench', 'screwdriver', 'saw', 'toolkit', 'borrow', 'lend'],
  'money-lending': ['cash', 'borrow', 'loan', 'emergency money', 'financial help', 'fund', 'rupees', 'amount', 'repay', 'support'],
  logistics: ['delivery', 'route', 'supply', 'distribute', 'volunteer', 'dispatch', 'coordinate', 'manage'],
  repairs: ['fix', 'broken', 'damage', 'maintenance', 'service', 'replace', 'install', 'technician'],
  childcare: ['child', 'baby', 'toddler', 'kids', 'babysit', 'daycare', 'school', 'tutor', 'homework'],
  education: ['tutor', 'teach', 'study', 'homework', 'school', 'math', 'science', 'english', 'coaching', 'class'],
  emergency: ['urgent', 'critical', 'immediate', 'sos', 'help', 'crisis', 'danger', 'accident'],
};

// Build reverse lookup: word -> categories
const WORD_TO_CATEGORIES = {};
Object.entries(SYNONYM_MAP).forEach(([category, words]) => {
  words.forEach((word) => {
    if (!WORD_TO_CATEGORIES[word]) WORD_TO_CATEGORIES[word] = [];
    WORD_TO_CATEGORIES[word].push(category);
  });
});

function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  const normalized = normalizeText(text);
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'i', 'my', 'me', 'we', 'our', 'for', 'to', 'of', 'in', 'on', 'at', 'and', 'or', 'but', 'with', 'from', 'by', 'it', 'its', 'this', 'that', 'have', 'has', 'had', 'do', 'does', 'did', 'be', 'been', 'being', 'can', 'could', 'will', 'would', 'should', 'may', 'might', 'need', 'want', 'get', 'got', 'some', 'any', 'all', 'no', 'not', 'so', 'if', 'as', 'up', 'out', 'about', 'into', 'than', 'then', 'when', 'where', 'who', 'which', 'what', 'how', 'very', 'just', 'also', 'more', 'most', 'other', 'such', 'only', 'own', 'same', 'too', 'under', 'over', 'after', 'before', 'between', 'through', 'during', 'please', 'help', 'someone', 'anyone', 'nearby', 'near', 'around', 'within']);
  return normalized.split(' ').filter((t) => t.length > 2 && !stopWords.has(t));
}

function expandSynonyms(tokens) {
  const expanded = new Set(tokens);
  tokens.forEach((token) => {
    // Direct synonym map expansion
    Object.entries(SYNONYM_MAP).forEach(([category, synonyms]) => {
      if (synonyms.includes(token) || token === category) {
        synonyms.forEach((s) => expanded.add(s));
        expanded.add(category);
      }
    });
    // Partial match
    Object.entries(SYNONYM_MAP).forEach(([category, synonyms]) => {
      synonyms.forEach((s) => {
        if (s.includes(token) || token.includes(s)) {
          synonyms.forEach((ss) => expanded.add(ss));
          expanded.add(category);
        }
      });
    });
  });
  return Array.from(expanded);
}

function semanticScore(textA, textB) {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);
  const expandedA = expandSynonyms(tokensA);
  const expandedB = expandSynonyms(tokensB);

  const setA = new Set(expandedA);
  const setB = new Set(expandedB);

  const intersection = [...setA].filter((t) => setB.has(t));
  const union = new Set([...setA, ...setB]);

  if (union.size === 0) return 0;

  // Jaccard similarity
  const jaccard = intersection.length / union.size;

  // Boost for direct token overlap (non-expanded)
  const directOverlap = tokensA.filter((t) => tokensB.includes(t)).length;
  const directBoost = directOverlap * 0.05;

  return Math.min(1, jaccard + directBoost);
}

function categoryScore(catA, catB) {
  if (!catA || !catB) return 0;
  if (catA === catB) return 1;
  // Related categories
  const related = {
    medical: ['elderly-care', 'emergency', 'blood'],
    'elderly-care': ['medical', 'groceries', 'transport'],
    groceries: ['logistics', 'transport'],
    transport: ['logistics', 'medical', 'groceries'],
    blood: ['medical', 'emergency'],
    emergency: ['medical', 'blood', 'transport'],
    'money-lending': ['emergency'],
    repairs: ['tools', 'logistics'],
    tools: ['repairs'],
  };
  const relatedCats = related[catA] || [];
  return relatedCats.includes(catB) ? 0.4 : 0;
}

function urgencyBoost(urgency) {
  const map = { critical: 0.2, high: 0.1, medium: 0.05, low: 0 };
  return map[urgency] || 0;
}

function distanceBoost(distanceKm) {
  if (distanceKm === null || distanceKm === undefined) return 0;
  if (distanceKm <= 1) return 0.2;
  if (distanceKm <= 3) return 0.15;
  if (distanceKm <= 5) return 0.1;
  if (distanceKm <= 10) return 0.05;
  return 0;
}

function verifiedBoost(verificationStatus) {
  return verificationStatus === 'verified' ? 0.1 : 0;
}

function haversineDistance(coord1, coord2) {
  // coord = [lng, lat]
  const R = 6371;
  const dLat = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const dLon = ((coord2[0] - coord1[0]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((coord1[1] * Math.PI) / 180) *
      Math.cos((coord2[1] * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function findMatchesForPost(post, candidatePosts, candidateUsers) {
  const results = [];
  const postText = `${post.title} ${post.description} ${(post.tags || []).join(' ')}`;

  // Match against other posts (offers if request, requests if offer)
  for (const candidate of candidatePosts) {
    if (candidate._id.toString() === post._id.toString()) continue;
    if (candidate.status === 'completed' || candidate.status === 'cancelled') continue;
    // For requests, find offers; for offers, find requests
    if (post.type === candidate.type) continue;

    const candidateText = `${candidate.title} ${candidate.description} ${(candidate.tags || []).join(' ')}`;
    const textSim = semanticScore(postText, candidateText);
    const catSim = categoryScore(post.category, candidate.category);
    const urgBoost = urgencyBoost(post.urgency);
    const distKm = haversineDistance(
      post.location.coordinates,
      candidate.location.coordinates
    );
    const distBoost = distanceBoost(distKm);

    const score = Math.min(1, textSim * 0.5 + catSim * 0.3 + urgBoost + distBoost);

    if (score > 0.05) {
      const reasons = [];
      if (textSim > 0.1) reasons.push(`Semantic similarity in description (${Math.round(textSim * 100)}%)`);
      if (catSim > 0) reasons.push(`Category match: ${post.category} ↔ ${candidate.category}`);
      if (distKm < 5) reasons.push(`Within ${distKm.toFixed(1)}km`);
      if (urgBoost > 0) reasons.push(`Urgency: ${post.urgency}`);

      results.push({
        type: 'post',
        item: candidate,
        score: Math.round(score * 100),
        distanceKm: Math.round(distKm * 10) / 10,
        reason: reasons.join('. ') || 'General category and keyword match',
        suggestedAction: post.type === 'request' ? 'Contact this helper' : 'Offer your help',
      });
    }
  }

  // Match against users with skills
  for (const user of candidateUsers) {
    if (!user.skills || user.skills.length === 0) continue;
    const userSkillText = user.skills.join(' ') + ' ' + (user.neighborhood || '');
    const textSim = semanticScore(postText, userSkillText);
    const verBoost = verifiedBoost(user.verificationStatus);
    const distKm = haversineDistance(
      post.location.coordinates,
      user.location.coordinates
    );
    const distBoost = distanceBoost(distKm);

    const score = Math.min(1, textSim * 0.6 + verBoost + distBoost);

    if (score > 0.08) {
      const reasons = [];
      if (textSim > 0.1) reasons.push(`Skills match: "${user.skills.slice(0, 2).join(', ')}"`);
      if (verBoost > 0) reasons.push('Verified resident');
      if (distKm < 5) reasons.push(`Only ${distKm.toFixed(1)}km away`);

      results.push({
        type: 'user',
        item: user,
        score: Math.round(score * 100),
        distanceKm: Math.round(distKm * 10) / 10,
        reason: reasons.join('. ') || 'Skill profile matches your request',
        suggestedAction: 'Start a conversation',
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 10);
}

function detectCommunityTrends(posts) {
  const now = new Date();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const recentPosts = posts.filter((p) => new Date(p.createdAt) >= sevenDaysAgo);

  const categoryCount = {};
  const neighborhoodCount = {};
  const urgentCount = {};

  recentPosts.forEach((post) => {
    categoryCount[post.category] = (categoryCount[post.category] || 0) + 1;
    if (post.urgency === 'high' || post.urgency === 'critical') {
      urgentCount[post.category] = (urgentCount[post.category] || 0) + 1;
    }
  });

  const trends = [];

  Object.entries(categoryCount).forEach(([category, count]) => {
    if (count >= 2) {
      const urgentForCat = urgentCount[category] || 0;
      const severity = urgentForCat >= 3 ? 'critical' : urgentForCat >= 2 ? 'high' : count >= 5 ? 'medium' : 'low';
      const categoryPosts = recentPosts.filter((p) => p.category === category);

      trends.push({
        title: getTrendTitle(category, count),
        summary: getTrendSummary(category, count, urgentForCat),
        category,
        severity,
        evidenceCount: count,
        detectedFromPosts: categoryPosts.map((p) => p._id),
        recommendedAction: getRecommendedAction(category),
        affectedArea: 'Local Neighborhood',
      });
    }
  });

  trends.sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });

  return trends;
}

function getTrendTitle(category, count) {
  const titles = {
    'elderly-care': `Senior Care Needs Rising — ${count} requests this week`,
    medical: `Medical Assistance Demand Spike — ${count} requests`,
    groceries: `Food & Grocery Shortage Signals — ${count} requests`,
    blood: `Blood Donor Urgency — ${count} requests`,
    transport: `Transport Gap Detected — ${count} requests`,
    'money-lending': `Financial Distress Signals — ${count} requests`,
    emergency: `Emergency Cluster Detected — ${count} critical requests`,
    repairs: `Home Repair Needs — ${count} requests`,
    tools: `Tool Sharing Demand — ${count} requests`,
    childcare: `Childcare Support Needed — ${count} requests`,
    education: `Education Support Requests — ${count} posts`,
    logistics: `Logistics Coordination Needed — ${count} posts`,
    other: `General Community Needs — ${count} posts`,
  };
  return titles[category] || `${category} trend — ${count} posts`;
}

function getTrendSummary(category, count, urgentCount) {
  const summaries = {
    'elderly-care': `${count} elderly care requests detected in the past 7 days. ${urgentCount} are marked urgent. Signals include loneliness, medicine pickup, and daily check-in needs.`,
    medical: `${count} medical assistance requests in the past week. ${urgentCount} are high/critical urgency. Community may need organized medical volunteer support.`,
    groceries: `${count} grocery/food requests detected. Possible food access gap in the neighborhood. Volunteer delivery network recommended.`,
    blood: `${count} blood donation requests. ${urgentCount} are critical. Immediate donor mobilization needed.`,
    transport: `${count} transport requests. Residents lack mobility support. Volunteer driver network could address this.`,
    'money-lending': `${count} financial assistance requests. Community members facing short-term financial stress. Micro-lending circle may help.`,
    emergency: `${count} emergency requests detected. ${urgentCount} are critical. Immediate community response required.`,
    repairs: `${count} home repair requests. Skill-sharing initiative could address these efficiently.`,
    tools: `${count} tool-sharing requests. A community tool library could serve these needs.`,
    childcare: `${count} childcare requests. Parents need support. Community childcare network recommended.`,
    education: `${count} education support requests. Tutoring volunteer program could help.`,
    logistics: `${count} logistics coordination needs. Organized volunteer dispatch system recommended.`,
    other: `${count} general community requests. Review and categorize for targeted response.`,
  };
  return summaries[category] || `${count} posts in ${category} category detected this week.`;
}

function getRecommendedAction(category) {
  const actions = {
    'elderly-care': 'Launch Senior Warm Check-in Drive. Recruit volunteers for daily calls and medicine pickup.',
    medical: 'Organize Medical Volunteer Network. Partner with local pharmacy for prescription pickup.',
    groceries: 'Start Community Grocery Delivery Program. Coordinate with local shops for bulk orders.',
    blood: 'Activate Blood Donor Alert Network. Send emergency notifications to registered donors.',
    transport: 'Create Volunteer Driver Pool. Schedule regular pickup routes for common destinations.',
    'money-lending': 'Establish Community Micro-Lending Circle. Set up transparent peer support fund.',
    emergency: 'Activate Emergency Response Team. Assign coordinators to each critical request.',
    repairs: 'Organize Skill-Share Saturday. Match repair volunteers with residents in need.',
    tools: 'Create Community Tool Library. Register available tools and set up borrowing system.',
    childcare: 'Launch Neighborhood Childcare Co-op. Connect parents for mutual childcare support.',
    education: 'Start Volunteer Tutoring Program. Match skilled residents with students needing help.',
    logistics: 'Deploy Smart Volunteer Routing. Use logistics intelligence to optimize resource distribution.',
    other: 'Review requests and create targeted community response plan.',
  };
  return actions[category] || 'Organize community response for this category.';
}

function generateActionPlan(trend, volunteers = []) {
  const plan = {
    title: `${trend.category.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Community Drive`,
    objective: `Address the spike in ${trend.category} needs in the neighborhood`,
    targetResidents: `Residents with ${trend.category} needs (${trend.evidenceCount} identified)`,
    requiredVolunteers: Math.max(3, Math.ceil(trend.evidenceCount / 2)),
    requiredResources: getRequiredResources(trend.category),
    executionSteps: getExecutionSteps(trend.category, trend.evidenceCount),
    suggestedMessage: getSuggestedMessage(trend),
    successMetrics: getSuccessMetrics(trend.category),
    estimatedDuration: '1-2 weeks',
    priority: trend.severity,
  };
  return plan;
}

function getRequiredResources(category) {
  const resources = {
    'elderly-care': ['Phone list of senior residents', 'Medicine pickup volunteers', 'Transport support', 'Weekly visit schedule'],
    medical: ['Medical volunteer contacts', 'Pharmacy partnerships', 'Emergency transport', 'First aid kits'],
    groceries: ['Grocery delivery volunteers', 'Local shop contacts', 'Delivery bags', 'Route map'],
    blood: ['Blood group registry', 'Hospital contacts', 'Emergency notification system', 'Transport'],
    transport: ['Volunteer driver list', 'Vehicle availability schedule', 'Route planning tool'],
    'money-lending': ['Community fund pool', 'Transparent ledger', 'Repayment tracking', 'Volunteer coordinators'],
    emergency: ['Emergency response team', 'Communication tree', 'Resource stockpile', 'Coordinator contacts'],
    repairs: ['Skilled volunteer list', 'Basic tool kit', 'Material fund', 'Schedule coordinator'],
    tools: ['Tool inventory list', 'Storage location', 'Borrowing register', 'Maintenance fund'],
    childcare: ['Certified caregivers', 'Safe space', 'Activity materials', 'Parent contact list'],
    education: ['Volunteer tutors', 'Study materials', 'Venue', 'Student list'],
    logistics: ['Volunteer roster', 'Vehicle list', 'Route optimizer', 'Communication channel'],
  };
  return resources[category] || ['Volunteers', 'Coordinator', 'Communication channel'];
}

function getExecutionSteps(category, count) {
  const steps = {
    'elderly-care': [
      `Identify ${Math.min(count * 2, 20)} senior residents within 2km using community map`,
      'Assign 2 volunteers per senior for daily phone check-ins and weekly visits',
      'Set up medicine pickup relay — volunteers collect from pharmacy and deliver',
    ],
    medical: [
      `Map ${count} medical requests to nearest available medical volunteers`,
      'Partner with 2-3 local pharmacies for prescription pickup service',
      'Create on-call medical volunteer schedule for the next 2 weeks',
    ],
    groceries: [
      `Identify ${count} households needing grocery support`,
      'Recruit 5 delivery volunteers and assign neighborhood zones',
      'Coordinate bulk purchase from local shops for cost efficiency',
    ],
    blood: [
      'Send emergency alert to all registered blood donors in the area',
      `Match ${count} blood requests with compatible donors by blood group`,
      'Arrange transport to hospital for donors and recipients',
    ],
    transport: [
      `Create volunteer driver pool from ${count} transport requests analysis`,
      'Schedule regular pickup routes for hospital, market, and school runs',
      'Set up ride-request system through the platform',
    ],
    'money-lending': [
      `Review ${count} financial assistance requests for urgency and amount`,
      'Establish transparent community micro-lending pool with volunteer oversight',
      'Set up repayment tracking and accountability system',
    ],
    emergency: [
      `Triage ${count} emergency requests by severity and assign response teams`,
      'Deploy nearest verified volunteers to critical cases immediately',
      'Establish 24-hour emergency coordination channel',
    ],
  };
  return steps[category] || [
    `Analyze ${count} community requests in this category`,
    'Recruit and brief volunteer team',
    'Execute coordinated community response over 2 weeks',
  ];
}

function getSuggestedMessage(trend) {
  return `🏘️ Community Alert: We've detected ${trend.evidenceCount} ${trend.category.replace('-', ' ')} needs in our neighborhood this week. Severity: ${trend.severity.toUpperCase()}. We're launching a coordinated response drive. Volunteers needed! Join the initiative on NeighborNet.`;
}

function getSuccessMetrics(category) {
  return [
    `Resolve 80% of open ${category} requests within 2 weeks`,
    'Recruit minimum 5 active volunteers for this category',
    'Reduce repeat requests by 50% through proactive support',
    'Achieve 4+ star satisfaction from helped residents',
  ];
}

module.exports = {
  normalizeText,
  tokenize,
  expandSynonyms,
  semanticScore,
  findMatchesForPost,
  detectCommunityTrends,
  generateActionPlan,
  haversineDistance,
};
