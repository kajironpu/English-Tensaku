let problems = [];
let currentProblem = "";

// CSV読み込み
async function loadProblems() {
  const response = await fetch("/problems.csv");
  const text = await response.text();
  const lines = text.trim().split("\n").slice(1); // ヘッダー除去
  problems = lines.map(line => line.trim()).filter(line => line);
}

// 問題を表示
function showProblem() {
  if (problems.length === 0) {
    document.getElementById("problem").textContent = "問題が読み込めませんでした。";
    return;
  }
  const idx = Math.floor(Math.random() * problems.length);
  currentProblem = problems[idx];
  document.getElementById("problem").textContent = currentProblem;
  document.getElementById("userAnswer").value = "";
  clearResult();
}

// ページ読み込み時に実行
document.addEventListener("DOMContentLoaded", async () => {
  await loadProblems();
  showProblem();
});
