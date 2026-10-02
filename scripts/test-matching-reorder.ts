import { PrismaClient, VerificationStatus, EvidenceType } from '@repo/db';
import { MatchingService } from '../apps/api/src/modules/matching/matching.service';

const prisma = new PrismaClient();

// A simple mock wrapper for the matching service
// We will instantiate it directly to bypass NestJS DI for the test script
class TestMatchingService extends MatchingService {
  constructor() {
    super({} as any); // We will override this.prisma
    (this as any).prisma = prisma;
  }
}

async function main() {
  console.log('--- Starting Critical Matching Reorder Test ---');
  const matchingService = new TestMatchingService();

  // 1. Cleanup old test data
  console.log('Cleaning up old test data...');
  await prisma.competencyEvidence.deleteMany({ where: { sourceRefId: 'test-reorder' } });
  
  const testUsers = await prisma.user.findMany({ 
    where: { email: { contains: 'reorder-test' } },
    include: { traineeProfile: true, trainerProfile: true }
  });
  for (const u of testUsers) {
    if (u.traineeProfile) {
      await prisma.trainerMatchScore.deleteMany({ where: { traineeId: u.traineeProfile.id } });
      await prisma.competencyEvidence.deleteMany({ where: { traineeCompetency: { traineeProfileId: u.traineeProfile.id } } });
      await prisma.skillGapAnalysis.deleteMany({ where: { traineeCompetency: { traineeProfileId: u.traineeProfile.id } } });
      await prisma.traineeCompetency.deleteMany({ where: { traineeProfileId: u.traineeProfile.id } });
      await prisma.traineeProfile.delete({ where: { id: u.traineeProfile.id } });
    }
    if (u.trainerProfile) {
      await prisma.trainerMatchScore.deleteMany({ where: { trainerId: u.trainerProfile.id } });
      await prisma.trainerExpertise.deleteMany({ where: { trainerProfileId: u.trainerProfile.id } });
      await prisma.trainerAvailability.deleteMany({ where: { trainerProfileId: u.trainerProfile.id } });
      await prisma.trainerProfile.delete({ where: { id: u.trainerProfile.id } });
    }
    await prisma.user.delete({ where: { id: u.id } });
  }

  const testSkills = await prisma.skill.findMany({ where: { name: { contains: 'ReorderTest' } } });
  for (const s of testSkills) {
    await prisma.competencySkill.deleteMany({ where: { skillId: s.id } });
    await prisma.trainerExpertise.deleteMany({ where: { skillId: s.id } });
    await prisma.skill.delete({ where: { id: s.id } });
  }
  
  const testComps = await prisma.competency.findMany({ where: { name: { contains: 'ReorderTest' } } });
  for (const c of testComps) {
    await prisma.competencySkill.deleteMany({ where: { competencyId: c.id } });
    await prisma.traineeCompetency.deleteMany({ where: { competencyId: c.id } });
    await prisma.competency.delete({ where: { id: c.id } });
  }

  // 2. Create Fixtures
  console.log('Creating skills and competencies...');
  const skillSeismology = await prisma.skill.create({ data: { name: 'ReorderTest: Seismology Basics', category: 'Test' } });
  const skillAdvanced = await prisma.skill.create({ data: { name: 'ReorderTest: Advanced Tectonics', category: 'Test' } });

  const compSeismology = await prisma.competency.create({
    data: {
      name: 'ReorderTest: Basic Seismology',
      category: 'Test',
      competencySkills: { create: { skillId: skillSeismology.id } }
    }
  });

  const compAdvanced = await prisma.competency.create({
    data: {
      name: 'ReorderTest: Advanced Tectonics',
      category: 'Test',
      competencySkills: { create: { skillId: skillAdvanced.id } }
    }
  });

  console.log('Creating test users (1 Trainee, 2 Trainers)...');
  
  // Trainer 1: Basic Tutor (Great at basics, terrible at advanced, highly rated)
  const userT1 = await prisma.user.create({ data: { email: 't1-basic@reorder-test.com', passwordHash: 'pwd' } });
  const t1 = await prisma.trainerProfile.create({
    data: {
      userId: userT1.id,
      verificationStatus: VerificationStatus.verified,
      yearsExperience: 10,
      availability: { create: [{ dayOfWeek: 1, startTime: '09:00', endTime: '10:00', timezone: 'UTC' }] }, // array
      expertise: {
        create: [
          { skillId: skillSeismology.id, proficiencyLevel: 5, certified: true },
          { skillId: skillAdvanced.id, proficiencyLevel: 1, certified: false },
        ]
      }
    }
  });

  // Trainer 2: Advanced Expert (Terrible at basics, great at advanced, slightly less experienced)
  const userT2 = await prisma.user.create({ data: { email: 't2-advanced@reorder-test.com', passwordHash: 'pwd' } });
  const t2 = await prisma.trainerProfile.create({
    data: {
      userId: userT2.id,
      verificationStatus: VerificationStatus.verified,
      yearsExperience: 5,
      availability: { create: [{ dayOfWeek: 2, startTime: '09:00', endTime: '10:00', timezone: 'UTC' }] }, // array
      expertise: {
        create: [
          { skillId: skillSeismology.id, proficiencyLevel: 1, certified: false },
          { skillId: skillAdvanced.id, proficiencyLevel: 5, certified: true },
        ]
      }
    }
  });

  // Trainee
  const userTrainee = await prisma.user.create({ data: { email: 'trainee@reorder-test.com', passwordHash: 'pwd' } });
  const trainee = await prisma.traineeProfile.create({
    data: {
      userId: userTrainee.id,
      traineeCompetencies: {
        create: [
          { competencyId: compSeismology.id, currentLevel: 1, requiredLevel: 4 }, // Gap of 3
          { competencyId: compAdvanced.id, currentLevel: 1, requiredLevel: 5 },  // Gap of 4
        ]
      }
    }
  });

  // 3. Initial Match
  console.log('\nRunning initial match (Trainee Level 1 in both)...');
  const res1 = await matchingService.computeMatchesForTrainee(userTrainee.id);
  const match1 = res1.matches;
  
  console.log('Results:');
  match1.forEach((m: any, i: number) => {
    console.log(`  ${i+1}. ${m.trainerName} - Score: ${m.matchScore}`);
    console.log(`     Reasons: ${m.reasons.join(', ')}`);
  });

  if (match1[0].trainerId !== t1.id) {
    console.error('❌ FAIL: Basic Tutor (Trainer 1) did not rank first initially!');
    process.exit(1);
  } else {
    console.log('✅ PASS: Basic Tutor ranks first initially because they cover the basic skills with more experience.');
  }

  // 4. Update Trainee Evidence (Level up Seismology to 4)
  console.log('\nApplying evidence: Trainee achieves Level 4 in Seismology...');
  
  const tcSeismology = await prisma.traineeCompetency.findUnique({
    where: { traineeProfileId_competencyId: { traineeProfileId: trainee.id, competencyId: compSeismology.id } }
  });

  if (!tcSeismology) throw new Error('Missing TC');

  await prisma.competencyEvidence.create({
    data: {
      traineeCompetencyId: tcSeismology.id,
      type: EvidenceType.ASSESSED,
      level: 4,
      weight: 1.0,
      sourceRefId: 'test-reorder',
    }
  });

  await prisma.traineeCompetency.update({
    where: { id: tcSeismology.id },
    data: { currentLevel: 4 } // Closes the gap (4 < 4 is false)
  });

  // 5. Re-run Match
  console.log('Running second match (Trainee Level 4 in Seismology)...');
  const res2 = await matchingService.computeMatchesForTrainee(userTrainee.id);
  const match2 = res2.matches;

  console.log('Results:');
  match2.forEach((m: any, i: number) => {
    console.log(`  ${i+1}. ${m.trainerName} - Score: ${m.matchScore}`);
    console.log(`     Reasons: ${m.reasons.join(', ')}`);
  });

  if (match2[0].trainerId !== t2.id) {
    console.error('❌ FAIL: Advanced Expert (Trainer 2) did not rise to rank #1 after Seismology gap was closed!');
    process.exit(1);
  } else {
    console.log('✅ PASS: Advanced Expert successfully rose to rank #1!');
  }

  console.log('\n🎉 Critical Test Passed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
