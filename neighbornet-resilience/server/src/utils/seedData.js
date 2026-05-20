require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Post = require('../models/Post');
const Initiative = require('../models/Initiative');
const TrendInsight = require('../models/TrendInsight');

// Chennai-area coordinates (neighborhood cluster)
const COORDS = {
  anna_nagar: [80.2101, 13.0850],
  t_nagar: [80.2341, 13.0418],
  adyar: [80.2574, 13.0067],
  velachery: [80.2209, 12.9815],
  mylapore: [80.2674, 13.0368],
  kodambakkam: [80.2245, 13.0524],
  nungambakkam: [80.2430, 13.0569],
  perambur: [80.2456, 13.1185],
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Initiative.deleteMany({}),
      TrendInsight.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    const hash = (pw) => bcrypt.hash(pw, 12);

    // Create users
    const users = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@neighbornet.com',
        passwordHash: await hash('Admin@123'),
        role: 'admin',
        verificationStatus: 'verified',
        neighborhood: 'Anna Nagar',
        addressText: '12, 3rd Avenue, Anna Nagar, Chennai',
        location: { type: 'Point', coordinates: COORDS.anna_nagar },
        skills: ['community management', 'coordination'],
        badges: ['Verified Resident', 'Community Organizer'],
        trustScore: 95,
      },
      {
        name: 'Priya Organizer',
        email: 'organizer@neighbornet.com',
        passwordHash: await hash('Organizer@123'),
        role: 'organizer',
        verificationStatus: 'verified',
        neighborhood: 'T Nagar',
        addressText: '45, Usman Road, T Nagar, Chennai',
        location: { type: 'Point', coordinates: COORDS.t_nagar },
        skills: ['event planning', 'community outreach', 'logistics'],
        badges: ['Verified Resident', 'Community Organizer', 'First Helper'],
        trustScore: 88,
      },
      {
        name: 'Ravi Kumar',
        email: 'resident@neighbornet.com',
        passwordHash: await hash('Resident@123'),
        role: 'resident',
        verificationStatus: 'verified',
        neighborhood: 'Adyar',
        addressText: '7, Gandhi Nagar, Adyar, Chennai',
        location: { type: 'Point', coordinates: COORDS.adyar },
        skills: ['plumbing hobbyist', 'home repairs', 'bike delivery'],
        badges: ['Verified Resident', 'First Helper', 'Tool Sharer'],
        trustScore: 82,
        phone: '9876543210',
      },
      {
        name: 'Meena Sundaram',
        email: 'meena@neighbornet.com',
        passwordHash: await hash('Resident@123'),
        role: 'resident',
        verificationStatus: 'verified',
        neighborhood: 'Mylapore',
        addressText: '23, Luz Church Road, Mylapore, Chennai',
        location: { type: 'Point', coordinates: COORDS.mylapore },
        skills: ['grocery delivery volunteer', 'elderly companionship', 'cooking'],
        badges: ['Verified Resident', 'Elder Support'],
        trustScore: 79,
        bloodGroup: 'B+',
        willingToDonate: true,
      },
      {
        name: 'Arjun Nair',
        email: 'arjun@neighbornet.com',
        passwordHash: await hash('Resident@123'),
        role: 'resident',
        verificationStatus: 'verified',
        neighborhood: 'Velachery',
        addressText: '56, Velachery Main Road, Chennai',
        location: { type: 'Point', coordinates: COORDS.velachery },
        skills: ['blood donor B+', 'emergency transport', 'bike delivery'],
        badges: ['Verified Resident', 'Blood Donor', 'Emergency Responder'],
        trustScore: 85,
        bloodGroup: 'B+',
        willingToDonate: true,
      },
      {
        name: 'Lakshmi Devi',
        email: 'lakshmi@neighbornet.com',
        passwordHash: await hash('Resident@123'),
        role: 'resident',
        verificationStatus: 'verified',
        neighborhood: 'Kodambakkam',
        addressText: '89, Kodambakkam High Road, Chennai',
        location: { type: 'Point', coordinates: COORDS.kodambakkam },
        skills: ['math tutor', 'education volunteer', 'childcare'],
        badges: ['Verified Resident', 'First Helper'],
        trustScore: 76,
      },
      {
        name: 'Suresh Babu',
        email: 'suresh@neighbornet.com',
        passwordHash: await hash('Resident@123'),
        role: 'resident',
        verificationStatus: 'verified',
        neighborhood: 'Nungambakkam',
        addressText: '34, Nungambakkam High Road, Chennai',
        location: { type: 'Point', coordinates: COORDS.nungambakkam },
        skills: ['tool sharing', 'carpentry', 'electrical repairs'],
        badges: ['Verified Resident', 'Tool Sharer'],
        trustScore: 80,
      },
      {
        name: 'Kavitha Raj',
        email: 'kavitha@neighbornet.com',
        passwordHash: await hash('Resident@123'),
        role: 'resident',
        verificationStatus: 'verified',
        neighborhood: 'Perambur',
        addressText: '12, Perambur Barracks Road, Chennai',
        location: { type: 'Point', coordinates: COORDS.perambur },
        skills: ['financial support volunteer', 'micro lending', 'emergency support'],
        badges: ['Verified Resident'],
        trustScore: 72,
      },
      {
        name: 'Dinesh Mohan',
        email: 'dinesh@neighbornet.com',
        passwordHash: await hash('Resident@123'),
        role: 'resident',
        verificationStatus: 'verified',
        neighborhood: 'Anna Nagar',
        addressText: '67, Anna Nagar West, Chennai',
        location: { type: 'Point', coordinates: [80.2150, 13.0900] },
        skills: ['pharmacy pickup', 'medical volunteer', 'elderly care'],
        badges: ['Verified Resident', 'Elder Support'],
        trustScore: 78,
        bloodGroup: 'O+',
        willingToDonate: true,
      },
      {
        name: 'Anitha Krishnan',
        email: 'anitha@neighbornet.com',
        passwordHash: await hash('Resident@123'),
        role: 'resident',
        verificationStatus: 'verified',
        neighborhood: 'T Nagar',
        addressText: '90, Pondy Bazaar, T Nagar, Chennai',
        location: { type: 'Point', coordinates: [80.2380, 13.0450] },
        skills: ['daily phone check-in', 'senior companion', 'grocery delivery'],
        badges: ['Verified Resident', 'Elder Support', 'First Helper'],
        trustScore: 83,
      },
      {
        name: 'Pending User 1',
        email: 'pending1@neighbornet.com',
        passwordHash: await hash('Resident@123'),
        role: 'resident',
        verificationStatus: 'pending',
        neighborhood: 'Adyar',
        addressText: '15, Adyar Bridge Road, Chennai',
        location: { type: 'Point', coordinates: [80.2600, 13.0100] },
        skills: ['cooking', 'cleaning'],
        badges: [],
        trustScore: 50,
        verificationSubmission: {
          addressProofType: 'Aadhaar Card',
          neighborhoodCode: 'ADY-2024',
          localReferenceName: 'Ravi Kumar',
          submittedAt: new Date(),
        },
      },
      {
        name: 'Pending User 2',
        email: 'pending2@neighbornet.com',
        passwordHash: await hash('Resident@123'),
        role: 'resident',
        verificationStatus: 'pending',
        neighborhood: 'Velachery',
        addressText: '23, Velachery Lake Road, Chennai',
        location: { type: 'Point', coordinates: [80.2250, 12.9850] },
        skills: ['driving', 'delivery'],
        badges: [],
        trustScore: 50,
      },
    ]);

    console.log(`✅ Created ${users.length} users`);

    const [admin, organizer, ravi, meena, arjun, lakshmi, suresh, kavitha, dinesh, anitha] = users;

    // Create posts
    const posts = await Post.insertMany([
      {
        author: ravi._id,
        type: 'request',
        title: 'Water leaking below kitchen sink',
        category: 'repairs',
        description: 'Pipe is leaking under my kitchen sink and I need someone nearby who can help fix it. The leak is getting worse and water is pooling on the floor.',
        urgency: 'high',
        status: 'open',
        vicinityRadiusKm: 3,
        location: { type: 'Point', coordinates: COORDS.adyar },
        tags: ['plumbing', 'leak', 'kitchen', 'pipe', 'urgent'],
        neededByDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        author: meena._id,
        type: 'request',
        title: 'Need O+ blood donor urgently',
        category: 'blood',
        description: 'My father is admitted at Apollo Hospital and urgently needs O+ blood. Surgery is scheduled for tomorrow morning. Please help if you can donate.',
        urgency: 'critical',
        status: 'open',
        vicinityRadiusKm: 10,
        location: { type: 'Point', coordinates: COORDS.mylapore },
        tags: ['blood', 'O+', 'urgent', 'hospital', 'surgery'],
        neededByDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      },
      {
        author: suresh._id,
        type: 'offer',
        title: 'Can lend drilling machine and toolkit',
        category: 'tools',
        description: 'I have a Bosch drilling machine, hammer, screwdrivers, and basic toolkit available for lending. Available on weekends. Please return in good condition.',
        urgency: 'low',
        status: 'open',
        vicinityRadiusKm: 5,
        location: { type: 'Point', coordinates: COORDS.nungambakkam },
        tags: ['tools', 'drill', 'toolkit', 'lending', 'weekend'],
      },
      {
        author: meena._id,
        type: 'offer',
        title: 'Can deliver groceries within 3km',
        category: 'groceries',
        description: 'I go to the market every morning. Happy to pick up groceries, vegetables, milk, and essentials for elderly or disabled neighbors within 3km of Mylapore.',
        urgency: 'low',
        status: 'open',
        vicinityRadiusKm: 3,
        location: { type: 'Point', coordinates: COORDS.mylapore },
        tags: ['grocery', 'delivery', 'vegetables', 'milk', 'morning'],
      },
      {
        author: anitha._id,
        type: 'request',
        title: 'Grandmother needs medicine pickup from pharmacy',
        category: 'elderly-care',
        description: 'My grandmother is 78 years old and cannot walk to the pharmacy. She needs her regular medicines picked up from the nearby pharmacy. This is a weekly need.',
        urgency: 'medium',
        status: 'open',
        vicinityRadiusKm: 2,
        location: { type: 'Point', coordinates: COORDS.t_nagar },
        tags: ['medicine', 'elderly', 'pharmacy', 'pickup', 'senior'],
      },
      {
        author: kavitha._id,
        type: 'request',
        title: 'Need small emergency money for hospital transport',
        category: 'money-lending',
        description: 'My husband had an accident and I need Rs. 2000 for ambulance and hospital transport. Will repay within 2 weeks once insurance claim is processed.',
        urgency: 'critical',
        status: 'open',
        vicinityRadiusKm: 5,
        location: { type: 'Point', coordinates: COORDS.perambur },
        tags: ['emergency', 'money', 'hospital', 'transport', 'loan'],
        amountNeeded: 2000,
        repaymentDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      {
        author: lakshmi._id,
        type: 'offer',
        title: 'Offering evening tuition for school kids',
        category: 'education',
        description: 'I am a retired school teacher offering free evening tuition for Class 6-10 students. Subjects: Math, Science, English. Weekdays 5-7 PM at my home.',
        urgency: 'low',
        status: 'open',
        vicinityRadiusKm: 2,
        location: { type: 'Point', coordinates: COORDS.kodambakkam },
        tags: ['tuition', 'education', 'math', 'science', 'free', 'school'],
      },
      {
        author: organizer._id,
        type: 'request',
        title: 'Looking for volunteers for senior check-in drive',
        category: 'elderly-care',
        description: 'We are organizing a weekly senior citizen check-in drive in T Nagar area. Need 10 volunteers to make daily phone calls and weekend visits to elderly residents living alone.',
        urgency: 'medium',
        status: 'open',
        vicinityRadiusKm: 5,
        location: { type: 'Point', coordinates: COORDS.t_nagar },
        tags: ['volunteer', 'senior', 'elderly', 'check-in', 'community'],
      },
      {
        author: arjun._id,
        type: 'offer',
        title: 'Emergency transport available — bike and car',
        category: 'transport',
        description: 'I have a bike and can arrange a car for emergencies. Available 24/7 for medical emergencies, hospital runs, and urgent transport needs within 10km.',
        urgency: 'low',
        status: 'open',
        vicinityRadiusKm: 10,
        location: { type: 'Point', coordinates: COORDS.velachery },
        tags: ['transport', 'emergency', 'bike', 'car', 'hospital', '24x7'],
      },
      {
        author: dinesh._id,
        type: 'offer',
        title: 'Pharmacy pickup and medicine delivery for seniors',
        category: 'medical',
        description: 'I work near Anna Nagar and can pick up medicines from pharmacies on my way home. Available for elderly residents who cannot travel. No charge.',
        urgency: 'low',
        status: 'open',
        vicinityRadiusKm: 4,
        location: { type: 'Point', coordinates: COORDS.anna_nagar },
        tags: ['medicine', 'pharmacy', 'pickup', 'elderly', 'delivery', 'free'],
      },
      {
        author: ravi._id,
        type: 'request',
        title: 'Need help with elderly neighbor who feels isolated',
        category: 'elderly-care',
        description: 'My neighbor Mrs. Parvathi (82 years) lives alone and has been feeling very lonely since her children moved abroad. Looking for someone to visit or call her regularly.',
        urgency: 'medium',
        status: 'open',
        vicinityRadiusKm: 2,
        location: { type: 'Point', coordinates: [80.2580, 13.0080] },
        tags: ['elderly', 'lonely', 'isolation', 'companionship', 'senior', 'visit'],
      },
      {
        author: meena._id,
        type: 'request',
        title: 'Need blood donor — B- blood group urgently',
        category: 'blood',
        description: 'Urgent requirement for B- blood at Government General Hospital. Patient is a 45-year-old woman undergoing emergency surgery. Please contact immediately.',
        urgency: 'critical',
        status: 'open',
        vicinityRadiusKm: 15,
        location: { type: 'Point', coordinates: COORDS.mylapore },
        tags: ['blood', 'B-', 'urgent', 'surgery', 'hospital', 'emergency'],
      },
    ]);

    console.log(`✅ Created ${posts.length} posts`);

    // Create initiatives
    await Initiative.insertMany([
      {
        title: 'Senior Warm Check-in Drive — T Nagar',
        description: 'Weekly volunteer program to check in on elderly residents living alone in T Nagar. Includes phone calls, medicine pickup, and weekend visits.',
        organizer: organizer._id,
        targetCategory: 'elderly-care',
        location: { type: 'Point', coordinates: COORDS.t_nagar },
        radiusKm: 5,
        actionPlan: '1. Identify senior residents\n2. Assign volunteer pairs\n3. Schedule weekly visits\n4. Track wellbeing reports',
        status: 'active',
        requiredVolunteers: 15,
        requiredResources: ['Phone list', 'Transport', 'Medicine fund'],
      },
      {
        title: 'Community Blood Donor Registry',
        description: 'Building a verified blood donor registry for the neighborhood. Donors are notified during emergencies based on blood group and proximity.',
        organizer: organizer._id,
        targetCategory: 'blood',
        location: { type: 'Point', coordinates: COORDS.anna_nagar },
        radiusKm: 10,
        actionPlan: '1. Register donors\n2. Verify blood groups\n3. Set up emergency alert system\n4. Coordinate with hospitals',
        status: 'active',
        requiredVolunteers: 5,
        requiredResources: ['Donor registry', 'Hospital contacts', 'Emergency notification system'],
      },
    ]);

    console.log('✅ Created initiatives');

    // Create trend insights
    await TrendInsight.insertMany([
      {
        title: 'Senior Care Needs Rising — 4 requests this week',
        summary: '4 elderly care requests detected in the past 7 days. Signals include loneliness, medicine pickup, and daily check-in needs.',
        category: 'elderly-care',
        severity: 'high',
        detectedFromPosts: [posts[4]._id, posts[7]._id, posts[10]._id],
        recommendedAction: 'Launch Senior Warm Check-in Drive. Recruit volunteers for daily calls and medicine pickup.',
        affectedArea: 'T Nagar, Mylapore, Adyar',
        evidenceCount: 4,
      },
      {
        title: 'Blood Donor Urgency — 2 critical requests',
        summary: '2 critical blood donation requests detected. Immediate donor mobilization needed.',
        category: 'blood',
        severity: 'critical',
        detectedFromPosts: [posts[1]._id, posts[11]._id],
        recommendedAction: 'Activate Blood Donor Alert Network. Send emergency notifications to registered donors.',
        affectedArea: 'Mylapore, City-wide',
        evidenceCount: 2,
      },
    ]);

    console.log('✅ Created trend insights');
    console.log('\n🎉 Seed completed successfully!\n');
    console.log('Demo credentials:');
    console.log('  Admin:     admin@neighbornet.com / Admin@123');
    console.log('  Organizer: organizer@neighbornet.com / Organizer@123');
    console.log('  Resident:  resident@neighbornet.com / Resident@123\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
