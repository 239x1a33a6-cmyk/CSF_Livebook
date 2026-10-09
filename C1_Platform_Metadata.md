# INTERNAL PLATFORM METADATA — C1
*(Not shown to students. Companion to `C1_Student_Content.md`.)*

## 1. Identity
```text
Concept ID: C1
Concept Name: DBMS vs File System, DBMS vs RDBMS
Module: Database Fundamentals
Subject: DBMS & SQL
Learning Time: 45–60 minutes
Difficulty: Beginner
Prerequisites: none
```

## 2. Learning Objectives (used by the quiz mapping)
- LO1 Explain database vs DBMS (and catalog/metadata)
- LO2 Describe why file-processing systems break down, using a scenario
- LO3 Match each file-system problem to the DBMS mechanism that addresses it
- LO4 Define an RDBMS correctly; avoid DBMS/RDBMS traps
- LO5 Explain physical vs logical data independence with examples
- LO6 Decide when plain files are still reasonable
- LO7 Answer standard interview questions with a clear structure

## 3. Content Block Inventory (student file, in order)
| # | Section | Block types |
|---|---|---|
| 1 | Concept Overview, What You Will Learn | HEADING, TEXT |
| 2 | Why This Matters | TEXT, DIAGRAM (VB-1), TEXT |
| 3 | Mental Model | CALLOUT, TABLE |
| 4 | Database vs DBMS | TEXT, EXAMPLE, UNDERSTANDING_CHECK |
| 5 | File-Processing System; Program-Data Dependence | TEXT, UNDERSTANDING_CHECK |
| 6 | File-System Problems | TEXT, DIAGRAM (VB-2), DIAGRAM (VB-3), UNDERSTANDING_CHECK |
| 7 | How a DBMS Solves Them | TABLE, CALLOUT |
| 8 | DBMS vs RDBMS | TEXT, DIAGRAM (VB-4), COMPARISON, WARNING |
| 9 | Data Independence; Physical vs Logical | TEXT, DIAGRAM (VB-5), COMPARISON, UNDERSTANDING_CHECK |
| 10 | When Files Are Still Enough | FLOWCHART (VB-6), TEXT |
| 11 | Worked Examples 1–3 | EXAMPLE, SQL, TABLE |
| 12 | Deep Understanding | TEXT |
| 13 | Real-World Applications | TABLE |
| 14 | Common Misconceptions (6) | MISCONCEPTION |
| 15 | Common Mistakes | TABLE |
| 16 | Important Edge Cases | TABLE |
| 17 | Interview Intelligence (7 questions + follow-up chain) | INTERVIEW_QUESTION |
| 18 | Understanding Checks (5 integrative) | UNDERSTANDING_CHECK |
| 19 | Concept Quiz (12) | QUIZ |
| 20 | Cheat Sheet | CHEAT_SHEET |
| 21 | Cross-Concept Connections | TEXT, FLOWCHART |
| 22 | If You Remember Only 5 Things; Can You Now… | RECAP |

## 4. Visual Register
Student-facing placeholders VB-1…VB-6 map to research visuals as follows.

### VB-1 ↔ V1.1
- **Placement:** immediately after the Registrar/Hostel/Library scenario, before the three questions.
- **Purpose:** show duplication and program–data dependence at a glance.
- **Specification:** two-panel architecture comparison. Left "File-processing": three application boxes (Registrar, Hostel, Library) stacked, each with an arrow to its own file icon (`registrar_students`, `hostel_students`, `library_members`); inside each application box a note "file layout is written into this program". Right "DBMS": the same three application boxes; all arrows go to one large "DBMS" box containing "Catalog (definitions of the data)" and "Query processor"; one arrow from the DBMS to a single "Shared data store" cylinder.
- **Labels:** Own file per program · Layout hard-coded in application · Same student stored three times · One shared store · Catalog · Query processor.
- **Takeaway:** in a DBMS the data and its description are shared, not copied and hard-coded into every program.

### VB-2 ↔ V1.2
- **Placement:** after the redundancy/inconsistency definitions.
- **Purpose:** turn "inconsistency" from a word into a visible failure.
- **Specification:** three-step process, left to right. Step 1 "Same data in 3 files": three file cards each showing `Asha — 12 Lake Road`. Step 2 "Update applied to two": Registrar and Hostel cards show `Asha — 40 Hill Street` (highlighted green); Library card unchanged. Step 3 "Ask a question": result bubble "Where does Asha live?" returning two different values, stale Library card outlined red.
- **Labels:** Registrar file · Hostel file · Library file · Updated · Not updated (stale) · Two different answers.
- **Takeaway:** redundancy makes every update a "change all copies" task; one missed copy yields silently wrong data.

### VB-3 ↔ V1.3
- **Placement:** after the transfer/atomicity paragraph.
- **Purpose:** show why partial updates matter without transaction jargon.
- **Specification:** two horizontal timelines. Lane 1 "File-processing": "Debit ₹500 from Account A (written)" → crash → "Credit Account B (never happens)"; end state "₹500 has vanished". Lane 2 "DBMS": "Start unit of work" → "Debit A" → crash → "DBMS undoes the unfinished work (rolls back)"; end state "A and B unchanged".
- **Labels:** Debit written · Crash · Credit missing · Rolled back · Both accounts unchanged.
- **Takeaway:** the DBMS treats both steps as one unit: both happen or neither.

### VB-4 ↔ V1.5
- **Placement:** after the DBMS/RDBMS definitions.
- **Purpose:** show DBMS vs RDBMS as nesting, not a has/has-not table.
- **Specification:** nested circles. Outer "DBMS (any data model)"; inside "Relational DBMS (data as relations/tables + keys)"; innermost "SQL products you will use (e.g., PostgreSQL, MySQL, SQLite, Oracle, SQL Server)". Side note: "How closely real SQL products follow the pure relational model is debated."
- **Takeaway:** "relational" names the data model; every RDBMS is a DBMS, but not conversely.

### VB-5 ↔ V1.4
- **Placement:** where the three levels are introduced (Data Independence).
- **Purpose:** show which layer a change touches and why applications stay unaffected.
- **Specification:** layered diagram. Top "External level": boxes "Student view (name, dept)" and "Accounts view (roll no, fees)". Middle "Conceptual level": "Whole database structure: student, fee tables". Bottom "Internal level": "Storage: files, indexes". Arrow between top and middle labelled "mapping", bracket "Logical data independence"; arrow between middle and bottom labelled "mapping", bracket "Physical data independence". Callouts: beside bottom bracket "Add an index → applications unaffected"; beside top bracket "Split a table in two, keep the same view → applications unaffected".
- **Takeaway:** you can change a lower level without breaking the level above it.

### VB-6 ↔ V1.6
- **Placement:** "When Files Are Still Enough".
- **Purpose:** connect the trade-off to a practical choice.
- **Specification:** decision flow: (1) Shared by several programs or people? (2) Must it live a long time? (3) Rules enforced (integrity, permissions)? (4) Many users updating at once? Outcomes: all "No" → "A plain file may be enough"; sharing/rules needed, single application, no server wanted → "An embedded database (e.g. SQLite)"; many users and rules → "A server DBMS".
- **Takeaway:** choose a DBMS for shared data, rules or concurrent use, not by default.

*Status: specifications only; none rendered. Illustration values (₹500, addresses) are invented and must be labelled as sample data if rendered.*

## 5. Example IDs Used
- X1.1 → Worked Example 2 (SQL). Examples 1 and 3 are reasoning exercises with no code (Example 3 derives from Content Bible scenario Q23).

## 6. Interview Question IDs Used
| Student Q# | Research ID | Group | Evidence label |
|---|---|---|---|
| 1 | Q01 | Basic | Frequently discussed topic (aggregated prep material) |
| 2 | Q02 | Basic | Frequently discussed topic |
| 3 | Q03 | Basic | Frequently discussed topic (with flagged weak claims) |
| 4 | Q10 | Conceptual | Frequently discussed topic |
| 5 | Q23 | Scenario | Practice prediction |
| 6 | Q32 | Deep-dive | Practice prediction |
| 7 | Q33 | Deep-dive | Practice prediction; low frequency, not verified as frequent |
No company-specific claim is made or implied. Evidence is aggregated prep material only (tier T4).

## 7. Assessment Objectives and Quiz Mapping
| Q | Type | Difficulty | LO | Misconception tested |
|---|---|---|---|---|
| 1 | MCQ | Easy | LO1 | database = DBMS |
| 2 | MCQ | Easy | LO2 | — |
| 3 | Matching | Medium | LO3 | — |
| 4 | Correct the statement | Medium | LO4 | false DBMS/RDBMS absolutes |
| 5 | MCQ | Medium | LO4 | files-vs-tables; "follows all Codd rules" |
| 6 | Output prediction | Medium | LO2/LO3 | — |
| 7 | MCQ | Medium | LO5 | — |
| 8 | Scenario | Medium–Hard | LO2/LO3 | sync-script fix |
| 9 | Short answer | Hard | LO5 | — |
| 10 | Misconception detection | Medium | LO3 | "no redundancy" |
| 11 | Comparison | Medium | LO1/LO3 | "DBMS = no files" |
| 12 | Short answer | Medium | LO6 | — |
LO7 is assessed through the Interview Intelligence section and Understanding Checks, not the quiz.

## 8. INTERNAL ANSWER DATA — Concept Quiz
- **Q1:** B. A database is the data, a DBMS is the software; "data about data" is metadata.
- **Q2:** B. Copies of the same data drifted apart.
- **Q3:** 1 atomicity; 2 security; 3 difficult access; 4 concurrent-access anomaly.
- **Q4:** Accept e.g. "An RDBMS is a DBMS based on the relational model (data in relations/tables with keys). Relationships or constraints are not what separates the terms." Reject answers keeping the absolute.
- **Q5:** B. A is the file confusion; C is an absolute; D is not established.
- **Q6:** one row: `Asha`. Ben is CSE but 7.5 is not above 8; Chitra is above 8 but ECE.
- **Q7:** A. The internal level changed; conceptual level and applications unaffected.
- **Q8:** Redundancy and inconsistency (and hard-to-combine data); fix: store each patient once in a shared record used by all three.
- **Q9:** A physical change changes nothing users see. A logical change alters structure, so each view's mapping must still return the same rows/columns; if the needed information is gone it cannot be hidden.
- **Q10:** B. Some redundancy is intentional.
- **Q11:** Who manages structure and rules: the DBMS provides shared catalog, query language, constraint enforcement, atomic transactions, concurrency control and access control instead of each program.
- **Q12:** e.g. a single user's short-lived data with no shared rules or concurrent users; none of the needs that justify a DBMS exist.

## 9. INTERNAL ANSWER DATA — Understanding Checks and Quick Checks
- Quick check (database vs DBMS): most likely a DBMS (possibly with a database in it); ask what they installed and whether it holds any data yet.
- Quick check (mobile number): every program that reads that file, because layouts are hard-coded.
- Quick check (problem naming): (a) concurrent-access anomaly; (b) integrity problem; (c) security problem.
- Quick check (physical/logical): (a) physical; (b) logical.
- Check 1: redundancy leading to inconsistency (copies of address not all updated).
- Check 2: file-based: every program using the Library file may need changes (program–data dependence); with logical independence existing views/applications should remain unchanged because the mapping absorbs the change.
- Check 3: (a) plain file (single user, short-lived, no shared rules); (b) DBMS (shared, long-lived, access control and integrity).
- Check 4: a DBMS under another data model can also express relationships; "relational" is about the data model. Rewrite per Quiz Q4.
- Check 5: integrity/consistency of rules; declare once and enforce centrally.

## 9a. Cross-Concept Links
C1→C2 (relational vocabulary; table vs relation) · C1→C3 (college scenario as a design problem) · C1→C4 (DDL vs DML as working form of data independence) · C1→C5 (integrity via constraints). Forward, not expanded: transactions, concurrency, normalisation, indexing, privileges.

## 10. Vendor-Specific Topics
- SQLite described as an embedded RDBMS (product-specific; labelled). PostgreSQL, MySQL, Oracle and SQL Server described only as "typically run as servers".
- Catalog inspection syntax in Example 2 is engine-named (`information_schema.columns`: PostgreSQL and MySQL; `PRAGMA table_info`: SQLite).
- Example 2's query is basic and was run on three engines; the student text deliberately makes no cross-engine claim.

## 11. Evidence-Sensitive Topics
- **Data-model history / "a DBMS need not support relationships":** no authoritative source gathered (gap G-C1-01). Student content uses only the model-based definition and makes no statement about hierarchical/network systems.
- **Codd's rules:** count (13, numbered 0–12) from a secondary source; the critique is attributed generically ("critics"); gap G-C1-02.
- **Three-schema "not implemented in full everywhere":** lecture-slide source; presented only as "reference model".
- **"Is MongoDB a DBMS/RDBMS?" follow-up:** answered by reasoning from definitions; no product claim.
- **Backup and recovery:** named only; mechanism is a cross-module (transactions) topic.
- **"SQL tables can contain duplicate rows and NULLs" (Deep Understanding):** theory-level claim, secondary sources; expanded in the next concept.
- **DBA role list:** fragmentary source; presented as a pattern, not an exhaustive list.

## 12. Source IDs
S60 (file-system lectures) · S67 (architecture slides) · S45 (Relational model, Wikipedia) · S47 (Codd's 12 rules, Wikipedia) · S62 (DBDebunk/Register commentary) · S63 (interview-prep aggregate, frequency only) · S44 (Codd 1970) · S23 (SQLite) · S53/S54/S55 (executed runs).

## 13. Verification Information
- Example 2 (X1.1) executed on SQLite 3.45.1, PostgreSQL 16.15, MySQL 8.0.46; result `Asha` on all three.
- All other C1 content is conceptual (no executable claims).
- Corrections preserved from the audit: "controlled, not eliminated" redundancy (not "no redundancy"); Codd rules = 13 (0–12), not 12; DBMS/RDBMS absolutes table rejected.
- Carried-over sources S60–S84 were not re-fetched in the audit.

## 14. Authoring Warnings
- Do not reintroduce the "DBMS = files / RDBMS = tables" table or the "DBMS has no relationships/constraints/multi-user" claims.
- Do not state "no redundancy".
- Do not state Codd's rules as a requirement of an RDBMS.
- Do not add company-specific interview claims.
- Do not teach C2–C6 content; later concepts are only named.
- Keep IDs, tags and audit terms out of student-facing blocks.
- Visual blocks must render from the specifications above; the student file only contains title, caption and "What to notice".

## 15. Content Quality Notes
- Student file contains no source IDs, evidence tags, visual/example/question IDs, correction or gap IDs, verification wording, or audit terminology (checked by script).
- Visual placeholders appear at the point of need (after the scenario, redundancy, atomicity, definitions, three levels, and the files-vs-DBMS decision).
- Length control: per-problem "how a DBMS helps" notes were consolidated into one mapping table to avoid repetition; recap and cheat sheet each add a different compression level.
- Open items for human review: draw the six visuals; decide whether the "Quick check" prompts become interactive blocks; confirm data-model history wording if a textbook source is added.
