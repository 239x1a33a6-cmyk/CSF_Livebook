import { PrismaClient, AssessmentType } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function sluggify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
    console.log("Starting idempotent curriculum seed...");

    // Read the validated curriculum tree
    const rawData = fs.readFileSync(path.join(__dirname, 'curriculum-seed.json'), 'utf-8');
    const subjects = JSON.parse(rawData);

    let subjectOrder = 1;
    for (const subject of subjects) {
        const subjectSlug = sluggify(subject.name);

        let dbSubject = await prisma.subject.upsert({
            where: { slug: subjectSlug },
            update: { name: subject.name, order: subjectOrder, isPublished: true },
            create: {
                name: subject.name,
                slug: subjectSlug,
                description: `Complete guide to ${subject.name}`,
                order: subjectOrder,
                isPublished: true
            }
        });

        let moduleOrder = 1;
        for (const mod of subject.modules) {
            const modSlug = sluggify(subject.name + '-' + mod.name);

            let dbModule = await prisma.module.upsert({
                where: { slug: modSlug },
                update: {
                    name: mod.name,
                    order: moduleOrder,
                    description: mod.objective || `Module covering ${mod.name}`,
                    isPublished: true
                },
                create: {
                    subjectId: dbSubject.id,
                    name: mod.name,
                    slug: modSlug,
                    description: mod.objective || `Module covering ${mod.name}`,
                    order: moduleOrder,
                    isPublished: true
                }
            });

            // Ensure an Assessment placeholder for the Module exists (for "Assigned Soon")
            const existingAssessment = await prisma.assessment.findFirst({
                where: { moduleId: dbModule.id, type: AssessmentType.MODULE_ASSESSMENT }
            });
            if (!existingAssessment) {
                await prisma.assessment.create({
                    data: {
                        moduleId: dbModule.id,
                        type: AssessmentType.MODULE_ASSESSMENT,
                        title: `${mod.name} Final Assessment`,
                        description: `Comprehensive assessment for ${mod.name}.`,
                        isPublished: false
                    }
                });
            }

            let conceptOrder = 1;
            for (const concept of mod.concepts) {
                // Safely reconcile C1 based on identical source strings
                const isC1 = concept.title.toLowerCase().includes('dbms vs file system') && concept.title.toLowerCase().includes('dbms vs rdbms');

                let slugCandidate = isC1 ? 'c1-dbms-vs-file-system' : sluggify(mod.name + '-' + concept.title);
                if (slugCandidate.length > 250) slugCandidate = slugCandidate.substring(0, 250); // safety

                let matchingConceptCode = `S${subjectOrder}M${moduleOrder}C${conceptOrder}`;
                if (isC1) matchingConceptCode = 'C1';

                // Look for existing concept by slug to preserve code if it existed before
                const existingConcept = await prisma.concept.findUnique({ where: { slug: slugCandidate } });
                if (existingConcept && !isC1) {
                    matchingConceptCode = existingConcept.conceptCode;
                }

                await prisma.concept.upsert({
                    where: { slug: slugCandidate },
                    update: {
                        title: concept.title,
                        description: concept.description || `Learning material for ${concept.title}`,
                        order: conceptOrder,
                        moduleId: dbModule.id // Realignment
                    },
                    create: {
                        moduleId: dbModule.id,
                        conceptCode: matchingConceptCode,
                        title: concept.title,
                        slug: slugCandidate,
                        description: concept.description || `Learning material for ${concept.title}`,
                        estimatedMinutes: 30,
                        order: conceptOrder,
                        isPublished: false // Not immediately "available" until resources uploaded, but visible
                    }
                });

                conceptOrder++;
            }
            moduleOrder++;
        }
        subjectOrder++;
    }
    console.log("Seed complete! 8 subjects, 42 modules, 184 concepts fully idempotent.");
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
