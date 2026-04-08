const cron = require('node-cron');
const Grievance = require('../models/Grievance');

// Run every day at midnight (0 0 * * *)
cron.schedule('0 0 * * *', async () => {
  console.log('Running cron job to check for overdue grievances...');
  try {
    const now = new Date();

    const overdueGrievances = await Grievance.find({
      status: { $in: ['pending', 'accepted', 'in_progress'] },
      deadline: { $lt: now },
      escalatedToHigher: false,
    });

    if (overdueGrievances.length > 0) {
      console.log(`Found ${overdueGrievances.length} overdue grievances. Escalating...`);
      
      for (const grievance of overdueGrievances) {
        grievance.status = 'escalated';
        grievance.escalatedToHigher = true;
        await grievance.save();
      }
      
      console.log('Escalation complete.');
    } else {
      console.log('No overdue grievances found.');
    }
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});

console.log('Cron jobs initialized');
