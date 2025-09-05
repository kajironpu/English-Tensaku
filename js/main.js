// --- GitHubトークンとモデル ---
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // 環境変数
const MODEL_NAME = "mistral-ai/mistral-medium-2505";

// --- 問題CSV読み込み（外部ファイルに変更済みの場合） ---
let problems = [];
fetch('problems.csv')
  .then(res => res.text())
  .then(csv => {
    problems = csv.split('\n').map(line => line.trim()).filter(line => line);
    showProblem();
  });

let currentProblem = "";

// --- 問題表示 ---
function showProblem() {
  if(problems.length === 0) return;
  const idx = Math.floor(Math.random() * problems.length);
  currentProblem = problems[idx];
  document.getElementById('problem').textContent = currentProblem;
  document.getElementById('userAnswer').value = "";
  clearResult();
}

function clearResult() {
  document.getElementById('corrected').textContent = "";
  document.getElementById('score').textContent = "";
  document.getElementById('advice').textContent = "";
}

// --- 音声入力 ---
document.getElementById('voiceInputBtn').addEventListener('click', () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert('音声入力はこのブラウザでサポートされていません');
    return;
  }
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    let transcript = event.results[0][0].transcript.trim();
    if (transcript.length > 0) {
      transcript = transcript.charAt(0).toUpperCase() + transcript.slice(1);
    }
    document.getElementById('userAnswer').value = transcript;
  };

  recognition.onerror = (event) => {
    alert('音声入力エラー: ' + event.error);
  };

  recognition.start();
});

// --- 添削処理 ---
async function checkAnswer() {
  const userText = document.getElementById('userAnswer').value.trim();
  if (!userText) { alert('英文を入力してください'); return; }

  const prompt = `あなたは中学生向けの英語添削AIです。
必ず次の形式で答えてください：
添削後: <自然で文法的に正しい英文>
スコア: <0-100の整数>
アドバイス: <改善点を日本語で丁寧に、中学生向けに分かりやすく200文字程度で>

問題の日本語文: "${currentProblem}"
ユーザーの英文: "${userText}"`;

  const checkBtn = document.getElementById('checkBtn');
  checkBtn.disabled = true;
  checkBtn.textContent = '添削中...';

  try {
    const response = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userText, currentProblem })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content.trim();

    // --- 正規表現で抽出 ---
    const correctedMatch = resultText.match(/添削後[:：]\s*(.*)/i);
    const scoreMatch = resultText.match(/スコア[:：]\s*(\d+)/i);
    const adviceMatch = resultText.match(/アドバイス[:：]\s*([\s\S]*)/i);

    const corrected = correctedMatch ? correctedMatch[1].trim() : "";
    const score = scoreMatch ? scoreMatch[1].trim() : "";
    const advice = adviceMatch ? adviceMatch[1].trim() : "";

    document.getElementById('corrected').textContent = corrected;
    document.getElementById('score').textContent = score ? score + " / 100" : "";
    document.getElementById('advice').textContent = advice;

    // --- 添削後に自動読み上げ ---
    if (corrected) {
      const utter = new SpeechSynthesisUtterance(corrected);
      utter.lang = 'en-US';
      speechSynthesis.speak(utter);
    }

  } catch (err) {
    alert('添削エラー: ' + err.message);
  } finally {
    checkBtn.disabled = false;
    checkBtn.textContent = '添削する';
  }
}

// --- ボタンイベント ---
document.getElementById('checkBtn').addEventListener('click', checkAnswer);
document.getElementById('nextBtn').addEventListener('click', showProblem);

// --- 初期表示 ---
document.addEventListener('DOMContentLoaded', () => {
  if (problems.length > 0) showProblem();
});
