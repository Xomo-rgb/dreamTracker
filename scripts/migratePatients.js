// Migration script to update patient records from 'condition' to 'visitReason'
// Run this once: node scripts/migratePatients.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyB_jhIArbePViKiD46QP_061IW4Qf2bsrk",
  authDomain: "dreamtracker-cb0bb.firebaseapp.com",
  projectId: "dreamtracker-cb0bb",
  storageBucket: "dreamtracker-cb0bb.firebasestorage.app",
  messagingSenderId: "620865246348",
  appId: "1:620865246348:web:d9022c18d330ba6fd217a9",
  measurementId: "G-0DC1E836TC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Map old medical conditions to new generic visit reasons
const conditionToVisitReason = {
  'Diabetes Check': 'Follow-up Required',
  'Hypertension': 'Follow-up Required',
  'Heart Disease': 'Follow-up Required',
  'Asthma': 'Follow-up Required',
  'Arthritis': 'Follow-up Required',
  'Depression': 'Follow-up Required',
  'Anxiety': 'Follow-up Required',
  'Cancer': 'Follow-up Required',
  'Missed Appointment': 'Missed Appointment',
  'Follow-up': 'Follow-up Required',
  'Routine': 'Routine Check',
  'Initial': 'Initial Visit',
  'New Patient': 'Initial Visit'
};

async function migratePatients() {
  try {
    console.log('Starting patient migration...');
    
    const patientsRef = collection(db, 'patients');
    const snapshot = await getDocs(patientsRef);
    
    console.log(`Found ${snapshot.size} patients to migrate`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const patientDoc of snapshot.docs) {
      const data = patientDoc.data();
      
      // Skip if already has visitReason
      if (data.visitReason) {
        console.log(`Skipping ${data.name} - already has visitReason`);
        skipped++;
        continue;
      }
      
      // Determine visitReason based on old condition
      let visitReason = 'Follow-up Required'; // default
      
      if (data.condition) {
        visitReason = conditionToVisitReason[data.condition] || 'Follow-up Required';
      }
      
      // Update the document
      const patientRef = doc(db, 'patients', patientDoc.id);
      await updateDoc(patientRef, {
        visitReason: visitReason
        // Note: We're NOT deleting 'condition' field for safety
        // You can manually delete it later if needed
      });
      
      console.log(`✓ Updated ${data.name}: "${data.condition}" → "${visitReason}"`);
      updated++;
    }
    
    console.log('\n=== Migration Complete ===');
    console.log(`Updated: ${updated} patients`);
    console.log(`Skipped: ${skipped} patients`);
    console.log('\nNote: Old "condition" field was kept for safety.');
    console.log('You can manually delete it from Firebase Console if desired.');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migratePatients();
