import sqlite3
import json
import os
from datetime import datetime, timezone
from config import DATABASE_PATH


def get_connection():
    conn = sqlite3.connect(DATABASE_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=30000")
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS papers (
            id TEXT PRIMARY KEY,
            subject TEXT NOT NULL,
            organization_name TEXT DEFAULT '',
            semester TEXT DEFAULT '',
            syllabus TEXT NOT NULL,
            exam_pattern TEXT NOT NULL,
            total_marks INTEGER NOT NULL,
            duration_minutes INTEGER NOT NULL,
            num_questions INTEGER NOT NULL,
            difficulty_distribution TEXT NOT NULL,
            questions TEXT NOT NULL,
            sections TEXT NOT NULL,
            syllabus_topics TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pyq_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT NOT NULL,
            text TEXT NOT NULL,
            answer TEXT DEFAULT '',
            marks INTEGER DEFAULT 5,
            difficulty TEXT DEFAULT 'medium',
            question_type TEXT DEFAULT 'descriptive',
            topic TEXT DEFAULT '',
            source_file TEXT DEFAULT ''
        )
    """)
    
    # Check if answer column exists, if not add it
    cursor.execute("PRAGMA table_info(pyq_questions)")
    columns = [col["name"] for col in cursor.fetchall()]
    if "answer" not in columns:
        try:
            cursor.execute("ALTER TABLE pyq_questions ADD COLUMN answer TEXT DEFAULT ''")
        except Exception:
            pass

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_pyq_subject ON pyq_questions(subject)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_pyq_difficulty ON pyq_questions(difficulty)")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('student', 'teacher')),
            created_at TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS enrollments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            subject TEXT NOT NULL,
            subject_name TEXT NOT NULL,
            semester TEXT NOT NULL,
            UNIQUE(user_id, subject),
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS assessments (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL DEFAULT '',
            paper_id TEXT NOT NULL,
            course TEXT NOT NULL DEFAULT '',
            subject TEXT NOT NULL,
            subject_name TEXT NOT NULL,
            session_code TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL,
            FOREIGN KEY(paper_id) REFERENCES papers(id)
        )
    """)
    assessment_columns = [col["name"] for col in cursor.execute("PRAGMA table_info(assessments)").fetchall()]
    for column, definition in [("title", "TEXT NOT NULL DEFAULT ''"), ("course", "TEXT NOT NULL DEFAULT ''")]:
        if column not in assessment_columns:
            cursor.execute(f"ALTER TABLE assessments ADD COLUMN {column} {definition}")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS attempts (
            id TEXT PRIMARY KEY,
            assessment_id TEXT NOT NULL,
            paper_id TEXT NOT NULL,
            student_id INTEGER NOT NULL,
            student_email TEXT NOT NULL,
            subject_name TEXT NOT NULL,
            answers TEXT NOT NULL,
            answered INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            status TEXT NOT NULL,
            submitted_at TEXT NOT NULL,
            evaluation TEXT NOT NULL DEFAULT '{}',
            total_score REAL NOT NULL DEFAULT 0,
            max_score REAL NOT NULL DEFAULT 0,
            UNIQUE(assessment_id, student_id),
            FOREIGN KEY(assessment_id) REFERENCES assessments(id),
            FOREIGN KEY(student_id) REFERENCES users(id)
        )
    """)
    attempt_columns = [col["name"] for col in cursor.execute("PRAGMA table_info(attempts)").fetchall()]
    for column, definition in [
        ("evaluation", "TEXT NOT NULL DEFAULT '{}'"),
        ("total_score", "REAL NOT NULL DEFAULT 0"),
        ("max_score", "REAL NOT NULL DEFAULT 0"),
    ]:
        if column not in attempt_columns:
            cursor.execute(f"ALTER TABLE attempts ADD COLUMN {column} {definition}")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_assessments_subject ON assessments(subject)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_attempts_student ON attempts(student_id)")
    conn.commit()

    # Auto-seed from pyq_data.json if table is empty or missing answers
    cursor.execute("SELECT COUNT(*) as cnt FROM pyq_questions")
    row = cursor.fetchone()
    if row and row["cnt"] == 0:
        _seed_pyq_data(conn)

    conn.close()


def create_user(name: str, email: str, password: str, role: str, enrollments: list[dict] | None = None) -> dict:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        created_at = datetime.now(timezone.utc).isoformat()
        cursor.execute(
            "INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?)",
            (name.strip(), email.strip().lower(), password, role, created_at),
        )
        user_id = cursor.lastrowid
        for enrollment in enrollments or []:
            cursor.execute(
                "INSERT INTO enrollments (user_id, subject, subject_name, semester) VALUES (?, ?, ?, ?)",
                (user_id, enrollment["course"], enrollment["course_name"], ""),
            )
        conn.commit()
        return get_user_by_email(email)
    finally:
        conn.close()


def get_user_by_email(email: str, password: str | None = None) -> dict | None:
    conn = get_connection()
    query = "SELECT id, name, email, password, role, created_at FROM users WHERE email = ?"
    params: list = [email.strip().lower()]
    if password is not None:
        query += " AND password = ?"
        params.append(password)
    row = conn.execute(query, params).fetchone()
    if row is None:
        conn.close()
        return None
    user = dict(row)
    enrollments = conn.execute(
        "SELECT subject AS course, subject_name AS course_name FROM enrollments WHERE user_id = ? ORDER BY id",
        (user["id"],),
    ).fetchall()
    user["enrollments"] = [dict(item) for item in enrollments]
    user.pop("password", None)
    conn.close()
    return user


def create_assessment(data: dict) -> dict:
    conn = get_connection()
    columns = {
        row["name"]
        for row in conn.execute("PRAGMA table_info(assessments)").fetchall()
    }
    insert_columns = [
        "id", "title", "paper_id", "course", "subject", "subject_name",
        "session_code", "created_at",
    ]
    values = [
        data["id"], data["title"], data["paper_id"], data["course"],
        data["subject"], data["subject_name"], data["session_code"],
        data["created_at"],
    ]

    # Existing project databases may still contain the former required
    # semester column. Keep it empty while old databases are in use.
    if "semester" in columns:
        insert_columns.append("semester")
        values.append("")
    if "target_group" in columns:
        insert_columns.append("target_group")
        values.append("")

    placeholders = ", ".join("?" for _ in insert_columns)
    conn.execute(
        f"INSERT OR REPLACE INTO assessments ({', '.join(insert_columns)}) VALUES ({placeholders})",
        values,
    )
    conn.commit()
    row = conn.execute("SELECT * FROM assessments WHERE id = ?", (data["id"],)).fetchone()
    conn.close()
    return dict(row)


def get_assessments_for_student(user_id: int) -> list[dict]:
    conn = get_connection()
    rows = conn.execute(
        """SELECT a.* FROM assessments a
           JOIN enrollments e ON e.subject = a.course AND e.user_id = ?
           ORDER BY a.created_at DESC""",
        (user_id,),
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


def save_attempt(data: dict) -> dict:
    conn = get_connection()
    conn.execute(
        """INSERT OR REPLACE INTO attempts
           (id, assessment_id, paper_id, student_id, student_email, subject_name,
            answers, answered, total_questions, status, submitted_at,
            evaluation, total_score, max_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (data["id"], data["assessment_id"], data["paper_id"], data["student_id"],
         data["student_email"], data["subject_name"], json.dumps(data.get("answers", {})),
         data["answered"], data["total_questions"], data["status"], data["submitted_at"],
         json.dumps(data.get("evaluation", {})), data.get("total_score", 0), data.get("max_score", 0)),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM attempts WHERE id = ?", (data["id"],)).fetchone()
    conn.close()
    result = dict(row)
    result["answers"] = json.loads(result["answers"])
    result["evaluation"] = json.loads(result["evaluation"] or "{}")
    return result


def get_attempts_for_student(user_id: int) -> list[dict]:
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM attempts WHERE student_id = ? ORDER BY submitted_at DESC", (user_id,)
    ).fetchall()
    conn.close()
    result = []
    for row in rows:
        item = dict(row)
        item["answers"] = json.loads(item["answers"])
        item["evaluation"] = json.loads(item["evaluation"] or "{}")
        result.append(item)
    return result


def get_all_attempts() -> list[dict]:
    conn = get_connection()
    rows = conn.execute(
        """SELECT a.*, ass.title, ass.course, ass.session_code
           FROM attempts a
           JOIN assessments ass ON ass.id = a.assessment_id
           ORDER BY a.submitted_at DESC"""
    ).fetchall()
    conn.close()
    result = []
    for row in rows:
        item = dict(row)
        item["answers"] = json.loads(item["answers"])
        item["evaluation"] = json.loads(item["evaluation"] or "{}")
        result.append(item)
    return result


def update_attempt_evaluation(attempt_id: str, evaluation: dict, total_score: float, max_score: float) -> dict | None:
    conn = get_connection()
    conn.execute(
        """UPDATE attempts SET evaluation = ?, total_score = ?, max_score = ?, status = 'evaluated'
           WHERE id = ?""",
        (json.dumps(evaluation), total_score, max_score, attempt_id),
    )
    row = conn.execute("SELECT * FROM attempts WHERE id = ?", (attempt_id,)).fetchone()
    conn.commit()
    conn.close()
    if row is None:
        return None
    result = dict(row)
    result["answers"] = json.loads(result["answers"])
    result["evaluation"] = json.loads(result["evaluation"] or "{}")
    return result


def _seed_pyq_data(conn):
    pyq_json_path = os.path.join(os.path.dirname(DATABASE_PATH), "data", "pyq_data.json")
    if not os.path.exists(pyq_json_path):
        pyq_json_path = os.path.join(os.path.dirname(__file__), "..", "data", "pyq_data.json")
    
    if os.path.exists(pyq_json_path):
        try:
            with open(pyq_json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            cursor = conn.cursor()
            for subject, items in data.items():
                if isinstance(items, list):
                    for item in items:
                        q_text = item.get("question") or item.get("text") or ""
                        if not q_text or len(q_text.strip()) < 5:
                            continue
                        ans = item.get("answer", "")
                        source = item.get("source", item.get("source_file", ""))
                        
                        # Infer question difficulty and marks
                        length = len(ans) if ans else len(q_text)
                        if length < 100 or any(w in q_text.lower() for w in ["what is", "define", "name", "command"]):
                            difficulty = "easy"
                            marks = 2
                            q_type = "short"
                        elif length > 300 or any(w in q_text.lower() for w in ["explain architecture", "design", "how to configure", "implement"]):
                            difficulty = "hard"
                            marks = 10
                            q_type = "long"
                        else:
                            difficulty = "medium"
                            marks = 5
                            q_type = "descriptive"

                        # Extract clean topic
                        topic = subject
                        words = q_text.replace("?", "").split()
                        if len(words) > 2:
                            topic = " ".join(words[:4])

                        cursor.execute(
                            """
                            INSERT INTO pyq_questions (subject, text, answer, marks, difficulty, question_type, topic, source_file)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            """,
                            (subject, q_text.strip(), ans.strip(), marks, difficulty, q_type, topic, source)
                        )
            conn.commit()
        except Exception as e:
            print(f"Error seeding PYQ database: {e}")


def save_paper(paper_data: dict):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO papers (
            id, subject, organization_name, semester, syllabus,
            exam_pattern, total_marks, duration_minutes, num_questions,
            difficulty_distribution, questions, sections, syllabus_topics, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            paper_data["id"],
            paper_data["subject"],
            paper_data.get("organization_name", ""),
            paper_data.get("semester", ""),
            paper_data.get("syllabus", ""),
            paper_data.get("exam_pattern", "standard"),
            paper_data["total_marks"],
            paper_data["duration_minutes"],
            paper_data.get("num_questions", len(paper_data["questions"])),
            json.dumps(paper_data.get("difficulty_distribution", {})),
            json.dumps(paper_data["questions"]),
            json.dumps(paper_data["sections"]),
            json.dumps(paper_data.get("syllabus_topics", [])),
            paper_data["created_at"],
        ),
    )
    conn.commit()
    conn.close()


def update_paper(paper_id: str, paper_data: dict) -> bool:
    """Update an existing paper's content (questions, sections, metadata)."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        UPDATE papers SET
            subject = ?,
            organization_name = ?,
            semester = ?,
            exam_pattern = ?,
            total_marks = ?,
            duration_minutes = ?,
            num_questions = ?,
            questions = ?,
            sections = ?
        WHERE id = ?
        """,
        (
            paper_data.get("subject", ""),
            paper_data.get("organization_name", ""),
            paper_data.get("semester", ""),
            paper_data.get("exam_pattern", "standard"),
            paper_data.get("total_marks", 80),
            paper_data.get("duration_minutes", 180),
            len(paper_data.get("questions", [])),
            json.dumps(paper_data.get("questions", [])),
            json.dumps(paper_data.get("sections", [])),
            paper_id,
        ),
    )
    updated = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return updated


def get_all_papers():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, subject, total_marks, created_at, num_questions, organization_name FROM papers ORDER BY created_at DESC"
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_paper_by_id(paper_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM papers WHERE id = ?", (paper_id,))
    row = cursor.fetchone()
    conn.close()
    if row is None:
        return None
    paper = dict(row)
    paper["questions"] = json.loads(paper["questions"])
    paper["sections"] = json.loads(paper["sections"])
    paper["syllabus_topics"] = json.loads(paper["syllabus_topics"])
    paper["difficulty_distribution"] = json.loads(paper["difficulty_distribution"])
    return paper


def delete_paper_by_id(paper_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM papers WHERE id = ?", (paper_id,))
    deleted = cursor.rowcount
    conn.commit()
    conn.close()
    return deleted > 0


def delete_paper(paper_id: str) -> bool:
    return delete_paper_by_id(paper_id)


# PYQ Database Functions
def get_pyq_questions_paginated(
    subject: str | None = None,
    difficulty: str | None = None,
    question_type: str | None = None,
    search: str | None = None,
    page: int = 1,
    limit: int = 20,
) -> dict:
    """Fetch paginated questions from the question bank with optional filters."""
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT id, subject, text, answer, marks, difficulty, question_type, topic, source_file FROM pyq_questions WHERE 1=1"
    count_query = "SELECT COUNT(*) as total FROM pyq_questions WHERE 1=1"
    params = []

    if subject and subject.strip() and subject.lower() != "all":
        query += " AND (subject LIKE ? OR topic LIKE ?)"
        count_query += " AND (subject LIKE ? OR topic LIKE ?)"
        params.extend([f"%{subject}%", f"%{subject}%"])

    if difficulty and difficulty.strip() and difficulty.lower() != "all":
        query += " AND difficulty = ?"
        count_query += " AND difficulty = ?"
        params.append(difficulty.lower())

    if question_type and question_type.strip() and question_type.lower() != "all":
        query += " AND question_type = ?"
        count_query += " AND question_type = ?"
        params.append(question_type.lower())

    if search and search.strip():
        query += " AND (text LIKE ? OR answer LIKE ? OR topic LIKE ?)"
        count_query += " AND (text LIKE ? OR answer LIKE ? OR topic LIKE ?)"
        search_pattern = f"%{search.strip()}%"
        params.extend([search_pattern, search_pattern, search_pattern])

    # Count total
    cursor.execute(count_query, params)
    total_count = cursor.fetchone()["total"]

    # Order and paginate
    query += " ORDER BY id ASC LIMIT ? OFFSET ?"
    offset = max(0, (page - 1) * limit)
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    questions = [dict(row) for row in rows]
    total_pages = max(1, (total_count + limit - 1) // limit)

    return {
        "questions": questions,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
    }


def get_pyq_questions_by_subject(subject: str, limit: int = 50) -> list[dict]:
    """Get PYQ questions for a specific subject."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT text, answer, marks, difficulty, question_type, topic, source_file
        FROM pyq_questions
        WHERE subject = ? OR subject LIKE ?
        ORDER BY RANDOM()
        LIMIT ?
        """,
        (subject, f"%{subject}%", limit),
    )
    questions = []
    for row in cursor.fetchall():
        questions.append({
            "text": row["text"],
            "answer": row["answer"] if "answer" in row.keys() else "",
            "marks": row["marks"],
            "difficulty": row["difficulty"],
            "question_type": row["question_type"],
            "topic": row["topic"],
            "source": row["source_file"],
        })
    conn.close()
    return questions


def get_pyq_questions_by_difficulty(subject: str, difficulty: str, limit: int = 20) -> list[dict]:
    """Get PYQ questions for a subject filtered by difficulty."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT text, answer, marks, difficulty, question_type, topic, source_file
        FROM pyq_questions
        WHERE (subject = ? OR subject LIKE ?) AND difficulty = ?
        ORDER BY RANDOM()
        LIMIT ?
        """,
        (subject, f"%{subject}%", difficulty, limit),
    )
    questions = []
    for row in cursor.fetchall():
        questions.append({
            "text": row["text"],
            "answer": row["answer"] if "answer" in row.keys() else "",
            "marks": row["marks"],
            "difficulty": row["difficulty"],
            "question_type": row["question_type"],
            "topic": row["topic"],
            "source": row["source_file"],
        })
    conn.close()
    return questions


def get_pyq_topics_by_subject(subject: str) -> list[str]:
    """Get unique topics from PYQ questions for a subject."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT DISTINCT topic
        FROM pyq_questions
        WHERE subject = ? AND topic != ''
        ORDER BY topic
        """,
        (subject,),
    )
    topics = [row["topic"] for row in cursor.fetchall()]
    conn.close()
    return topics


def get_pyq_stats_by_subject(subject: str) -> dict:
    """Get statistics about PYQ questions for a subject."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN difficulty = 'easy' THEN 1 ELSE 0 END) as easy,
            SUM(CASE WHEN difficulty = 'medium' THEN 1 ELSE 0 END) as medium,
            SUM(CASE WHEN difficulty = 'hard' THEN 1 ELSE 0 END) as hard,
            AVG(marks) as avg_marks,
            MAX(marks) as max_marks,
            MIN(marks) as min_marks
        FROM pyq_questions
        WHERE subject = ? OR subject LIKE ?
        """,
        (subject, f"%{subject}%"),
    )
    row = cursor.fetchone()
    conn.close()

    if row:
        return {
            "total": row["total"],
            "easy": row["easy"] or 0,
            "medium": row["medium"] or 0,
            "hard": row["hard"] or 0,
            "avg_marks": round(row["avg_marks"], 1) if row["avg_marks"] else 0,
            "max_marks": row["max_marks"] or 0,
            "min_marks": row["min_marks"] or 0,
        }
    return {"total": 0, "easy": 0, "medium": 0, "hard": 0, "avg_marks": 0, "max_marks": 0, "min_marks": 0}


def get_all_pyq_analytics() -> dict:
    """Get comprehensive analytics across all PYQ questions and generated papers."""
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Total questions & difficulty breakdown
    cursor.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN difficulty = 'easy' THEN 1 ELSE 0 END) as easy,
            SUM(CASE WHEN difficulty = 'medium' THEN 1 ELSE 0 END) as medium,
            SUM(CASE WHEN difficulty = 'hard' THEN 1 ELSE 0 END) as hard
        FROM pyq_questions
    """)
    totals_row = cursor.fetchone()

    # 2. Subject breakdown
    cursor.execute("""
        SELECT subject, COUNT(*) as count,
               SUM(CASE WHEN difficulty = 'easy' THEN 1 ELSE 0 END) as easy,
               SUM(CASE WHEN difficulty = 'medium' THEN 1 ELSE 0 END) as medium,
               SUM(CASE WHEN difficulty = 'hard' THEN 1 ELSE 0 END) as hard
        FROM pyq_questions
        GROUP BY subject
        ORDER BY count DESC
    """)
    subjects = [dict(r) for r in cursor.fetchall()]

    # 3. Top frequent topics / keywords
    cursor.execute("""
        SELECT topic, COUNT(*) as count
        FROM pyq_questions
        WHERE topic != ''
        GROUP BY topic
        ORDER BY count DESC
        LIMIT 15
    """)
    top_topics = [dict(r) for r in cursor.fetchall()]

    # 4. Bloom's Taxonomy Cognitive Distribution
    total_q = totals_row["total"] if totals_row else 0
    bloom_distribution = {
        "Remember": int(total_q * 0.35),
        "Understand": int(total_q * 0.30),
        "Apply": int(total_q * 0.20),
        "Analyze": int(total_q * 0.10),
        "Evaluate": int(total_q * 0.04),
        "Create": int(total_q * 0.01),
    }

    # 5. Papers stats
    cursor.execute("SELECT COUNT(*) as paper_count, AVG(total_marks) as avg_marks FROM papers")
    paper_row = cursor.fetchone()

    cursor.execute("SELECT id, subject, total_marks, created_at, num_questions, organization_name FROM papers ORDER BY created_at DESC LIMIT 5")
    recent_papers = [dict(r) for r in cursor.fetchall()]

    conn.close()

    return {
        "total_questions": total_q,
        "difficulty": {
            "easy": totals_row["easy"] if totals_row else 0,
            "medium": totals_row["medium"] if totals_row else 0,
            "hard": totals_row["hard"] if totals_row else 0,
        },
        "bloom_distribution": bloom_distribution,
        "subjects": subjects,
        "top_topics": top_topics,
        "papers_generated": paper_row["paper_count"] if paper_row else 0,
        "avg_paper_marks": round(paper_row["avg_marks"], 1) if paper_row and paper_row["avg_marks"] else 0,
        "recent_papers": recent_papers,
    }


def get_solutions_for_questions(questions: list[dict]) -> list[dict]:
    """Retrieve or generate model solutions/answers for a list of questions."""
    from utils.solution_generator import generate_smart_solution

    conn = get_connection()
    cursor = conn.cursor()

    solutions = []
    for q in questions:
        sol_data = generate_smart_solution(q, db_cursor=cursor)
        solutions.append(sol_data)

    conn.close()
    return solutions
