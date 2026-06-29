import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zhghxalqsexpvnadjblg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ2h4YWxxc2V4cHZuYWRqYmxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODMxNTcsImV4cCI6MjA5NzE1OTE1N30.OdTPXKnD8u08IlrlcZn4qGLklxWeVJVpgK48i1nzspU';
const supabase = createClient(supabaseUrl, supabaseKey);

const mockIncidents = [
  {
    title: 'Phishing Campaign Targeting SBI Customers',
    incident_type: 'phishing',
    severity: 'high',
    description: 'Received multiple SMS messages claiming my SBI account is blocked. URL leads to a fake login page.',
    latitude: 13.0827,
    longitude: 80.2707,
    location_name: 'Chennai, Tamil Nadu',
    status: 'investigating'
  },
  {
    title: 'Ransomware Attack on Local Business',
    incident_type: 'malware',
    severity: 'critical',
    description: 'Local textile company computers locked with ransomware demanding Bitcoin.',
    latitude: 11.0168,
    longitude: 76.9558,
    location_name: 'Coimbatore, Tamil Nadu',
    status: 'open'
  },
  {
    title: 'Fraudulent UPI Payment Request',
    incident_type: 'fraud',
    severity: 'medium',
    description: 'Scammer sent a collect request on PhonePe pretending to be from electricity board.',
    latitude: 9.9252,
    longitude: 78.1198,
    location_name: 'Madurai, Tamil Nadu',
    status: 'resolved'
  },
  {
    title: 'Unauthorized Access to Email Account',
    incident_type: 'hacking',
    severity: 'high',
    description: 'Unknown IPs from Russia logging into my work email account.',
    latitude: 10.7905,
    longitude: 78.7047,
    location_name: 'Tiruchirappalli, Tamil Nadu',
    status: 'investigating'
  },
  {
    title: 'Identity Theft on Instagram',
    incident_type: 'identity_theft',
    severity: 'medium',
    description: 'Fake profile created using my photos asking friends for money.',
    latitude: 11.6643,
    longitude: 78.1460,
    location_name: 'Salem, Tamil Nadu',
    status: 'open'
  }
];

async function insertData() {
  const { data, error } = await supabase.from('incidents').insert(mockIncidents);
  if (error) {
    console.error('Error inserting data:', error);
  } else {
    console.log('Successfully inserted mock threats.');
  }
}

insertData();
