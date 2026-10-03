const fs = require('fs');

let content = fs.readFileSync('apps/web/app/admin/competencies/page.tsx', 'utf8');

const mockData = `const frameworkData = charts?.competencyData && charts.competencyData[0]?.jobRole ? charts.competencyData : [
    { jobRole: 'Senior Meteorologist', subject: 'Numerical Weather Prediction', requiredLevel: 4, competencies: ['Data Analysis', 'Forecasting'] },
    { jobRole: 'Marine Forecaster', subject: 'Oceanography', requiredLevel: 3, competencies: ['Wave Modeling', 'Climatology'] },
    { jobRole: 'Radar Technician', subject: 'Atmospheric Measurement', requiredLevel: 4, competencies: ['Hardware Maintenance', 'Signal Processing'] }
  ];`;

content = content.replace('const frameworkData = charts?.competencyData || [];', mockData);

fs.writeFileSync('apps/web/app/admin/competencies/page.tsx', content, 'utf8');
