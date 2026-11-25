import os
import json
import re
import fitz  # PyMuPDF
import faiss
from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from google import genai

load_dotenv()

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# تهيئة Gemini SDK
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_NAME = "gemini-2.5-flash"

# تحميل نموذج Embeddings خفيف وسريع يدعم العربية والإنجليزية
embed_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

# ذاكرة بسيطة لتخزين chunks وفهرس FAISS للملف الحالي
knowledge_base = {
    "filename": None,
    "chunks": [],
    "index": None,
}


def extract_text_from_pdf(pdf_path: str) -> str:
    """استخراج النص الكامل من ملف PDF مع رقم الصفحة."""
    pages_text = []
    with fitz.open(pdf_path) as doc:
        for page_num, page in enumerate(doc, start=1):
            text = page.get_text("text").strip()
            if text:
                pages_text.append(f"[Page {page_num}]\n{text}")
    return "\n\n".join(pages_text)


def chunk_text(text: str, chunk_size: int = 350, overlap: int = 70) -> list[str]:
    """تقسيم النص إلى أجزاء متداخلة للحفاظ على السياق."""
    words = text.split()
    if not words:
        return []
    chunks = []
    step = max(1, chunk_size - overlap)
    for i in range(0, len(words), step):
        chunk = " ".join(words[i : i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
    return chunks


def build_faiss_index(chunks: list[str]):
    """إنشاء فهرس FAISS من Embeddings النصوص."""
    embeddings = embed_model.encode(chunks, convert_to_numpy=True).astype("float32")
    faiss.normalize_L2(embeddings)
    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)
    return index


def retrieve_relevant_chunks(query: str, top_k: int = 4) -> list[str]:
    """استرجاع أكثر الأجزاء صلة بسؤال الطالب."""
    if knowledge_base["index"] is None or not knowledge_base["chunks"]:
        return []
    q_emb = embed_model.encode([query], convert_to_numpy=True).astype("float32")
    faiss.normalize_L2(q_emb)
    _, indices = knowledge_base["index"].search(q_emb, min(top_k, len(knowledge_base["chunks"])))
    results = []
    for idx in indices[0]:
        if 0 <= idx < len(knowledge_base["chunks"]):
            results.append(knowledge_base["chunks"][idx])
    return results


def ask_llm(system_instruction: str, user_prompt: str) -> str:
    """استدعاء نموذج Gemini."""
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=user_prompt,
        config={
            "system_instruction": system_instruction,
            "temperature": 0.4,
        },
    )
    return response.text or ""


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/upload", methods=["POST"])
def upload_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Please upload a valid PDF file"}), 400

    save_path = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(save_path)

    raw_text = extract_text_from_pdf(save_path)
    chunks = chunk_text(raw_text, chunk_size=350, overlap=70)
    if not chunks:
        return jsonify({"error": "Could not extract text from this PDF"}), 400

    index = build_faiss_index(chunks)
    knowledge_base["filename"] = file.filename
    knowledge_base["chunks"] = chunks
    knowledge_base["index"] = index

    return jsonify({
        "message": "PDF processed successfully",
        "filename": file.filename,
        "chunks_count": len(chunks),
    })


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    message = (data.get("message") or "").strip()
    lang = data.get("lang", "ar")

    if not message:
        return jsonify({"error": "Message is required"}), 400

    retrieved = retrieve_relevant_chunks(message, top_k=4)
    context_block = "\n---\n".join(retrieved) if retrieved else "No lecture context uploaded yet."

    lang_rule = (
        "Respond clearly in Arabic (using clear educational Arabic, keeping technical terms in English when helpful)."
        if lang == "ar"
        else "Respond clearly in English."
    )

    system_instruction = f"""
You are a patient, encouraging AI Tutor and Instructor.
{lang_rule}
Rules:
1. Ground your explanation in the provided Lecture Context whenever available.
2. Break complex concepts into clear, bite-sized steps with concrete examples.
3. If the answer is not in the Lecture Context, state clearly that it's outside the uploaded lecture, then give a helpful general explanation.
4. End with one short check-for-understanding question to engage the student.
"""

    user_prompt = f"""
Lecture Context:
{context_block}

Student Question:
{message}
"""

    reply = ask_llm(system_instruction, user_prompt)
    return jsonify({
        "reply": reply,
        "used_context": bool(retrieved),
    })


@app.route("/generate-quiz", methods=["POST"])
def generate_quiz():
    data = request.get_json() or {}
    topic = (data.get("topic") or "main concepts of the lecture").strip()
    lang = data.get("lang", "ar")

    retrieved = retrieve_relevant_chunks(topic, top_k=5)
    if not retrieved:
        return jsonify({"error": "Please upload a PDF lecture first."}), 400

    context_block = "\n---\n".join(retrieved)
    lang_rule = "Write questions, options, and explanations in Arabic." if lang == "ar" else "Write questions, options, and explanations in English."

    system_instruction = f"""
You are an AI assessment creator. {lang_rule}
Generate 4 multiple-choice questions (MCQ) based strictly on the Lecture Context.
Return ONLY valid JSON matching this schema:
{{
  "questions": [
    {{
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correct_index": 0,
      "explanation": "string"
    }}
  ]
}}
"""

    raw_output = ask_llm(system_instruction, f"Topic: {topic}\n\nContext:\n{context_block}")
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_output.strip(), flags=re.MULTILINE)

    try:
        quiz_data = json.loads(cleaned)
        return jsonify(quiz_data)
    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse quiz JSON", "raw": raw_output}), 500


if __name__ == "__main__":
    app.run(debug=True)