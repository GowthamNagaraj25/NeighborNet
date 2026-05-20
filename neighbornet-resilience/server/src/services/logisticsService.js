const { semanticScore, haversineDistance } = require('./aiService');

function urgencyWeight(urgency) {
  const map = { critical: 100, high: 70, medium: 40, low: 10 };
  return map[urgency] || 10;
}

function distanceScore(distanceKm) {
  if (distanceKm <= 1) return 100;
  if (distanceKm <= 3) return 80;
  if (distanceKm <= 5) return 60;
  if (distanceKm <= 10) return 40;
  return 20;
}

function skillMatchScore(request, volunteer) {
  const requestText = `${request.title} ${request.description} ${request.category}`;
  const volunteerText = (volunteer.skills || []).join(' ');
  return semanticScore(requestText, volunteerText) * 100;
}

function trustScore(volunteer) {
  let score = volunteer.trustScore || 50;
  if (volunteer.verificationStatus === 'verified') score += 20;
  return Math.min(100, score);
}

function generateLogisticsPlan(requests, volunteers) {
  const urgentRequests = requests
    .filter((r) => r.status === 'open' && (r.urgency === 'high' || r.urgency === 'critical'))
    .sort((a, b) => urgencyWeight(b.urgency) - urgencyWeight(a.urgency));

  const routes = [];
  const assignedRequests = new Set();
  const volunteerLoad = {};

  volunteers.forEach((v) => (volunteerLoad[v._id.toString()] = 0));

  for (const request of urgentRequests) {
    if (assignedRequests.has(request._id.toString())) continue;

    let bestVolunteer = null;
    let bestScore = -1;

    for (const volunteer of volunteers) {
      const vid = volunteer._id.toString();
      if (volunteerLoad[vid] >= 3) continue; // max 3 assignments per volunteer

      const distKm = haversineDistance(
        request.location.coordinates,
        volunteer.location.coordinates
      );
      if (distKm > (request.vicinityRadiusKm || 10)) continue;

      const score =
        urgencyWeight(request.urgency) * 0.35 +
        distanceScore(distKm) * 0.3 +
        skillMatchScore(request, volunteer) * 0.25 +
        trustScore(volunteer) * 0.1;

      if (score > bestScore) {
        bestScore = score;
        bestVolunteer = { volunteer, distKm, score };
      }
    }

    if (bestVolunteer) {
      const vid = bestVolunteer.volunteer._id.toString();
      volunteerLoad[vid] = (volunteerLoad[vid] || 0) + 1;
      assignedRequests.add(request._id.toString());

      routes.push({
        volunteer: bestVolunteer.volunteer.name,
        volunteerId: vid,
        volunteerSkills: bestVolunteer.volunteer.skills || [],
        assignedTo: request.title,
        requestId: request._id,
        category: request.category,
        priority: request.urgency,
        distanceKm: Math.round(bestVolunteer.distKm * 10) / 10,
        score: Math.round(bestVolunteer.score),
        reason: buildReason(request, bestVolunteer.volunteer, bestVolunteer.distKm),
        suggestedOrder: routes.length + 1,
      });
    }
  }

  // Detect gaps
  const gaps = [];
  const unassigned = urgentRequests.filter((r) => !assignedRequests.has(r._id.toString()));
  unassigned.forEach((r) => {
    gaps.push(`No available volunteer found for: "${r.title}" (${r.urgency} urgency, ${r.category})`);
  });

  // Category gaps
  const requestCategories = new Set(urgentRequests.map((r) => r.category));
  const volunteerCategories = new Set(
    volunteers.flatMap((v) =>
      (v.skills || []).flatMap((s) => {
        const text = s.toLowerCase();
        if (text.includes('blood')) return ['blood'];
        if (text.includes('transport') || text.includes('bike') || text.includes('car')) return ['transport'];
        if (text.includes('medical') || text.includes('medicine')) return ['medical'];
        if (text.includes('grocery') || text.includes('food')) return ['groceries'];
        return [];
      })
    )
  );

  requestCategories.forEach((cat) => {
    if (!volunteerCategories.has(cat) && cat !== 'other') {
      gaps.push(`No ${cat} specialist volunteer available in the area`);
    }
  });

  const recommendations = generateRecommendations(gaps, urgentRequests, volunteers);

  return {
    summary: `${routes.length} urgent request${routes.length !== 1 ? 's' : ''} matched to ${new Set(routes.map((r) => r.volunteerId)).size} volunteer${routes.length !== 1 ? 's' : ''}. ${unassigned.length} request${unassigned.length !== 1 ? 's' : ''} need${unassigned.length === 1 ? 's' : ''} more volunteers.`,
    totalRequests: urgentRequests.length,
    assignedCount: routes.length,
    unassignedCount: unassigned.length,
    routes,
    gaps,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}

function buildReason(request, volunteer, distKm) {
  const parts = [];
  if (distKm <= 2) parts.push(`Closest verified volunteer (${distKm.toFixed(1)}km away)`);
  else parts.push(`Within ${distKm.toFixed(1)}km`);

  const skillMatch = skillMatchScore(request, volunteer);
  if (skillMatch > 30) parts.push(`Strong skill match for ${request.category}`);
  if (volunteer.verificationStatus === 'verified') parts.push('Verified resident');
  if (volunteer.trustScore >= 70) parts.push(`High trust score (${volunteer.trustScore})`);

  return parts.join('. ');
}

function generateRecommendations(gaps, requests, volunteers) {
  const recs = [];
  if (gaps.length > 0) {
    recs.push('Recruit additional volunteers for uncovered categories');
  }
  if (volunteers.length < requests.length / 2) {
    recs.push('Volunteer count is low — launch community volunteer recruitment drive');
  }
  const bloodRequests = requests.filter((r) => r.category === 'blood');
  if (bloodRequests.length > 0) {
    recs.push('Create emergency blood donor alert — send notifications to all registered donors');
  }
  const criticalCount = requests.filter((r) => r.urgency === 'critical').length;
  if (criticalCount > 2) {
    recs.push(`${criticalCount} critical requests detected — activate emergency response protocol`);
  }
  if (recs.length === 0) {
    recs.push('Current volunteer coverage is adequate — maintain regular check-ins');
  }
  return recs;
}

module.exports = { generateLogisticsPlan };
