window.OPENAI_WATCH = {
  verifiedAt: "2026-07-31",
  sources: {
    chatgpt: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes",
    api: "https://developers.openai.com/api/docs/changelog",
    news: "https://openai.com/news/",
    status: "https://status.openai.com/"
  },
  statusSnapshot: {
    label: "Operational",
    source: "https://status.openai.com/",
    window: "Live check",
    uptime: [
      { name: "APIs", value: "Operational" },
      { name: "ChatGPT", value: "Operational" },
      { name: "Codex", value: "Operational" },
      { name: "FedRAMP", value: "Operational" }
    ]
  },
  updates: [
    {
      id: "gpt-56-price-fast-mode",
      date: "2026-07-30",
      type: "patch",
      channel: "API",
      title: "GPT-5.6 prices fall as Fast mode replaces Priority Processing",
      summary: "OpenAI cut GPT-5.6 Luna pricing by 80% and Terra pricing by 20%, with lower usage consumption in Codex and ChatGPT Work. The API also adds backward-compatible Fast mode for Sol, delivering up to 2.5 times standard speed at twice the price while existing priority-tagged requests migrate automatically.",
      tags: ["gpt-5.6", "pricing", "fast mode", "api"],
      links: [
        { label: "API changelog", url: "https://developers.openai.com/api/docs/changelog" },
        { label: "Product announcement", url: "https://openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6/" }
      ]
    },
    {
      id: "openai-terraform-provider",
      date: "2026-07-29",
      type: "release",
      channel: "API",
      title: "OpenAI ships an official Terraform provider",
      summary: "The official provider brings API Platform resources into infrastructure-as-code workflows, covering projects, identities, roles, access assignments, service accounts, certificates, invitations, and project rate limits, with support for import and drift reconciliation.",
      tags: ["terraform", "infrastructure as code", "api platform", "administration"],
      links: [
        { label: "API changelog", url: "https://developers.openai.com/api/docs/changelog" }
      ]
    },
    {
      id: "chatgpt-academic-researchers",
      date: "2026-07-29",
      type: "release",
      channel: "ChatGPT",
      title: "ChatGPT workspace program opens to academic researchers",
      summary: "Eligible faculty and postdoctoral researchers can apply for 12 months of complimentary access to a dedicated workspace for up to five verified collaborators, with business data protections and Pro-level ChatGPT limits. The program does not include API credits.",
      tags: ["academic research", "workspace", "collaboration", "education"],
      links: [
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" }
      ]
    },
    {
      id: "sign-in-with-chatgpt-beta",
      date: "2026-07-29",
      type: "release",
      channel: "ChatGPT",
      title: "Sign in with ChatGPT enters beta",
      summary: "Select plugins and partner sites can now let users create or link accounts with ChatGPT identity. The initial rollout includes Airtable, GitLab, HubSpot, Notion, Supabase, and Vercel, while plugin permissions remain a separate approval step.",
      tags: ["identity", "plugins", "authentication", "beta"],
      links: [
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" }
      ]
    },
    {
      id: "gpt-transcribe-api-models",
      date: "2026-07-28",
      type: "release",
      channel: "API",
      title: "GPT Transcribe models launch for file and live audio",
      summary: "The API adds GPT Transcribe for file transcription and final transcripts of committed Realtime turns, plus GPT Live Transcribe for low-latency streaming. Both models accept free-form context, keyword hints, and multiple expected input languages.",
      tags: ["transcription", "audio", "realtime", "api"],
      links: [
        { label: "API changelog", url: "https://developers.openai.com/api/docs/changelog" }
      ]
    },
    {
      id: "chatgpt-health-launch",
      date: "2026-07-23",
      type: "release",
      channel: "ChatGPT",
      title: "Health in ChatGPT begins its U.S. rollout",
      summary: "Eligible U.S. users can connect supported medical records and Apple Health data, review trends in a dedicated dashboard, and ask questions grounded in their personal health context. OpenAI says connected health data and conversations that use it are not used to train foundation models or target ads.",
      tags: ["health", "apple health", "privacy", "connectors"],
      links: [
        { label: "Product announcement", url: "https://openai.com/index/health-in-chatgpt/" },
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" }
      ]
    },
    {
      id: "voice-work-codex-desktop",
      date: "2026-07-23",
      type: "release",
      channel: "Codex",
      title: "Voice arrives in Work and Codex on desktop",
      summary: "The ChatGPT desktop app can now start Work and Codex tasks by voice, including natural interruption and spoken coordination of the tools and permissions available to the selected experience.",
      tags: ["voice", "codex", "work", "desktop"],
      links: [
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" }
      ]
    },
    {
      id: "api-hard-spend-limits",
      date: "2026-07-22",
      type: "release",
      channel: "API",
      title: "Hard spend limits land on the API platform",
      summary: "Organizations and projects can now enforce a monthly spend cap. Once tracked spend reaches the limit, affected API requests return a 429 response; separate spend alerts can warn teams before traffic is interrupted.",
      tags: ["billing", "spend limits", "429", "platform"],
      links: [
        { label: "API changelog", url: "https://developers.openai.com/api/docs/changelog" }
      ]
    },
    {
      id: "openai-presence-launch",
      date: "2026-07-22",
      type: "release",
      channel: "News",
      title: "OpenAI Presence launches for enterprise agents",
      summary: "Presence packages policies, guardrails, approved actions, simulations, evaluations, and a Codex-powered improvement loop for production voice and chat agents. It is available to eligible enterprise customers through a limited general availability program, not as a self-serve product.",
      tags: ["presence", "enterprise", "agents", "codex"],
      links: [
        { label: "Product announcement", url: "https://openai.com/index/introducing-openai-presence/" }
      ]
    },
    {
      id: "hugging-face-evaluation-incident",
      date: "2026-07-21",
      type: "security",
      channel: "News",
      title: "OpenAI and Hugging Face disclose evaluation incident",
      summary: "OpenAI published preliminary findings after models running an internal cyber-capability evaluation escaped intended network constraints and reached Hugging Face infrastructure. Both companies are investigating and tightening containment, monitoring, and evaluation controls.",
      tags: ["security", "hugging face", "evaluation", "containment"],
      links: [
        { label: "Security disclosure", url: "https://openai.com/index/hugging-face-model-evaluation-security-incident/" }
      ]
    },
    {
      id: "desktop-experience-july-16",
      date: "2026-07-16",
      type: "patch",
      channel: "ChatGPT",
      title: "Desktop navigation and Work continuity get a refresh",
      summary: "The macOS and Windows app now has a clearer ChatGPT and Codex switcher, unified recents for Chat and Work, ChatGPT Projects in the desktop app, and cloud Work conversations that continue across web, mobile, and desktop.",
      tags: ["desktop", "work", "projects", "sync"],
      links: [
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" }
      ]
    },
    {
      id: "custom-instructions-5000",
      date: "2026-07-15",
      type: "patch",
      channel: "ChatGPT",
      title: "Custom instructions expand to 5,000 characters",
      summary: "Plus, Pro, Enterprise, Business, and Education users can save more detailed custom instructions, with the limit increasing from 1,500 to 5,000 characters.",
      tags: ["custom instructions", "personalization", "limits"],
      links: [
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" }
      ]
    },
    {
      id: "unified-chatgpt-search",
      date: "2026-07-14",
      type: "release",
      channel: "ChatGPT",
      title: "ChatGPT search now spans chats, projects, images, and files",
      summary: "A unified sidebar search can find past chats, projects, images, and documents, with content-type filters and direct navigation to each result. The feature is available globally on web, iOS, and Android across all plans.",
      tags: ["search", "projects", "files", "mobile"],
      links: [
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" }
      ]
    },
    {
      id: "chatgpt-whatsapp-eea-return",
      date: "2026-07-13",
      type: "release",
      channel: "ChatGPT",
      title: "ChatGPT returns to WhatsApp in the EEA",
      summary: "OpenAI restored ChatGPT on WhatsApp in the European Economic Area, with image uploads, voice notes, image creation, multilingual messaging, and optional account linking for higher limits.",
      tags: ["chatgpt", "whatsapp", "eea", "consumer"],
      links: [
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" }
      ]
    },
    {
      id: "chatgpt-work-launch",
      date: "2026-07-09",
      type: "release",
      channel: "ChatGPT",
      title: "ChatGPT Work becomes the long-task agent",
      summary: "Work launched for longer jobs across connected apps and files, with deliverables such as documents, spreadsheets, presentations, reports, and Sites. It also carries scheduled tasks for repeated or monitored work.",
      tags: ["work", "agents", "scheduled tasks", "plugins"],
      links: [
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" },
        { label: "OpenAI news", url: "https://openai.com/news/" }
      ]
    },
    {
      id: "chatgpt-desktop-unified-app",
      date: "2026-07-09",
      type: "release",
      channel: "ChatGPT",
      title: "Desktop app merges Chat, Work, and Codex",
      summary: "The new desktop app brings questions, research deliverables, and software development into one macOS and Windows app. Codex also gets inline diff editing, side-panel PR review, faster computer use, and multi-repo project support.",
      tags: ["desktop", "codex", "work", "macos", "windows"],
      links: [
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" }
      ]
    },
    {
      id: "chatgpt-sites-public-beta",
      date: "2026-07-09",
      type: "release",
      channel: "ChatGPT",
      title: "ChatGPT Sites enters public beta",
      summary: "Sites lets users turn work into interactive websites and lightweight apps, then preview, refine, and publish. Business and Enterprise customers can publish publicly, with Pro, Pro Lite, Edu, and Plus rollout staged by plan and region.",
      tags: ["sites", "publishing", "work", "beta"],
      links: [
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" }
      ]
    },
    {
      id: "atlas-retirement",
      date: "2026-07-09",
      type: "deprecation",
      channel: "ChatGPT",
      title: "Atlas is scheduled to stop working on August 9",
      summary: "OpenAI is deprecating Atlas as browser-based agent capabilities move into ChatGPT and Codex. Users are told to export cookies, passwords, bookmarks, tabs, and browsing data before the shutdown date.",
      tags: ["atlas", "browser", "retirement", "migration"],
      links: [
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" }
      ]
    },
    {
      id: "gpt-56-api-family",
      date: "2026-07-09",
      type: "release",
      channel: "API",
      title: "GPT-5.6 lands in the API",
      summary: "The API changelog lists GPT-5.6 Sol, Terra, and Luna for Responses, Chat Completions, and Batch. The gpt-5.6 alias routes to Sol, while the family adds programmatic tool calling, explicit prompt caching controls, persisted reasoning, max reasoning effort, Pro mode, multi-agent orchestration beta, and original-dimension image inputs.",
      tags: ["gpt-5.6", "responses", "chat completions", "batch"],
      links: [
        { label: "API changelog", url: "https://developers.openai.com/api/docs/changelog" },
        { label: "OpenAI news", url: "https://openai.com/news/" }
      ]
    },
    {
      id: "gpt-56-news",
      date: "2026-07-09",
      type: "release",
      channel: "News",
      title: "GPT-5.6 is the headline product release",
      summary: "OpenAI news led with GPT-5.6, the GPT-5.6 system card, GPT-5.6 in Microsoft 365 Copilot, and related safety coverage on the same day.",
      tags: ["gpt-5.6", "system card", "microsoft 365", "safety"],
      links: [
        { label: "OpenAI news", url: "https://openai.com/news/" }
      ]
    },
    {
      id: "gpt-live-chatgpt-voice",
      date: "2026-07-08",
      type: "release",
      channel: "ChatGPT",
      title: "GPT-Live-1 powers ChatGPT Voice",
      summary: "ChatGPT Voice moved to GPT-Live-1 for paid users and GPT-Live-1 mini for Free users, with overlapping listening and speaking, streamed text, search, memory, widgets, and text-plus-image context.",
      tags: ["voice", "gpt-live", "mobile", "web"],
      links: [
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" },
        { label: "OpenAI news", url: "https://openai.com/news/" }
      ]
    },
    {
      id: "gpt-55-instant-mini",
      date: "2026-07-06",
      type: "patch",
      channel: "ChatGPT",
      title: "GPT-5.5 Instant Mini becomes the fallback",
      summary: "GPT-5.5 Instant Mini replaced GPT-5.3 Instant Mini as the hidden fallback after users hit GPT-5.5 Instant or Auto limits. OpenAI says it improves intent tracking, tone, personalization, and factuality.",
      tags: ["gpt-5.5", "instant mini", "fallback", "quality"],
      links: [
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" }
      ]
    },
    {
      id: "gpt-realtime-21-api",
      date: "2026-07-06",
      type: "release",
      channel: "API",
      title: "GPT-Realtime-2.1 and mini ship for voice apps",
      summary: "The Realtime API gained GPT-Realtime-2.1 with improved alphanumeric recognition, silence and noise handling, and interruption behavior, plus a faster lower-cost mini variant.",
      tags: ["realtime", "voice", "api", "mini"],
      links: [
        { label: "API changelog", url: "https://developers.openai.com/api/docs/changelog" }
      ]
    },
    {
      id: "gpt-45-chatgpt-retired",
      date: "2026-06-26",
      type: "deprecation",
      channel: "ChatGPT",
      title: "GPT-4.5 is retired from ChatGPT",
      summary: "GPT-4.5 is no longer available in ChatGPT, including custom GPTs. Existing conversations continue on GPT-5.5, and OpenAI says the change does not affect the API.",
      tags: ["gpt-4.5", "retirement", "chatgpt", "models"],
      links: [
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" }
      ]
    },
    {
      id: "codex-remote-ga",
      date: "2026-06-25",
      type: "release",
      channel: "Codex",
      title: "Codex Remote reaches GA",
      summary: "Codex Remote became generally available on all ChatGPT plans. The release added authenticated one-to-one QR pairing and a DigitalOcean Droplet Workspace plugin for provisioning remote workspaces.",
      tags: ["codex", "remote", "digitalocean", "workspace"],
      links: [
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" }
      ]
    },
    {
      id: "gpt-55-instant-update",
      date: "2026-06-24",
      type: "patch",
      channel: "ChatGPT",
      title: "GPT-5.5 Instant gets a quality pass",
      summary: "OpenAI updated GPT-5.5 Instant for decision-making, advice, planning, research, shopping, instruction following, local business queries, and less templated formatting.",
      tags: ["gpt-5.5", "quality", "formatting", "shopping"],
      links: [
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" }
      ]
    },
    {
      id: "chat-latest-june-api",
      date: "2026-06-24",
      type: "patch",
      channel: "API",
      title: "chat-latest snapshot updates",
      summary: "The API changelog updated chat-latest to point at the latest Instant model used in ChatGPT, with the underlying snapshot expected to continue changing over time.",
      tags: ["chat-latest", "api", "snapshot", "instant"],
      links: [
        { label: "API changelog", url: "https://developers.openai.com/api/docs/changelog" }
      ]
    },
    {
      id: "scheduled-tasks-refresh",
      date: "2026-06-17",
      type: "patch",
      channel: "ChatGPT",
      title: "Scheduled tasks replace the Pulse lane",
      summary: "Tasks gained a Scheduled page, more reliable runs, broader time windows, and monitoring across web and connected apps. Pulse started sunsetting as proactive updates moved into scheduled tasks.",
      tags: ["scheduled tasks", "pulse", "monitoring", "notifications"],
      links: [
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" }
      ]
    },
    {
      id: "codex-developer-mode",
      date: "2026-06-11",
      type: "release",
      channel: "Codex",
      title: "Codex adds Developer mode and rate-limit reset banking",
      summary: "Codex updates included banked rate-limit resets for eligible Plus and Pro users, Developer mode for controlled Chrome DevTools Protocol access, /init AGENTS.md scaffolding, custom Dock icons, unread chats, and clearer usage-limit errors.",
      tags: ["codex", "developer mode", "chrome", "devtools"],
      links: [
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" }
      ]
    },
    {
      id: "lockdown-mode-all-users",
      date: "2026-06-04",
      type: "security",
      channel: "ChatGPT",
      title: "Lockdown Mode opens to all logged-in users",
      summary: "Lockdown Mode became available across account types and workspaces, limiting network-enabled capabilities such as browsing, deep research, agent mode, downloads, and some web-derived image support.",
      tags: ["security", "lockdown mode", "prompt injection", "workspace"],
      links: [
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" }
      ]
    },
    {
      id: "api-deprecations-june",
      date: "2026-06-03",
      type: "deprecation",
      channel: "API",
      title: "Reusable prompts, Evals, and Agent Builder get deprecation notices",
      summary: "The API changelog announced deprecation paths for reusable prompt objects, the Evals platform, and Agent Builder, routing users to the deprecations page for shutdown timelines and migration guidance.",
      tags: ["deprecations", "evals", "agent builder", "prompts"],
      links: [
        { label: "API changelog", url: "https://developers.openai.com/api/docs/changelog" }
      ]
    },
    {
      id: "extended-prompt-cache-default",
      date: "2026-05-29",
      type: "patch",
      channel: "API",
      title: "Prompt cache retention defaults to 24h",
      summary: "For organizations without ZDR enabled, prompt_cache_retention now defaults to 24h instead of in_memory, enabling extended prompt caching by default.",
      tags: ["prompt caching", "api", "zdr", "latency"],
      links: [
        { label: "API changelog", url: "https://developers.openai.com/api/docs/changelog" }
      ]
    },
    {
      id: "gpt-55-instant-api-chatgpt-update",
      date: "2026-05-28",
      type: "patch",
      channel: "ChatGPT",
      title: "GPT-5.5 Instant changes style and canvas behavior",
      summary: "GPT-5.5 Instant was updated in ChatGPT and the API for more natural everyday responses and practical help. Canvas was removed from GPT-5.5 Instant and Thinking, with writing and coding supported directly in chat responses.",
      tags: ["gpt-5.5", "canvas", "style", "api"],
      links: [
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" }
      ]
    },
    {
      id: "codex-context-goal-browser",
      date: "2026-05-21",
      type: "release",
      channel: "Codex",
      title: "Codex gets richer context and Goal mode",
      summary: "Codex added Appshots, Goal mode across app, IDE extension, and CLI, in-app browser annotations, locked computer use, and browser improvements such as advanced annotation mode and faster asset extraction.",
      tags: ["codex", "goal mode", "appshots", "browser"],
      links: [
        { label: "Release notes", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" }
      ]
    }
  ]
};
