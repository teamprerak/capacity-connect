if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://ccuser:ccpassword@localhost:5433/capacityconnect';
}

import {
  PrismaClient,
  UserStatus,
  VerificationStatus,
  CourseStatus,
  Difficulty,
  EnrollmentStatus,
  ProgressStatus,
  AssessmentType,
  QuestionType,
  GapClassification,
  EvidenceType,
} from '../generated/client/index.js';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';

const prisma = new PrismaClient();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting Capacity Connect Phase 3 Database Seeding (MoES Edition)...');

  // ── 1. Clean Database ──────────────────────────────────────────────────────
  console.log('🧹 Cleaning existing data...');
  await prisma.competencyEvidence.deleteMany();
  await prisma.certificateVerification.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.trainerMatchScore.deleteMany();
  await prisma.assessmentAnswer.deleteMany();
  await prisma.assessmentAttempt.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.assessmentQuestion.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.courseProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.courseModule.deleteMany();
  await prisma.coursePrerequisite.deleteMany();
  await prisma.courseSkill.deleteMany();
  await prisma.course.deleteMany();
  await prisma.courseCategory.deleteMany();
  await prisma.trainerAvailability.deleteMany();
  await prisma.trainerExpertise.deleteMany();
  await prisma.skillGapAnalysis.deleteMany();
  await prisma.traineeCompetency.deleteMany();
  await prisma.competencySkill.deleteMany();
  await prisma.competency.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.proficiencyLevel.deleteMany();
  await prisma.qualification.deleteMany();
  await prisma.workExperience.deleteMany();
  await prisma.interest.deleteMany();
  await prisma.externalCertificate.deleteMany();
  await prisma.traineeProfile.deleteMany();
  await prisma.trainerProfile.deleteMany();
  await prisma.department.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  // ── 2. Roles ───────────────────────────────────────────────────────────────
  console.log('🔐 Seeding Roles...');
  const roleAdmin   = await prisma.role.create({ data: { name: 'admin' } });
  const roleTrainer = await prisma.role.create({ data: { name: 'trainer' } });
  const roleTrainee = await prisma.role.create({ data: { name: 'trainee' } });

  // ── 3. Proficiency Levels ──────────────────────────────────────────────────
  console.log('📊 Seeding Proficiency Levels...');
  for (const l of [
    { levelNumber: 1, label: 'Novice' },
    { levelNumber: 2, label: 'Beginner' },
    { levelNumber: 3, label: 'Intermediate' },
    { levelNumber: 4, label: 'Advanced' },
    { levelNumber: 5, label: 'Expert' },
  ]) {
    await prisma.proficiencyLevel.create({ data: l });
  }

  // ── 4. Departments ─────────────────────────────────────────────────────────
  console.log('🏢 Seeding MoES Departments...');
  const deptSeismo   = await prisma.department.create({ data: { name: 'Seismology & Geophysics',       description: 'Earthquake monitoring, seismic hazard assessment, and geophysical surveys' } });
  const deptOcean    = await prisma.department.create({ data: { name: 'Ocean & Coastal Sciences',      description: 'Oceanography, coastal zone management, and marine biodiversity' } });
  const deptAtmos    = await prisma.department.create({ data: { name: 'Atmospheric Sciences',          description: 'Meteorology, climate science, and atmospheric dynamics' } });
  const deptGeo      = await prisma.department.create({ data: { name: 'Geological Survey & Mapping',  description: 'Geological mapping, mineral resource assessment, and remote sensing' } });
  const deptClimate  = await prisma.department.create({ data: { name: 'Climate & Environment',         description: 'Climate change research, environmental monitoring, and carbon studies' } });
  const deptIT       = await prisma.department.create({ data: { name: 'Data & IT Services',            description: 'Geospatial data infrastructure, HPC, and scientific computing' } });

  // ── 5. Skills ──────────────────────────────────────────────────────────────
  console.log('💡 Seeding MoES Earth Science Skills...');

  const skillSeismology        = await prisma.skill.create({ data: { name: 'Seismology Fundamentals',          category: 'Earth Sciences',      description: 'Earthquake mechanics, wave propagation, and seismic station operation' } });
  const skillSeismicHazard     = await prisma.skill.create({ data: { name: 'Seismic Hazard Assessment',        category: 'Earth Sciences',      description: 'Probabilistic seismic hazard analysis and risk mapping' } });
  const skillGeophysics        = await prisma.skill.create({ data: { name: 'Applied Geophysics',               category: 'Earth Sciences',      description: 'Gravity, magnetic, and resistivity surveys for subsurface imaging' } });
  const skillOceanography      = await prisma.skill.create({ data: { name: 'Physical Oceanography',            category: 'Ocean Sciences',      description: 'Ocean circulation, thermohaline dynamics, and tide modeling' } });
  const skillCoastalManagement = await prisma.skill.create({ data: { name: 'Coastal Zone Management',          category: 'Ocean Sciences',      description: 'Shoreline change analysis and coastal erosion mitigation' } });
  const skillMarineBio         = await prisma.skill.create({ data: { name: 'Marine Biodiversity Monitoring',   category: 'Ocean Sciences',      description: 'Coral reef surveys, fish stock assessment, and EIA for coastal projects' } });
  const skillMeteorology       = await prisma.skill.create({ data: { name: 'Meteorology & Weather Forecasting',category: 'Atmospheric Sciences',description: 'Numerical weather prediction, synoptic analysis, and NWP model interpretation' } });
  const skillClimateModeling   = await prisma.skill.create({ data: { name: 'Climate Modeling & Projection',    category: 'Atmospheric Sciences',description: 'General circulation models, RCP scenarios, and downscaling techniques' } });
  const skillRemoteSensing     = await prisma.skill.create({ data: { name: 'Remote Sensing & GIS',             category: 'Geospatial',          description: 'Satellite image analysis, NDVI mapping, and ArcGIS/QGIS workflows' } });
  const skillGeoMapping        = await prisma.skill.create({ data: { name: 'Geological Mapping',               category: 'Geological Survey',   description: 'Structural geology, stratigraphy, and field mapping techniques' } });
  const skillMineralResources  = await prisma.skill.create({ data: { name: 'Mineral Resource Assessment',      category: 'Geological Survey',   description: 'Resource estimation, ore deposit modeling, and economic geology' } });
  const skillClimateChange     = await prisma.skill.create({ data: { name: 'Climate Change Science',           category: 'Climate Sciences',    description: 'Greenhouse gas accounting, IPCC methodologies, and climate risk assessment' } });
  const skillEnvMonitoring     = await prisma.skill.create({ data: { name: 'Environmental Monitoring',         category: 'Climate Sciences',    description: 'Air/water/soil quality monitoring networks and sensor data analysis' } });
  const skillScientificData    = await prisma.skill.create({ data: { name: 'Scientific Data Management',       category: 'Data & Computing',   description: 'NetCDF, HDF5, metadata standards, and geospatial databases' } });
  const skillHPC               = await prisma.skill.create({ data: { name: 'High-Performance Computing',      category: 'Data & Computing',   description: 'Parallel computing, MPI/OpenMP, and HPC cluster job scheduling' } });

  // Generic professional skills (needed for onboarding quiz mapping)
  const skillCommunication  = await prisma.skill.create({ data: { name: 'Communication',   category: 'Professional Skills', description: 'Effective written and verbal communication in scientific and institutional contexts' } });
  const skillLeadership     = await prisma.skill.create({ data: { name: 'Leadership',      category: 'Professional Skills', description: 'Team leadership, mentoring, and cross-functional coordination' } });
  const skillTechnicalSkills= await prisma.skill.create({ data: { name: 'Technical Skills',category: 'Professional Skills', description: 'Core domain-specific technical proficiency' } });
  const skillTimeManagement = await prisma.skill.create({ data: { name: 'Time Management', category: 'Professional Skills', description: 'Planning, prioritization, and deadline management' } });
  const skillProblemSolving = await prisma.skill.create({ data: { name: 'Problem Solving', category: 'Professional Skills', description: 'Analytical thinking and structured approach to resolving complex challenges' } });

  // ── 6. Competencies ────────────────────────────────────────────────────────
  console.log('🧠 Seeding Competency Framework...');

  const compSeismology = await prisma.competency.create({
    data: { name: 'Seismology & Earthquake Science', category: 'Earth Sciences', description: 'Understanding and application of seismological principles for monitoring and hazard assessment' },
  });
  const compOcean = await prisma.competency.create({
    data: { name: 'Oceanographic Research', category: 'Ocean Sciences', description: 'Physical, chemical and biological oceanography for coastal and deep-water environments' },
  });
  const compAtmosphere = await prisma.competency.create({
    data: { name: 'Atmospheric & Climate Science', category: 'Atmospheric Sciences', description: 'Integrated atmospheric dynamics and climate projection capabilities' },
  });
  const compGeospatial = await prisma.competency.create({
    data: { name: 'Geospatial & Geological Analysis', category: 'Geospatial', description: 'Remote sensing, GIS, and field-based geological mapping and resource assessment' },
  });
  const compClimate = await prisma.competency.create({
    data: { name: 'Climate Change & Environmental Management', category: 'Climate Sciences', description: 'Climate risk assessment, emissions accounting, and environmental monitoring systems' },
  });
  const compDataScience = await prisma.competency.create({
    data: { name: 'Scientific Data & HPC', category: 'Data & Computing', description: 'Managing scientific datasets, running numerical models on HPC clusters' },
  });
  const compProfessional = await prisma.competency.create({
    data: { name: 'Professional Effectiveness', category: 'Professional Skills', description: 'Core soft skills for institutional capacity building' },
  });

  await prisma.competencySkill.createMany({
    data: [
      { competencyId: compSeismology.id, skillId: skillSeismology.id },
      { competencyId: compSeismology.id, skillId: skillSeismicHazard.id },
      { competencyId: compSeismology.id, skillId: skillGeophysics.id },
      { competencyId: compOcean.id, skillId: skillOceanography.id },
      { competencyId: compOcean.id, skillId: skillCoastalManagement.id },
      { competencyId: compOcean.id, skillId: skillMarineBio.id },
      { competencyId: compAtmosphere.id, skillId: skillMeteorology.id },
      { competencyId: compAtmosphere.id, skillId: skillClimateModeling.id },
      { competencyId: compGeospatial.id, skillId: skillRemoteSensing.id },
      { competencyId: compGeospatial.id, skillId: skillGeoMapping.id },
      { competencyId: compGeospatial.id, skillId: skillMineralResources.id },
      { competencyId: compClimate.id, skillId: skillClimateChange.id },
      { competencyId: compClimate.id, skillId: skillEnvMonitoring.id },
      { competencyId: compDataScience.id, skillId: skillScientificData.id },
      { competencyId: compDataScience.id, skillId: skillHPC.id },
      { competencyId: compProfessional.id, skillId: skillCommunication.id },
      { competencyId: compProfessional.id, skillId: skillLeadership.id },
      { competencyId: compProfessional.id, skillId: skillTechnicalSkills.id },
      { competencyId: compProfessional.id, skillId: skillTimeManagement.id },
      { competencyId: compProfessional.id, skillId: skillProblemSolving.id },
    ],
  });

  // ── 7. Password ────────────────────────────────────────────────────────────
  const defaultPassword = 'Password123!';
  const passwordHash    = await argon2.hash(defaultPassword);

  // ── 8. Admin ───────────────────────────────────────────────────────────────
  console.log('👑 Seeding Admin...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@capacityconnect.org',
      passwordHash,
      status: UserStatus.active,
      emailVerifiedAt: new Date(),
      onboardingCompleted: true,
      userRoles: { create: { roleId: roleAdmin.id } },
    },
  });

  // ── 9. Trainers (8 MoES domain experts) ───────────────────────────────────
  console.log('👨‍🏫 Seeding MoES Expert Trainers...');

  const trainerDefs = [
    { email: 'trainer.seismo@capacityconnect.org',   name: 'Dr. Ananya Krishnamurthy', dept: deptSeismo,  exp: 18, rating: 4.95, skills: [{ s: skillSeismology, l: 5, c: true }, { s: skillSeismicHazard, l: 5, c: true }, { s: skillGeophysics, l: 4, c: false }] },
    { email: 'trainer.geophysics@capacityconnect.org',name: 'Dr. Rajiv Sharma',          dept: deptGeo,     exp: 15, rating: 4.88, skills: [{ s: skillGeophysics, l: 5, c: true }, { s: skillGeoMapping, l: 5, c: true }, { s: skillRemoteSensing, l: 4, c: false }] },
    { email: 'trainer.ocean@capacityconnect.org',    name: 'Dr. Priya Nair',            dept: deptOcean,   exp: 14, rating: 4.82, skills: [{ s: skillOceanography, l: 5, c: true }, { s: skillCoastalManagement, l: 4, c: true }, { s: skillMarineBio, l: 3, c: false }] },
    { email: 'trainer.atmos@capacityconnect.org',    name: 'Dr. Suresh Gupta',          dept: deptAtmos,   exp: 16, rating: 4.90, skills: [{ s: skillMeteorology, l: 5, c: true }, { s: skillClimateModeling, l: 5, c: true }, { s: skillClimateChange, l: 4, c: false }] },
    { email: 'trainer.gis@capacityconnect.org',      name: 'Ms. Kavitha Reddy',         dept: deptGeo,     exp: 12, rating: 4.75, skills: [{ s: skillRemoteSensing, l: 5, c: true }, { s: skillGeoMapping, l: 4, c: false }, { s: skillMineralResources, l: 3, c: false }] },
    { email: 'trainer.climate@capacityconnect.org',  name: 'Dr. Mohan Lal',             dept: deptClimate, exp: 13, rating: 4.87, skills: [{ s: skillClimateChange, l: 5, c: true }, { s: skillEnvMonitoring, l: 5, c: true }, { s: skillClimateModeling, l: 4, c: false }] },
    { email: 'trainer.data@capacityconnect.org',     name: 'Dr. Siddharth Menon',       dept: deptIT,      exp: 10, rating: 4.80, skills: [{ s: skillScientificData, l: 5, c: true }, { s: skillHPC, l: 4, c: false }, { s: skillRemoteSensing, l: 3, c: false }] },
    { email: 'trainer.marine@capacityconnect.org',   name: 'Dr. Lalitha Varma',         dept: deptOcean,   exp: 11, rating: 4.78, skills: [{ s: skillMarineBio, l: 5, c: true }, { s: skillOceanography, l: 4, c: false }, { s: skillCoastalManagement, l: 4, c: true }] },
  ];

  const trainers: any[] = [];
  for (const t of trainerDefs) {
    const user = await prisma.user.create({
      data: {
        email: t.email,
        passwordHash,
        status: UserStatus.active,
        emailVerifiedAt: new Date(),
        onboardingCompleted: true,
        userRoles: { create: { roleId: roleTrainer.id } },
      },
    });
    const profile = await prisma.trainerProfile.create({
      data: {
        userId: user.id,
        departmentId: t.dept.id,
        bio: `${t.name} is a senior MoES specialist with ${t.exp} years of field and research experience.`,
        jobTitle: `Senior Specialist — ${t.dept.name}`,
        verificationStatus: VerificationStatus.verified,
        yearsExperience: t.exp,
        trainerRatingAvg: t.rating,
        availability: {
          create: [
            { dayOfWeek: 1, startTime: '09:00', endTime: '12:00', timezone: 'Asia/Kolkata' },
            { dayOfWeek: 3, startTime: '14:00', endTime: '17:00', timezone: 'Asia/Kolkata' },
          ],
        },
      },
    });
    await prisma.rating.create({ data: { trainerId: profile.id, avgRating: t.rating, totalRatings: Math.floor(t.exp * 4) } });
    for (const sk of t.skills) {
      await prisma.trainerExpertise.create({
        data: { trainerProfileId: profile.id, skillId: sk.s.id, proficiencyLevel: sk.l, certified: sk.c, yearsExperience: t.exp },
      });
    }
    trainers.push({ user, profile, name: t.name });
  }

  // ── 10. Course Categories ──────────────────────────────────────────────────
  console.log('📚 Seeding MoES Course Categories...');
  const catSeismo   = await prisma.courseCategory.create({ data: { name: 'Seismology & Geophysics' } });
  const catOcean    = await prisma.courseCategory.create({ data: { name: 'Ocean & Coastal Sciences' } });
  const catAtmos    = await prisma.courseCategory.create({ data: { name: 'Atmospheric Sciences' } });
  const catGeo      = await prisma.courseCategory.create({ data: { name: 'Geology & Remote Sensing' } });
  const catClimate  = await prisma.courseCategory.create({ data: { name: 'Climate & Environment' } });
  const catData     = await prisma.courseCategory.create({ data: { name: 'Scientific Data & HPC' } });

  // ── 11. Courses (24 MoES Courses) ─────────────────────────────────────────
  console.log('🎓 Seeding 24 MoES Courses...');

  const courseDefs = [
    // ─── Seismology (4 courses) ───────────────────────────────────────────
    {
      title: 'Introduction to Seismology & Earthquake Monitoring',
      cat: catSeismo, trainer: trainers[0], diff: Difficulty.beginner, dur: 360,
      skills: [skillSeismology],
      desc: 'Fundamentals of seismic wave theory, earthquake source mechanics, and seismic network operations for national monitoring programs.',
      modules: [
        { title: 'Seismic Wave Types: P, S, Love & Rayleigh Waves', order: 1, type: 'text', text: 'Seismic waves are mechanical waves that propagate through the Earth following an earthquake. P-waves (primary) are compressional, travel fastest (~6-8 km/s in crust), and are the first to arrive at seismic stations. S-waves (secondary) are shear waves (~3.5-4.5 km/s), cannot travel through liquids. Surface waves (Love and Rayleigh) are slower but cause most structural damage.\n\n**Key formula for P-wave velocity:** Vp = √((K + 4/3 G) / ρ)\nwhere K = bulk modulus, G = shear modulus, ρ = density.\n\n**Exercise:** A seismograph records P-wave arrival at T=0 and S-wave at T=8 seconds. Using Vp=6 km/s and Vs=3.5 km/s, estimate the epicenter distance using the S-P time method.' },
        { title: 'Seismic Station Setup & Instrument Calibration', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=1oW_m1o1wEI' },
        { title: 'Earthquake Magnitude Scales: ML, Mb, Ms, Mw', order: 3, type: 'text', text: 'Different magnitude scales were developed for different contexts:\n\n- **Local Magnitude (ML)**: Richter scale, for regional earthquakes up to ~600 km\n- **Body-wave magnitude (mb)**: Uses P-wave amplitudes at 1 Hz\n- **Surface-wave magnitude (Ms)**: Uses 20-second surface waves\n- **Moment Magnitude (Mw)**: Most physically meaningful, based on seismic moment: M0 = μ × A × D where μ = shear modulus, A = fault area, D = average displacement\n\nMw is now the international standard and does not saturate for large earthquakes unlike older scales.' },
        { title: 'Seismogram Reading & Phase Identification', order: 4, type: 'hybrid', video: 'https://www.youtube.com/watch?v=3c-iZaI7f-0', text: 'A seismogram displays ground motion versus time. Key phases to identify: Pn (head wave), Pg (direct P), Sg (direct S), Lg (crustal guided waves). Practice reading seismograms from the Indian Seismological Observation Network (ISON).' },
        { title: 'Earthquake Location Methods & Inversion Techniques', order: 5, type: 'text', text: 'Earthquake location requires at least 3 stations. Methods include: Geiger method (iterative least-squares), Joint Hypocenter Determination (JHD), and waveform cross-correlation. Modern networks use SeisComp3 software for real-time processing. Accuracy depends on velocity model quality and station coverage.' },
      ],
    },
    {
      title: 'Seismic Hazard Assessment & Risk Mapping',
      cat: catSeismo, trainer: trainers[0], diff: Difficulty.advanced, dur: 480,
      skills: [skillSeismicHazard, skillSeismology],
      desc: 'Probabilistic Seismic Hazard Analysis (PSHA) for building codes, land use planning, and critical infrastructure siting in seismically active zones.',
      modules: [
        { title: 'Seismotectonic Framework of India', order: 1, type: 'text', text: 'India sits on the Indian Plate, which collides with the Eurasian Plate at ~5 cm/year. Key seismic zones: Zone V (very high — Himalayan belt, Andaman), Zone IV (high — Indo-Gangetic plain, NE India), Zone III (moderate), Zones I-II (low). Major faults: Main Central Thrust (MCT), Main Boundary Thrust (MBT), Main Frontal Thrust (MFT).' },
        { title: 'Probabilistic Seismic Hazard Analysis (PSHA) Methodology', order: 2, type: 'text', text: 'PSHA integrates uncertainty in earthquake occurrence, location, and ground motion. Key steps:\n1. Identify seismic sources (faults, areal zones)\n2. Characterize recurrence (Gutenberg-Richter: log N = a - bM)\n3. Select Ground Motion Prediction Equations (GMPEs)\n4. Compute hazard curves (PGA vs. Annual Probability of Exceedance)\n5. Generate hazard maps at target return periods (475yr, 2475yr)' },
        { title: 'Ground Motion Prediction Equations (GMPEs)', order: 3, type: 'video', video: 'https://www.youtube.com/watch?v=1oW_m1o1wEI' },
        { title: 'Site Response & Microzonation', order: 4, type: 'text', text: 'Local site conditions amplify ground motion. Vs30 (average shear-wave velocity in top 30m) is the standard site parameter. NEHRP site classes: A (hard rock, Vs30>1500 m/s) to F (special soils). Microzonation maps combine hazard + site response + liquefaction potential.' },
        { title: 'Risk Assessment & Loss Estimation', order: 5, type: 'hybrid', video: 'https://www.youtube.com/watch?v=3c-iZaI7f-0', text: 'Seismic risk = Hazard × Exposure × Vulnerability. Tools: OpenQuake, HAZUS. Fragility curves relate ground motion intensity to building damage probability. Loss estimation supports prioritization of retrofitting programs.' },
      ],
    },
    {
      title: 'Applied Geophysics: Surveys & Subsurface Imaging',
      cat: catSeismo, trainer: trainers[1], diff: Difficulty.intermediate, dur: 420,
      skills: [skillGeophysics],
      desc: 'Field geophysical methods including gravity, magnetics, resistivity, and seismic refraction for geological mapping and resource exploration.',
      modules: [
        { title: 'Gravity Survey Methods & Bouguer Anomaly Interpretation', order: 1, type: 'text', text: 'Gravimeters measure variations in Earth\'s gravitational field (in milligals, mGal). Corrections applied: Free-air, Bouguer, terrain, latitude, tidal, and instrument drift. Bouguer anomaly = observed gravity - theoretical gravity - free-air correction + Bouguer correction. Negative Bouguer anomalies indicate low-density material (mountains, sediment basins); positive anomalies indicate dense material (mafic rocks, ore bodies).' },
        { title: 'Magnetic Surveying & Aeromagnetic Interpretation', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=1oW_m1o1wEI' },
        { title: 'Electrical Resistivity Tomography (ERT)', order: 3, type: 'text', text: 'ERT images subsurface resistivity variations. Common arrays: Schlumberger, Wenner, dipole-dipole. Low resistivity (<10 Ωm): clay, saline water, graphite. High resistivity (>1000 Ωm): granite, dry sand. Applications: groundwater exploration, fault mapping, archaeological surveys, pollution mapping.' },
        { title: 'Seismic Refraction & MASW', order: 4, type: 'hybrid', video: 'https://www.youtube.com/watch?v=3c-iZaI7f-0', text: 'Seismic refraction uses critically refracted waves to map velocity interfaces. Multi-channel Analysis of Surface Waves (MASW) derives shear-wave velocity profiles for site characterization. MASW produces a Vs30 profile essential for seismic microzonation.' },
      ],
    },
    {
      title: 'Seismology Case Study: The Bhuj 2001 Earthquake',
      cat: catSeismo, trainer: trainers[0], diff: Difficulty.intermediate, dur: 300,
      skills: [skillSeismology, skillSeismicHazard],
      desc: 'In-depth case study of the Mw 7.7 Bhuj earthquake: source characterization, site effects, societal impact, and lessons for national seismic preparedness.',
      modules: [
        { title: 'Tectonic Setting & Source Characterization', order: 1, type: 'text', text: 'The January 26, 2001 Bhuj earthquake (Mw 7.7) occurred in the Kachchh rift basin, Gujarat. The earthquake ruptured a blind reverse fault (South Wagad Fault) within an intraplate setting. Fault dimensions: ~40 km length, ~30 km down-dip width, maximum slip ~10 m. The intraplate setting made it scientifically significant — high stress accumulation in stable continental regions can produce very large earthquakes with long recurrence intervals.' },
        { title: 'Ground Motion & Site Amplification Effects', order: 2, type: 'hybrid', video: 'https://www.youtube.com/watch?v=1oW_m1o1wEI', text: 'Bhuj produced PGA values exceeding 1g near the epicenter. Significant amplification observed in Ahmedabad (~250 km away) due to thick alluvial deposits. The 2001 event triggered the first systematic microzonation study of Indian cities. Key lesson: site response can cause damage far from the epicenter, especially in soft-soil cities built on river deposits.' },
        { title: 'Socioeconomic Impact & Emergency Response Evaluation', order: 3, type: 'text', text: '~13,805 deaths, 166,000 injuries, 339,000 homes destroyed. Economic losses estimated at USD 5 billion. Post-event evaluation found: widespread non-engineered construction, lack of awareness of seismic zone, inadequate enforcement of building codes. This led to major revisions in BIS 1893:2002 (Indian seismic design code).' },
        { title: 'Policy Changes & Preparedness Improvements', order: 4, type: 'text', text: 'Post-Bhuj reforms: Establishment of National Disaster Management Authority (NDMA), revision of building codes, deployment of 62 additional broadband seismic stations across Gujarat, real-time earthquake early warning research initiation, and mandatory seismic hazard assessment for all critical infrastructure.' },
      ],
    },

    // ─── Ocean Sciences (4 courses) ───────────────────────────────────────
    {
      title: 'Physical Oceanography: Circulation & Dynamics',
      cat: catOcean, trainer: trainers[2], diff: Difficulty.intermediate, dur: 360,
      skills: [skillOceanography],
      desc: 'Ocean current systems, thermohaline circulation, tidal dynamics, and mesoscale eddies relevant to India\'s EEZ and monsoon forecasting.',
      modules: [
        { title: 'Indian Ocean Circulation: Monsoon-Driven Dynamics', order: 1, type: 'text', text: 'The Indian Ocean is unique — it reverses circulation seasonally driven by the Asian monsoon. Summer monsoon (SW): Somali Current flows northward, upwelling off Oman/Somalia creates one of the world\'s most productive fisheries. Winter monsoon (NE): circulation reversal, warm pool in Bay of Bengal. The Indonesian Throughflow connects Indian and Pacific Oceans and influences global thermohaline circulation.' },
        { title: 'ARGO Float Data & Ocean Heat Content Analysis', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=1oW_m1o1wEI' },
        { title: 'Tidal Prediction & Extreme Sea Level Events', order: 3, type: 'text', text: 'Tidal prediction uses harmonic analysis: sea level = Σ Aₙ cos(σₙt - φₙ) where Aₙ = amplitude, σₙ = angular frequency, φₙ = phase for each tidal constituent. Major constituents: M2 (principal lunar, 12.42hr), S2 (principal solar, 12hr), K1, O1. Surge modeling combines tidal prediction with storm surge from numerical models (ADCIRC, SCHISM).' },
        { title: 'Ocean Remote Sensing: Altimetry & SST Mapping', order: 4, type: 'hybrid', video: 'https://www.youtube.com/watch?v=3c-iZaI7f-0', text: 'Satellite altimetry (TOPEX/Poseidon, Jason series) measures sea surface height to detect currents, eddies, and El Niño. Sea Surface Temperature (SST) from MODIS, VIIRS helps track monsoon onset, fishery productivity zones, and coral bleaching events.' },
      ],
    },
    {
      title: 'Coastal Zone Management & Shoreline Dynamics',
      cat: catOcean, trainer: trainers[2], diff: Difficulty.intermediate, dur: 360,
      skills: [skillCoastalManagement],
      desc: 'Coastal geomorphology, erosion assessment, CRZ regulations, and vulnerability mapping for India\'s 7,500 km coastline.',
      modules: [
        { title: 'Indian Coastal Geomorphology & Classification', order: 1, type: 'text', text: 'India\'s coastline spans 7,516 km with diverse geomorphology: deltaic coasts (Krishna, Godavari, Mahanadi, Ganga), rocky coasts (Konkan, Kerala), sandy beach-barrier systems, and mangrove-fringed coasts. Western coast (Arabian Sea): mostly cliffed, narrow shelf. Eastern coast (Bay of Bengal): broad continental shelf, major deltas, more vulnerable to cyclones.' },
        { title: 'Shoreline Change Analysis using DSAS', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=1oW_m1o1wEI' },
        { title: 'Coastal Regulation Zone (CRZ) Notification 2019', order: 3, type: 'text', text: 'CRZ 2019 classifies coastal areas: CRZ-I (ecologically sensitive), CRZ-II (built-up areas within municipal limits), CRZ-III (rural areas), CRZ-IV (Andaman & Nicobar, Lakshadweep). HTL/LTL determination methods: seasonal averaging, tidal predictions. CRZ management plans must integrate climate change projections for sea level rise.' },
        { title: 'Coastal Vulnerability Index & Adaptation Strategies', order: 4, type: 'text', text: 'CVI = √(Var1 × Var2 × ... × Varn) / n where variables include: geomorphology, coastal slope, relative sea-level change, shoreline erosion/accretion rate, mean tidal range, mean significant wave height. CVI ranges from 1 (low) to 5 (very high vulnerability). Adaptation measures: living shorelines, managed retreat, beach nourishment, hybrid grey-green infrastructure.' },
      ],
    },
    {
      title: 'Marine Biodiversity & Fisheries Impact Assessment',
      cat: catOcean, trainer: trainers[7], diff: Difficulty.beginner, dur: 300,
      skills: [skillMarineBio],
      desc: 'Marine ecosystems, coral reef ecology, fish stock assessment methods, and environmental impact assessment for coastal development projects.',
      modules: [
        { title: 'Indian Marine Ecosystems: Coral Reefs, Mangroves & Seagrass', order: 1, type: 'text', text: 'India harbors reef systems in: Lakshadweep (atolls), Andaman & Nicobar (barrier/fringing reefs), Gulf of Mannar (patch reefs), Gulf of Kutch. Mangrove cover: ~4,992 km² (Sundarbans being the world\'s largest). Seagrass meadows support dugong populations in Gulf of Mannar. All three ecosystems are critical blue carbon stores and nursery habitats.' },
        { title: 'Coral Bleaching Monitoring Protocols', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=1oW_m1o1wEI' },
        { title: 'Fish Stock Assessment Methods', order: 3, type: 'text', text: 'Stock assessment models: Surplus Production Models (Schaefer, Fox), Length-Frequency Analysis, Virtual Population Analysis (VPA). Maximum Sustainable Yield (MSY): harvest level that maintains maximum long-term yield. Reference points: FMSY, BMSY. Indian fisheries: ~9.17 million tonnes annual production, 1.4 million active fishing vessels.' },
        { title: 'EIA Methodology for Coastal Infrastructure', order: 4, type: 'text', text: 'Coastal EIA under EIA Notification 2006: scoping, baseline data collection (12 months), impact prediction, mitigation planning, and Environmental Management Plan (EMP). Significant impacts to assess: dredging effects on seabed communities, turbidity plumes, loss of mangroves, disruption of turtle nesting beaches, noise from pile driving.' },
      ],
    },
    {
      title: 'Tsunami Science & Early Warning Systems',
      cat: catOcean, trainer: trainers[2], diff: Difficulty.advanced, dur: 420,
      skills: [skillOceanography, skillSeismicHazard],
      desc: 'Tsunami generation physics, propagation modeling, inundation assessment, and the Indian Tsunami Early Warning System (ITEWS) operation.',
      modules: [
        { title: 'Tsunami Generation: Earthquakes, Landslides & Volcanoes', order: 1, type: 'text', text: 'Tsunamis are generated by sudden vertical seafloor displacement. Generation condition: Mw ≥ 7.5, shallow focal depth (<70 km), tsunamigenic fault mechanism (thrust). Energy transfer efficiency depends on fault area and slip rate. The 2004 Indian Ocean tsunami (Mw 9.2, Sumatra-Andaman fault) displaced a fault segment ~1,300 km long, generating waves that traversed the entire Indian Ocean.' },
        { title: 'Tsunami Propagation Modeling with MOST/COMCOT', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=3c-iZaI7f-0' },
        { title: 'Indian Tsunami Early Warning System (ITEWS)', order: 3, type: 'text', text: 'ITEWS (established 2007 at INCOIS, Hyderabad) operates:\n- 17 real-time seismic stations\n- 12 bottom pressure recorders (BPR/DART buoys)\n- 30+ tide gauges\n- Decision Support System for alert generation in <30 minutes\nAlert levels: Warning (for exposed coasts), Watch, Advisory, and Information bulletins. Integration with IOWave international exercises.' },
        { title: 'Inundation Modeling & Community Preparedness', order: 4, type: 'text', text: 'High-resolution inundation models use coastal DEMs at 10-30m resolution. Output: maximum water height, flow velocity, inundation extent. Results drive: evacuation route planning, vertical evacuation structure siting, signage and community mock drill design. India has conducted >100 community mock drills since 2004.' },
      ],
    },

    // ─── Atmospheric Sciences (4 courses) ─────────────────────────────────
    {
      title: 'Meteorology & Numerical Weather Prediction',
      cat: catAtmos, trainer: trainers[3], diff: Difficulty.intermediate, dur: 480,
      skills: [skillMeteorology],
      desc: 'Synoptic meteorology, mesoscale dynamics, and operational NWP model interpretation for weather forecasting in India\'s diverse climate zones.',
      modules: [
        { title: 'Atmospheric Thermodynamics & Stability Analysis', order: 1, type: 'text', text: 'Atmospheric stability determines convective potential. Key parameters:\n- CAPE (Convective Available Potential Energy): >1000 J/kg = significant convective potential\n- CIN (Convective Inhibition): energy that inhibits convection\n- Lifted Index (LI): LI < -6 = severe thunderstorm potential\n- K-Index: >35 = high thunderstorm probability\n\nThermodynamic diagrams (Skew-T/log-P) show temperature and dewpoint profiles, wind shear, and lifting levels.' },
        { title: 'Indian Monsoon Dynamics & Prediction Challenges', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=1oW_m1o1wEI' },
        { title: 'Tropical Cyclone Forecasting & IMD Operations', order: 3, type: 'text', text: 'Cyclone intensity classification (IMD): Depression (< 17 m/s), Deep Depression (17-27 m/s), Cyclonic Storm (28-47 m/s), Severe CS (48-63 m/s), Very Severe CS (64-89 m/s), Extremely Severe CS (90-119 m/s), Super Cyclonic Storm (≥ 120 m/s). IMD uses ensemble track forecasts, SSHA for rapid intensification potential, and microwave satellite data for eye structure analysis.' },
        { title: 'NWP Model Interpretation: GFS, ECMWF & WRF', order: 4, type: 'hybrid', video: 'https://www.youtube.com/watch?v=3c-iZaI7f-0', text: 'Key NWP models used in India: GFS (NCEP, 13 km global), ECMWF-IFS (9 km global, best skill), WRF-ARW (used by IMD at 12 km for India domain). Model biases: monsoon onset timing, orographic precipitation (Western Ghats, Himalayas), sea breeze circulations. Probabilistic forecasting via ensemble means, spread, and postprocessed products.' },
        { title: 'Weather Data Assimilation & Quality Control', order: 5, type: 'text', text: 'Data assimilation integrates observations with model background state to produce optimal initial conditions. Methods: 3D-Var, 4D-Var, Ensemble Kalman Filter (EnKF). India\'s observing network: 550 automated weather stations, 600 automatic rain gauges, 33 Doppler weather radars, radiosondes from 39 stations, INSAT-3D/3DR satellite data.' },
      ],
    },
    {
      title: 'Climate Modeling & Future Projections for India',
      cat: catAtmos, trainer: trainers[3], diff: Difficulty.advanced, dur: 480,
      skills: [skillClimateModeling, skillClimateChange],
      desc: 'General circulation models, CMIP6 projections, regional downscaling, and climate services for sectoral adaptation planning in India.',
      modules: [
        { title: 'Structure & Evaluation of General Circulation Models', order: 1, type: 'text', text: 'GCMs solve fluid dynamics equations on a 3D grid. Components: atmosphere, ocean, land surface, sea ice, biogeochemical cycles. Resolution trade-off: coarse global models (100-300 km) cannot resolve mesoscale phenomena. CMIP6 models: 20-50 km atmospheric resolution, improved land surface schemes. Model evaluation uses Taylor diagrams, RMSE, spatial correlation against reanalysis datasets.' },
        { title: 'CMIP6 Climate Scenarios & Indian Projections', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=1oW_m1o1wEI' },
        { title: 'Statistical & Dynamical Downscaling Techniques', order: 3, type: 'text', text: 'Statistical downscaling: Transfer functions between large-scale predictors and local-scale predictands. Methods: BCSD (Bias-Corrected Spatial Disaggregation), quantile mapping, machine learning approaches. Dynamical downscaling: Regional Climate Models (RegCM4, WRF) nested in GCMs at 12-25 km resolution. High-resolution downscaling critical for mountains, coasts, urban heat islands.' },
        { title: 'Climate Services & Sectoral Applications', order: 4, type: 'text', text: 'Climate services translate model output into decision-relevant information for: agriculture (crop calendars, heat stress indices), water resources (streamflow projections), urban planning (extreme heat mapping), energy sector (wind/solar resource assessment under climate change). India\'s Climate Hazards & Vulnerability Atlas provides district-level climate projections.' },
      ],
    },
    {
      title: 'India Meteorological Department: Field Operations & Data Management',
      cat: catAtmos, trainer: trainers[3], diff: Difficulty.beginner, dur: 300,
      skills: [skillMeteorology, skillScientificData],
      desc: 'IMD observation network operations, quality control procedures, and the transition to automated and digital meteorological data management.',
      modules: [
        { title: 'Surface Weather Observation Standards (WMO Manual 8)', order: 1, type: 'text', text: 'WMO Manual on Codes (Vol 1, Manual 8) defines observation standards. Parameters: temperature (dry/wet bulb), humidity, wind direction/speed, visibility, present weather, cloud type/amount/base height, surface pressure (MSL reduction). Siting criteria: open area, 10m anemometer height, thermometer screen (Stevenson screen) specifications. Frequency: synoptic observations at 0000, 0600, 1200, 1800 UTC.' },
        { title: 'Automatic Weather Station (AWS) Network Management', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=1oW_m1o1wEI' },
        { title: 'Radiosonde Operations & Upper Air Data Collection', order: 3, type: 'text', text: 'Radiosondes ascend at ~300 m/min, measuring temperature, humidity, and GPS wind to ~35 km altitude. Data transmission via Vaisala RS41 or Modem RS series. Data quality: spike detection, physically based range checks, buddy checks against adjacent stations. Upper air data critical for NWP initialization and jet stream monitoring.' },
        { title: 'Climate Data Management: CLIMSOFT & OSCAR System', order: 4, type: 'text', text: 'CLIMSOFT is WMO\'s open-source climate data management system for station data entry, QC, and archival. OSCAR (Observing Systems Capability Analysis and Review) maintains the WMO surface observation station inventory. Indian metadata: 556 surface stations, 67 upper air stations registered. Data sharing: GTS (Global Telecommunication System) for real-time exchange.' },
      ],
    },
    {
      title: 'Air Quality Monitoring & Atmospheric Dispersion',
      cat: catAtmos, trainer: trainers[5], diff: Difficulty.intermediate, dur: 360,
      skills: [skillEnvMonitoring, skillMeteorology],
      desc: 'Ambient air quality standards, monitoring network design, Gaussian dispersion modeling, and urban air quality management strategies.',
      modules: [
        { title: 'National Ambient Air Quality Standards (NAAQS 2009)', order: 1, type: 'text', text: 'NAAQS 2009 (amended) prescribes annual and 24-hour standards for: PM2.5 (60/40 µg/m³), PM10 (100/60 µg/m³), SO₂ (80/80 µg/m³), NO₂ (80/80 µg/m³), O₃ (180/100 µg/m³), CO (4000/2000 µg/m³), lead (1.0/0.5 µg/m³), NH₃ (400/400 µg/m³). Industrial area standards are higher. AQI calculation uses health breakpoints for each pollutant.' },
        { title: 'CAAQMS: Continuous Ambient Air Quality Monitoring', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=3c-iZaI7f-0' },
        { title: 'Gaussian Dispersion Modeling with AERMOD', order: 3, type: 'text', text: 'Gaussian plume model: C = Q/(πσyσzu) × exp(-y²/2σy²) × [exp(-(z-H)²/2σz²) + exp(-(z+H)²/2σz²)]. AERMOD incorporates boundary layer meteorology, terrain effects, and building downwash. Required inputs: emission inventory, hourly meteorological data (surface + upper air), terrain DEM, receptor grid. AERMOD is USEPA preferred model, adopted by India for EIA purposes.' },
        { title: 'Air Quality Action Plans: Delhi NCR Case Study', order: 4, type: 'text', text: 'GRAP (Graded Response Action Plan) activates emergency measures at AQI thresholds: Stage I (Poor, AQI 201-300), Stage II (Very Poor, 301-400), Stage III (Severe, 401-450), Stage IV (Severe+, >450). Measures include: construction ban, diesel gensets, odd-even traffic rationing. Source apportionment studies identify contributions from: vehicles (28%), dust (31%), industry (11%), biomass burning (17%), other (13%).' },
      ],
    },

    // ─── Geology & Remote Sensing (4 courses) ─────────────────────────────
    {
      title: 'Remote Sensing & GIS for Earth Scientists',
      cat: catGeo, trainer: trainers[4], diff: Difficulty.beginner, dur: 360,
      skills: [skillRemoteSensing],
      desc: 'Principles of satellite remote sensing, digital image processing, and GIS applications for geological mapping, disaster monitoring, and environmental assessment.',
      modules: [
        { title: 'Electromagnetic Spectrum & Sensor Characteristics', order: 1, type: 'text', text: 'Remote sensing exploits the interaction of EM radiation with Earth\'s surface. Wavelength regions: Visible (0.4-0.7 µm), NIR (0.7-1.3 µm), SWIR (1.3-3 µm), TIR (8-14 µm), Microwave (1mm-1m). Sensor types: multispectral (Landsat OLI: 30m), hyperspectral (AVIRIS: 224 bands, 20m), SAR (Sentinel-1: 10m). Spatial vs spectral resolution trade-offs determine application suitability.' },
        { title: 'NDVI, NDWI & Spectral Indices for Vegetation & Water Mapping', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=1oW_m1o1wEI' },
        { title: 'Digital Elevation Models & Terrain Analysis', order: 3, type: 'text', text: 'DEM sources: SRTM (30m global), ALOS PALSAR (12.5m), Cartosat-1 (10m), TanDEM-X (12m). Derived products: slope, aspect, hillshade, curvature, flow direction, flow accumulation, watershed delineation. Applications: erosion susceptibility mapping, flood modeling, landslide hazard zonation, road alignment design.' },
        { title: 'GIS Analysis for Geological Hazard Mapping', order: 4, type: 'text', text: 'GIS layers for hazard mapping: geology, lineaments/faults (from satellite), DEM-derived slope, aspect, land use/land cover, soil type, rainfall (TRMM/GPM), proximity to water bodies. Landslide susceptibility using Weight of Evidence (WoE), Frequency Ratio, Logistic Regression, or ML-based approaches (Random Forest, SVM). Validation: ROC-AUC using inventory data.' },
      ],
    },
    {
      title: 'Geological Mapping: Techniques & Applications',
      cat: catGeo, trainer: trainers[1], diff: Difficulty.intermediate, dur: 420,
      skills: [skillGeoMapping],
      desc: 'Systematic geological field mapping, structural geology analysis, stratigraphic correlation, and preparation of geological reports for GSI standards.',
      modules: [
        { title: 'Geological Map Reading & Stratigraphic Column Construction', order: 1, type: 'text', text: 'Geological maps show surface distribution of rock units. Map symbols: formation contacts (certain/uncertain), fault types (normal, reverse, strike-slip, thrust), fold axes, dip and strike measurements (360° system in India). Stratigraphic columns represent the temporal sequence of formations from oldest (bottom) to youngest (top). Indian Standard Stratigraphy: Archaean, Proterozoic, Palaeozoic, Mesozoic, Cenozoic.' },
        { title: 'Structural Geology: Folds, Faults & Measurement Techniques', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=1oW_m1o1wEI' },
        { title: 'Field Mapping Methods & GPS Documentation', order: 3, type: 'text', text: 'GSI mapping standards (National Geoscience Data Centre): 1:50,000 scale for detailed mapping, 1:250,000 for regional. Field equipment: Brunton compass (bearing and dip measurement), geological hammer, hand lens, acid bottle (for carbonate testing). GPS waypoints documented with lithology description, attitude data, sample/photo references. Daily field sheets follow GSI format with location, rock description, structural data, sketch.' },
        { title: 'Remote Sensing for Geological Mapping: Lineament Analysis', order: 4, type: 'text', text: 'Lineaments on satellite imagery often represent faults, shear zones, joints, or lithological contacts. Detection methods: directional filtering, principal component analysis (PCA), IHS enhancement. Validation requires field verification. Bhukosh portal (GSI) provides open-access geological data and maps for India at multiple scales.' },
      ],
    },
    {
      title: 'Mineral Resource Assessment & Economic Geology',
      cat: catGeo, trainer: trainers[1], diff: Difficulty.advanced, dur: 480,
      skills: [skillMineralResources, skillGeoMapping],
      desc: 'Ore deposit geology, resource estimation using geostatistics, drill core logging, and UNFC compliant mineral resource reporting.',
      modules: [
        { title: 'Types of Ore Deposits & Genesis Models', order: 1, type: 'text', text: 'Major deposit types: Magmatic (chromite, PGE, Ni-Cu), Hydrothermal (Cu-Au porphyry, VMS, IOCG, epithermal Au-Ag), Sedimentary (banded iron formations, placer Au/Ti, potash), Weathering (laterite Ni/Al, regolith Au), Pegmatite (Li, Be, rare earths). India\'s major deposits: iron ore (Odisha, Goa), coal (Jharkhand, Chhattisgarh), bauxite (Odisha), copper (Rajasthan), limestone (AP, Rajasthan).' },
        { title: 'Drill Core Logging & Sampling Procedures', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=3c-iZaI7f-0' },
        { title: 'Geostatistics & Resource Estimation (JORC/UNFC)', order: 3, type: 'text', text: 'Variogram analysis quantifies spatial continuity: γ(h) = (1/2N) Σ [Z(xi) - Z(xi+h)]². Parameters: nugget (short-range variability), sill (total variance), range (distance of spatial correlation). Kriging estimates values at unsampled locations with minimum variance. UNFC categories: E (Economic), F (Feasibility), G (geological knowledge) combined to classify Reserves (1,1,1) through Resources (1,2,2) to Inventories (2,3,3).' },
        { title: 'Environmental Considerations in Mining', order: 4, type: 'text', text: 'Mining EIA mandatory under EIA Notification 2006 for all non-coal mines >5 ha, coal mines >150 ha/year production. Key concerns: Acid Mine Drainage (AMD) from sulfide minerals, tailings dam stability (Brumadinho 2019 lessons), dust generation, dewatering impacts on local aquifers. Progressive mine closure planning required by MMDR Act 1957 (amended 2021).' },
      ],
    },
    {
      title: 'InSAR & Satellite Geodesy for Ground Deformation Monitoring',
      cat: catGeo, trainer: trainers[4], diff: Difficulty.advanced, dur: 420,
      skills: [skillRemoteSensing, skillSeismicHazard],
      desc: 'Interferometric Synthetic Aperture Radar (InSAR) theory, Sentinel-1 processing workflows, and applications for subsidence monitoring, volcano deformation, and co-seismic displacement mapping.',
      modules: [
        { title: 'SAR Principles & Interferometry Theory', order: 1, type: 'text', text: 'SAR illuminates targets with microwave pulses and records amplitude and phase of backscattered signal. InSAR computes phase difference between two SAR acquisitions to detect surface displacement. Phase change: Δφ = (4π/λ) × Δr, where λ = wavelength, Δr = line-of-sight displacement. Sentinel-1 C-band (5.6 cm): suitable for slow deformation. L-band (23.5 cm, ALOS-2): better coherence in vegetated areas.' },
        { title: 'Sentinel-1 InSAR Processing with SNAP & ISCE', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=1oW_m1o1wEI' },
        { title: 'Co-seismic Displacement Mapping: Recent Indian Examples', order: 3, type: 'text', text: 'InSAR successfully mapped co-seismic displacement for: 2016 Manipur earthquake (Mw 6.7), 2017 Iran-Iraq earthquake, 2023 Turkey-Syria earthquake (Mw 7.8). Processing steps: SLC data coregistration, interferogram formation, flat earth and topographic phase removal (using SRTM DEM), filtering, phase unwrapping, geocoding, displacement conversion.' },
        { title: 'Subsidence Monitoring for Urban & Mining Areas', order: 4, type: 'text', text: 'Time-series InSAR (PSInSAR, SBAS) monitors long-term deformation rates. Applications in India: land subsidence in Delhi NCR (groundwater depletion: 1-3 cm/year), subsidence over coal mines (Jharia coalfield), coastal subsidence (Sundarbans delta). Multi-temporal InSAR provides mm/year precision, essential for infrastructure risk assessment.' },
      ],
    },

    // ─── Climate & Environment (4 courses) ────────────────────────────────
    {
      title: 'Climate Change Science: IPCC AR6 Findings & Indian Context',
      cat: catClimate, trainer: trainers[5], diff: Difficulty.intermediate, dur: 360,
      skills: [skillClimateChange],
      desc: 'IPCC Sixth Assessment Report key findings, Indian climate change observations, and sectoral vulnerability assessment for national adaptation planning.',
      modules: [
        { title: 'IPCC AR6 WGI: Physical Science Basis — Key Findings', order: 1, type: 'text', text: 'IPCC AR6 WGI (2021) confirmed: 1.1°C warming above pre-industrial levels, each of the last four decades has been successively warmer than any preceding decade since 1850. Human influence is "unequivocal" cause of warming. Sea level rise: 0.20m (1901-2018), rate accelerating. Global warming of 1.5°C expected between 2030-2052 under high-emission scenarios. India: 0.7°C warming since 1901, increasing frequency of extreme heat events, changes in monsoon variability.' },
        { title: 'Greenhouse Gas Inventory & Emissions Accounting', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=1oW_m1o1wEI' },
        { title: 'Climate Change Impacts on Indian Agriculture & Water Resources', order: 3, type: 'text', text: 'Projected impacts (2°C scenario): wheat yield -6 to -25%, rice yield -10 to -30%, Kharif crop growing season shortening. Water: 30% of India may face severe water stress by 2050. Himalayan glacier retreat reduces dry-season river flow affecting 400+ million people. Adaptation options: climate-resilient crop varieties, micro-irrigation, agroforestry, changing crop calendars, insurance schemes.' },
        { title: 'Loss & Damage, Climate Finance & India\'s NDC', order: 4, type: 'text', text: 'India\'s NDC (updated 2022): 45% emissions intensity reduction from 2005 levels by 2030, 50% cumulative power from non-fossil sources by 2030. Climate finance: Green Climate Fund, Adaptation Fund, National Adaptation Fund for Climate Change (NAFCC). Loss & damage — Article 8 of Paris Agreement — formally recognized as separate pillar at COP28 (2023). India focuses on technology transfer and climate justice.' },
      ],
    },
    {
      title: 'Environmental Monitoring Networks & Data Quality',
      cat: catClimate, trainer: trainers[5], diff: Difficulty.beginner, dur: 300,
      skills: [skillEnvMonitoring],
      desc: 'Designing and operating environmental monitoring networks for air, water, and soil quality; sensor calibration, data quality control, and reporting standards.',
      modules: [
        { title: 'Environmental Monitoring Network Design Principles', order: 1, type: 'text', text: 'Network design objectives: representativeness, reliability, cost-effectiveness. Location criteria vary by media: Air — upwind/downwind of sources, background sites, urban population centers. Water — upstream/downstream of discharges, tributaries, estuary mouth. Soil — land use stratified sampling, transect-based surveys. Minimum detection limit, measurement uncertainty, and data recovery rate (>75%) are key performance indicators.' },
        { title: 'Water Quality Monitoring: CPCB Standards & Methods', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=3c-iZaI7f-0' },
        { title: 'IoT Sensors & Real-Time Environmental Data Platforms', order: 3, type: 'text', text: 'Low-cost sensors (particulate: OPC-R1, MET One; gas: Alphasense, Sensirion) enable dense monitoring networks. Challenges: calibration drift, cross-sensitivity, humidity effects. UPPCB\'s real-time monitoring dashboard integrates 40+ sensors across UP cities. Data pipeline: sensor → data logger → MQTT broker → cloud database → visualization dashboard. API standards: OpenAQ, SensorThings API (OGC).' },
        { title: 'Environmental Data Reporting: EPR & State of Environment Reports', order: 4, type: 'text', text: 'Annual Environmental Performance Report (EPR) mandatory for category A/B industries under EIA Notification. State of Environment (SoE) reports published by State Pollution Control Boards follow DPSIR framework (Driver-Pressure-State-Impact-Response). National reporting to UNEP: Global Environment Outlook (GEO) and SDG 6, 11, 13, 14, 15 indicator tracking.' },
      ],
    },
    {
      title: 'Carbon Accounting & Net Zero Pathways for India',
      cat: catClimate, trainer: trainers[5], diff: Difficulty.advanced, dur: 420,
      skills: [skillClimateChange, skillEnvMonitoring],
      desc: 'GHG inventory methodology (IPCC 2006 guidelines), India\'s LULUCF carbon sink, corporate carbon accounting (ISO 14064), and sectoral decarbonization pathways.',
      modules: [
        { title: 'IPCC 2006 GHG Inventory Guidelines: Tier 1/2/3 Methods', order: 1, type: 'text', text: 'Emissions calculated as: Activity Data × Emission Factor. Tier 1: IPCC default emission factors. Tier 2: country-specific emission factors. Tier 3: process-based models (most accurate). Key source categories for India: Energy (electricity, transport, industry: ~75% of national emissions), Agriculture (enteric fermentation, rice paddies, N₂O from soils: ~16%), LULUCF (net sink: -310 Mt CO₂e), Waste (landfills, wastewater: ~4%).' },
        { title: 'India\'s LULUCF Carbon Sink & Forest Carbon Assessment', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=1oW_m1o1wEI' },
        { title: 'Corporate Carbon Accounting: ISO 14064 & GHG Protocol', order: 3, type: 'text', text: 'Scope 1 (direct emissions), Scope 2 (purchased electricity — market-based or location-based), Scope 3 (value chain — 15 categories). GHG Protocol Corporate Standard is the most widely used framework globally. ISO 14064-1 specifies organizational-level GHG quantification and reporting. Emissions factors for Indian electricity grid: 0.82 kg CO₂/kWh (CEA 2022).' },
        { title: 'Sectoral Decarbonization: Power, Transport & Industry', order: 4, type: 'text', text: 'Power: Solar (capacity: 73 GW, 2024), Wind (45 GW), target 500 GW renewable by 2030. Green hydrogen: PLI scheme, SIGHT programme (₹17,490 crore). Transport: EV adoption (FAME-II), BS-VI fuel standards, biofuel blending (E20 petrol by 2025). Industry: Perform Achieve Trade (PAT) scheme — 25 sectors covered, 13.4 Mt CO₂ saved in Cycle-I. Steel: sponge iron to EAF transition pathway.' },
      ],
    },
    {
      title: 'Disaster Risk Reduction & the Sendai Framework',
      cat: catClimate, trainer: trainers[5], diff: Difficulty.beginner, dur: 300,
      skills: [skillEnvMonitoring, skillClimateChange],
      desc: 'Sendai Framework for DRR 2015-2030 targets, India\'s disaster management architecture under the DM Act 2005, and community-based DRR best practices.',
      modules: [
        { title: 'Sendai Framework: 4 Priorities & 7 Global Targets', order: 1, type: 'text', text: 'Sendai DRR Framework (2015-2030) has 4 priorities: Understanding disaster risk, Strengthening disaster risk governance, Investing in DRR for resilience, Enhancing preparedness for effective response. 7 targets by 2030: Substantially reduce mortality/affected people/economic losses, Reduce infrastructure damage, increase national/local DRR strategies, enhance international cooperation, expand availability of multi-hazard early warning systems.' },
        { title: 'India\'s Disaster Management Architecture: NDMA, SDMA, DDMA', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=1oW_m1o1wEI' },
        { title: 'Community-Based DRR: Village-Level Preparedness', order: 3, type: 'text', text: 'CBDRR programs in India: UNDP-supported Village Disaster Management Committees (VDMC) in flood-prone areas, Mock drills (104 conducted across India, 2023), Cyclone shelter management training, NDRF Community Response Teams (CRT) training. Success metrics: evacuation time reduction (Kerala: from 4 hours to 1.5 hours), early warning last-mile connectivity, community hazard mapping.' },
        { title: 'Multi-Hazard Risk Assessment at District Level', order: 4, type: 'text', text: 'District-level multi-hazard risk index combines: Hazard index (historical events, probabilistic hazard), Exposure index (population, assets, critical infrastructure), Vulnerability index (poverty, housing quality, access to services). NDMA has published district-level Disaster Risk Index (DRI) for 640 districts. Priority districts receive NDRF deployment planning and infrastructure investment.' },
      ],
    },

    // ─── Scientific Data & HPC (4 courses) ────────────────────────────────
    {
      title: 'Scientific Data Management: NetCDF, HDF5 & Metadata Standards',
      cat: catData, trainer: trainers[6], diff: Difficulty.intermediate, dur: 360,
      skills: [skillScientificData],
      desc: 'Self-describing file formats for geoscientific data, CF conventions, metadata standards (ISO 19115, Dublin Core), and geospatial databases for institutional data management.',
      modules: [
        { title: 'NetCDF4 & CF Conventions for Geoscience Data', order: 1, type: 'text', text: 'NetCDF (Network Common Data Form) is the de facto standard for gridded geoscience data. CF (Climate and Forecast) conventions define standard names, units, coordinate variables, and metadata attributes. Key attributes: standard_name (from CF table), units (UDUNITS compatible), long_name, missing_value, _FillValue, valid_range. Python: xarray, NetCDF4-python. R: ncdf4, RNetCDF. Compression: HDF5 with DEFLATE at level 6 recommended.' },
        { title: 'HDF5 Data Model & Scientific Dataset Organization', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=3c-iZaI7f-0' },
        { title: 'Geospatial Database Design with PostGIS', order: 3, type: 'text', text: 'PostGIS extends PostgreSQL with spatial types: POINT, LINESTRING, POLYGON, MULTIPOLYGON, GEOMETRY. Key functions: ST_Distance, ST_Intersects, ST_Within, ST_Buffer. Spatial indexing: GIST index critical for performance. Indian geospatial standards: IndiaGIS, Survey of India (SOI) datum (Everest spheroid → transition to WGS84 GCS). Bhuvana (ISRO) and Bhuvan (ISRO) are national geoportals using Open Geospatial Consortium (OGC) WMS/WFS standards.' },
        { title: 'FAIR Data Principles & Scientific Data Publishing', order: 4, type: 'text', text: 'FAIR: Findable (DOI, rich metadata in searchable registries), Accessible (open protocols, authentication for sensitive data), Interoperable (standard vocabularies, linked data), Reusable (provenance, clear license). Indian data repositories: INCOIS data portal, IMD climate data portal, NRSC Bhuvan. Data citation: DataCite DOI schema, use of ORCID for researchers. License options: CC-BY 4.0 (most open) to CC-BY-NC-ND for restricted data.' },
      ],
    },
    {
      title: 'High-Performance Computing for Earth Sciences',
      cat: catData, trainer: trainers[6], diff: Difficulty.advanced, dur: 480,
      skills: [skillHPC, skillScientificData],
      desc: 'HPC cluster architecture, job scheduling with SLURM, MPI/OpenMP parallel programming patterns, and optimization of numerical weather prediction and ocean modeling codes.',
      modules: [
        { title: 'HPC Architecture: CPU, GPU & Memory Hierarchy', order: 1, type: 'text', text: 'Modern HPC nodes: multi-socket CPU (Intel Xeon Scalable, AMD EPYC), DDR5 memory (up to 2 TB/node), NVMe local storage, high-bandwidth interconnect (InfiniBand HDR 200 Gb/s, Omni-Path). GPU accelerators (NVIDIA A100, H100) provide 10-100x speedup for suitable algorithms. Memory hierarchy: Register → L1/L2/L3 cache → DRAM → local NVMe → Lustre parallel filesystem → tape archive. Cache-friendly code organization critical for performance.' },
        { title: 'SLURM Job Scheduling & Resource Management', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=1oW_m1o1wEI' },
        { title: 'MPI & OpenMP Programming for Geoscience Models', order: 3, type: 'text', text: 'MPI (Message Passing Interface) for distributed memory parallelism: domain decomposition in NWP models. Key routines: MPI_Send/Recv, MPI_Bcast, MPI_Reduce, MPI_Allgather, MPI_Scatterv. OpenMP for shared memory parallelism: !$OMP PARALLEL DO directives in Fortran WRF code. Hybrid MPI+OpenMP: 1 MPI rank per socket, OpenMP threads per core. Performance profiling: Intel VTune, Scalasca, TAU. WRF scaling example: 16 cores → 256 cores shows 12x speedup (75% parallel efficiency).' },
        { title: 'GPU Acceleration with CUDA for Atmospheric Models', order: 4, type: 'text', text: 'CUDA programming model: Host (CPU) + Device (GPU). NVIDIA GPU: thousands of CUDA cores in Streaming Multiprocessors (SMs). Memory types: Global (high latency), Shared (on-chip, low latency), Registers. WRF-CUDA: radiation and microphysics schemes ported to GPU, 3-5x speedup per node. Python GPU computing: CuPy (NumPy-compatible), PyTorch for ML-based parameterization schemes. INCOIS uses Pratyush supercomputer (6.8 PFLOPs) for operational ocean forecasting.' },
      ],
    },
    {
      title: 'Python for Earth Science Data Analysis',
      cat: catData, trainer: trainers[6], diff: Difficulty.beginner, dur: 360,
      skills: [skillScientificData, skillClimateModeling],
      desc: 'Python ecosystem for geoscientific analysis: NumPy, Pandas, xarray, Matplotlib, Cartopy, and SciPy applied to climate, seismic, and oceanographic datasets.',
      modules: [
        { title: 'xarray for Multidimensional Geoscience Data', order: 1, type: 'text', text: 'xarray extends NumPy for labeled N-dimensional data. Dataset and DataArray are core objects. Dimensions: time, lat, lon, level. Coordinate-aware operations: automatic alignment, broadcasting, groupby. CMIP6 data access via intake-esm catalog. Example: ds = xr.open_dataset("era5_2023.nc"); monthly_mean = ds["t2m"].resample(time="1MS").mean(). Performance: Dask integration for out-of-core computation on large (>10 GB) datasets.' },
        { title: 'Cartopy & Matplotlib for Geospatial Visualization', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=3c-iZaI7f-0' },
        { title: 'ObsPy for Seismological Data Processing', order: 3, type: 'text', text: 'ObsPy is the Python framework for seismological data. Key classes: Catalog (events), Inventory (stations/channels), Stream (waveforms). FDSN web service access: from obspy.clients.fdsn import Client; client = Client("IRIS"); st = client.get_waveforms("IU","ANMO","00","BHZ", starttime, endtime). Signal processing: detrend, taper, filter, instrument removal using RESP or StationXML. Spectral analysis: FFT, PPSD (Probabilistic Power Spectral Density) for noise analysis.' },
        { title: 'Machine Learning for Earth Science Classification Problems', order: 4, type: 'text', text: 'Common ML applications in Earth science: Seismic phase picking (PhaseNet, EQTransformer — U-Net based), Cloud/land cover classification from satellite (CNNs), Flood mapping (Random Forest with SAR backscatter + DEM features), Earthquake early warning (CNN for P-wave classification). scikit-learn pipeline: preprocessing → feature engineering → model selection (GridSearchCV) → evaluation (cross-validation). DL frameworks: TensorFlow/Keras, PyTorch for custom architectures.' },
      ],
    },
    {
      title: 'Geographic Information Systems: Advanced Spatial Analysis',
      cat: catData, trainer: trainers[4], diff: Difficulty.intermediate, dur: 360,
      skills: [skillRemoteSensing, skillScientificData],
      desc: 'Advanced GIS workflows for Earth scientists: vector/raster analysis, network analysis, spatial statistics, and web GIS deployment using open-source tools.',
      modules: [
        { title: 'Spatial Data Models: Vector, Raster & Point Cloud', order: 1, type: 'text', text: 'Vector model: discrete features as points, lines, polygons with attribute tables. Topology rules ensure data integrity. Raster model: continuous surfaces as regular grid cells. Resolution choice depends on phenomenon scale. Point cloud (LiDAR, Structure-from-Motion): 3D representation, processed using PDAL, LAZperf. Conversion between models: rasterization (v.to.rast), vectorization (r.to.vect) in GRASS GIS. Open formats: GeoPackage (replaces Shapefile), GeoTIFF, COG (Cloud-Optimized GeoTIFF).' },
        { title: 'QGIS for Geological & Environmental Mapping', order: 2, type: 'video', video: 'https://www.youtube.com/watch?v=1oW_m1o1wEI' },
        { title: 'Spatial Statistics: Interpolation & Hotspot Analysis', order: 3, type: 'text', text: 'Interpolation methods: IDW (inverse distance weighting — simple), Kriging (geostatistical, minimum variance), Spline (smooth surface). Spatial autocorrelation: Moran\'s I statistic (positive values = clustering, negative = dispersion). Getis-Ord Gi* for hotspot analysis (earthquake epicenter clustering, pollution hotspots). GeoDa and PySAL for open-source spatial statistics.' },
        { title: 'Web GIS & OGC Service Deployment with GeoServer', order: 4, type: 'text', text: 'OGC standards: WMS (map images), WFS (feature data), WCS (raster data), OGC API Features (RESTful). GeoServer publishes geospatial layers from PostGIS, shapefiles, GeoTIFF. WMTS for cached tile delivery improves performance. Leaflet.js + GeoServer WMS/WFS for interactive web maps. India\'s NSDI (National Spatial Data Infrastructure) uses OGC standards for data sharing between government agencies.' },
      ],
    },
  ];

  const courses: any[] = [];
  for (const c of courseDefs) {
    const course = await prisma.course.create({
      data: {
        title: c.title,
        slug: slugify(c.title),
        description: c.desc,
        trainerId: c.trainer.profile.id,
        categoryId: c.cat.id,
        difficulty: c.diff,
        durationMinutes: c.dur,
        status: CourseStatus.published,
        approvedById: adminUser.id,
        approvedAt: daysAgo(Math.floor(Math.random() * 60 + 10)),
        courseSkills: { create: c.skills.map((s: any) => ({ skillId: s.id })) },
      },
    });

    for (const m of c.modules) {
      await prisma.courseModule.create({
        data: {
          courseId: course.id,
          title: m.title,
          sequenceOrder: m.order,
          videoUrl:     (m as any).video    ?? null,
          textContent:  (m as any).text     ?? null,
          documentUrl:  null,
        },
      });
    }

    courses.push(course);
  }

  // ── 12. Seismology Case Study Assessment (4 Qs, 3/4 = 75% = Level 4) ──────
  console.log('📝 Seeding Seismology Case Study Assessment...');
  const seismoCourse = courses[3]; // "Seismology Case Study: The Bhuj 2001 Earthquake"
  const seismoAssessment = await prisma.assessment.create({
    data: {
      courseId: seismoCourse.id,
      subject: 'Bhuj 2001 Earthquake — Case Study Assessment',
      type: AssessmentType.post_test,
      timeLimitMinutes: 30,
      passScorePct: 60,
      createdById: trainers[0].user.id,
    },
  });

  // 4 questions — designed so 3/4 correct = 75% score = Level 4 via SCORE_TO_LEVEL mapping
  await prisma.assessmentQuestion.create({
    data: {
      assessmentId: seismoAssessment.id,
      questionType: QuestionType.single_mcq,
      questionText: 'The 2001 Bhuj earthquake occurred in which tectonic setting?',
      difficulty: Difficulty.intermediate,
      points: 25,
      options: {
        create: [
          { optionText: 'Convergent plate boundary at the Himalayas', isCorrect: false },
          { optionText: 'Intraplate setting within the stable Indian craton (Kachchh rift basin)', isCorrect: true },
          { optionText: 'Oceanic spreading ridge in the Arabian Sea', isCorrect: false },
          { optionText: 'Transform fault along the western continental margin', isCorrect: false },
        ],
      },
    },
  });

  await prisma.assessmentQuestion.create({
    data: {
      assessmentId: seismoAssessment.id,
      questionType: QuestionType.single_mcq,
      questionText: 'What was the approximate moment magnitude (Mw) of the Bhuj 2001 earthquake?',
      difficulty: Difficulty.beginner,
      points: 25,
      options: {
        create: [
          { optionText: 'Mw 5.5', isCorrect: false },
          { optionText: 'Mw 6.3', isCorrect: false },
          { optionText: 'Mw 7.7', isCorrect: true },
          { optionText: 'Mw 8.9', isCorrect: false },
        ],
      },
    },
  });

  await prisma.assessmentQuestion.create({
    data: {
      assessmentId: seismoAssessment.id,
      questionType: QuestionType.single_mcq,
      questionText: 'Why was significant structural damage observed in Ahmedabad city (~250 km from epicenter)?',
      difficulty: Difficulty.advanced,
      points: 25,
      options: {
        create: [
          { optionText: 'Ahmedabad is located directly on the South Wagad Fault', isCorrect: false },
          { optionText: 'Amplification of seismic waves in thick alluvial/soft soil deposits beneath the city', isCorrect: true },
          { optionText: 'The earthquake triggered a secondary strike-slip fault beneath Ahmedabad', isCorrect: false },
          { optionText: 'Ahmedabad experienced a local aftershock of Mw 6.0 simultaneously', isCorrect: false },
        ],
      },
    },
  });

  await prisma.assessmentQuestion.create({
    data: {
      assessmentId: seismoAssessment.id,
      questionType: QuestionType.single_mcq,
      questionText: 'Which Indian seismic design code was significantly revised following the Bhuj earthquake?',
      difficulty: Difficulty.intermediate,
      points: 25,
      options: {
        create: [
          { optionText: 'IS 456:2000 (Plain & Reinforced Concrete)', isCorrect: false },
          { optionText: 'IS 800:2007 (General Construction in Steel)', isCorrect: false },
          { optionText: 'BIS 1893:2002 (Criteria for Earthquake Resistant Design)', isCorrect: true },
          { optionText: 'NBC 2016 (National Building Code)', isCorrect: false },
        ],
      },
    },
  });

  // ── 13. Demo Trainee Account (backdated, rich evidence) ────────────────────
  console.log('👨‍🎓 Seeding Demo Trainee Account with backdated evidence...');

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo.trainee@capacityconnect.org',
      passwordHash,
      status: UserStatus.active,
      emailVerifiedAt: daysAgo(120),
      onboardingCompleted: true,
      onboardingData: {
        tq1: 'Technical', tq2: 2, tq3: ['Communication', 'Technical Skills'],
        tq4: 'Look for documentation or examples', tq5: 2, tq6: 2, tq7: 3,
        tq8: 'Admit it immediately and seek help', tq9: ['Watching video tutorials'], tq10: 'Learn a specific tool',
      },
      userRoles: { create: { roleId: roleTrainee.id } },
      createdAt: daysAgo(120),
    },
  });

  const demoProfile = await prisma.traineeProfile.create({
    data: {
      userId: demoUser.id,
      departmentId: deptSeismo.id,
      headline: 'Junior Geoscientist — Seismology Division',
      bio: 'Early-career geoscientist with field experience in seismic station maintenance. Seeking to build expertise in earthquake hazard assessment and geophysical surveying.',
      profileCompletionPct: 90,
      createdAt: daysAgo(120),
    },
  });

  // Demo trainee competencies: Seismology (currentLevel=1 → evidence pushes to 4), others lower
  const demoTCs: Record<string, any> = {};

  const tcDefs = [
    { compId: compSeismology.id,   current: 1, required: 5, label: 'seismology' },
    { compId: compGeospatial.id,   current: 2, required: 4, label: 'geospatial' },
    { compId: compAtmosphere.id,   current: 1, required: 3, label: 'atmosphere' },
    { compId: compProfessional.id, current: 2, required: 4, label: 'professional' },
  ];

  for (const tc of tcDefs) {
    const created = await prisma.traineeCompetency.create({
      data: {
        traineeProfileId: demoProfile.id,
        competencyId: tc.compId,
        currentLevel: tc.current,
        requiredLevel: tc.required,
        lastEvidenceAt: daysAgo(90),
        createdAt: daysAgo(110),
      },
    });
    demoTCs[tc.label] = created;

    const gapVal = Math.max(0, tc.required - tc.current);
    await prisma.skillGapAnalysis.create({
      data: {
        traineeCompetencyId: created.id,
        gapValue: gapVal,
        gapClassification: gapVal >= 4 ? GapClassification.critical : gapVal === 3 ? GapClassification.high : gapVal === 2 ? GapClassification.medium : gapVal === 1 ? GapClassification.low : GapClassification.none,
      },
    });
  }

  // ── Backdated evidence for Demo Trainee ────────────────────────────────────
  // Quiz evidence (from onboarding ~110 days ago)
  await prisma.competencyEvidence.create({
    data: {
      traineeCompetencyId: demoTCs.seismology.id,
      type: EvidenceType.QUIZ_INFERRED,
      level: 2,
      weight: 0.4,
      sourceRefId: 'quiz:onboarding',
      createdAt: daysAgo(110),
      updatedAt: daysAgo(110),
    },
  });
  await prisma.competencyEvidence.create({
    data: {
      traineeCompetencyId: demoTCs.professional.id,
      type: EvidenceType.QUIZ_INFERRED,
      level: 2,
      weight: 0.4,
      sourceRefId: 'quiz:onboarding',
      createdAt: daysAgo(110),
      updatedAt: daysAgo(110),
    },
  });

  // Self-reported wizard selection (~90 days ago)
  await prisma.competencyEvidence.create({
    data: {
      traineeCompetencyId: demoTCs.seismology.id,
      type: EvidenceType.SELF_REPORTED,
      level: 1,
      weight: 0.5,
      sourceRefId: `wizard:${skillSeismology.id}`,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(90),
    },
  });

  // Behavioral evidence from course module completion (~60 days ago)
  await prisma.competencyEvidence.create({
    data: {
      traineeCompetencyId: demoTCs.seismology.id,
      type: EvidenceType.BEHAVIORAL,
      level: 1,
      weight: 0.1,
      sourceRefId: courses[0].id, // Introduction to Seismology course
      createdAt: daysAgo(60),
      updatedAt: daysAgo(60),
    },
  });

  // ASSESSED evidence: 3/4 correct = 75% → Level 4 (via SCORE_TO_LEVEL: maxPct=80 → level 4)
  await prisma.competencyEvidence.create({
    data: {
      traineeCompetencyId: demoTCs.seismology.id,
      type: EvidenceType.ASSESSED,
      level: 4,   // 3/4 = 75% → Level 4 (server-scored)
      weight: 1.0,
      sourceRefId: seismoAssessment.id,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(30),
    },
  });

  // Update the seismology TraineeCompetency currentLevel to reflect ASSESSED evidence
  await prisma.traineeCompetency.update({
    where: { id: demoTCs.seismology.id },
    data: {
      currentLevel: 4,
      confidence: 1.0,
      lastAssessedAt: daysAgo(30),
      assessmentScore: 75.0,
      lastEvidenceAt: daysAgo(30),
    },
  });
  await prisma.skillGapAnalysis.updateMany({
    where: { traineeCompetencyId: demoTCs.seismology.id },
    data: { gapValue: 1, gapClassification: GapClassification.low, computedAt: daysAgo(30) },
  });

  // ── 14. Demo Trainee Enrollment & Progress ─────────────────────────────────
  const demoEnroll = await prisma.enrollment.create({
    data: {
      traineeId: demoProfile.id,
      courseId: courses[0].id,  // Introduction to Seismology
      status: EnrollmentStatus.completed,
      completedAt: daysAgo(35),
      enrolledAt: daysAgo(75),
    },
  });

  const introSeismoModules = await prisma.courseModule.findMany({ where: { courseId: courses[0].id } });
  for (const mod of introSeismoModules) {
    await prisma.courseProgress.create({
      data: {
        enrollmentId: demoEnroll.id,
        moduleId: mod.id,
        status: ProgressStatus.completed,
        progressPct: 100,
        lastAccessedAt: daysAgo(40),
      },
    });
  }

  // Demo assessment attempt
  const demoAttempt = await prisma.assessmentAttempt.create({
    data: {
      assessmentId: seismoAssessment.id,
      traineeId: demoProfile.id,
      startedAt: new Date(daysAgo(30).getTime() + 1000 * 60),
      submittedAt: new Date(daysAgo(30).getTime() + 1000 * 60 * 22),
      scorePct: 75.0,  // 3/4 correct = 75%
      passed: true,
      attemptNumber: 1,
    },
  });

  // Demo certificate
  const certToken = uuidv4();
  const verifyUrl = `http://localhost:3000/certificates/verify/${certToken}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl);
  await prisma.certificate.create({
    data: {
      enrollmentId: demoEnroll.id,
      certificateNumber: 'CC-MoES-2026-0001',
      traineeId: demoProfile.id,
      courseId: courses[0].id,
      trainerId: trainers[0].profile.id,
      issuedAt: daysAgo(29),
      qrPayloadUrl: qrDataUrl,
      verificationToken: certToken,
    },
  });

  // ── 15. General Trainees (15 users) ───────────────────────────────────────
  console.log('👥 Seeding 15 general trainees...');
  const depts = [deptSeismo, deptOcean, deptAtmos, deptGeo, deptClimate, deptIT];
  const comps = [compSeismology, compOcean, compAtmosphere, compGeospatial, compClimate, compDataScience];

  for (let i = 1; i <= 15; i++) {
    const user = await prisma.user.create({
      data: {
        email: `trainee${i}@capacityconnect.org`,
        passwordHash,
        status: UserStatus.active,
        emailVerifiedAt: new Date(),
        onboardingCompleted: true,
        userRoles: { create: { roleId: roleTrainee.id } },
      },
    });
    const dept = depts[i % depts.length];
    const comp = comps[i % comps.length];
    const curLevel = (i % 3) + 1;
    const reqLevel = 4;

    const profile = await prisma.traineeProfile.create({
      data: {
        userId: user.id,
        departmentId: dept.id,
        headline: `MoES Scientist Grade ${(i % 3) + 2}`,
        bio: `Dedicated earth scientist working in ${dept.name}.`,
        profileCompletionPct: 70 + (i % 30),
      },
    });

    const tc = await prisma.traineeCompetency.create({
      data: {
        traineeProfileId: profile.id,
        competencyId: comp.id,
        currentLevel: curLevel,
        requiredLevel: reqLevel,
      },
    });

    const gapVal = Math.max(0, reqLevel - curLevel);
    await prisma.skillGapAnalysis.create({
      data: {
        traineeCompetencyId: tc.id,
        gapValue: gapVal,
        gapClassification: gapVal >= 3 ? GapClassification.high : gapVal === 2 ? GapClassification.medium : GapClassification.low,
      },
    });

    // Enroll first 8 trainees in a relevant course
    if (i <= 8) {
      const targetCourse = courses[(i - 1) % 8];
      const enrollment = await prisma.enrollment.create({
        data: {
          traineeId: profile.id,
          courseId: targetCourse.id,
          status: i <= 3 ? EnrollmentStatus.completed : EnrollmentStatus.in_progress,
          completedAt: i <= 3 ? daysAgo(Math.floor(Math.random() * 20 + 5)) : null,
        },
      });

      const mods = await prisma.courseModule.findMany({ where: { courseId: targetCourse.id } });
      if (mods.length > 0) {
        await prisma.courseProgress.create({
          data: {
            enrollmentId: enrollment.id,
            moduleId: mods[0].id,
            status: i <= 3 ? ProgressStatus.completed : ProgressStatus.in_progress,
            progressPct: i <= 3 ? 100 : 50,
          },
        });
      }
    }
  }

  // ── 16. Trainer Match Scores for Demo Trainee ──────────────────────────────
  console.log('🎯 Seeding Trainer Match Scores for demo trainee...');
  await prisma.trainerMatchScore.createMany({
    data: [
      {
        traineeId: demoProfile.id,
        trainerId: trainers[0].profile.id,  // Seismology expert
        matchScore: 0.8750,
        reasons: ['Covers 3/3 seismology gap skills', 'Expertise significantly above required level', '2 availability slot(s) declared', '18 years of experience', 'Certified in 3 matched skill(s)'],
      },
      {
        traineeId: demoProfile.id,
        trainerId: trainers[1].profile.id,  // Geophysics expert
        matchScore: 0.6200,
        reasons: ['Covers 2/3 needed skills (Geophysics, Remote Sensing)', '2 availability slot(s) declared', '15 years of experience'],
      },
    ],
  });

  // ── 17. Audit Logs ─────────────────────────────────────────────────────────
  console.log('🛡️ Seeding Audit Logs...');
  await prisma.auditLog.createMany({
    data: [
      { actorUserId: adminUser.id, action: 'course.approved', entityType: 'Course', entityId: courses[0].id, ipAddress: '127.0.0.1', metadata: { title: courses[0].title } },
      { actorUserId: adminUser.id, action: 'course.approved', entityType: 'Course', entityId: courses[1].id, ipAddress: '127.0.0.1', metadata: { title: courses[1].title } },
      { actorUserId: demoUser.id,  action: 'trainee.onboarding.completed', entityType: 'User', entityId: demoUser.id, ipAddress: '127.0.0.1', metadata: {} },
    ],
  });

  // ── Done ───────────────────────────────────────────────────────────────────
  console.log('\n======================================================');
  console.log('✅ PHASE 3 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
  console.log('\n🌍 MoES CAPACITY CONNECT DEMO CREDENTIALS:');
  console.log('------------------------------------------------------');
  console.log('👑 ADMIN:         admin@capacityconnect.org          / Password123!');
  console.log('👨‍🏫 TRAINER:       trainer.seismo@capacityconnect.org / Password123!');
  console.log('👨‍🎓 DEMO TRAINEE:  demo.trainee@capacityconnect.org   / Password123!');
  console.log('👨‍🎓 TRAINEE:       trainee1@capacityconnect.org       / Password123!');
  console.log('------------------------------------------------------');
  console.log('\n📊 SEEDED:');
  console.log(`  • 15 MoES Earth Science skills + 5 professional skills`);
  console.log(`  • 7 competency domains`);
  console.log(`  • 8 domain-expert trainers`);
  console.log(`  • 24 MoES courses (100+ modules)`);
  console.log(`  • 1 Demo Trainee with backdated evidence timeline`);
  console.log(`  • Seismology case study: 4-question assessment (3/4=75%=Level4)`);
  console.log('------------------------------------------------------\n');
}

main()
  .catch((e) => {
    console.error('❌ Error Seeding Database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
