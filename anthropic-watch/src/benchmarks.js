/* Anthropic Watch benchmark tables, one entry per launch, numbers as published by Anthropic
   in that launch's own table (launch post, model card or addendum). Each row keeps the scores
   for earlier Claude models exactly as that same table reported them, so within-launch deltas
   compare like with like. Anthropic sometimes restates older numbers in later posts; we keep
   each table as published. Keys in `s` are model ids from models.js; `o` holds non-Claude models.
   unit: "%" unless set. hib: higher is better (default true). */
window.ANTHROPIC_BENCH = {
  verifiedAt: "2026-10-08",
  launches: [
    { model: "claude-2", date: "2023-07-11", src: "https://www.anthropic.com/news/claude-2", srcLabel: "Claude 2 launch post + model card",
      rows: [
        { b: "HumanEval", m: "Python function writing", c: "0-shot, pass@1", s: { "claude-2": 71.2, "claude-1": 56.0, "claude-instant-1": 52.8 } },
        { b: "MMLU", m: "Knowledge across 57 subjects", c: "5-shot CoT", s: { "claude-2": 78.5, "claude-1": 77.0, "claude-instant-1": 73.4 } },
        { b: "GSM8K", m: "Grade-school maths", c: "0-shot CoT", s: { "claude-2": 88.0, "claude-1": 85.2, "claude-instant-1": 80.9 } },
        { b: "Bar exam (MBE)", m: "US bar exam multiple choice", c: "5-shot", s: { "claude-2": 76.5, "claude-1": 73.0 } },
        { b: "TriviaQA", m: "Factual recall", c: "5-shot", s: { "claude-2": 87.5, "claude-1": 86.7, "claude-instant-1": 78.9 } }
      ],
      note: "Claude 1 scores are for Claude 1.3 and Instant scores for Instant 1.1, as the Claude 2 model card lists them. The Claude 1 launch post itself published no benchmark numbers." },

    { model: "claude-2-1", date: "2023-11-21", src: "https://www.anthropic.com/news/claude-2-1", srcLabel: "Claude 2.1 launch post",
      rows: [],
      note: "No standard benchmark scores. Anthropic reported relative gains over Claude 2.0: about half as many false statements, 30% fewer wrong answers on long documents, and 3–4× fewer cases of wrongly concluding a document supports a claim." },

    { model: "claude-3-opus", date: "2024-03-04", src: "https://www.anthropic.com/news/claude-3-family", srcLabel: "Claude 3 model card (tables 1 and 3)",
      rows: [
        { b: "MMLU", m: "Knowledge across 57 subjects", c: "5-shot", s: { "claude-3-opus": 86.8, "claude-3-sonnet": 79.0, "claude-3-haiku": 75.2 } },
        { b: "GPQA Diamond", m: "Graduate-level, search-proof science", c: "0-shot CoT", s: { "claude-3-opus": 50.4, "claude-3-sonnet": 40.4, "claude-3-haiku": 33.3 } },
        { b: "MATH", m: "Competition maths", c: "0-shot CoT", s: { "claude-3-opus": 60.1, "claude-3-sonnet": 43.1, "claude-3-haiku": 38.9 } },
        { b: "HumanEval", m: "Python function writing", c: "0-shot", s: { "claude-3-opus": 84.9, "claude-3-sonnet": 73.0, "claude-3-haiku": 75.9 } },
        { b: "GSM8K", m: "Grade-school maths", c: "0-shot CoT", s: { "claude-3-opus": 95.0, "claude-3-sonnet": 92.3, "claude-3-haiku": 88.9 } },
        { b: "MMMU", m: "College-level visual questions", c: "val, 0-shot", s: { "claude-3-opus": 59.4, "claude-3-sonnet": 53.1, "claude-3-haiku": 50.2 } }
      ],
      note: "The launch post compared Claude 3 with Claude 2.1 only qualitatively (e.g. about 2× accuracy on hard factual questions). Claude 3 Haiku really does beat Claude 3 Sonnet on HumanEval." },

    { model: "claude-3-5-sonnet", date: "2024-06-20", src: "https://www.anthropic.com/news/claude-3-5-sonnet", srcLabel: "Claude 3.5 Sonnet launch + model card addendum",
      rows: [
        { b: "GPQA Diamond", m: "Graduate-level, search-proof science", c: "0-shot CoT", s: { "claude-3-5-sonnet": 59.4, "claude-3-opus": 50.4, "claude-3-sonnet": 40.4 } },
        { b: "MMLU", m: "Knowledge across 57 subjects", c: "5-shot", s: { "claude-3-5-sonnet": 88.7, "claude-3-opus": 86.8, "claude-3-sonnet": 78.3 } },
        { b: "MATH", m: "Competition maths", c: "0-shot CoT", s: { "claude-3-5-sonnet": 71.1, "claude-3-opus": 60.1, "claude-3-sonnet": 43.1 } },
        { b: "HumanEval", m: "Python function writing", c: "0-shot", s: { "claude-3-5-sonnet": 92.0, "claude-3-opus": 84.9, "claude-3-sonnet": 73.0 } },
        { b: "MMMU", m: "College-level visual questions", c: "val, 0-shot CoT", s: { "claude-3-5-sonnet": 68.3, "claude-3-opus": 59.4, "claude-3-sonnet": 53.1 } },
        { b: "Agentic coding (internal)", m: "Implementing real open-source pull requests", c: "Anthropic internal eval", s: { "claude-3-5-sonnet": 64, "claude-3-opus": 38, "claude-3-sonnet": 21, "claude-3-haiku": 17 } }
      ],
      note: "The first time a middle-tier Claude beat the previous flagship across the board, at a fifth of Opus's price." },

    { model: "claude-3-5-sonnet-oct", date: "2024-10-22", src: "https://www.anthropic.com/news/3-5-models-and-computer-use", srcLabel: "Oct 2024 launch post + model card addendum",
      rows: [
        { b: "SWE-bench Verified", m: "Fixing real GitHub issues", c: "pass@1, simple agent scaffold", s: { "claude-3-5-sonnet-oct": 49.0, "claude-3-5-haiku": 40.6, "claude-3-5-sonnet": 33.4, "claude-3-opus": 22.2, "claude-3-haiku": 7.2 } },
        { b: "TAU-bench Retail", m: "Agent tool use with a simulated customer", c: "TAU-bench v1, pass^1", s: { "claude-3-5-sonnet-oct": 69.2, "claude-3-5-haiku": 51.0, "claude-3-5-sonnet": 62.6, "claude-3-opus": 45.1, "claude-3-haiku": 18.2 } },
        { b: "GPQA Diamond", m: "Graduate-level, search-proof science", c: "0-shot CoT", s: { "claude-3-5-sonnet-oct": 65.0, "claude-3-5-haiku": 41.6, "claude-3-5-sonnet": 59.4, "claude-3-opus": 50.4, "claude-3-haiku": 33.3 } },
        { b: "MMLU-Pro", m: "Harder MMLU", c: "0-shot CoT", s: { "claude-3-5-sonnet-oct": 78.0, "claude-3-5-haiku": 65.0, "claude-3-5-sonnet": 75.1, "claude-3-opus": 67.9, "claude-3-haiku": 49.0 } },
        { b: "MATH", m: "Competition maths", c: "0-shot CoT", s: { "claude-3-5-sonnet-oct": 78.3, "claude-3-5-haiku": 69.2, "claude-3-5-sonnet": 71.1, "claude-3-opus": 60.1, "claude-3-haiku": 38.9 } },
        { b: "HumanEval", m: "Python function writing", c: "0-shot", s: { "claude-3-5-sonnet-oct": 93.7, "claude-3-5-haiku": 88.1, "claude-3-5-sonnet": 92.0, "claude-3-opus": 84.9, "claude-3-haiku": 75.9 } },
        { b: "OSWorld (original)", m: "Operating a real computer", c: "screenshot-only, 15 steps", s: { "claude-3-5-sonnet-oct": 14.9 } },
        { b: "MMMU", m: "College-level visual questions", c: "val, 0-shot CoT", s: { "claude-3-5-sonnet-oct": 70.4, "claude-3-5-sonnet": 68.3, "claude-3-opus": 59.4 } }
      ],
      note: "The first launch to report SWE-bench Verified and OSWorld. Claude 3.5 Haiku launched text-only, so it has no vision scores." },

    { model: "claude-3-7-sonnet", date: "2025-02-24", src: "https://www.anthropic.com/news/claude-3-7-sonnet", srcLabel: "Claude 3.7 Sonnet launch post",
      rows: [
        { b: "SWE-bench Verified", m: "Fixing real GitHub issues", c: "pass@1, all 500 problems, with a planning tool, no extended thinking", s: { "claude-3-7-sonnet": 62.3, "claude-3-5-sonnet-oct": 49.0 } },
        { b: "GPQA Diamond", m: "Graduate-level, search-proof science", c: "64K extended thinking", s: { "claude-3-7-sonnet": 78.2, "claude-3-5-sonnet-oct": 65.0 } },
        { b: "TAU-bench Retail", m: "Agent tool use with a simulated customer", c: "no extended thinking", s: { "claude-3-7-sonnet": 81.2, "claude-3-5-sonnet-oct": 71.5 } },
        { b: "MATH 500", m: "Competition maths (500-problem subset)", c: "64K extended thinking", s: { "claude-3-7-sonnet": 96.2, "claude-3-5-sonnet-oct": 78.0 } },
        { b: "AIME 2024", m: "Olympiad-qualifier maths", c: "64K extended thinking", s: { "claude-3-7-sonnet": 61.3, "claude-3-5-sonnet-oct": 16.0 } },
        { b: "MMMU", m: "College-level visual questions", c: "val, 64K extended thinking", s: { "claude-3-7-sonnet": 75.0, "claude-3-5-sonnet-oct": 70.4 } }
      ],
      note: "The first Claude with extended thinking, so most non-coding scores here are with thinking and the 3.5 Sonnet column is without it. Not a like-for-like model comparison: it shows what reasoning adds." },

    { model: "claude-opus-4", date: "2025-05-22", src: "https://www.anthropic.com/news/claude-4", srcLabel: "Claude 4 launch post",
      rows: [
        { b: "SWE-bench Verified", m: "Fixing real GitHub issues", c: "pass@1, 2-tool scaffold, no extended thinking", s: { "claude-opus-4": 72.5, "claude-sonnet-4": 72.7, "claude-3-7-sonnet": 62.3 } },
        { b: "SWE-bench Verified (parallel)", m: "Same, with parallel test-time compute", c: "parallel attempts + internal scorer", s: { "claude-opus-4": 79.4, "claude-sonnet-4": 80.2, "claude-3-7-sonnet": 70.3 } },
        { b: "Terminal-Bench", m: "Agentic coding in a terminal", c: "no extended thinking", s: { "claude-opus-4": 43.2 } }
      ],
      note: "The live launch page now shows only the SWE-bench chart. Opus 4 and Sonnet 4 scores on GPQA, MMMU and AIME are listed in the Opus 4.1 table instead." },

    { model: "claude-opus-4-1", date: "2025-08-05", src: "https://www.anthropic.com/news/claude-opus-4-1", srcLabel: "Claude Opus 4.1 launch post",
      rows: [
        { b: "SWE-bench Verified", m: "Fixing real GitHub issues", c: "pass@1, 10 trials, no extended thinking", s: { "claude-opus-4-1": 74.5, "claude-opus-4": 72.5, "claude-sonnet-4": 72.7, "claude-3-7-sonnet": 62.3 } },
        { b: "Terminal-Bench", m: "Agentic coding in a terminal", c: "Terminus 1 agent, 5 trials", s: { "claude-opus-4-1": 43.3, "claude-opus-4": 39.2, "claude-sonnet-4": 35.5 } },
        { b: "GPQA Diamond", m: "Graduate-level, search-proof science", c: "extended thinking up to 64K", s: { "claude-opus-4-1": 80.9, "claude-opus-4": 79.6, "claude-sonnet-4": 75.4, "claude-3-7-sonnet": 78.2 } },
        { b: "TAU-bench Retail", m: "Agent tool use with a simulated customer", c: "extended thinking, 100 steps", s: { "claude-opus-4-1": 82.4, "claude-opus-4": 81.4, "claude-sonnet-4": 80.5, "claude-3-7-sonnet": 81.2 } },
        { b: "MMMU", m: "College-level visual questions", c: "val, extended thinking", s: { "claude-opus-4-1": 77.1, "claude-opus-4": 76.5, "claude-sonnet-4": 74.4, "claude-3-7-sonnet": 75.0 } },
        { b: "AIME 2025", m: "Olympiad-qualifier maths", c: "extended thinking", s: { "claude-opus-4-1": 78.0, "claude-opus-4": 75.5, "claude-sonnet-4": 70.5 } }
      ],
      note: "Note the restatement: this table lists Opus 4 at 39.2% on Terminal-Bench, where the May post said 43.2%." },

    { model: "claude-sonnet-4-5", date: "2025-09-29", src: "https://www.anthropic.com/news/claude-sonnet-4-5", srcLabel: "Claude Sonnet 4.5 launch post",
      rows: [
        { b: "SWE-bench Verified", m: "Fixing real GitHub issues", c: "10 trials, 200K thinking budget", s: { "claude-sonnet-4-5": 77.2, "claude-opus-4-1": 74.5, "claude-sonnet-4": 72.7 } },
        { b: "OSWorld-Verified", m: "Operating a real computer", c: "100 steps, 4 runs", s: { "claude-sonnet-4-5": 61.4, "claude-opus-4-1": 44.4, "claude-sonnet-4": 42.2 } },
        { b: "Terminal-Bench", m: "Agentic coding in a terminal", c: "Terminus 2 agent", s: { "claude-sonnet-4-5": 50.0, "claude-opus-4-1": 46.5, "claude-sonnet-4": 36.4 } },
        { b: "τ2-bench Telecom", m: "Agent tool use, telecom support", c: "extended thinking", s: { "claude-sonnet-4-5": 98.0, "claude-opus-4-1": 71.5, "claude-sonnet-4": 49.6 } },
        { b: "GPQA Diamond", m: "Graduate-level, search-proof science", c: "extended thinking", s: { "claude-sonnet-4-5": 83.4, "claude-opus-4-1": 81.0, "claude-sonnet-4": 76.1 } },
        { b: "AIME 2025", m: "Olympiad-qualifier maths", c: "no tools", s: { "claude-sonnet-4-5": 87.0, "claude-opus-4-1": 78.0, "claude-sonnet-4": 70.5 } },
        { b: "MMMU", m: "College-level visual questions", c: "val", s: { "claude-sonnet-4-5": 77.8, "claude-opus-4-1": 77.1, "claude-sonnet-4": 74.4 } }
      ],
      note: "A Sonnet that beat the then-current Opus on coding and computer use. OSWorld switched to the Verified framework here, so earlier OSWorld numbers aren't comparable." },

    { model: "claude-haiku-4-5", date: "2025-10-15", src: "https://www.anthropic.com/news/claude-haiku-4-5", srcLabel: "Claude Haiku 4.5 launch post",
      rows: [
        { b: "SWE-bench Verified", m: "Fixing real GitHub issues", c: "50 trials, 128K thinking", s: { "claude-haiku-4-5": 73.3, "claude-sonnet-4-5": 77.2, "claude-sonnet-4": 72.7 } },
        { b: "OSWorld-Verified", m: "Operating a real computer", c: "100 steps, 4 runs", s: { "claude-haiku-4-5": 50.7, "claude-sonnet-4-5": 61.4, "claude-sonnet-4": 42.2 } },
        { b: "Terminal-Bench", m: "Agentic coding in a terminal", c: "Terminus 2", s: { "claude-haiku-4-5": 41.0, "claude-sonnet-4-5": 50.0, "claude-sonnet-4": 36.4 } },
        { b: "GPQA Diamond", m: "Graduate-level, search-proof science", c: "128K thinking", s: { "claude-haiku-4-5": 73.0, "claude-sonnet-4-5": 83.4, "claude-sonnet-4": 76.1 } },
        { b: "AIME 2025", m: "Olympiad-qualifier maths", c: "no tools", s: { "claude-haiku-4-5": 80.7, "claude-sonnet-4-5": 87.0, "claude-sonnet-4": 70.5 } },
        { b: "MMMU", m: "College-level visual questions", c: "val", s: { "claude-haiku-4-5": 73.2, "claude-sonnet-4-5": 77.8, "claude-sonnet-4": 74.4 } }
      ],
      note: "A Haiku that matched the previous Sonnet (Sonnet 4) on coding. The table has no Claude 3.5 Haiku column." },

    { model: "claude-opus-4-5", date: "2025-11-24", src: "https://www.anthropic.com/news/claude-opus-4-5", srcLabel: "Claude Opus 4.5 launch post",
      rows: [
        { b: "SWE-bench Verified", m: "Fixing real GitHub issues", c: "effort high, 5 trials", s: { "claude-opus-4-5": 80.9, "claude-sonnet-4-5": 77.2, "claude-opus-4-1": 74.5 } },
        { b: "Terminal-Bench 2.0", m: "Agentic coding in a terminal", c: "128K thinking", s: { "claude-opus-4-5": 59.3, "claude-sonnet-4-5": 50.0, "claude-opus-4-1": 46.5 } },
        { b: "OSWorld-Verified", m: "Operating a real computer", c: "", s: { "claude-opus-4-5": 66.3, "claude-sonnet-4-5": 61.4, "claude-opus-4-1": 44.4 } },
        { b: "ARC-AGI-2", m: "Novel abstract puzzles", c: "Verified", s: { "claude-opus-4-5": 37.6, "claude-sonnet-4-5": 13.6 } },
        { b: "MCP Atlas", m: "Tool use at scale", c: "", s: { "claude-opus-4-5": 62.3, "claude-sonnet-4-5": 43.8, "claude-opus-4-1": 40.9 } },
        { b: "GPQA Diamond", m: "Graduate-level, search-proof science", c: "64K thinking, 5 trials", s: { "claude-opus-4-5": 87.0, "claude-sonnet-4-5": 83.4, "claude-opus-4-1": 81.0 } },
        { b: "MMMU", m: "College-level visual questions", c: "val", s: { "claude-opus-4-5": 80.7, "claude-sonnet-4-5": 77.8, "claude-opus-4-1": 77.1 } }
      ],
      note: "The first Claude above 80% on SWE-bench Verified, at a third of the previous Opus price." },

    { model: "claude-opus-4-6", date: "2026-02-05", src: "https://www.anthropic.com/news/claude-opus-4-6", srcLabel: "Opus 4.6 launch post + system card",
      rows: [
        { b: "SWE-bench Verified", m: "Fixing real GitHub issues", c: "adaptive thinking, max effort, 25 trials", s: { "claude-opus-4-6": 80.8, "claude-opus-4-5": 80.9, "claude-sonnet-4-5": 77.2 }, o: { "GPT-5.2": 80.0, "Gemini 3 Pro": 76.2 } },
        { b: "Terminal-Bench 2.0", m: "Agentic coding in a terminal", c: "Terminus-2 harness", s: { "claude-opus-4-6": 65.4, "claude-opus-4-5": 59.8, "claude-sonnet-4-5": 51.0 }, o: { "GPT-5.2": 64.7, "Gemini 3 Pro": 56.2 } },
        { b: "OSWorld-Verified", m: "Operating a real computer", c: "max effort", s: { "claude-opus-4-6": 72.7, "claude-opus-4-5": 66.3, "claude-sonnet-4-5": 61.4 } },
        { b: "ARC-AGI-2", m: "Novel abstract puzzles", c: "Verified, max effort", s: { "claude-opus-4-6": 68.8, "claude-opus-4-5": 37.6, "claude-sonnet-4-5": 13.6 }, o: { "GPT-5.2": 54.2, "Gemini 3 Pro (Deep Think)": 45.1 } },
        { b: "GPQA Diamond", m: "Graduate-level, search-proof science", c: "max effort", s: { "claude-opus-4-6": 91.3, "claude-opus-4-5": 87.0, "claude-sonnet-4-5": 83.4 }, o: { "GPT-5.2": 93.2, "Gemini 3 Pro": 91.9 } },
        { b: "Humanity's Last Exam (no tools)", m: "Very hard expert questions", c: "max effort", s: { "claude-opus-4-6": 40.0, "claude-opus-4-5": 30.8, "claude-sonnet-4-5": 17.7 }, o: { "Gemini 3 Pro": 37.5, "GPT-5.2": 36.6 } },
        { b: "Humanity's Last Exam (with tools)", m: "Very hard expert questions, with search and code", c: "max effort; revised 53.1 → 53.0", s: { "claude-opus-4-6": 53.0, "claude-opus-4-5": 43.4, "claude-sonnet-4-5": 33.6 }, o: { "GPT-5.2": 50.0, "Gemini 3 Pro": 45.8 } },
        { b: "GDPval-AA", m: "Paid knowledge-work tasks (Elo)", c: "Artificial Analysis Elo", unit: "Elo", s: { "claude-opus-4-6": 1606, "claude-opus-4-5": 1416, "claude-sonnet-4-5": 1276 }, o: { "GPT-5.2": 1462, "Gemini 3 Pro": 1201 } }
      ],
      note: "Ties Opus 4.5 on SWE-bench Verified but jumps on terminal coding, ARC-AGI-2 (37.6 → 68.8) and Humanity's Last Exam. First Claude with adaptive thinking and a 1M window at standard price." },

    { model: "claude-sonnet-4-6", date: "2026-02-17", src: "https://www.anthropic.com/news/claude-sonnet-4-6", srcLabel: "Sonnet 4.6 launch post + system card",
      rows: [
        { b: "SWE-bench Verified", m: "Fixing real GitHub issues", c: "25 trials", s: { "claude-sonnet-4-6": 79.6, "claude-opus-4-6": 80.8, "claude-opus-4-5": 80.9, "claude-sonnet-4-5": 77.2 }, o: { "GPT-5.2": 80.0 } },
        { b: "OSWorld-Verified", m: "Operating a real computer", c: "", s: { "claude-sonnet-4-6": 72.5, "claude-opus-4-6": 72.7, "claude-opus-4-5": 66.3, "claude-sonnet-4-5": 61.4 } },
        { b: "ARC-AGI-2", m: "Novel abstract puzzles", c: "Verified, max effort", s: { "claude-sonnet-4-6": 58.3, "claude-opus-4-6": 68.8, "claude-opus-4-5": 37.6, "claude-sonnet-4-5": 13.6 }, o: { "GPT-5.2": 54.2 } },
        { b: "GPQA Diamond", m: "Graduate-level, search-proof science", c: "max effort", s: { "claude-sonnet-4-6": 89.9, "claude-opus-4-6": 91.3, "claude-opus-4-5": 87.0, "claude-sonnet-4-5": 83.4 } },
        { b: "GDPval-AA", m: "Paid knowledge-work tasks (Elo)", c: "Artificial Analysis Elo", unit: "Elo", s: { "claude-sonnet-4-6": 1633, "claude-opus-4-6": 1606, "claude-opus-4-5": 1416, "claude-sonnet-4-5": 1276 }, o: { "GPT-5.2": 1462 } }
      ],
      note: "Near-Opus 4.6 on most rows at Sonnet pricing, and slightly ahead of it on GDPval-AA." },

    { model: "claude-mythos-preview", date: "2026-04-07", src: "https://www.anthropic.com/glasswing", srcLabel: "Project Glasswing + Mythos Preview system card",
      rows: [
        { b: "SWE-bench Verified", m: "Fixing real GitHub issues", c: "max effort", s: { "claude-mythos-preview": 93.9, "claude-opus-4-6": 80.8 }, o: { "Gemini 3.1 Pro": 80.6 } },
        { b: "SWE-bench Pro", m: "Harder, multi-file engineering tasks", c: "max effort", s: { "claude-mythos-preview": 77.8, "claude-opus-4-6": 53.4 }, o: { "GPT-5.4": 57.7, "Gemini 3.1 Pro": 54.2 } },
        { b: "Terminal-Bench 2.0", m: "Agentic coding in a terminal", c: "Terminus-2, max effort", s: { "claude-mythos-preview": 82.0, "claude-opus-4-6": 65.4 }, o: { "GPT-5.4": 75.1, "Gemini 3.1 Pro": 68.5 } },
        { b: "GPQA Diamond", m: "Graduate-level, search-proof science", c: "max effort", s: { "claude-mythos-preview": 94.5, "claude-opus-4-6": 91.3 }, o: { "Gemini 3.1 Pro": 94.3, "GPT-5.4": 92.8 } },
        { b: "Humanity's Last Exam (no tools)", m: "Very hard expert questions", c: "max effort", s: { "claude-mythos-preview": 56.8, "claude-opus-4-6": 40.0 }, o: { "Gemini 3.1 Pro": 44.4, "GPT-5.4": 39.8 } },
        { b: "OSWorld-Verified", m: "Operating a real computer", c: "", s: { "claude-mythos-preview": 79.6, "claude-opus-4-6": 72.7 }, o: { "GPT-5.4": 75.0 } }
      ],
      note: "A gated preview, not generally available, so it isn't on the frontier line. It shows how far ahead Anthropic's unreleased models were: +13 pts on SWE-bench Verified over the public flagship." },

    { model: "claude-opus-4-7", date: "2026-04-16", src: "https://www.anthropic.com/news/claude-opus-4-7", srcLabel: "Opus 4.7 launch post + system card",
      rows: [
        { b: "SWE-bench Verified", m: "Fixing real GitHub issues", c: "max effort, memorization-flagged problems excluded", s: { "claude-opus-4-7": 87.6, "claude-opus-4-6": 80.8 }, o: { "Gemini 3.1 Pro": 80.6 } },
        { b: "SWE-bench Pro", m: "Harder, multi-file engineering tasks", c: "max effort", s: { "claude-opus-4-7": 64.3, "claude-opus-4-6": 53.4 }, o: { "GPT-5.4": 57.7, "Gemini 3.1 Pro": 54.2 } },
        { b: "Terminal-Bench 2.0", m: "Agentic coding in a terminal", c: "Terminus-2, thinking off", s: { "claude-opus-4-7": 69.4, "claude-opus-4-6": 65.4 }, o: { "GPT-5.4": 75.1, "Gemini 3.1 Pro": 68.5 } },
        { b: "OSWorld-Verified", m: "Operating a real computer", c: "", s: { "claude-opus-4-7": 78.0, "claude-opus-4-6": 72.7 }, o: { "GPT-5.4": 75.0 } },
        { b: "GPQA Diamond", m: "Graduate-level, search-proof science", c: "max effort", s: { "claude-opus-4-7": 94.2, "claude-opus-4-6": 91.3 }, o: { "Gemini 3.1 Pro": 94.3, "GPT-5.4": 92.8 } },
        { b: "Humanity's Last Exam (no tools)", m: "Very hard expert questions", c: "max effort", s: { "claude-opus-4-7": 46.9, "claude-opus-4-6": 40.0 }, o: { "Gemini 3.1 Pro": 44.4, "GPT-5.4": 39.8 } },
        { b: "ARC-AGI-2", m: "Novel abstract puzzles", c: "max effort", s: { "claude-opus-4-7": 75.8, "claude-opus-4-6": 68.8 }, o: { "Gemini 3.1 Pro": 77.1, "GPT-5.4": 73.3 } }
      ],
      note: "Introduced the newer tokenizer. Behind GPT-5.4 on Terminal-Bench 2.0 (OpenAI used a specialised harness)." },

    { model: "claude-opus-4-8", date: "2026-05-28", src: "https://www.anthropic.com/news/claude-opus-4-8", srcLabel: "Opus 4.8 launch post + system card",
      rows: [
        { b: "SWE-bench Verified", m: "Fixing real GitHub issues", c: "max effort, 5 trials", s: { "claude-opus-4-8": 88.6, "claude-opus-4-7": 87.6 }, o: { "Gemini 3.1 Pro": 80.6 } },
        { b: "SWE-bench Pro", m: "Harder, multi-file engineering tasks", c: "max effort", s: { "claude-opus-4-8": 69.2, "claude-opus-4-7": 64.3 }, o: { "GPT-5.5": 58.6, "Gemini 3.1 Pro": 54.2 } },
        { b: "Terminal-Bench 2.1", m: "Agentic coding in a terminal (revised 2.0)", c: "Terminus-2", s: { "claude-opus-4-8": 74.6, "claude-opus-4-7": 66.1 }, o: { "GPT-5.5": 78.2, "Gemini 3.1 Pro": 70.3 } },
        { b: "OSWorld-Verified", m: "Operating a real computer", c: "new harness: zoom fix, 128K tokens per turn", s: { "claude-opus-4-8": 83.4, "claude-opus-4-7": 82.8 }, o: { "GPT-5.5": 78.7, "Gemini 3.1 Pro": 76.2 } },
        { b: "GPQA Diamond", m: "Graduate-level, search-proof science", c: "max effort", s: { "claude-opus-4-8": 93.6, "claude-opus-4-7": 94.2 }, o: { "Gemini 3.1 Pro": 94.3 } },
        { b: "Humanity's Last Exam (no tools)", m: "Very hard expert questions", c: "max effort", s: { "claude-opus-4-8": 49.8, "claude-opus-4-7": 46.9 }, o: { "Gemini 3.1 Pro": 44.4, "GPT-5.5": 41.4 } },
        { b: "GDPval-AA", m: "Paid knowledge-work tasks (Elo)", c: "Artificial Analysis Elo", unit: "Elo", s: { "claude-opus-4-8": 1890, "claude-opus-4-7": 1753 }, o: { "GPT-5.5": 1769, "Gemini 3.1 Pro": 1314 } }
      ],
      note: "A modest, real step at the same price. Note the OSWorld harness change: Opus 4.7 re-scored from 78.0 to 82.8 under it." },

    { model: "claude-fable-5", date: "2026-06-09", src: "https://www.anthropic.com/news/claude-fable-5-mythos-5", srcLabel: "Fable 5 / Mythos 5 system card (table 8.1.A)",
      rows: [
        { b: "SWE-bench Verified", m: "Fixing real GitHub issues", c: "max effort, production safeguards on", s: { "claude-fable-5": 95.0, "claude-mythos-5": 95.5, "claude-mythos-preview": 93.9, "claude-opus-4-8": 88.6 }, o: { "Gemini 3.1 Pro": 80.6 } },
        { b: "SWE-bench Pro", m: "Harder, multi-file engineering tasks", c: "max effort", s: { "claude-fable-5": 80.0, "claude-mythos-5": 80.3, "claude-mythos-preview": 77.8, "claude-opus-4-8": 69.2 }, o: { "GPT-5.5": 58.6, "Gemini 3.1 Pro": 54.2 } },
        { b: "Terminal-Bench 2.1", m: "Agentic coding in a terminal", c: "Opus 4.8 shown at 82.7 here vs 74.6 in its own card", s: { "claude-fable-5": 84.3, "claude-mythos-5": 88.0, "claude-opus-4-8": 82.7 }, o: { "GPT-5.5 (Codex CLI)": 83.4 } },
        { b: "OSWorld-Verified", m: "Operating a real computer", c: "zoom-fix harness", s: { "claude-fable-5": 85.0, "claude-mythos-5": 85.0, "claude-mythos-preview": 85.4, "claude-opus-4-8": 83.4 }, o: { "GPT-5.5": 78.7, "Gemini 3.1 Pro": 76.2 } },
        { b: "GDPval-AA", m: "Paid knowledge-work tasks (Elo)", c: "Elo as of 6 Jun 2026", unit: "Elo", s: { "claude-fable-5": 1932, "claude-opus-4-8": 1890 }, o: { "GPT-5.5": 1769, "Gemini 3.1 Pro": 1314 } }
      ],
      note: "A Mythos-class model released for general use, as a new tier above Opus at $10 / $50. Mythos 5 is the same model with cyber safeguards lifted for vetted organisations. Last launch to report SWE-bench Verified." },

    { model: "claude-sonnet-5", date: "2026-06-30", src: "https://www.anthropic.com/news/claude-sonnet-5", srcLabel: "Sonnet 5 system card (table 8.1.A)",
      rows: [
        { b: "SWE-bench Pro", m: "Harder, multi-file engineering tasks", c: "max effort, 5 trials", s: { "claude-sonnet-5": 63.2, "claude-sonnet-4-6": 58.1 }, o: { "GPT-5.5": 58.6, "Gemini 3.5 Flash": 55.1 } },
        { b: "Terminal-Bench 2.1", m: "Agentic coding in a terminal", c: "", s: { "claude-sonnet-5": 80.4, "claude-sonnet-4-6": 67.0 }, o: { "GPT-5.5 (Codex CLI)": 83.4, "Gemini 3.5 Flash": 76.2 } },
        { b: "OSWorld-Verified", m: "Operating a real computer", c: "zoom-fix harness; Sonnet 4.6 re-scored", s: { "claude-sonnet-5": 81.2, "claude-sonnet-4-6": 78.5 }, o: { "GPT-5.5": 78.7 } },
        { b: "Humanity's Last Exam (no tools)", m: "Very hard expert questions", c: "updated grader", s: { "claude-sonnet-5": 43.2, "claude-sonnet-4-6": 34.6 }, o: { "GPT-5.5": 41.4, "Gemini 3.5 Flash": 40.2 } }
      ],
      note: "Close to Opus 4.8 on many tasks; its $2 / $10 launch price became permanent." },

    { model: "claude-opus-5", date: "2026-07-24", src: "https://www.anthropic.com/news/claude-opus-5", srcLabel: "Opus 5 system card (table 8.1.A)",
      rows: [
        { b: "SWE-bench Pro", m: "Harder, multi-file engineering tasks", c: "max effort, 5 trials", s: { "claude-opus-5": 79.2, "claude-opus-4-8": 69.2, "claude-fable-5": 80.0 }, o: { "GPT-5.6 Sol": 64.6 } },
        { b: "FrontierCode 1.1", m: "Frontier-difficulty coding (Main split)", c: "", s: { "claude-opus-5": 53.4, "claude-opus-4-8": 46.5, "claude-fable-5": 53.5 }, o: { "GPT-5.6 Sol": 47.5 } },
        { b: "OSWorld 2.0", m: "Operating a real computer (new version)", c: "not comparable to OSWorld-Verified", s: { "claude-opus-5": 70.6, "claude-opus-4-8": 55.7, "claude-fable-5": 66.1 }, o: { "GPT-5.6 Sol": 62.6 } },
        { b: "Humanity's Last Exam (no tools)", m: "Very hard expert questions", c: "", s: { "claude-opus-5": 56.3, "claude-opus-4-8": 49.8, "claude-fable-5": 56.5 } },
        { b: "ARC-AGI-2", m: "Novel abstract puzzles", c: "", s: { "claude-opus-5": 90.4, "claude-opus-4-8": 72.1 }, o: { "GPT-5.6 Sol": 92.5 } },
        { b: "ARC-AGI-3", m: "Interactive reasoning games", c: "high effort", s: { "claude-opus-5": 30.2, "claude-opus-4-8": 1.5 }, o: { "GPT-5.6 Sol": 7.8 } },
        { b: "GDPval-AA v2", m: "Paid knowledge-work tasks (Elo)", c: "relative Elo", unit: "Elo", s: { "claude-opus-5": 1861, "claude-opus-4-8": 1593, "claude-fable-5": 1747 }, o: { "GPT-5.6 Sol": 1736 } }
      ],
      note: "Roughly ties Fable 5 at half the price, and beats it on knowledge work. Opus 4.8's GDPval Elo here (1593) differs from its launch value (1890) because the Elo pool and version changed." },

    { model: "claude-fable-5-1", date: "2026-09-01", src: "https://www.anthropic.com/claude-fable-and-mythos-5-1", srcLabel: "Fable 5.1 / Mythos 5.1 system card (table 8.1.A)",
      rows: [
        { b: "SWE-bench Pro", m: "Harder, multi-file engineering tasks", c: "max effort, 5 trials", s: { "claude-fable-5-1": 81.2, "claude-fable-5": 80.0, "claude-opus-5": 79.2 }, o: { "GPT-5.6 Sol": 64.6 } },
        { b: "Terminal-Bench 4.0", m: "Agentic coding in a terminal (new, much harder version)", c: "Mythos 5.1: 60.9", s: { "claude-fable-5-1": 55.8, "claude-mythos-5-1": 60.9, "claude-fable-5": 42.0, "claude-opus-5": 52.3 }, o: { "GPT-5.6 Sol": 37.3 } },
        { b: "Humanity's Last Exam (no tools)", m: "Very hard expert questions", c: "max effort", s: { "claude-fable-5-1": 60.9, "claude-fable-5": 57.8, "claude-opus-5": 56.6 } },
        { b: "AutomationBench", m: "Business workflow automation (Zapier)", c: "", s: { "claude-fable-5-1": 31.4, "claude-fable-5": 17.1, "claude-opus-5": 26.9 }, o: { "GPT-5.6 Sol": 19.6 } },
        { b: "GDPval-AA v2", m: "Paid knowledge-work tasks (Elo)", c: "relative Elo", unit: "Elo", s: { "claude-fable-5-1": 1853, "claude-fable-5": 1723, "claude-opus-5": 1824 }, o: { "GPT-5.6 Sol": 1711 } },
        { b: "ARC-AGI-2", m: "Novel abstract puzzles", c: "", s: { "claude-fable-5-1": 90.0, "claude-fable-5": 89.2, "claude-opus-5": 90.4 }, o: { "GPT-5.6 Sol": 92.5 } }
      ],
      note: "The same model ships twice: Fable 5.1 (general) and Mythos 5.1 (verified orgs). The Terminal-Bench gap between them comes from Fable's cyber safeguards." },

    { model: "claude-opus-5-5", date: "2026-09-22", src: "https://www.anthropic.com/claude-opus-5-5", srcLabel: "Opus 5.5 launch + system card (table 8.1.A)",
      rows: [
        { b: "SWE-bench Pro", m: "Harder, multi-file engineering tasks", c: "max effort, 5 trials", s: { "claude-opus-5-5": 89.9, "claude-fable-5-1": 81.2, "claude-opus-5": 79.2 } },
        { b: "Terminal-Bench 4.0", m: "Agentic coding in a terminal", c: "xhigh effort", s: { "claude-opus-5-5": 66.4, "claude-fable-5-1": 55.8, "claude-opus-5": 52.3 }, o: { "GPT-6 Astra (high)": 57.9, "GPT-5.6 Sol": 37.3 } },
        { b: "FrontierCode 1.1", m: "Frontier-difficulty coding (Main split)", c: "max effort", s: { "claude-opus-5-5": 54.4, "claude-fable-5-1": 50.3, "claude-opus-5": 48.0 }, o: { "GPT-6 Astra": 53.3 } },
        { b: "Humanity's Last Exam (no tools)", m: "Very hard expert questions", c: "safeguards on", s: { "claude-opus-5-5": 64.4, "claude-fable-5-1": 60.9, "claude-opus-5": 56.6 } },
        { b: "GDPval-AA v2.1", m: "Paid knowledge-work tasks (Elo)", c: "v2.1 scale", unit: "Elo", s: { "claude-opus-5-5": 1846, "claude-fable-5-1": 1735, "claude-opus-5": 1708 }, o: { "GPT-5.6 Sol": 1588, "GPT-6 Astra": 1542 } },
        { b: "AutomationBench", m: "Business workflow automation (Zapier)", c: "", s: { "claude-opus-5-5": 40.0, "claude-fable-5-1": 31.4, "claude-opus-5": 26.9 }, o: { "GPT-6 Astra": 41.4 } }
      ],
      note: "An Opus that beats the top-tier Fable 5.1 on every row here, at 40% of its price. That's why Anthropic now recommends it as the default." },

    { model: "claude-sonnet-5-5", date: "2026-09-28", src: "https://www.anthropic.com/claude-sonnet-5-5", srcLabel: "Sonnet 5.5 launch + system card (table 8.1.A)",
      rows: [
        { b: "SWE-bench Pro", m: "Harder, multi-file engineering tasks", c: "max effort", s: { "claude-sonnet-5-5": 81.3, "claude-sonnet-5": 63.2, "claude-opus-5-5": 89.9 } },
        { b: "Terminal-Bench 4.0", m: "Agentic coding in a terminal", c: "Opus 5.5 at xhigh", s: { "claude-sonnet-5-5": 70.6, "claude-sonnet-5": 10.3, "claude-opus-5-5": 66.4 } },
        { b: "FrontierCode 1.1", m: "Frontier-difficulty coding (Main split)", c: "xhigh effort (max: 46.2)", s: { "claude-sonnet-5-5": 52.1, "claude-sonnet-5": 42.4, "claude-opus-5-5": 54.4 }, o: { "GPT-6 Sol": 49.3 } },
        { b: "Humanity's Last Exam (no tools)", m: "Very hard expert questions", c: "", s: { "claude-sonnet-5-5": 56.9, "claude-sonnet-5": 43.1, "claude-opus-5-5": 64.4 } },
        { b: "GDPval-AA v2.1", m: "Paid knowledge-work tasks (Elo)", c: "v2.1 scale", unit: "Elo", s: { "claude-sonnet-5-5": 1844, "claude-sonnet-5": 1449, "claude-opus-5-5": 1846 }, o: { "GPT-6 Sol": 1487 } },
        { b: "AutomationBench", m: "Business workflow automation (Zapier)", c: "", s: { "claude-sonnet-5-5": 44.7, "claude-sonnet-5": 10.7, "claude-opus-5-5": 42.5 }, o: { "GPT-6 Sol": 32.0 } }
      ],
      note: "Ties Opus 5.5 on knowledge work and beats it on Terminal-Bench 4.0, at half the price." },

    { model: "claude-haiku-5-5", date: "2026-10-07", src: "https://www.anthropic.com/claude-haiku-5-5", srcLabel: "Haiku 5.5 launch post + system card",
      rows: [
        { b: "GDPval-AA v2.1", m: "Paid knowledge-work tasks (Elo)", c: "v2.1 scale", unit: "Elo", s: { "claude-haiku-5-5": 1620, "claude-haiku-4-5": 735, "claude-sonnet-5-5": 1840 }, o: { "GPT-6 Luna": 1437 } },
        { b: "OSWorld 2.1 (offline)", m: "Operating a real computer (offline subset)", c: "offline subset", s: { "claude-haiku-5-5": 72.4, "claude-haiku-4-5": 15.7, "claude-sonnet-5-5": 83.9 }, o: { "GPT-6 Luna": 48.9 } },
        { b: "Humanity's Last Exam (no tools)", m: "Very hard expert questions", c: "", s: { "claude-haiku-5-5": 45.9, "claude-haiku-4-5": 10.2, "claude-sonnet-5-5": 56.9 } },
        { b: "Humanity's Last Exam (with tools)", m: "Very hard expert questions, with search and code", c: "", s: { "claude-haiku-5-5": 57.4, "claude-haiku-4-5": 18.7, "claude-sonnet-5-5": 64.5 } },
        { b: "Terminal-Bench 4.0", m: "Agentic coding in a terminal", c: "", s: { "claude-haiku-5-5": 39.2, "claude-haiku-4-5": 0.0, "claude-sonnet-5-5": 70.6 }, o: { "GPT-6 Luna": 16.4 } },
        { b: "SWE-bench Pro", m: "Harder, multi-file engineering tasks", c: "max effort", s: { "claude-haiku-5-5": 64.8, "claude-sonnet-5-5": 81.3 } },
        { b: "FrontierCode 1.1", m: "Frontier-difficulty coding (Main split)", c: "max effort", s: { "claude-haiku-5-5": 46.4, "claude-sonnet-5-5": 46.2 }, o: { "GPT-6 Luna": 42.4 } },
        { b: "Chartography (no tools)", m: "Reading charts", c: "no tools", s: { "claude-haiku-5-5": 46.4, "claude-haiku-4-5": 6.4, "claude-sonnet-5-5": 61.6 }, o: { "GPT-6 Luna": 29.1 } }
      ],
      note: "A Haiku that roughly matches 2026's Sonnet 5 on SWE-bench Pro (64.8 vs 63.2) at one-twentieth the input price." }
  ],
  caveats: [
    "Benchmarks change over time: MMLU gave way to MMMLU, MATH to MATH 500, AIME 2024 to AIME 2025, TAU-bench to τ2-bench, original OSWorld to OSWorld-Verified, and Terminal-Bench went through several versions. Trend lines only join the same benchmark version.",
    "Reasoning settings differ: 2023–24 scores are without thinking; most non-coding scores from Claude 3.7 on use extended or adaptive thinking.",
    "Anthropic sometimes restates older models' scores in later posts (e.g. Opus 4 on Terminal-Bench: 43.2% in May 2025, 39.2% in Aug 2025). Each table here is kept as published.",
    "Parallel test-time compute scores use extra attempts and internal scoring, and are kept separate from pass@1.",
    "2026 version breaks: Terminal-Bench 2.0 → 2.1 → 4.0 (scores drop sharply at 4.0); OSWorld-Verified was re-run with a zoom-tool fix that raised older scores, then replaced by OSWorld 2.0 and 2.1; SWE-bench Verified was retired after Fable 5 in favour of SWE-bench Pro.",
    "GDPval-AA and AA-Briefcase are relative Elo ratings that drift as models are added, and come in versions (v2, v2.1). Compare Elo only within one table.",
    "From Fable 5 on, scores are measured with production safeguards and fallback models switched on, which Anthropic says lowers some results.",
    "Competitor scores (GPT, Gemini) are as listed in Anthropic's tables, often from the vendor's own harness."
  ]
};
