import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CollegeCollab database...');

  // Create departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { code: 'CS' },
      update: {},
      create: { name: 'Computer Science', code: 'CS', description: 'Department of Computer Science and Engineering' },
    }),
    prisma.department.upsert({
      where: { code: 'EE' },
      update: {},
      create: { name: 'Electrical Engineering', code: 'EE', description: 'Department of Electrical Engineering' },
    }),
    prisma.department.upsert({
      where: { code: 'MATH' },
      update: {},
      create: { name: 'Mathematics', code: 'MATH', description: 'Department of Mathematics' },
    }),
  ]);

  // Create admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@collegecollab.rw' },
    update: {},
    create: {
      email: 'admin@collegecollab.rw',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
    },
  });
  await prisma.adminProfile.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id },
  });

  // Create lecturer
  const lecturerPassword = await bcrypt.hash('lecturer123', 12);
  const lecturer = await prisma.user.upsert({
    where: { email: 'lecturer@collegecollab.rw' },
    update: {},
    create: {
      email: 'lecturer@collegecollab.rw',
      password: lecturerPassword,
      firstName: 'Jean-Pierre',
      lastName: 'Nkurunziza',
      role: 'LECTURER',
    },
  });
  const lecturerProfile = await prisma.lecturerProfile.upsert({
    where: { userId: lecturer.id },
    update: {},
    create: { userId: lecturer.id, employeeId: 'LEC001', title: 'Dr.', specialization: 'Computer Science' },
  });

  // Create student
  const studentPassword = await bcrypt.hash('student123', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@collegecollab.rw' },
    update: {},
    create: {
      email: 'student@collegecollab.rw',
      password: studentPassword,
      firstName: 'Alice',
      lastName: 'Ntwali',
      role: 'STUDENT',
    },
  });
  const studentProfile = await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {},
    create: { userId: student.id, studentId: 'STU001', enrollmentYear: 2024, gpa: 3.7 },
  });

  // Create courses
  const course1 = await prisma.course.upsert({
    where: { code: 'CS101' },
    update: {},
    create: {
      name: 'Introduction to Computer Science',
      code: 'CS101',
      description: 'Fundamentals of computer science, programming, and problem solving.',
      credits: 3,
      departmentId: departments[0].id,
      lecturerId: lecturerProfile.id,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { code: 'CS201' },
    update: {},
    create: {
      name: 'Data Structures and Algorithms',
      code: 'CS201',
      description: 'Advanced data structures and algorithm design.',
      credits: 4,
      departmentId: departments[0].id,
      lecturerId: lecturerProfile.id,
    },
  });

  // Enroll student
  await prisma.enrollment.upsert({
    where: { studentId_courseId: { studentId: studentProfile.id, courseId: course1.id } },
    update: {},
    create: { studentId: studentProfile.id, courseId: course1.id },
  });

  // Create tasks
  await prisma.task.upsert({
    where: { id: 'task-seed-001' },
    update: {},
    create: {
      id: 'task-seed-001',
      title: 'Binary Trees Implementation',
      description: 'Implement a binary search tree with insert, delete, and traversal operations.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      courseId: course1.id,
      createdById: lecturer.id,
      priority: 'HIGH',
      maxScore: 100,
    },
  });

  await prisma.task.upsert({
    where: { id: 'task-seed-002' },
    update: {},
    create: {
      id: 'task-seed-002',
      title: 'Sorting Algorithms Lab',
      description: 'Implement and compare bubble sort, merge sort, and quicksort algorithms.',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      courseId: course1.id,
      createdById: lecturer.id,
      priority: 'MEDIUM',
      maxScore: 100,
    },
  });

  console.log('✅ Seeding completed!');
  console.log('\n📋 Demo Accounts:');
  console.log('   Admin    → admin@collegecollab.rw   / admin123');
  console.log('   Lecturer → lecturer@collegecollab.rw / lecturer123');
  console.log('   Student  → student@collegecollab.rw  / student123\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
