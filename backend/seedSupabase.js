const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ojibuhaovoohpzmorsek.supabase.co',
  'sb_publishable_bCVStqQKXoxLmDZngGhQUg_EW1ZohXf'
);

const expertsData = [
  {
    name: 'Sarah Jenkins',
    category: 'Technology',
    designation: 'Senior Cloud Architect',
    company: 'TechFlow Solutions',
    experience: 8,
    rating: 4.9,
    total_reviews: 124,
    hourly_rate: 150,
    bio: 'Specializing in AWS and cloud-native architecture. I help startups scale their infrastructure efficiently.',
    skills: ['AWS', 'Kubernetes', 'Microservices', 'Node.js'],
    avatar: 'https://i.pravatar.cc/150?img=47',
    is_active: true
  },
  {
    name: 'Michael Chen',
    category: 'Finance',
    designation: 'Investment Strategist',
    company: 'Capital Ridge',
    experience: 12,
    rating: 4.8,
    total_reviews: 89,
    hourly_rate: 200,
    bio: 'Former Wall Street analyst helping individuals and small businesses optimize their investment portfolios.',
    skills: ['Portfolio Management', 'Crypto', 'Tax Strategy'],
    avatar: 'https://i.pravatar.cc/150?img=11',
    is_active: true
  }
];

async function seed() {
  console.log('Seeding Supabase Database...');
  
  const { data: insertedExperts, error: expertError } = await supabase
    .from('experts')
    .insert(expertsData)
    .select();

  if (expertError) {
    console.error('Failed to seed experts:', expertError);
    return;
  }

  console.log('Experts seeded successfully!');

  // Create some slots for the first expert
  const slotsData = [
    {
      expert_id: insertedExperts[0].id,
      date: '2023-12-01',
      time: '09:00 AM',
      is_booked: false
    },
    {
      expert_id: insertedExperts[0].id,
      date: '2023-12-01',
      time: '10:00 AM',
      is_booked: false
    }
  ];

  const { error: slotError } = await supabase
    .from('expert_slots')
    .insert(slotsData);

  if (slotError) {
    console.error('Failed to seed slots:', slotError);
  } else {
    console.log('Slots seeded successfully!');
  }
}

seed();
