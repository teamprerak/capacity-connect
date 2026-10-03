const fs = require('fs');

const missingDashboardKeys = {
  "admin_dashboard": "Admin Command Center",
  "organization_wide_training__co": "Organization-wide training, competency, and governance oversight.",
  "value_": "Value:",
  "competency_improvement": "Competency Improvement Velocity",
  "average_verified_score_trend": "Average Verified Efficacy Score Trend",
  "_50_pts": "+5.0 pts",
  "n_a__no_data_": "Awaiting Telemetry Data",
  "department_participation": "Departmental Participation",
  "active_learners_by_training_ar": "Active Learners by Training Area",
  "recent_activity": "Recent Platform Activity",
  "latest_workflow_events": "Latest system workflow and governance events",
  "n_a__no_recent_activity_": "No recent activity recorded.",
  "pending_actions": "Pending Administrative Actions",
  "basic_reporting_governance_rev": "Operational workflows requiring governance review",
  "user_registrations": "User Registration Approvals",
  "course_proposals": "Course Publishing Proposals",
  "enrollment_requests": "Enrollment Requests",
  "n_a": "0",
  "unverified_trainers": "Unverified Trainer Applications",
  "n_a__no_pending_actions_": "No pending actions."
};

const filePath = 'apps/web/public/locales/en/common.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

Object.assign(data, missingDashboardKeys);

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully injected dashboard keys.');
