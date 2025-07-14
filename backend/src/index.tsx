import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import pdfParse from 'pdf-parse';
import Jimp from 'jimp';
import dotenv from 'dotenv';
import { Request, Response } from 'express';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001; // 백엔드 포트

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

// Gemini API 키 설정
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // 환경 변수에서 API 키 로드
if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// 채팅 세션 관리를 위한 임시 저장소 (실제 서비스에서는 데이터베이스 사용)
const conversations = new Map<string, { role: string; content: string; }[]>();

// 안전 설정 (Python 코드에 없었지만, Gemini API 사용 시 권장)
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// 이미지 파일을 Base64로 인코딩하는 헬퍼 함수
async function fileToGenerativePart(buffer: Buffer, mimeType: string) {
  if (mimeType.startsWith('image/')) {
    const image = await Jimp.read(buffer);
    const resizedImageBuffer = await image.getBufferAsync(mimeType);
    return { inlineData: { data: resizedImageBuffer.toString('base64'), mimeType } };
  } else {
    throw new Error('Unsupported file type for Gemini Vision.');
  }
}

// /pro_solve_chat_api 엔드포인트
app.post('/pro_solve_chat_api', upload.single('file'), async (req: Request, res: Response) => {
  const sessionId = req.headers['x-session-id'] as string || 'default-session'; // 세션 ID (임시)
  let messages = conversations.get(sessionId) || [];

  const user_input = req.body.message || '';
  const file = req.file;

  try {
    if (file) {
      // 이미지 처리
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
      const prompt_text = user_input || "업로드한 이미지에 대한 설명 또는 해답을 제공해주세요.";
      const imagePart = await fileToGenerativePart(file.buffer, file.mimetype || 'image/jpeg');

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [prompt_text, imagePart] }],
        safetySettings,
      });
      const response = result.response;
      const assistant_reply = response.text();

      messages.push({ role: "user", content: user_input, imageUrl: file ? URL.createObjectURL(new Blob([file.buffer], { type: file.mimetype })) : undefined });
      messages.push({ role: "assistant", content: assistant_reply });

      conversations.set(sessionId, messages);
      return res.json({ reply: assistant_reply });

    } else {
      // 텍스트 처리
      messages.push({ role: "user", content: user_input });

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const chat = model.startChat({ history: messages, safetySettings });

      const result = await chat.sendMessage(user_input);
      const response = result.response;
      const assistant_reply = response.text();

      messages.push({ role: "assistant", content: assistant_reply });
      conversations.set(sessionId, messages);

      // Python 코드의 navigate 로직은 프론트엔드에서 처리하는 것이 더 적절합니다.
      // 여기서는 단순히 텍스트 응답만 보냅니다.
      return res.json({ reply: assistant_reply });
    }
  } catch (error: any) {
    console.error('Error in pro_solve_chat_api:', error.response?.data || error.message);
    res.status(500).json({ error: 'AI 응답 처리 중 오류가 발생했습니다.' });
  }
});

// /generate-problems 엔드포인트
app.post('/generate-problems', upload.single('pdf_file'), async (req: Request, res: Response) => {
  // 인증 로직 (Python 코드의 get_current_user에 해당)
  // 여기서는 간단히 req.headers에 'authorization' 토큰이 있다고 가정하고, 실제 인증은 구현하지 않습니다.
  // 실제 앱에서는 Supabase JWT 등을 검증해야 합니다.
  const authToken = req.headers.authorization;
  if (!authToken) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }

  const { subject, danwon, difficulty, problem_type, num_questions, extra } = req.body;
  const pdfFile = req.file;

  let pdf_text = "";
  if (pdfFile) {
    try {
      const data = await pdfParse(pdfFile.buffer);
      pdf_text = data.text;
    } catch (e: any) {
      return res.status(400).json({ error: `PDF 처리 오류: ${e.message}` });
    }
  }

  const prompt = `
너는 사용자가 요청하거나 업로드한 문제와 비슷한 난이도, 비슷한 유형의 문제를 출제해주는 모델이다.
문제는 시중 문제집 유형으로 만들어라. 업로드된 PDF가 있다면 참고하라.
사용자가 오지선다형 유형의 문제를 요청한다면, 반드시 각 문제마다 5개의 보기를 모두 제공하여라.

● 주제  : ${subject}
● 단원  : ${danwon}
● 난이도 : ${difficulty}
● 유형  : ${problem_type}
● 개수  : ${num_questions} 개
● 추가 요청 : ${extra || '없음'}
● PDF 미리보기(최대 1000자) :
${pdf_text.substring(0, 1000)}

반환 형식은 아래 예처럼 **순수 JSON 문자열**만 보내라(코드블럭 금지).

{
  "problems": [
    {"question": "…", "answer": "…", "explanation": "…"}
  ]
}
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings,
    });
    const response = result.response;
    let raw = response.text().trim();

    // 코드펜스 제거 (Python 코드의 정규식과 유사하게)
    raw = raw.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');

    const data = JSON.parse(raw);
    const problems = data.problems || [];

    if (!problems.length) {
      return res.status(400).json({ error: "문제가 생성되지 않았습니다." });
    }

    res.json({ problems });

  } catch (error: any) {
    console.error('Error in generate-problems:', error.response?.data || error.message);
    if (error instanceof SyntaxError) {
      return res.status(500).json({ error: "AI 응답을 JSON으로 변환하지 못했습니다. 응답 형식 오류." });
    }
    res.status(500).json({ error: `문제 생성 중 오류: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`백엔드 서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
