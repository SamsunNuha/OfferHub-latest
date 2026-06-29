const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\SamsunNuha\\.gemini\\antigravity-ide\\brain\\87651750-d5fb-4a93-b667-ff2bbeccfce5\\.system_generated\\logs\\transcript.jsonl';

if (!fs.existsSync(logPath)) {
  console.error("Log file does not exist at:", logPath);
  process.exit(1);
}

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  const step = JSON.parse(line);
  if (step.source === 'USER_EXPLICIT' && step.type === 'USER_INPUT') {
    const time = new Date(step.created_at);
    // Check if on 2026-06-27 between 11:15 and 11:30 UTC
    if (time.getUTCFullYear() === 2026 && time.getUTCMonth() === 5 && time.getUTCDate() === 27 && time.getUTCHours() === 11 && time.getUTCMinutes() >= 15 && time.getUTCMinutes() <= 30) {
      console.log(`STEP ${step.step_index}: time: ${step.created_at}`);
      console.log(step.content);
      console.log("-----------------------------------------");
    }
  }
});
