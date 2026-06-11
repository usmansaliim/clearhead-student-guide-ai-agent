# ── NUST Knowledge Base ─────────────────────────────────────
# Extracted from NUST UG Handbook + community knowledge

NUST_KB = {
    "grading": {
        "scale": {
            "A": 4.00, "B+": 3.50, "B": 3.00,
            "C+": 2.50, "C": 2.00, "D+": 1.50, "D": 1.00, "F": 0.00
        },
        "minimum_cgpa": {
            "engineering_cs": 2.00,
            "business_social": 2.50
        },
        "grading_system": "Relative grading on 1.00 to 4.00 scale",
        "to_earn_credits": "Minimum 1.0 grade point (D grade) per course",
        "xf_grade": "XF = F due to attendance shortage below 75%. Can only be cleared by repeating the course.",
        "i_grade": "Incomplete — given for illness/valid reason if attendance >= 75%",
        "w_grade": "Dropped course — appears on transcript but not counted in GPA",
    },

    "attendance": {
        "minimum": "75% attendance mandatory to appear in End Semester Exam",
        "penalty": "Below 75% = XF grade (counts as F, cannot be retested)",
        "no_exceptions": "No deviation from 75% rule under any circumstances",
        "tip": "Missing even a few classes can push you below 75% in a semester. Track attendance weekly."
    },

    "academic_deficiency": {
        "triggers": [
            "F or XF grade in any course",
            "Semester GPA below 2.00 (2.50 for Business/Social Sciences)",
            "CGPA below 2.00",
            "Incomplete (I) grade in any course"
        ],
        "disposals": {
            "warning": "SGPA < 2.00 or F/XF but doesn't qualify for probation. Student must contact faculty and keep records.",
            "probation": "CGPA < 2.00 and doesn't qualify for withdrawal. 4 consecutive probations = withdrawal.",
            "suspension": "Disciplinary grounds, attendance below 75% on medical grounds, absent 30-45 consecutive days.",
            "withdrawal": "7+ F/XF grades accumulated, 4 consecutive probations, 5+ F/XF in first semester, or can't complete degree in max time."
        }
    },

    "course_repeat": {
        "to_clear_f": "Can repeat to clear W/F/XF. Both grades appear on transcript but better grade counts for CGPA.",
        "for_improvement": "Can repeat max 5 courses for CGPA improvement (grade below 2.0). Better grade counted.",
        "eligibility_honors": "Repeating ANY course makes you ineligible for academic honors except Rector's Gold Medal.",
        "retest": "If failed course is a prerequisite, retest within first 6 academic weeks of next semester. Max achievable grade = D.",
        "xf_retest": "XF grade (attendance failure) CANNOT appear in retest. Must repeat full course."
    },

    "course_load": {
        "minimum_regular": "15 credit hours per semester",
        "maximum_regular": "21 credit hours per semester",
        "summer_max": "Maximum 2 courses in summer semester",
        "add_drop_deadline": "Add/drop within first 2 weeks of regular semester, 1st week of summer",
        "drop_deadline": "Can drop course up to 8th week of regular semester (gets W grade)",
        "w_limit": "Maximum 2 Ws per semester, maximum 4 Ws accumulated at any time"
    },

    "summer_semester": {
        "purpose": "NOT a regular semester. Only for: clearing F grades, improving grades, repeat courses, minors",
        "conditions": "Min 5 students needed for a course to be offered",
        "cannot": "XF grades (attendance failures) cannot be cleared in summer unless institution approves",
        "fee": "Pay per credit hour fee for summer courses"
    },

    "degree_requirements": {
        "bscs": {
            "credit_hours": 133,
            "minimum_cgpa": 2.00,
            "duration": "Minimum 4 years, maximum 7 years",
            "internship": "Mandatory internship (graded, 3 CHs, min 6 weeks) — appears as Qualified/Not Qualified on transcript",
            "community_service": "2 credit hours community service course mandatory"
        },
        "general": {
            "final_year_project": "Minimum C grade required in final year design project",
            "internship_voluntary": "1st/2nd year students can do 4-8 week voluntary internship in NGOs/public sector in summer"
        }
    },

    "gpa_calculation": {
        "formula": "Sum of (Grade Points × Credit Hours) / Total Credit Hours",
        "cgpa": "Cumulative across all semesters",
        "sgpa": "Single semester GPA",
        "tip": "Improving one bad grade can significantly boost CGPA — especially in high credit hour courses (3-4 CH courses matter most)"
    },

    "probation_survival": {
        "what_to_do": [
            "Contact faculty for guidance immediately",
            "Keep complete records of all semester work",
            "Visit student advisor (mandatory sessions in weeks 3, 9, 15)",
            "Don't take maximum course load while on probation",
            "Focus on clearing F grades in summer semester"
        ],
        "community_advice": [
            "Talk to seniors who've been through it — many NUST students recover from probation",
            "SEECS counseling available — use it, no shame in that",
            "Drop courses early (before week 8) rather than failing them",
            "Form study groups — NUST culture is collaborative despite competition"
        ]
    },

    "minors": {
        "eligibility": "After completing 1st year, minimum CGPA 2.75 (engineering/CS/IT) or 3.00 (NBS/S3H)",
        "requirements": "Minimum 12 CHs (4 courses) out of 6 offered",
        "available": ["Management (NBS)", "Computer Science (SEECS)", "Mathematics (SNS)", 
                     "Economics (S3H)", "Psychology (S3H)", "Data Science", "Software Engineering (MCS)"],
        "benefit": "Shows on transcript, gives career edge, allows interdisciplinary learning",
        "note": "W and F grades in Minor don't appear on transcript but you must pass all 4 courses"
    },

    "exchange_programs": {
        "eligibility": "3+ semesters completed, minimum CGPA 2.50, semesters 3-5",
        "duration": "1-2 semesters at international university",
        "process": "Apply through NUST International Office (NIO) at nio.nust.edu.pk",
        "tip": "Strong CGPA is key — selections are merit-based"
    },

    "hostel": {
        "rules": "75% attendance required to maintain hostel",
        "tip": "Hostel life at NUST is significantly different from home — more freedom but more discipline required",
        "community_advice": "Best study groups form in hostels. Use the environment — late nights in common rooms with seniors are invaluable."
    },

    "student_life_advice": {
        "first_year": [
            "First semester results don't define you but they do set your CGPA baseline — take it seriously",
            "Get to know your student advisor — they're your official lifeline for academic issues",
            "Join at least one society/club — NHC, NUST Entrepreneurship, tech societies are great for CS students",
            "The SEECS library and labs are open late — use them",
            "Build friendships across batches — seniors have gone through what you're facing"
        ],
        "gpa_recovery": [
            "CGPA recovery is possible but takes 2-3 semesters of consistent effort",
            "Focus on high credit hour courses — a B in a 4-CH course beats an A in a 1-CH course for CGPA",
            "Use summer semester strategically — clear your worst grades",
            "Past papers are gold at NUST — every senior has them, ask"
        ],
        "mental_health": [
            "NUST has counseling services — use them without shame",
            "NUST culture can feel intensely competitive — comparison kills more students than failing grades",
            "Take breaks. NUST burnout is real and well-documented on r/NUST",
            "Talk to your batch — everyone is struggling more than they show on LinkedIn"
        ],
        "career": [
            "NUST placement office actively works with companies — use it from 2nd year",
            "NSTP (National Science and Technology Park) on campus is excellent for early internships",
            "LinkedIn with NUST in your profile gets attention — Pakistani tech industry heavily recruits from NUST",
            "Build projects during summers — GitHub portfolio matters as much as CGPA for CS jobs",
            "Rozee.pk, LinkedIn, and NUST alumni network are your three internship sources"
        ],
        "finances": [
            "NUST Merit Scholarship available for top performers — check criteria with registrar",
            "Need-based financial assistance available — apply through Student Affairs",
            "Part-time work options are limited during semester — summer freelancing is more practical",
            "NUST fee structure has payment plans — contact finance directorate"
        ]
    },

    "important_contacts": {
        "registrar": "+92-51-90851041 | registrar@nust.edu.pk",
        "examinations": "+92-51-90851061",
        "academics": "+92-51-90851071 | dacad@nust.edu.pk",
        "seecs": "+92-51-90852001 | seecs@nust.edu.pk",
        "student_affairs": "Available through respective institution",
        "nust_uan": "+92-51-111-11-6878"
    },

    "common_student_problems": {
        "low_gpa": "Focus on: dropping weak courses before week 8, repeating high-CH courses in summer, getting tutoring from seniors",
        "attendance_issues": "Track attendance app daily. If at risk, talk to faculty BEFORE hitting 75% — they can sometimes help with medical grounds",
        "failing_prerequisite": "Register for retest within first 6 weeks of next semester. Max grade D but clears the block.",
        "probation": "Don't panic. Contact student advisor immediately. Make a course load plan. Use summer.",
        "mental_health": "NUST counseling exists. r/NUST community is surprisingly supportive. Talk to batch mates.",
        "family_pressure": "Extremely common at NUST. CGPA 2.5-3.0 is normal and employable. Top companies hire 2.7 CGPA NUST students regularly.",
        "no_internship": "NSTP on campus, Rozee.pk, professor research assistant positions, NUST societies — all accessible without high CGPA",
        "summer_confusion": "Default plan: 1 course to clear/improve + 1 skill to build + apply for anything"
    }
}


def search_nust_knowledge(query: str) -> dict:
    """Search the NUST knowledge base for relevant information."""
    query_lower = query.lower()
    results = {}

    # Keyword matching
    keyword_map = {
        "gpa": ["grading", "gpa_calculation"],
        "cgpa": ["grading", "gpa_calculation", "academic_deficiency"],
        "grade": ["grading", "course_repeat"],
        "attendance": ["attendance"],
        "probation": ["academic_deficiency", "probation_survival"],
        "fail": ["academic_deficiency", "course_repeat", "common_student_problems"],
        "f grade": ["course_repeat", "academic_deficiency"],
        "xf": ["attendance", "course_repeat"],
        "repeat": ["course_repeat"],
        "summer": ["summer_semester"],
        "withdraw": ["academic_deficiency", "course_load"],
        "drop": ["course_load"],
        "minor": ["minors"],
        "internship": ["degree_requirements", "student_life_advice"],
        "hostel": ["hostel"],
        "stress": ["student_life_advice"],
        "mental": ["student_life_advice"],
        "career": ["student_life_advice"],
        "job": ["student_life_advice"],
        "exchange": ["exchange_programs"],
        "scholarship": ["student_life_advice"],
        "money": ["student_life_advice"],
        "finance": ["student_life_advice"],
        "semester": ["course_load", "summer_semester"],
        "contact": ["important_contacts"],
        "counseling": ["student_life_advice"],
        "society": ["student_life_advice"],
        "suspension": ["academic_deficiency"],
        "warning": ["academic_deficiency"],
        "project": ["degree_requirements"],
        "credit": ["course_load", "degree_requirements"],
        "bscs": ["degree_requirements"],
        "seecs": ["important_contacts", "student_life_advice"],
    }

    matched_sections = set()
    for keyword, sections in keyword_map.items():
        if keyword in query_lower:
            for section in sections:
                matched_sections.add(section)

    # If nothing matched, return general student life advice
    if not matched_sections:
        matched_sections = {"student_life_advice", "common_student_problems"}

    for section in matched_sections:
        if section in NUST_KB:
            results[section] = NUST_KB[section]

    return {
        "query": query,
        "source": "NUST UG Handbook + Community Knowledge",
        "results": results,
        "disclaimer": "Based on NUST UG Handbook. Always verify critical decisions with your academic advisor or registrar."
    }


def get_nust_context_for_prompt() -> str:
    """Returns a condensed NUST context string for the system prompt."""
    return """
NUST KNOWLEDGE BASE — USE THIS TO GIVE ACCURATE NUST-SPECIFIC ADVICE:

GRADING: A=4.0, B+=3.5, B=3.0, C+=2.5, C=2.0, D+=1.5, D=1.0, F=0. Relative grading system.
MINIMUM CGPA: 2.00 for Engineering/CS, 2.50 for Business/Social Sciences
ATTENDANCE: 75% mandatory. Below 75% = XF grade (F that can't be retested, must repeat course)
XF vs F: XF = attendance failure (repeat course only). F = academic failure (can retest within 6 weeks)
MAX RETEST GRADE: D grade only. For prerequisite courses, retest within first 6 weeks of next semester.

ACADEMIC DEFICIENCY DISPOSAL:
- Warning: SGPA < 2.00 but no withdrawal
- Probation: CGPA < 2.00
- Withdrawal: 7+ F/XF grades OR 4 consecutive probations OR 5+ F/XF in first semester

COURSE REPEAT: Can repeat max 5 courses for CGPA improvement. Better grade counts. Repeating = no academic honors.
COURSE LOAD: Min 15 CHs, Max 21 CHs. Max 2 Ws per semester, 4 Ws accumulated total.
DROP DEADLINE: Week 8 of regular semester (gets W grade). After that = stuck with it.
SUMMER: Max 2 courses. Not for new courses — only repeat/deficiency/minors.
BSCS: 133 credit hours, CGPA 2.00 minimum, max 7 years to complete.
INTERNSHIP: Mandatory 6-week internship (3 CHs) for BSCS, graded as Qualified/Not Qualified.
MINORS: After 1st year, CGPA 2.75+ for CS/Engineering, 12 CHs minimum (4 courses).

STUDENT LIFE REALITY:
- CGPA 2.5-3.0 is normal and employable at NUST — top companies hire 2.7 CGPA NUST grads
- NSTP on campus = best early internship source
- Past papers from seniors are essential
- NUST counseling services exist and are free — no shame in using them
- r/NUST is active and supportive for real student problems
- SEECS specifically: very competitive culture, but batch solidarity is real
"""