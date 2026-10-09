import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { c1Content } from './data/c1-content';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // ── Admin user ──────────────────────────────────────────────────────────────
    const adminPassword = await bcrypt.hash('Admin@1234', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@csf.dev' },
        update: {},
        create: {
            name: 'Admin',
            email: 'admin@csf.dev',
            passwordHash: adminPassword,
            role: 'ADMIN',
        },
    });
    console.log('✅ Admin user:', admin.email);

    // ── DBMS & SQL Subject ──────────────────────────────────────────────────────
    const dbmsSubject = await prisma.subject.upsert({
        where: { slug: 'dbms-sql' },
        update: {},
        create: {
            name: 'DBMS & SQL',
            slug: 'dbms-sql',
            description:
                'Master database management systems, relational model, SQL, normalization, transactions, and query optimization.',
            icon: '🗄️',
            order: 2,
            isPublished: true,
        },
    });
    console.log('✅ Subject:', dbmsSubject.name);

    // ── Database Fundamentals Module ────────────────────────────────────────────
    const dbFundamentalsModule = await prisma.module.upsert({
        where: { slug: 'database-fundamentals' },
        update: {},
        create: {
            subjectId: dbmsSubject.id,
            name: 'Database Fundamentals',
            slug: 'database-fundamentals',
            description:
                'Core concepts every developer and engineer must understand about databases before writing a single query.',
            order: 1,
            isPublished: true,
        },
    });
    console.log('✅ Module:', dbFundamentalsModule.name);

    // ── C1 Concept ─────────────────────────────────────────────────────────────
    const c1Concept = await prisma.concept.upsert({
        where: { slug: 'c1-dbms-vs-file-system' },
        update: {},
        create: {
            moduleId: dbFundamentalsModule.id,
            conceptCode: 'C1',
            title: 'DBMS vs File System, DBMS vs RDBMS',
            slug: 'c1-dbms-vs-file-system',
            description:
                'Understand why databases replaced file systems, what a DBMS actually manages, and the precise distinction between DBMS and RDBMS.',
            estimatedMinutes: 50,
            difficulty: 'BEGINNER',
            order: 1,
            isPublished: true,
        },
    });
    console.log('✅ Concept:', c1Concept.conceptCode, c1Concept.title);

    // ── C1 Content ─────────────────────────────────────────────────────────────
    await prisma.conceptContent.upsert({
        where: { conceptId: c1Concept.id },
        update: { blocks: c1Content.blocks as object },
        create: {
            conceptId: c1Concept.id,
            blocks: c1Content.blocks as object,
        },
    });
    console.log('✅ C1 content seeded');

    // ── C1 Assessment ───────────────────────────────────────────────────────────
    const c1Assessment = await prisma.assessment.upsert({
        where: { id: 'c1-concept-quiz-seed' },
        update: {},
        create: {
            id: 'c1-concept-quiz-seed',
            conceptId: c1Concept.id,
            type: 'CONCEPT_QUIZ',
            title: 'C1 Concept Quiz — DBMS vs File System, DBMS vs RDBMS',
            description: 'Test your understanding of DBMS fundamentals.',
            passingScore: 70,
            isPublished: true,
        },
    });
    console.log('✅ Assessment:', c1Assessment.title);

    // Import quiz questions from data file
    const { c1Questions } = await import('./data/c1-questions');
    for (const q of c1Questions) {
        await prisma.question.upsert({
            where: { id: q.id },
            update: {},
            create: {
                ...q,
                assessmentId: c1Assessment.id,
            },
        });
    }
    console.log(`✅ ${c1Questions.length} quiz questions seeded`);

    // ── Placeholder concepts C2–C6 (coming soon) ────────────────────────────────
    const comingSoon = [
        { code: 'C2', title: 'Relational Model Terminology', order: 2 },
        { code: 'C3', title: 'Keys — Primary, Candidate, Foreign', order: 3 },
        { code: 'C4', title: 'Normalization — 1NF to BCNF', order: 4 },
        { code: 'C5', title: 'Transactions & ACID Properties', order: 5 },
        { code: 'C6', title: 'Indexing & Query Optimization', order: 6 },
    ];
    for (const cs of comingSoon) {
        await prisma.concept.upsert({
            where: { slug: `${cs.code.toLowerCase()}-${cs.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` },
            update: {},
            create: {
                moduleId: dbFundamentalsModule.id,
                conceptCode: cs.code,
                title: cs.title,
                slug: `${cs.code.toLowerCase()}-${cs.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                description: 'Coming soon.',
                estimatedMinutes: 45,
                difficulty: 'BEGINNER',
                order: cs.order,
                isPublished: false, // Not yet published
            },
        });
    }
    console.log('✅ Placeholder concepts C2–C6 seeded (unpublished)');

    // ── Other subjects (scaffolded, unpublished) ─────────────────────────────────
    const otherSubjects = [
        { name: 'Operating Systems', slug: 'operating-systems', icon: '💻', order: 1 },
        { name: 'GenAI & AI', slug: 'genai-ai', icon: '🤖', order: 3 },
        { name: 'DevOps', slug: 'devops', icon: '🔧', order: 4 },
        { name: 'OOP', slug: 'oop', icon: '📦', order: 5 },
        { name: 'Computer Networks', slug: 'computer-networks', icon: '🌐', order: 6 },
        { name: 'System Design', slug: 'system-design', icon: '🏗️', order: 7 },
        { name: 'Computer Architecture', slug: 'computer-architecture', icon: '⚙️', order: 8 },
    ];
    for (const s of otherSubjects) {
        await prisma.subject.upsert({
            where: { slug: s.slug },
            update: {},
            create: {
                name: s.name,
                slug: s.slug,
                description: `Coming soon — ${s.name} fundamentals.`,
                icon: s.icon,
                order: s.order,
                isPublished: false,
            },
        });
    }
    console.log('✅ Other subjects scaffolded (unpublished)');

    console.log('\n🎉 Seed complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
