checkBtn.disabled = true;
checkBtn.textContent = '添削中...';

    // --- サーバー関数経由で呼び出す ---
const response = await fetch('/api/check', {
method:'POST',
headers:{ 'Content-Type':'application/json' },
body: JSON.stringify({ userText, currentProblem })
});

if(!response.ok){
      const errData = await response.json();
      throw new Error(errData.error || `HTTP ${response.status}`);
      const errText = await response.text();
      throw new Error(errText);
}

const data = await response.json();
    const resultText = data.result;
    const resultText = data.choices[0].message.content.trim();

// --- 正規表現で抽出 ---
const correctedMatch = resultText.match(/添削後[:：]\s*(.*)/i);
