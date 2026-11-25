const i18n = {
  ar: {
    dir: "rtl",
    lang: "ar",
    title: "مساعد التعليم الذكي",
    subtitle: "تعلّم أسرع مع شرح من محاضراتك وكويزات ذكية",
    langToggle: "English",
    uploadHeading: "رفع ملف المحاضرة (PDF)",
    uploadDesc: "ارفع ملف المحاضرة ليقوم المساعد بفهرسته والإجابة بدقة من محتواه.",
    chooseFile: "اختر ملف PDF",
    noFile: "لم يتم اختيار ملف بعد",
    uploadBtn: "رفع ومعالجة",
    uploading: "جاري رفع الملف ومعالجته...",
    selectPdfFirst: "من فضلك اختر ملف PDF أولاً.",
    uploadSuccess: "تمت معالجة الملف بنجاح",
    uploadError: "حدث خطأ أثناء رفع الملف.",
    chatHeading: "اسأل المدرس الذكي",
    chatStatus: "● جاهز للمساعدة",
    welcomeMsg: "أهلاً بك! ارفع ملف المحاضرة أولاً ثم اسألني أي سؤال لتبسيط المفاهيم أو حل التمارين.",
    chatPlaceholder: "اكتب سؤالك هنا...",
    sendBtn: "إرسال",
    thinking: "جاري التفكير...",
    chatError: "تعذر الحصول على رد الآن، حاول مرة أخرى.",
    quizHeading: "توليد اختبار قصير (Quiz)",
    quizDesc: "اختبر فهمك للمحاضرة بأسئلة ذكية مع شرح فوري للإجابات.",
    quizPlaceholder: "موضوع الاختبار (اختياري)",
    generateQuizBtn: "توليد الأسئلة",
    generatingQuiz: "جاري توليد الأسئلة...",
    quizError: "تعذر توليد الاختبار، تأكد من رفع ملف محاضرة أولاً.",
    userLabel: "أنت",
    explanationPrefix: "الشرح: "
  },
  en: {
    dir: "ltr",
    lang: "en",
    title: "AI Educational Tutor",
    subtitle: "Learn faster with lecture-grounded answers and smart quizzes",
    langToggle: "العربية",
    uploadHeading: "Upload Lecture PDF",
    uploadDesc: "Upload your lecture PDF so the tutor can index it and answer accurately.",
    chooseFile: "Choose PDF file",
    noFile: "No file selected yet",
    uploadBtn: "Upload & Process",
    uploading: "Uploading and processing PDF...",
    selectPdfFirst: "Please choose a PDF file first.",
    uploadSuccess: "PDF processed successfully",
    uploadError: "Failed to upload and process the PDF.",
    chatHeading: "Ask Your AI Tutor",
    chatStatus: "● Ready to help",
    welcomeMsg: "Welcome! Upload a lecture PDF first, then ask me anything to simplify concepts or solve problems.",
    chatPlaceholder: "Type your question here...",
    sendBtn: "Send",
    thinking: "Thinking...",
    chatError: "Could not get a response right now. Please try again.",
    quizHeading: "Generate Quick Quiz",
    quizDesc: "Test your understanding with smart questions and instant explanations.",
    quizPlaceholder: "Quiz topic (optional)",
    generateQuizBtn: "Generate Questions",
    generatingQuiz: "Generating questions...",
    quizError: "Could not generate quiz. Make sure a lecture PDF is uploaded.",
    userLabel: "You",
    explanationPrefix: "Explanation: "
  }
};

let currentLang = "ar";

// Elements
const bodyEl = document.body;
const langToggleBtn = document.getElementById("lang-toggle");
const langLabelEl = document.getElementById("lang-label");

const uploadForm = document.getElementById("upload-form");
const pdfInput = document.getElementById("pdf-file");
const fileNameDisplay = document.getElementById("file-name-display");
const dropzone = document.getElementById("dropzone");
const uploadBtn = document.getElementById("upload-btn");
const uploadBtnText = document.getElementById("upload-btn-text");
const uploadStatus = document.getElementById("upload-status");

const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const sendBtn = document.getElementById("send-btn");
const sendBtnText = document.getElementById("send-btn-text");

const quizTopicInput = document.getElementById("quiz-topic");
const generateQuizBtn = document.getElementById("generate-quiz-btn");
const generateQuizText = document.getElementById("generate-quiz-text");
const quizContainer = document.getElementById("quiz-container");

function t() {
  return i18n[currentLang];
}

function applyLanguage(lang) {
  currentLang = lang;
  const dict = t();

  bodyEl.setAttribute("dir", dict.dir);
  bodyEl.setAttribute("lang", dict.lang);
  document.documentElement.setAttribute("dir", dict.dir);
  document.documentElement.setAttribute("lang", dict.lang);

  document.getElementById("app-title").textContent = dict.title;
  document.getElementById("app-subtitle").textContent = dict.subtitle;
  langLabelEl.textContent = dict.langToggle;

  document.getElementById("upload-heading").textContent = dict.uploadHeading;
  document.getElementById("upload-desc").textContent = dict.uploadDesc;
  document.getElementById("choose-file-text").textContent = dict.chooseFile;
  uploadBtnText.textContent = dict.uploadBtn;

  if (!pdfInput.files || !pdfInput.files.length) {
    fileNameDisplay.textContent = dict.noFile;
  }

  document.getElementById("chat-heading").textContent = dict.chatHeading;
  document.getElementById("chat-status-tag").textContent = dict.chatStatus;
  chatInput.placeholder = dict.chatPlaceholder;
  sendBtnText.textContent = dict.sendBtn;

  const welcomeBubble = document.getElementById("welcome-bubble");
  if (welcomeBubble) {
    welcomeBubble.textContent = dict.welcomeMsg;
  }

  document.getElementById("quiz-heading").textContent = dict.quizHeading;
  document.getElementById("quiz-desc").textContent = dict.quizDesc;
  quizTopicInput.placeholder = dict.quizPlaceholder;
  generateQuizText.textContent = dict.generateQuizBtn;
}

langToggleBtn.addEventListener("click", () => {
  applyLanguage(currentLang === "ar" ? "en" : "ar");
});

function setStatus(type, message) {
  uploadStatus.className = `status-box show ${type}`;
  uploadStatus.textContent = message;
}

// File selection & drag/drop
pdfInput.addEventListener("change", () => {
  if (pdfInput.files && pdfInput.files.length > 0) {
    fileNameDisplay.textContent = pdfInput.files[0].name;
  } else {
    fileNameDisplay.textContent = t().noFile;
  }
});

["dragenter", "dragover"].forEach((evtName) => {
  dropzone.addEventListener(evtName, (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });
});

["dragleave", "drop"].forEach((evtName) => {
  dropzone.addEventListener(evtName, (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
  });
});

dropzone.addEventListener("drop", (e) => {
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    pdfInput.files = files;
    fileNameDisplay.textContent = files[0].name;
  }
});

// Upload PDF
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!pdfInput.files || pdfInput.files.length === 0) {
    setStatus("error", t().selectPdfFirst);
    return;
  }

  const formData = new FormData();
  formData.append("file", pdfInput.files[0]);

  uploadBtn.disabled = true;
  uploadBtnText.textContent = t().uploading;
  setStatus("info", t().uploading);

  try {
    const res = await fetch("/upload", {
      method: "POST",
      body: formData
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error || t().uploadError);
    }

    const chunksInfo = data.chunks ? ` (${data.chunks} chunks)` : "";
    setStatus("success", `${data.message || t().uploadSuccess}${chunksInfo}`);
  } catch (err) {
    setStatus("error", err.message || t().uploadError);
  } finally {
    uploadBtn.disabled = false;
    uploadBtnText.textContent = t().uploadBtn;
  }
});

// Chat helpers
function appendMessage(sender, text, isTemp = false) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${sender === "user" ? "user-message" : "bot-message"}`;
  if (isTemp) msgDiv.dataset.temp = "true";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = sender === "user" ? t().userLabel.slice(0, 2) : "🎓";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  msgDiv.appendChild(avatar);
  msgDiv.appendChild(bubble);
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return msgDiv;
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = chatInput.value.trim();
  if (!question) return;

  appendMessage("user", question);
  chatInput.value = "";
  chatInput.disabled = true;
  sendBtn.disabled = true;

  const thinkingEl = appendMessage("bot", t().thinking, true);

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        message: question,
        language: currentLang
      })
    });
    const data = await res.json();
    thinkingEl.remove();

    if (!res.ok || data.error) {
      appendMessage("bot", data.error || t().chatError);
    } else {
      const answer = data.answer || data.reply || data.response || JSON.stringify(data);
      appendMessage("bot", answer);
    }
  } catch (err) {
    thinkingEl.remove();
    appendMessage("bot", t().chatError);
  } finally {
    chatInput.disabled = false;
    sendBtn.disabled = false;
    chatInput.focus();
  }
});

// Quiz Generator
function renderQuiz(questions) {
  quizContainer.innerHTML = "";
  if (!Array.isArray(questions) || questions.length === 0) {
    quizContainer.innerHTML = `<div class="status-box show error">${t().quizError}</div>`;
    return;
  }

  questions.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "quiz-card";

    const qText = document.createElement("div");
    qText.className = "quiz-question";
    qText.textContent = `${idx + 1}. ${item.question || item.q || ""}`;
    card.appendChild(qText);

    const optionsWrap = document.createElement("div");
    optionsWrap.className = "quiz-options";

    const options = item.options || item.choices || [];
    const correctAnswer = item.answer ?? item.correct_answer ?? item.correct ?? "";

    options.forEach((opt) => {
      const optBtn = document.createElement("button");
      optBtn.type = "button";
      optBtn.className = "quiz-option-btn";
      optBtn.textContent = opt;

      optBtn.addEventListener("click", () => {
        const allBtns = optionsWrap.querySelectorAll(".quiz-option-btn");
        allBtns.forEach((b) => (b.disabled = true));

        const isCorrect =
          opt === correctAnswer ||
          String(opt).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();

        if (isCorrect) {
          optBtn.classList.add("correct");
        } else {
          optBtn.classList.add("wrong");
          allBtns.forEach((b) => {
            if (
              b.textContent === correctAnswer ||
              b.textContent.trim().toLowerCase() === String(correctAnswer).trim().toLowerCase()
            ) {
              b.classList.add("correct");
            }
          });
        }

        if (item.explanation) {
          const exp = document.createElement("div");
          exp.className = "quiz-explanation";
          exp.textContent = `${t().explanationPrefix}${item.explanation}`;
          card.appendChild(exp);
        }
      });

      optionsWrap.appendChild(optBtn);
    });

    card.appendChild(optionsWrap);
    quizContainer.appendChild(card);
  });
}

generateQuizBtn.addEventListener("click", async () => {
  generateQuizBtn.disabled = true;
  generateQuizText.textContent = t().generatingQuiz;
  quizContainer.innerHTML = `<div class="status-box show info">${t().generatingQuiz}</div>`;

  try {
    const res = await fetch("/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: quizTopicInput.value.trim(),
        language: currentLang
      })
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error || t().quizError);
    }

    const questions = Array.isArray(data) ? data : data.quiz || data.questions || [];
    renderQuiz(questions);
  } catch (err) {
    quizContainer.innerHTML = `<div class="status-box show error">${err.message || t().quizError}</div>`;
  } finally {
    generateQuizBtn.disabled = false;
    generateQuizText.textContent = t().generateQuizBtn;
  }
});

applyLanguage("ar");