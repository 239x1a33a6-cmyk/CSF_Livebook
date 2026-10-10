// @ts-nocheck
import fs from 'fs';
import path from 'path';

function parseSyllabus() {
    const text = fs.readFileSync(path.join(__dirname, '../../../syllabus.txt'), 'utf8');
    const lines = text.split('\n').map(l => l.trim().replace(/\s+/g, ' ')).filter(l => l);

    const modules = [];
    let currentModule = null;

    // Ignore Page Headers
    const isIgnored = (l) => l.startsWith('CS FUNDAMENTALS INTERVIEW SYLLABUS') ||
        l.startsWith('High-priority topics only') ||
        l.startsWith('Source:') ||
        l.match(/^Page \d+$/);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (isIgnored(line)) continue;

        // Skip TOC section completely
        if (i < 27) continue;

        // Detect Module by looking ahead for "X concepts"
        // Wait, if it's "X concepts" down below, then "line" might be the module name.
        if (lines[i + 1] && lines[i + 1].match(/^\d+ concepts$/) && !lines[i + 2]?.match(/^\d+ must-know/)) {
            let name = line;

            // if the previous line isn't a known boundary (numbers, bullet points, ignored)
            // It could be the first half of a module name.
            if (!isIgnored(lines[i - 1]) && !lines[i - 1].match(/^\d+/) && !lines[i - 1].startsWith('●')) {
                // If it's a known Subject name, we ignore it from the module title
                const subjectNames = [
                    'DBMS & SQL', 'Object-Oriented', 'Programming',
                    'Operating', 'Systems', 'Computer', 'Networks',
                    'DevOps and Software', 'Delivery', 'Architecture',
                    'System Design', 'Fundamentals', 'GenAI and AI'
                ];
                let isSubjectStr = false;
                for (let sn of subjectNames) {
                    if (lines[i - 1] === sn) isSubjectStr = true;
                }
                if (!isSubjectStr) {
                    name = lines[i - 1] + ' ' + line;
                }
            }

            // Clean up module name
            if (name.startsWith('DBMS & SQL ')) name = name.replace('DBMS & SQL ', '');
            if (name.startsWith('GenAI and AI Fundamentals ')) name = name.replace('GenAI and AI Fundamentals ', '');

            currentModule = {
                name: name.trim(),
                expectedConcepts: parseInt(lines[i + 1].split(' ')[0]),
                objective: "",
                concepts: []
            };
            modules.push(currentModule);
            i++; // skip 'X concepts'

            // Gather the objective string until the first bullet point
            let objLines = [];
            while (i + 1 < lines.length && !lines[i + 1].startsWith('●') && !isIgnored(lines[i + 1])) {
                // If the next line is a subject name repeat, skip it in Objective
                if (['DBMS & SQL', 'Operating Systems', 'Computer Networks'].includes(lines[i + 1])) break;
                objLines.push(lines[++i]);
            }
            currentModule.objective = objLines.join(' ');
            continue;
        }

        // Concept Declaration
        if (line.startsWith('●') && currentModule) {
            let conceptText = line.substring(1).trim();

            while (i + 1 < lines.length && !lines[i + 1].startsWith('●') && !isIgnored(lines[i + 1])) {
                if (lines[i + 2] && lines[i + 2].match(/^\d+ concepts$/)) break; // Next module indicator
                if (lines[i + 1].match(/^\d+ concepts$/) || lines[i + 1].match(/^\d+ modules$/)) break;

                conceptText += ' ' + lines[++i];
            }

            let splitIndex = conceptText.indexOf('–');
            if (splitIndex === -1) splitIndex = conceptText.indexOf('-');

            let title = conceptText;
            let currentDesc = "";
            if (splitIndex !== -1) {
                title = conceptText.substring(0, splitIndex).trim();
                currentDesc = conceptText.substring(splitIndex + 1).trim();
            }

            currentModule.concepts.push({
                title: title.trim(),
                description: currentDesc.trim()
            });
            continue;
        }
    }

    // Now deterministic split into 8 subjects based on the layout
    const TOC = [
        { name: "DBMS & SQL", expectedModules: 8 },
        { name: "Object-Oriented Programming", expectedModules: 5 },
        { name: "Operating Systems", expectedModules: 9 },
        { name: "Computer Networks", expectedModules: 5 },
        { name: "DevOps and Software Delivery", expectedModules: 7 },
        { name: "Computer Architecture", expectedModules: 1 },
        { name: "System Design Fundamentals", expectedModules: 1 },
        { name: "GenAI and AI Fundamentals", expectedModules: 6 }
    ];

    const subjects = [];
    let modPointer = 0;

    for (let t of TOC) {
        let subjModules = modules.slice(modPointer, modPointer + t.expectedModules);
        subjects.push({
            name: t.name,
            modules: subjModules
        });
        modPointer += t.expectedModules;
    }

    // Validation
    let sCount = subjects.length;
    let mCount = modules.length;
    let cCount = 0;
    let discrepancies = [];

    modules.forEach(m => {
        cCount += m.concepts.length;
        if (m.expectedConcepts !== m.concepts.length) {
            discrepancies.push(`Mismatch in module "${m.name}": Expected ${m.expectedConcepts}, Found ${m.concepts.length}`);
        }
    });

    console.log(`Extracted: ${sCount} Subjects, ${mCount} Modules, ${cCount} Concepts.`);
    if (sCount !== 8 || mCount !== 42 || cCount !== 184) {
        console.error("❌ COUNTS DO NOT MATCH TARGET!");
        if (discrepancies.length > 0) {
            console.error("Discrepancies found:");
            discrepancies.forEach(d => console.error(d));
        }
    } else {
        console.log("✅ All counts match the target 8/42/184.");
        fs.writeFileSync(path.join(__dirname, 'curriculum-seed.json'), JSON.stringify(subjects, null, 2));
    }
}

parseSyllabus();
