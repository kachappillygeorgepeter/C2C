import { PrismaClient, Role, CompanyStatus, JobStatus, JobType, WorkMode, ApplicationStatus, NotificationType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data in reverse order of foreign keys
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.interview.deleteMany()
  await prisma.applicationStatusHistory.deleteMany()
  await prisma.application.deleteMany()
  await prisma.jobSkill.deleteMany()
  await prisma.studentSkill.deleteMany()
  await prisma.skill.deleteMany()
  await prisma.jobEligibility.deleteMany()
  await prisma.jobPosting.deleteMany()
  await prisma.company.deleteMany()
  await prisma.project.deleteMany()
  await prisma.certification.deleteMany()
  await prisma.studentProfile.deleteMany()
  await prisma.recruiterProfile.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()
  await prisma.department.deleteMany()

  const passwordHash = await bcrypt.hash('Password123!', 10)

  // 1. Departments
  console.log('Inserting departments...')
  const deptCSE = await prisma.department.create({
    data: { name: 'Computer Science and Engineering', code: 'CSE' }
  })
  const deptECE = await prisma.department.create({
    data: { name: 'Electronics and Communication Engineering', code: 'ECE' }
  })
  const deptMECH = await prisma.department.create({
    data: { name: 'Mechanical Engineering', code: 'MECH' }
  })

  // 2. Skills
  console.log('Inserting skills...')
  const skillTS = await prisma.skill.create({ data: { name: 'TypeScript', category: 'Programming' } })
  const skillReact = await prisma.skill.create({ data: { name: 'React', category: 'Frontend' } })
  const skillNode = await prisma.skill.create({ data: { name: 'Node.js', category: 'Backend' } })
  const skillPython = await prisma.skill.create({ data: { name: 'Python', category: 'Programming' } })
  const skillSQL = await prisma.skill.create({ data: { name: 'PostgreSQL', category: 'Database' } })

  // 3. Admin User
  console.log('Creating admin user...')
  await prisma.user.create({
    data: {
      email: 'admin@campus.edu',
      passwordHash,
      role: Role.ADMIN
    }
  })

  // 4. Students
  console.log('Creating students...')
  // Student 1: High achiever, CSE, 2025, CGPA 9.2, 0 backlogs
  const studentUser1 = await prisma.user.create({
    data: {
      email: 'arjun.sharma@student.campus.edu',
      passwordHash,
      role: Role.STUDENT,
      studentProfile: {
        create: {
          studentId: 'CS2021001',
          fullName: 'Arjun Sharma',
          phone: '+919876543210',
          departmentId: deptCSE.id,
          branch: 'CSE',
          cgpa: 9.2,
          graduationYear: 2025,
          semester: 7,
          activeBacklogs: 0,
          totalBacklogs: 0,
          tenthPercent: 94.5,
          twelfthPercent: 92.0,
          preferredJobType: JobType.FULL_TIME,
          preferredLocation: 'Bengaluru',
          profileComplete: true,
          completionPct: 100,
          skills: {
            create: [
              { skillId: skillTS.id, level: 'Advanced' },
              { skillId: skillReact.id, level: 'Advanced' },
              { skillId: skillNode.id, level: 'Intermediate' }
            ]
          }
        }
      }
    },
    include: { studentProfile: true }
  })

  // Student 2: ECE, 2025, CGPA 7.1, 1 active backlog (tests eligibility filter)
  const studentUser2 = await prisma.user.create({
    data: {
      email: 'priya.nair@student.campus.edu',
      passwordHash,
      role: Role.STUDENT,
      studentProfile: {
        create: {
          studentId: 'EC2021045',
          fullName: 'Priya Nair',
          phone: '+919876543211',
          departmentId: deptECE.id,
          branch: 'ECE',
          cgpa: 7.1,
          graduationYear: 2025,
          semester: 7,
          activeBacklogs: 1,
          totalBacklogs: 2,
          tenthPercent: 88.0,
          twelfthPercent: 85.5,
          preferredJobType: JobType.FULL_TIME,
          preferredLocation: 'Hyderabad',
          profileComplete: true,
          completionPct: 90
        }
      }
    },
    include: { studentProfile: true }
  })

  // 5. Recruiters & Companies
  console.log('Creating recruiters and companies...')
  // Recruiter 1: Nexus Tech
  const recUser1 = await prisma.user.create({
    data: {
      email: 'recruiter@nexustech.io',
      passwordHash,
      role: Role.RECRUITER,
      recruiterProfile: {
        create: {
          fullName: 'Vikram Mehta',
          phone: '+919811223344',
          designation: 'Talent Acquisition Lead',
          company: {
            create: {
              name: 'Nexus Technologies',
              website: 'https://nexustech.io',
              industry: 'Enterprise Software & Cloud',
              description: 'Next-generation cloud infrastructure and developer tooling platforms.',
              status: CompanyStatus.APPROVED,
              headquarters: 'Bengaluru, India',
              companySize: '500-1000'
            }
          }
        }
      }
    },
    include: { recruiterProfile: { include: { company: true } } }
  })

  // Recruiter 2: QuantEdge Systems
  const recUser2 = await prisma.user.create({
    data: {
      email: 'hr@quantedge.com',
      passwordHash,
      role: Role.RECRUITER,
      recruiterProfile: {
        create: {
          fullName: 'Ananya Roy',
          phone: '+919822334455',
          designation: 'Campus Hiring Specialist',
          company: {
            create: {
              name: 'QuantEdge Analytics',
              website: 'https://quantedge.com',
              industry: 'FinTech & High Frequency Trading',
              description: 'Algorithmic trading systems and real-time quantitative investment analytics.',
              status: CompanyStatus.APPROVED,
              headquarters: 'Mumbai, India',
              companySize: '200-500'
            }
          }
        }
      }
    },
    include: { recruiterProfile: { include: { company: true } } }
  })

  const company1Id = recUser1.recruiterProfile!.company!.id
  const company2Id = recUser2.recruiterProfile!.company!.id

  // 6. Job Postings
  console.log('Creating job postings...')
  // Job 1: Software Engineer (Full-Time) - Nexus Tech
  const job1 = await prisma.jobPosting.create({
    data: {
      companyId: company1Id,
      title: 'Full Stack Software Engineer',
      description: 'We are seeking high-caliber engineers to build our scalable distributed web applications using React, Node.js, and TypeScript.',
      responsibilities: 'Develop high-throughput REST APIs, build modern reactive UI workflows, and maintain automated test pipelines.',
      jobType: JobType.FULL_TIME,
      workMode: WorkMode.HYBRID,
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      salaryMin: 1400000,
      salaryMax: 1800000,
      openings: 5,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(),
      eligibility: {
        create: {
          minCgpa: 8.0,
          maxBacklogs: 0,
          allowedDepts: ['CSE', 'ECE'],
          allowedGradYears: [2025],
          requiredSkills: ['TypeScript', 'React', 'Node.js']
        }
      }
    }
  })

  // Job 2: Frontend Engineering Intern (PPO) - Nexus Tech
  await prisma.jobPosting.create({
    data: {
      companyId: company1Id,
      title: 'Frontend Engineering Intern (PPO Option)',
      description: 'Join our UI systems team to build high-performance data visualization interfaces.',
      jobType: JobType.INTERNSHIP_PPO,
      workMode: WorkMode.REMOTE,
      city: 'Bengaluru',
      stipend: 50000,
      ppoCTC: 1600000,
      openings: 3,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(),
      eligibility: {
        create: {
          minCgpa: 7.0,
          maxBacklogs: 1,
          allowedDepts: ['CSE', 'ECE'],
          allowedGradYears: [2025],
          requiredSkills: ['React', 'TypeScript']
        }
      }
    }
  })

  // Job 3: Quantitative Systems Associate - QuantEdge (High cutoff)
  await prisma.jobPosting.create({
    data: {
      companyId: company2Id,
      title: 'Quantitative Software Associate',
      description: 'Low-latency backend services and distributed execution systems for market microstructure trading.',
      jobType: JobType.FULL_TIME,
      workMode: WorkMode.ON_SITE,
      city: 'Mumbai',
      salaryMin: 2200000,
      salaryMax: 2800000,
      openings: 2,
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(),
      eligibility: {
        create: {
          minCgpa: 8.5,
          maxBacklogs: 0,
          allowedDepts: ['CSE'],
          allowedGradYears: [2025],
          requiredSkills: ['Python', 'PostgreSQL']
        }
      }
    }
  })

  // 7. Seed Application for Student 1 -> Job 1
  console.log('Seeding initial application...')
  const app1 = await prisma.application.create({
    data: {
      studentId: studentUser1.studentProfile!.id,
      jobPostingId: job1.id,
      coverLetter: 'Passionate full-stack developer with extensive React and Node.js project experience.',
      status: ApplicationStatus.SHORTLISTED,
      history: {
        create: [
          {
            previousStatus: null,
            newStatus: ApplicationStatus.APPLIED,
            changedById: studentUser1.id,
            note: 'Application submitted via student portal'
          },
          {
            previousStatus: ApplicationStatus.APPLIED,
            newStatus: ApplicationStatus.SHORTLISTED,
            changedById: recUser1.id,
            note: 'Profile matched core criteria with strong CGPA'
          }
        ]
      }
    }
  })

  // Notification for student
  await prisma.notification.create({
    data: {
      userId: studentUser1.id,
      type: NotificationType.SHORTLISTED,
      title: 'Shortlisted for Nexus Technologies!',
      message: 'Congratulations! You have been shortlisted for Full Stack Software Engineer at Nexus Technologies.',
      link: `/student/applications/${app1.id}`
    }
  })

  console.log('✅ Seed completed successfully!')
  console.log('--------------------------------------------------')
  console.log('Credentials for all users:')
  console.log('Password: Password123!')
  console.log('Admin:      admin@campus.edu')
  console.log('Student 1:  arjun.sharma@student.campus.edu (CGPA 9.2, Eligible for all jobs)')
  console.log('Student 2:  priya.nair@student.campus.edu   (CGPA 7.1, 1 Backlog)')
  console.log('Recruiter:  recruiter@nexustech.io')
  console.log('--------------------------------------------------')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
