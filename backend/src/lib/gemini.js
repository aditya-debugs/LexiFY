import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate quiz questions using Gemini API
 * Both users get similar conceptual questions but in their respective learning languages
 */
export async function generateQuizWithGemini(
  day,
  duration,
  creatorData,
  partnerData
) {
  try {
    // Determine difficulty based on day number
    const progressPercentage = (day / duration) * 100;
    let difficulty, difficultyDescription;

    if (progressPercentage <= 30) {
      difficulty = "beginner";
      difficultyDescription =
        "Very basic vocabulary, simple greetings, and common everyday words. Focus on foundational phrases and single words.";
    } else if (progressPercentage <= 70) {
      difficulty = "intermediate";
      difficultyDescription =
        "Common phrases, basic grammar structures, conversational expressions. Include sentence formation and practical usage.";
    } else {
      difficulty = "advanced";
      difficultyDescription =
        "Complex grammar, idiomatic expressions, nuanced vocabulary, cultural context. Challenge with sophisticated language concepts.";
    }

    console.log(
      `Generating ${difficulty} quiz for Day ${day}/${duration} (${progressPercentage.toFixed(
        0
      )}% progress)`
    );

    // Generate quiz for creator's language
    const creatorQuiz = await generateLanguageSpecificQuiz(
      day,
      duration,
      creatorData.learningLanguage,
      creatorData.nativeLanguage,
      difficulty,
      difficultyDescription
    );

    // Generate quiz for partner's language
    const partnerQuiz = await generateLanguageSpecificQuiz(
      day,
      duration,
      partnerData.learningLanguage,
      partnerData.nativeLanguage,
      difficulty,
      difficultyDescription
    );

    return {
      creatorQuiz,
      partnerQuiz,
    };
  } catch (error) {
    console.error("Error generating quiz with Gemini:", error);
    throw error;
  }
}

/**
 * Generate language-specific quiz questions
 */
async function generateLanguageSpecificQuiz(
  day,
  duration,
  learningLanguage,
  nativeLanguage,
  difficulty,
  difficultyDescription
) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    const prompt = `You are a language learning expert. Generate 5 multiple-choice quiz questions to help someone learn ${learningLanguage}.

QUIZ DETAILS:
- Day: ${day} of ${duration}
- Difficulty: ${difficulty}
- Learning Language: ${learningLanguage} (the language the user wants to learn)
- Native Language: ${nativeLanguage || "English"} (the user's mother tongue)

DIFFICULTY GUIDELINES:
${difficultyDescription}

CRITICAL REQUIREMENTS - FOLLOW EXACTLY:
1. ALL questions MUST be written ONLY in ${
      nativeLanguage || "English"
    } (the learner's native language)
   - This allows them to understand what is being asked
   - Never mix languages in the question text
   - NEVER include any word from ${learningLanguage} in the question itself
   - Instead, DESCRIBE the concept, situation, or meaning in ${
     nativeLanguage || "English"
   }
   - Example: Instead of "How do you say 'Hello'?", ask "What greeting do you use when meeting someone?"

2. ALL 4 answer options MUST be written ONLY in ${learningLanguage} (the language they are learning)
   - Option 0, 1, 2, 3 must ALL be in ${learningLanguage}
   - Never use ${nativeLanguage || "English"} in the options

3. Structure of each question:
   - Exactly ONE correct answer (in ${learningLanguage})
   - Exactly THREE wrong answers (also in ${learningLanguage})
   - Wrong answers should be plausible but clearly incorrect
   - Shuffle the position of correct answer (don't always put it first)

4. Each question should teach practical ${learningLanguage} vocabulary, phrases, or grammar
5. Provide exactly 4 answer options for each question
6. Mark the correct answer using index (0, 1, 2, or 3)
7. Make questions relevant to real-world usage
8. Questions should vary in concepts: greetings, numbers, food, directions, time, common phrases, colors, family, etc.

EXAMPLE 1 - Spanish learner (Native: English, Learning: Spanish):
{
  "question": "What greeting do you use when you meet someone in the morning?",
  "options": ["Buenos días", "Buenas noches", "Buenas tardes", "Adiós"],
  "correctAnswer": 0,
  "difficulty": "beginner",
  "concept": "greetings"
}

EXAMPLE 2 - French learner (Native: English, Learning: French):
{
  "question": "What do you say to express gratitude?",
  "options": ["Merci", "Bonjour", "Au revoir", "S'il vous plaît"],
  "correctAnswer": 0,
  "difficulty": "beginner",
  "concept": "basic_phrases"
}

EXAMPLE 3 - English learner (Native: Spanish, Learning: English):
{
  "question": "¿Qué saludo usas cuando conoces a alguien por la mañana?",
  "options": ["Good morning", "Good night", "Good afternoon", "Goodbye"],
  "correctAnswer": 0,
  "difficulty": "beginner",
  "concept": "greetings"
}

EXAMPLE 4 - German learner (Native: French, Learning: German):
{
  "question": "Que dis-tu pour exprimer ta gratitude?",
  "options": ["Danke", "Bitte", "Hallo", "Tschüss"],
  "correctAnswer": 0,
  "difficulty": "beginner",
  "concept": "basic_phrases"
}

EXAMPLE 5 - Hindi learner (Native: English, Learning: Hindi):
{
  "question": "What greeting do you use when meeting someone for the first time?",
  "options": ["नमस्ते", "धन्यवाद", "अलविदा", "कृपया"],
  "correctAnswer": 0,
  "difficulty": "beginner",
  "concept": "greetings"
}

EXAMPLE 6 - English learner (Native: Hindi, Learning: English):
{
  "question": "जब आप किसी से पहली बार मिलते हैं तो आप कौन सा अभिवादन करते हैं?",
  "options": ["Hello", "Thank you", "Goodbye", "Please"],
  "correctAnswer": 0,
  "difficulty": "beginner",
  "concept": "greetings"
}

Remember: Question in ${
      nativeLanguage || "English"
    }, ALL options in ${learningLanguage}!

Generate exactly 5 questions following this structure. Return ONLY a valid JSON array with no markdown formatting, no code blocks, no extra text.

JSON Response:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log(
      `Raw Gemini response for ${learningLanguage}:`,
      text.substring(0, 200)
    );

    // Clean the response to extract JSON
    let jsonText = text.trim();
    // Remove markdown code blocks if present
    jsonText = jsonText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/```/g, "");
    // Remove any leading/trailing whitespace
    jsonText = jsonText.trim();

    const quiz = JSON.parse(jsonText);

    // Validate the response
    if (!Array.isArray(quiz)) {
      throw new Error("Response is not an array");
    }

    if (quiz.length !== 5) {
      console.warn(`Expected 5 questions, got ${quiz.length}`);
    }

    // Validate and normalize each question
    const normalizedQuiz = quiz.map((q, index) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Invalid question structure at index ${index}`);
      }

      return {
        question: q.question,
        options: q.options,
        correctAnswer:
          typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
        difficulty: q.difficulty || difficulty,
        concept: q.concept || "general",
      };
    });

    console.log(
      `✅ Successfully generated ${normalizedQuiz.length} questions for ${learningLanguage}`
    );

    return normalizedQuiz;
  } catch (error) {
    console.error(`Error generating ${learningLanguage} quiz:`, error.message);
    throw error;
  }
}

/**
 * Fallback quiz generation without AI (in case Gemini fails)
 */
export function generateFallbackQuiz(
  day,
  learningLanguage,
  nativeLanguage = "English"
) {
  console.warn(
    `Using fallback quiz for ${learningLanguage} on day ${day}, native: ${nativeLanguage}`
  );

  // Basic language-specific translations for common words
  const translations = {
    Spanish: {
      hello: "Hola",
      goodbye: "Adiós",
      thanks: "Gracias",
      please: "Por favor",
      yes: "Sí",
    },
    French: {
      hello: "Bonjour",
      goodbye: "Au revoir",
      thanks: "Merci",
      please: "S'il vous plaît",
      yes: "Oui",
    },
    German: {
      hello: "Hallo",
      goodbye: "Auf Wiedersehen",
      thanks: "Danke",
      please: "Bitte",
      yes: "Ja",
    },
    Italian: {
      hello: "Ciao",
      goodbye: "Arrivederci",
      thanks: "Grazie",
      please: "Per favore",
      yes: "Sì",
    },
    Russian: {
      hello: "Привет",
      goodbye: "До свидания",
      thanks: "Спасибо",
      please: "Пожалуйста",
      yes: "Да",
    },
    Japanese: {
      hello: "こんにちは",
      goodbye: "さようなら",
      thanks: "ありがとう",
      please: "お願いします",
      yes: "はい",
    },
    Chinese: {
      hello: "你好",
      goodbye: "再见",
      thanks: "谢谢",
      please: "请",
      yes: "是",
    },
    Korean: {
      hello: "안녕하세요",
      goodbye: "안녕히 가세요",
      thanks: "감사합니다",
      please: "주세요",
      yes: "네",
    },
    Portuguese: {
      hello: "Olá",
      goodbye: "Adeus",
      thanks: "Obrigado",
      please: "Por favor",
      yes: "Sim",
    },
    Dutch: {
      hello: "Hallo",
      goodbye: "Tot ziens",
      thanks: "Dank je",
      please: "Alsjeblieft",
      yes: "Ja",
    },
    english: {
      hello: "Hello",
      goodbye: "Goodbye",
      thanks: "Thank you",
      please: "Please",
      yes: "Yes",
    },
  };

  // Question templates in different languages
  const questionTemplates = {
    English: {
      greeting: () => "What do you say when you greet someone?",
      farewell: () => "What do you say when saying goodbye?",
      thanks: () => "How do you express gratitude or thanks?",
      please: () => "What word do you use to make a polite request?",
      yes: () => "What word means affirmative or agreement?",
    },
    Spanish: {
      greeting: () => "¿Qué dices cuando saludas a alguien?",
      farewell: () => "¿Qué dices cuando te despides?",
      thanks: () => "¿Cómo expresas gratitud o agradecimiento?",
      please: () => "¿Qué palabra usas para hacer una petición educada?",
      yes: () => "¿Qué palabra significa afirmativo o acuerdo?",
    },
    French: {
      greeting: () => "Que dis-tu quand tu salues quelqu'un?",
      farewell: () => "Que dis-tu quand tu dis au revoir?",
      thanks: () => "Comment exprimes-tu ta gratitude ou tes remerciements?",
      please: () => "Quel mot utilises-tu pour faire une demande polie?",
      yes: () => "Quel mot signifie affirmatif ou accord?",
    },
    German: {
      greeting: () => "Was sagst du, wenn du jemanden begrüßt?",
      farewell: () => "Was sagst du, wenn du dich verabschiedest?",
      thanks: () => "Wie drückst du Dankbarkeit oder Dank aus?",
      please: () => "Welches Wort verwendest du für eine höfliche Bitte?",
      yes: () => "Welches Wort bedeutet Zustimmung oder Ja?",
    },
    Italian: {
      greeting: () => "Cosa dici quando saluti qualcuno?",
      farewell: () => "Cosa dici quando dici addio?",
      thanks: () => "Come esprimi gratitudine o ringraziamenti?",
      please: () => "Quale parola usi per fare una richiesta gentile?",
      yes: () => "Quale parola significa affermativo o accordo?",
    },
    Russian: {
      greeting: () => "Что ты говоришь, когда приветствуешь кого-то?",
      farewell: () => "Что ты говоришь, когда прощаешься?",
      thanks: () => "Как ты выражаешь благодарность?",
      please: () => "Какое слово ты используешь для вежливой просьбы?",
      yes: () => "Какое слово означает утверждение или согласие?",
    },
    Japanese: {
      greeting: () => "誰かに挨拶するとき、何と言いますか？",
      farewell: () => "さよならを言うとき、何と言いますか？",
      thanks: () => "感謝の気持ちを表すとき、何と言いますか？",
      please: () => "丁寧にお願いするとき、何という言葉を使いますか？",
      yes: () => "肯定的な答えや同意を示す言葉は何ですか？",
    },
    Chinese: {
      greeting: () => "当你问候别人时，你说什么？",
      farewell: () => "当你说再见时，你说什么？",
      thanks: () => "你如何表达感谢？",
      please: () => "你用什么词来进行礼貌的请求？",
      yes: () => "什么词表示肯定或同意？",
    },
    Korean: {
      greeting: () => "누군가에게 인사할 때 뭐라고 말하나요?",
      farewell: () => "작별을 고할 때 뭐라고 말하나요?",
      thanks: () => "감사를 표현할 때 무엇이라고 말하나요?",
      please: () => "정중하게 요청할 때 어떤 단어를 사용하나요?",
      yes: () => "긍정적인 답변이나 동의를 나타내는 단어는 무엇인가요?",
    },
    Portuguese: {
      greeting: () => "O que você diz quando cumprimenta alguém?",
      farewell: () => "O que você diz quando se despede?",
      thanks: () => "Como você expressa gratidão ou agradecimento?",
      please: () => "Qual palavra você usa para fazer um pedido educado?",
      yes: () => "Qual palavra significa afirmativo ou concordância?",
    },
    Dutch: {
      greeting: () => "Wat zeg je als je iemand begroet?",
      farewell: () => "Wat zeg je als je afscheid neemt?",
      thanks: () => "Hoe druk je dankbaarheid of dank uit?",
      please: () => "Welk woord gebruik je voor een beleefd verzoek?",
      yes: () => "Welk woord betekent bevestigend of akkoord?",
    },
    Hindi: {
      greeting: () => "जब आप किसी का अभिवादन करते हैं तो क्या कहते हैं?",
      farewell: () => "जब आप विदाई कहते हैं तो क्या कहते हैं?",
      thanks: () => "आब धन्यवाद या आभार कैसे व्यक्त करते हैं?",
      please: () =>
        "विनम्र अनुरोध करने के लिए आप कौन सा शब्द इस्तेमाल करते हैं?",
      yes: () => "कौन सा शब्द सहमति या हाँ को दर्शाता है?",
    },
    Arabic: {
      greeting: () => "ماذا تقول عندما تحيي شخصًا؟",
      farewell: () => "ماذا تقول عندما تودع شخصًا؟",
      thanks: () => "كيف تعبر عن الامتنان أو الشكر؟",
      please: () => "ما الكلمة التي تستخدمها لتقديم طلب مهذب؟",
      yes: () => "ما الكلمة التي تعني إيجابي أو موافقة؟",
    },
    Turkish: {
      greeting: () => "Birini selamladığınızda ne söylersiniz?",
      farewell: () => "Veda ederken ne söylersiniz?",
      thanks: () => "Minnetini veya teşekkürünü nasıl ifade edersiniz?",
      please: () => "Kibar bir rica için hangi kelimeyi kullanırsınız?",
      yes: () => "Olumlu veya uyum ifade eden kelime hangisidir?",
    },
    Polish: {
      greeting: () => "Co mówisz, kiedy komuś witasz?",
      farewell: () => "Co mówisz, kiedy żegnasz się?",
      thanks: () => "Jak wyrażasz wdzięczność lub podziękowania?",
      please: () => "Jakiego słowa używasz do uprzejmej prośby?",
      yes: () => "Jakie słowo oznacza potwierdzenie lub zgodę?",
    },
    Swedish: {
      greeting: () => "Vad säger du när du hälsar på någon?",
      farewell: () => "Vad säger du när du tar farväl?",
      thanks: () => "Hur uttrycker du tacksamhet eller tack?",
      please: () => "Vilket ord använder du för en artig begäran?",
      yes: () => "Vilket ord betyder jakande eller överenskommelse?",
    },
    Greek: {
      greeting: () => "Τι λες όταν χαιρετάς κάποιον;",
      farewell: () => "Τι λες όταν αποχαιρετάς;",
      thanks: () => "Πώς εκφράζεις ευγνωμοσύνη ή ευχαριστίες;",
      please: () => "Ποια λέξη χρησιμοποιείς για μια ευγενική παράκληση;",
      yes: () => "Ποια λέξη σημαίνει καταφατικό ή συμφωνία;",
    },
    Vietnamese: {
      greeting: () => "Bạn nói gì khi chào hỏi ai đó?",
      farewell: () => "Bạn nói gì khi chào tạm biệt?",
      thanks: () => "Bạn biểu hiện lòng biết ơn như thế nào?",
      please: () => "Bạn dùng từ gì để nhờ vả một cách lịch sự?",
      yes: () => "Từ nào có nghĩa là khẳng định hoặc đồng ý?",
    },
    Thai: {
      greeting: () => "คุณพูดอะไรเมื่อทักทายใครสักคน?",
      farewell: () => "คุณพูดอะไรเมื่อกล่าวลา?",
      thanks: () => "คุณแสดงความขอบคุณหรือขอบใจอย่างไร?",
      please: () => "คุณใช้คำอะไรเพื่อขอร้องอย่างสุภาพ?",
      yes: () => "คำใดมีความหมายว่ายืนยันหรือเห็นด้วย?",
    },
    Bengali: {
      greeting: () => "আপনি কাউকে অভিবাদন জানাতে কী বলেন?",
      farewell: () => "আপনি বিদায় জানাতে কী বলেন?",
      thanks: () => "আপনি কীভাবে কৃতজ্ঞতা বা ধন্যবাদ প্রকাশ করেন?",
      please: () => "ভদ্র অনুরোধের জন্য আপনি কোন শব্দ ব্যবহার করেন?",
      yes: () => "কোন শব্দ সম্মতি বা হ্যাঁ বোঝায়?",
    },
    Tamil: {
      greeting: () => "யாரையாவது வாழ்த்தும்போது என்ன சொல்வீர்கள்?",
      farewell: () => "விடைபெறும்போது என்ன சொல்வீர்கள்?",
      thanks: () => "நன்றி அல்லது நன்றியை எவ்வாறு வெளிப்படுத்துவீர்கள்?",
      please: () =>
        "கண்ணியமான கேட்டுக்கொள்ளலுக்கு எந்த வார்த்தையைப் பயன்படுத்துவீர்கள்?",
      yes: () => "உறுதிப்படுத்தல் அல்லது ஒப்புதலைக் குறிக்கும் வார்த்தை எது?",
    },
  };

  // Get translations for the learning language
  const learningLangKey =
    learningLanguage.charAt(0).toUpperCase() +
    learningLanguage.slice(1).toLowerCase();
  const words = translations[learningLangKey] || {
    hello: `Hello in ${learningLanguage}`,
    goodbye: `Goodbye in ${learningLanguage}`,
    thanks: `Thank you in ${learningLanguage}`,
    please: `Please in ${learningLanguage}`,
    yes: `Yes in ${learningLanguage}`,
  };

  // Get question templates for the native language
  const nativeLangKey =
    nativeLanguage.charAt(0).toUpperCase() +
    nativeLanguage.slice(1).toLowerCase();
  let templates = questionTemplates[nativeLangKey];

  // If exact match not found, try case-insensitive search
  if (!templates) {
    const nativeLower = nativeLanguage.toLowerCase();
    const matchingKey = Object.keys(questionTemplates).find(
      (key) => key.toLowerCase() === nativeLower
    );
    templates = matchingKey
      ? questionTemplates[matchingKey]
      : questionTemplates.English;
  }

  console.log(
    `Using question templates for native language: ${nativeLanguage} (${
      templates === questionTemplates.English
        ? "fallback to English"
        : "matched"
    })`
  );

  // Helper function to shuffle options and track correct answer
  const shuffleOptions = (options, correctIndex) => {
    const shuffled = options.map((option, index) => ({
      option,
      isCorrect: index === correctIndex,
    }));

    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const newOptions = shuffled.map((item) => item.option);
    const newCorrectIndex = shuffled.findIndex((item) => item.isCorrect);

    return { options: newOptions, correctAnswer: newCorrectIndex };
  };

  // Create basic language learning questions in native language
  const baseQuestions = [
    {
      question: templates.greeting(),
      originalOptions: [words.hello, words.goodbye, words.thanks, words.please],
      originalCorrectAnswer: 0,
      difficulty:
        day <= 3 ? "beginner" : day <= 7 ? "intermediate" : "advanced",
      concept: "greetings",
    },
    {
      question: templates.thanks(),
      originalOptions: [words.thanks, words.hello, words.goodbye, words.yes],
      originalCorrectAnswer: 0,
      difficulty:
        day <= 3 ? "beginner" : day <= 7 ? "intermediate" : "advanced",
      concept: "basic_phrases",
    },
    {
      question: templates.farewell(),
      originalOptions: [words.goodbye, words.hello, words.please, words.thanks],
      originalCorrectAnswer: 0,
      difficulty:
        day <= 3 ? "beginner" : day <= 7 ? "intermediate" : "advanced",
      concept: "greetings",
    },
    {
      question: templates.please(),
      originalOptions: [words.please, words.thanks, words.yes, words.goodbye],
      originalCorrectAnswer: 0,
      difficulty:
        day <= 3 ? "beginner" : day <= 7 ? "intermediate" : "advanced",
      concept: "politeness",
    },
    {
      question: templates.yes(),
      originalOptions: [words.yes, words.hello, words.thanks, words.goodbye],
      originalCorrectAnswer: 0,
      difficulty:
        day <= 3 ? "beginner" : day <= 7 ? "intermediate" : "advanced",
      concept: "basic_responses",
    },
  ];

  // Shuffle options for each question
  const questions = baseQuestions.map((q) => {
    const shuffled = shuffleOptions(q.originalOptions, q.originalCorrectAnswer);
    return {
      question: q.question,
      options: shuffled.options,
      correctAnswer: shuffled.correctAnswer,
      difficulty: q.difficulty,
      concept: q.concept,
    };
  });

  return questions;
}
