const fs = require('fs');

const replacements = {
  't("value_")': '"Value: "',
  '{t("admin_dashboard")}': '"Admin Command Center"',
  '{t("organization_wide_training__co")}': '"Organization-wide training, competency, and governance oversight."',
  '{t("competency_improvement")}': '"Competency Improvement Velocity"',
  '{t("average_verified_score_trend")}': '"Average Verified Efficacy Score Trend"',
  '{t("_50_pts")}': '"+5.0 pts"',
  '{t("n_a__no_data_")}': '"Awaiting Telemetry Data"',
  '{t("department_participation")}': '"Departmental Participation"',
  '{t("active_learners_by_training_ar")}': '"Active Learners by Training Area"',
  '{t("recent_activity")}': '"Recent Platform Activity"',
  '{t("latest_workflow_events")}': '"Latest system workflow and governance events"',
  '{t("n_a__no_recent_activity_")}': '"No recent activity recorded."',
  '{t("pending_actions")}': '"Pending Administrative Actions"',
  '{t("basic_reporting_governance_rev")}': '"Operational workflows requiring governance review"',
  '{t("user_registrations")}': '"User Registration Approvals"',
  '{t("course_proposals")}': '"Course Publishing Proposals"',
  '{t("enrollment_requests")}': '"Enrollment Requests"',
  '{t("n_a")}': '"0"',
  '{t("unverified_trainers")}': '"Unverified Trainer Applications"',
  '{t("n_a__no_pending_actions_")}': '"No pending actions."'
};

let content = fs.readFileSync('apps/web/app/admin/dashboard/page.tsx', 'utf8');

for (const [key, value] of Object.entries(replacements)) {
  content = content.split(key).join(value);
}

fs.writeFileSync('apps/web/app/admin/dashboard/page.tsx', content, 'utf8');
console.log('Replaced all broken i18n keys with polished English text.');
