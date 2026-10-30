window.ANTHROPIC_WATCH = {
  verifiedAt: "2026-10-04",
  sources: {
    claude: "https://support.claude.com/en/articles/12138966-release-notes",
    api: "https://platform.claude.com/docs/en/release-notes/overview",
    claudeCode: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md",
    news: "https://www.anthropic.com/news",
    status: "https://status.claude.com/"
  },
  statusSnapshot: {
    label: "All systems operational",
    source: "https://status.claude.com/",
    window: "Live check",
    uptime: [
      { name: "claude.ai", value: "Operational" },
      { name: "Claude API", value: "Operational" },
      { name: "Claude Console", value: "Operational" },
      { name: "Claude Code", value: "Operational" },
      { name: "Claude Cowork", value: "Operational" },
      { name: "Claude for Government", value: "Operational" }
    ]
  },
  updates: [
    {
      id: "cc-2-1-288-prompt-recovery-code-review-findings",
      date: "2026-10-02",
      type: "patch",
      channel: "Claude Code",
      title: "Claude Code 2.1.288: recover cleared prompts, tunable /code-review",
      summary: "Pressing Up on an empty prompt restores a draft cleared with Ctrl+C, /code-review takes --max-findings, and auto mode compacts long conversations instead of failing classifier review.",
      tags: [
        "ux",
        "code-review",
        "auto-mode"
      ],
      links: [
        {
          label: "GitHub release v2.1.288",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.288"
        }
      ]
    },
    {
      id: "cc-2-1-287-claude-mods",
      date: "2026-10-01",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.287: Claude Mods and \"You should know\"",
      summary: "Plugins can now change deeper Claude Code behavior as Claude Mods, and a built-in You should know mod runs a side agent that flags things you or Claude may have missed.",
      tags: [
        "plugins",
        "mods",
        "agents"
      ],
      links: [
        {
          label: "GitHub release v2.1.287",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.287"
        }
      ]
    },
    {
      id: "api-sonnet-4-5-deprecation",
      date: "2026-09-30",
      type: "deprecation",
      channel: "API",
      title: "Claude Sonnet 4.5 deprecated, retiring Nov 30, 2026",
      summary: "Anthropic announced the deprecation of claude-sonnet-4-5-20250929, with API retirement set for November 30, 2026; Sonnet 5.5 is the recommended replacement.",
      tags: [
        "models",
        "deprecation",
        "sonnet",
        "sonnet-4.5",
        "api"
      ],
      links: [
        {
          label: "Deprecations: Model deprecations",
          url: "https://platform.claude.com/docs/en/about-claude/model-deprecations"
        },
        {
          label: "API docs",
          url: "https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide#migrating-from-sonnet-45"
        },
        {
          label: "Deprecations: Model deprecations: Sonnet 4.5",
          url: "https://platform.claude.com/docs/en/about-claude/model-deprecations#2026-09-30-claude-sonnet-4-5-model"
        }
      ]
    },
    {
      id: "cc-2-1-285-desktop-handoff-allowed-providers",
      date: "2026-09-29",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.285: claude --desktop handoff and provider allowlist",
      summary: "`claude --desktop` opens the Claude desktop app on the current directory or a resumed session, and admins can restrict which API providers a machine uses via allowedProviders.",
      tags: [
        "desktop",
        "enterprise",
        "cli"
      ],
      links: [
        {
          label: "GitHub release v2.1.285",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.285"
        }
      ]
    },
    {
      id: "ghsa-gfvf-j8jh-jxxw-managed-settings-skipped",
      date: "2026-09-29",
      type: "security",
      channel: "Claude Code",
      title: "Claude Code skipped managed settings when a stored API key won",
      summary: "Low severity (CVE-2026-103012). Claude Code fetched managed settings with a stored API key instead of the Enterprise/Team sign-in. If that key was rejected, the session started without the org's policies. Fixed in 2.1.260.",
      tags: [
        "security",
        "claude-code",
        "enterprise",
        "managed-settings",
        "low"
      ],
      links: [
        {
          label: "GHSA-gfvf-j8jh-jxxw",
          url: "https://github.com/anthropics/claude-code/security/advisories/GHSA-gfvf-j8jh-jxxw"
        }
      ]
    },
    {
      id: "claude-sonnet-5-5-launch",
      date: "2026-09-28",
      type: "release",
      channel: "News",
      title: "Claude Sonnet 5.5 launches as the second Claude 5.5 model",
      summary: "Sonnet 5.5 is a clear upgrade over Sonnet 5 and a faster, lower-cost partner to Opus 5.5 for everyday work. Anthropic says it runs 30%+ faster and costs up to 30% less for most work. It is available on every platform, including AWS, Google Cloud and Azure, and Haiku 5.5 is due in the coming weeks.",
      tags: [
        "model",
        "sonnet",
        "claude-5.5",
        "models",
        "launch"
      ],
      links: [
        {
          label: "Announcement",
          url: "https://www.anthropic.com/claude-sonnet-5-5"
        },
        {
          label: "Release notes",
          url: "https://support.claude.com/en/articles/12138966-release-notes"
        },
        {
          label: "API docs: What's new in Sonnet 5.5",
          url: "https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5"
        },
        {
          label: "API docs: Sonnet 5.5 model page",
          url: "https://platform.claude.com/docs/en/models/sonnet-5-5/overview"
        }
      ]
    },
    {
      id: "api-sonnet-5-5-account-bound-thinking",
      date: "2026-09-28",
      type: "patch",
      channel: "API",
      title: "Sonnet 5.5 thinking blocks are bound to the producing account",
      summary: "Thinking blocks from Sonnet 5.5 only work in the account that produced them (or a linked one); when another account sends one, the API drops the block before the model sees it and the request still succeeds. Blocks from earlier models aren't affected.",
      tags: [
        "thinking",
        "sonnet",
        "api-behavior"
      ],
      links: [
        {
          label: "Account-bound thinking",
          url: "https://platform.claude.com/docs/en/build-with-claude/preserved-thinking#account-bound-thinking"
        }
      ]
    },
    {
      id: "cc-2-1-284-claude-sonnet-5-5",
      date: "2026-09-28",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.284: Claude Sonnet 5.5 is the new default Sonnet",
      summary: "Claude Sonnet 5.5 becomes the default Sonnet on the Anthropic API with 1M context at $2/$10 per Mtok; /usage shows gateway spend limits in dollars.",
      tags: [
        "models",
        "sonnet",
        "pricing"
      ],
      links: [
        {
          label: "GitHub release v2.1.284",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.284"
        }
      ]
    },
    {
      id: "build-plugins-for-claude-portal",
      date: "2026-09-25",
      type: "release",
      channel: "Claude",
      title: "Developer portal for submitting Claude plugins",
      summary: "Developers can submit plugins to the Claude directory via a new portal, follow review status, and view usage analytics after launch.",
      tags: [
        "plugins",
        "developers",
        "directory"
      ],
      links: [
        {
          label: "Build plugins for Claude",
          url: "https://claude.com/blog/build-plugins-for-claude"
        }
      ]
    },
    {
      id: "ghsa-v234-4jrq-mgg6-desktop-cowork-file-exec",
      date: "2026-09-25",
      type: "security",
      channel: "Claude",
      title: "Claude Desktop macOS: Cowork folder file could run host commands",
      summary: "High severity. The macOS blocklist of auto-executing file types was missing one type, so a compromised agent could place a file in a Cowork folder that ran commands on the host when the user opened it. Fixed in Claude Desktop 1.15962.0.",
      tags: [
        "security",
        "claude-desktop",
        "cowork",
        "macos",
        "high"
      ],
      links: [
        {
          label: "GHSA-v234-4jrq-mgg6",
          url: "https://github.com/anthropics/claude-code/security/advisories/GHSA-v234-4jrq-mgg6"
        }
      ]
    },
    {
      id: "api-refusal-billing-resumed",
      date: "2026-09-24",
      type: "patch",
      channel: "API",
      title: "Billing resumes for some pre-output refusals",
      summary: "Refusals that occur before any output are billed again when the stop category is bio, frontier_llm or reasoning_extraction; other categories stay unbilled and fallback credit is unchanged.",
      tags: [
        "pricing",
        "refusals",
        "billing"
      ],
      links: [
        {
          label: "How refusals are billed",
          url: "https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback#how-refusals-are-billed"
        }
      ]
    },
    {
      id: "api-compliance-m365-local-sessions-ga",
      date: "2026-09-24",
      type: "release",
      channel: "API",
      title: "Compliance API local sessions GA for Microsoft 365 agents",
      summary: "The Compliance API's local session endpoints left beta for Claude for Microsoft 365 sessions in Excel, PowerPoint, Word and Outlook.",
      tags: [
        "compliance",
        "enterprise",
        "ga"
      ],
      links: [
        {
          label: "Sessions on users' machines",
          url: "https://platform.claude.com/docs/en/manage-claude/compliance-sessions#retrieve-local-sessions"
        }
      ]
    },
    {
      id: "api-compliance-activity-feed-names-removed",
      date: "2026-09-24",
      type: "patch",
      channel: "API",
      title: "Compliance Activity Feed stops returning file names and titles",
      summary: "The Activity Feed now omits file names, project document names and artifact titles, retroactively; a key with the read:compliance_user_data scope is needed to look them up by ID.",
      tags: [
        "compliance",
        "privacy",
        "enterprise"
      ],
      links: [
        {
          label: "Activity object",
          url: "https://platform.claude.com/docs/en/manage-claude/compliance-activity-feed#understand-the-activity-object"
        }
      ]
    },
    {
      id: "api-cache-diagnostics-ga",
      date: "2026-09-23",
      type: "release",
      channel: "API",
      title: "Cache diagnostics graduates out of beta",
      summary: "Cache diagnostics no longer needs the cache-diagnosis-2026-04-07 header; opt in by sending a diagnostics object, and Messages responses always carry a diagnostics field (null if unused).",
      tags: [
        "prompt-caching",
        "ga",
        "diagnostics"
      ],
      links: [
        {
          label: "Cache diagnostics",
          url: "https://platform.claude.com/docs/en/build-with-claude/cache-diagnostics"
        }
      ]
    },
    {
      id: "claude-opus-5-5-launch",
      date: "2026-09-22",
      type: "release",
      channel: "News",
      title: "Claude Opus 5.5 opens the Claude 5.5 family",
      summary: "Opus 5.5 is the first Claude 5.5 model. Anthropic says it matches Fable 5.1 on most work at 40% lower cost than Opus 5, and it scored best on Anthropic's automated behavioral alignment audit.",
      tags: [
        "model",
        "opus",
        "claude-5.5",
        "alignment",
        "models"
      ],
      links: [
        {
          label: "Announcement",
          url: "https://www.anthropic.com/claude-opus-5-5"
        },
        {
          label: "API docs",
          url: "https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5"
        }
      ]
    },
    {
      id: "api-opus-5-5-breaking-changes",
      date: "2026-09-22",
      type: "patch",
      channel: "API",
      title: "Opus 5.5: thinking can't be disabled; forced tool_choice removed",
      summary: "On Opus 5.5, explicit thinking settings and tool_choice any/tool return 400 errors; computer use on the API and Google Cloud requires the new computer_toolset_20260801.",
      tags: [
        "opus",
        "breaking-change",
        "thinking",
        "tools"
      ],
      links: [
        {
          label: "Opus 5.5 migration guide",
          url: "https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#migrating-from-claude-opus-5"
        }
      ]
    },
    {
      id: "api-opus-5-5-fast-mode",
      date: "2026-09-22",
      type: "release",
      channel: "API",
      title: "Fast mode research preview available for Opus 5.5",
      summary: "Fast mode, still a research preview, can now be used with Claude Opus 5.5 on the Claude API.",
      tags: [
        "fast-mode",
        "opus",
        "research-preview"
      ],
      links: [
        {
          label: "Fast mode",
          url: "https://platform.claude.com/docs/en/build-with-claude/fast-mode"
        }
      ]
    },
    {
      id: "api-inline-tools-beta",
      date: "2026-09-22",
      type: "release",
      channel: "API",
      title: "Define tools inside mid-conversation system messages (beta)",
      summary: "With the inline-tools-2026-09-15 header, a tool_addition block can carry a full tool definition, letting you add or change tools without editing tools or breaking the prompt cache; MCP toolsets are supported too.",
      tags: [
        "tools",
        "beta",
        "prompt-caching",
        "mcp"
      ],
      links: [
        {
          label: "Define tools in a message",
          url: "https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages#define-tools-in-a-message-beta"
        }
      ]
    },
    {
      id: "cc-2-1-280-claude-opus-5-5",
      date: "2026-09-22",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.280: Claude Opus 5.5 lands as default Opus",
      summary: "Claude Opus 5.5 becomes the default Opus model with 1M context at $4/$20 per Mtok, and Pro and Team Standard plans now default to Opus instead of Sonnet.",
      tags: [
        "models",
        "opus",
        "pricing"
      ],
      links: [
        {
          label: "GitHub release v2.1.280",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.280"
        }
      ]
    },
    {
      id: "cc-2-1-278-server-side-auto-mode",
      date: "2026-09-19",
      type: "patch",
      channel: "Claude Code",
      title: "Claude Code 2.1.278: free server-side auto mode classifier",
      summary: "Auto mode for API, Enterprise and cloud-provider users now defaults to a server-side classifier that does not bill classifier overhead, with a /status row showing which is active.",
      tags: [
        "auto-mode",
        "pricing",
        "enterprise"
      ],
      links: [
        {
          label: "GitHub release v2.1.278",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.278"
        },
        {
          label: "Auto mode classifier billing docs",
          url: "https://code.claude.com/docs/en/auto-mode-classifier-billing"
        }
      ]
    },
    {
      id: "api-cache-diagnostics-field-always-present",
      date: "2026-09-18",
      type: "patch",
      channel: "API",
      title: "Cache diagnostics field always returned with beta header",
      summary: "Responses to requests carrying the cache-diagnosis beta header now always include diagnostics, set to null when no diagnostics object was sent, instead of omitting it.",
      tags: [
        "prompt-caching",
        "diagnostics"
      ],
      links: [
        {
          label: "Cache diagnostics",
          url: "https://platform.claude.com/docs/en/build-with-claude/cache-diagnostics"
        }
      ]
    },
    {
      id: "api-compliance-claude-in-chrome-sessions",
      date: "2026-09-18",
      type: "release",
      channel: "API",
      title: "Compliance API returns Claude in Chrome session transcripts",
      summary: "Enterprise orgs can now pull Claude in Chrome session transcripts through the Compliance API local session endpoints, in beta.",
      tags: [
        "compliance",
        "enterprise",
        "beta",
        "chrome"
      ],
      links: [
        {
          label: "Sessions on users' machines",
          url: "https://platform.claude.com/docs/en/manage-claude/compliance-sessions#retrieve-local-sessions"
        }
      ]
    },
    {
      id: "cc-2-1-277-agents-md-support",
      date: "2026-09-18",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.277: AGENTS.md support",
      summary: "Projects without a CLAUDE.md now have their AGENTS.md read as project instructions, configurable in /config; Fable is always listed in /model on the Anthropic API.",
      tags: [
        "agents-md",
        "project-instructions"
      ],
      links: [
        {
          label: "GitHub release v2.1.277",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.277"
        }
      ]
    },
    {
      id: "life-sciences-verification-program",
      date: "2026-09-17",
      type: "release",
      channel: "News",
      title: "Life Sciences Verification Program opens in beta",
      summary: "Verified life-science teams and institutions can now get Mythos, Opus and Sonnet with looser biology safeguards for research. Applications are open after an early-access phase with dozens of organizations.",
      tags: [
        "life-sciences",
        "safeguards",
        "access-program",
        "beta"
      ],
      links: [
        {
          label: "Introducing the Life Sciences Verification Program",
          url: "https://www.anthropic.com/news/life-sciences-verification-program"
        }
      ]
    },
    {
      id: "cc-2-1-275-send-now-skill-sync",
      date: "2026-09-17",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.275: send-now key and claude.ai skill sync",
      summary: "Ctrl+Enter interrupts the current turn and sends all queued messages at once, and skills and plugins enabled on a claude.ai account now sync to terminal sessions.",
      tags: [
        "skills",
        "plugins",
        "ux"
      ],
      links: [
        {
          label: "GitHub release v2.1.275",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.275"
        }
      ]
    },
    {
      id: "cowork-in-every-conversation",
      date: "2026-09-16",
      type: "release",
      channel: "Claude",
      title: "Cowork capabilities merged into every conversation",
      summary: "A unified Claude experience brings Cowork's abilities to any chat without picking a mode; chats, projects, connectors and skills carry over. Rolling out gradually to Pro and Max on web, desktop and mobile.",
      tags: [
        "cowork",
        "chat",
        "pro",
        "max"
      ],
      links: [
        {
          label: "Claude Cowork and chat are one Claude",
          url: "https://support.claude.com/en/articles/16761823"
        }
      ]
    },
    {
      id: "designs-decks-docs-any-conversation",
      date: "2026-09-16",
      type: "release",
      channel: "Claude",
      title: "Claude Design, Slides and Docs in any conversation",
      summary: "Designs, decks and documents can be requested and edited in any chat, Claude Code and the Artifacts tab. Claude Slides and the new Claude Docs join Claude Design; available on all plans, beta and off by default on Enterprise.",
      tags: [
        "artifacts",
        "design",
        "slides",
        "docs"
      ],
      links: [
        {
          label: "What are artifacts",
          url: "https://support.claude.com/en/articles/17153992"
        },
        {
          label: "Get started with Claude Docs",
          url: "https://support.claude.com/en/articles/16923645"
        }
      ]
    },
    {
      id: "salesforce-in-claude-beta",
      date: "2026-09-15",
      type: "release",
      channel: "Claude",
      title: "Salesforce in Claude plugin enters beta",
      summary: "A Salesforce plugin surfaces accounts, opportunities and pipeline inside Claude with 37 prebuilt sales skills; beta on paid plans for orgs approved by Salesforce.",
      tags: [
        "plugin",
        "salesforce",
        "beta"
      ],
      links: [
        {
          label: "Bringing Salesforce into Claude",
          url: "https://claude.com/blog/salesforce-in-claude"
        }
      ]
    },
    {
      id: "api-compaction-on-demand-beta",
      date: "2026-09-14",
      type: "release",
      channel: "API",
      title: "On-demand conversation compaction in the Messages API (beta)",
      summary: "A new top-level compaction parameter returns a signed summary block you send in place of older messages; you choose when to compact, can run it in the background, and can keep recent turns verbatim.",
      tags: [
        "context-management",
        "beta",
        "messages-api"
      ],
      links: [
        {
          label: "Compaction on demand",
          url: "https://platform.claude.com/docs/en/build-with-claude/compaction-on-demand"
        }
      ]
    },
    {
      id: "api-thinking-mismatch-allowed",
      date: "2026-09-14",
      type: "patch",
      channel: "API",
      title: "New thinking_mismatch_allowed input transformation entry",
      summary: "Under the thinking-binding-controls beta, input_transformations can now flag thinking blocks that failed the prefix check where enforcement is off, helping you find history edits before opting in.",
      tags: [
        "thinking",
        "beta",
        "observability"
      ],
      links: [
        {
          label: "Preserved thinking controls",
          url: "https://platform.claude.com/docs/en/build-with-claude/preserved-thinking#preserved-thinking-controls"
        }
      ]
    },
    {
      id: "cc-2-1-271-fast-mode-remote",
      date: "2026-09-14",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.271: fast mode in remote and cloud sessions",
      summary: "Fast mode now works in Claude Code Remote sessions on cloud and self-hosted runners where the org allows it; subagents can opt out of loading CLAUDE.md via omitClaudeMd.",
      tags: [
        "fast-mode",
        "remote",
        "subagents"
      ],
      links: [
        {
          label: "GitHub release v2.1.271",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.271"
        }
      ]
    },
    {
      id: "ghsa-h4mw-j7qp-8mwm-agent-sdk-python-resume-injection",
      date: "2026-09-12",
      type: "security",
      channel: "API",
      title: "Agent SDK for Python: resume option allowed command injection",
      summary: "Critical (CVE-2026-96620). The Python Agent SDK passed the resume value to the CLI without validating it, so a crafted value could inject an MCP config flag and run arbitrary commands. Fixed in claude-agent-sdk 0.2.121.",
      tags: [
        "security",
        "agent-sdk",
        "python",
        "critical"
      ],
      links: [
        {
          label: "GHSA-h4mw-j7qp-8mwm",
          url: "https://github.com/anthropics/claude-agent-sdk-python/security/advisories/GHSA-h4mw-j7qp-8mwm"
        }
      ]
    },
    {
      id: "cc-2-1-269-plugin-eval",
      date: "2026-09-11",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.269: claude plugin eval for scored plugin tests",
      summary: "Plugin authors can run a plugin's eval suite against Claude Code with `claude plugin eval` and get reproducible scored results as JSON and HTML; /output-style command added.",
      tags: [
        "plugins",
        "evals"
      ],
      links: [
        {
          label: "GitHub release v2.1.269",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.269"
        }
      ]
    },
    {
      id: "api-managed-agents-auto-permissions",
      date: "2026-09-10",
      type: "release",
      channel: "API",
      title: "Managed Agents gains server-evaluated 'auto' permission policy",
      summary: "An auto permission policy lets the server decide per tool call whether to run, deny or pause for approval, with the evaluation reported on tool-use events.",
      tags: [
        "managed-agents",
        "permissions",
        "agents"
      ],
      links: [
        {
          label: "Permission policies: auto",
          url: "https://platform.claude.com/docs/en/managed-agents/permission-policies#let-the-server-evaluate-each-call-with-auto"
        }
      ]
    },
    {
      id: "api-ant-cli-sessions-connect",
      date: "2026-09-10",
      type: "release",
      channel: "API",
      title: "ant CLI 1.32.0 adds sessions connect",
      summary: "The ant CLI can attach a terminal to a live Managed Agents session to watch, message and approve or deny pending tool calls, or open the Console session viewer locally with --web.",
      tags: [
        "cli",
        "managed-agents",
        "sdk"
      ],
      links: [
        {
          label: "Sessions connect",
          url: "https://platform.claude.com/docs/en/cli-sdks-libraries/cli/sessions-connect"
        }
      ]
    },
    {
      id: "smart-reports-beta",
      date: "2026-09-10",
      type: "release",
      channel: "Claude",
      title: "Smart reports beta for Enterprise",
      summary: "Enterprise teams get beta reports analyzing Claude usage: work done, cost, friction points, and repeated patterns worth turning into shared skills.",
      tags: [
        "enterprise",
        "analytics",
        "beta"
      ],
      links: [
        {
          label: "Get started with smart reports",
          url: "https://support.claude.com/en/articles/16893491-get-started-with-smart-reports"
        }
      ]
    },
    {
      id: "api-cache-diagnostics-fingerprint-change",
      date: "2026-09-09",
      type: "patch",
      channel: "API",
      title: "Cache diagnostics fingerprints stored only with diagnostics object",
      summary: "Request fingerprints are now saved only when the diagnostics object is included; header-only requests won't be found by later previous_message_id lookups.",
      tags: [
        "prompt-caching",
        "diagnostics",
        "behavior-change"
      ],
      links: [
        {
          label: "Cache diagnostics",
          url: "https://platform.claude.com/docs/en/build-with-claude/cache-diagnostics"
        }
      ]
    },
    {
      id: "api-ant-apply",
      date: "2026-09-03",
      type: "release",
      channel: "API",
      title: "ant CLI 1.30.0 adds resources-as-code with ant apply",
      summary: "ant apply creates and updates agents, environments, skills, memory stores and deployments from repo files, writing a claude-lock.json so repeat runs update rather than duplicate.",
      tags: [
        "cli",
        "managed-agents",
        "infrastructure-as-code"
      ],
      links: [
        {
          label: "Manage resources with ant apply",
          url: "https://platform.claude.com/docs/en/cli-sdks-libraries/cli/apply"
        }
      ]
    },
    {
      id: "api-per-message-effort-google-cloud",
      date: "2026-09-03",
      type: "release",
      channel: "API",
      title: "Per-message effort beta extends to Google Cloud",
      summary: "Changing effort mid-conversation, in beta, now also works on Google Cloud for Fable 5.1, Mythos 5.1 and Opus 5 using the same beta header.",
      tags: [
        "effort",
        "google-cloud",
        "beta"
      ],
      links: [
        {
          label: "Per-message effort",
          url: "https://platform.claude.com/docs/en/build-with-claude/effort#change-effort-mid-conversation-beta"
        }
      ]
    },
    {
      id: "cc-2-1-260-live-diff-panel",
      date: "2026-09-03",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.260: live diff panel in fullscreen",
      summary: "Fullscreen mode gets a side diff panel showing uncommitted changes as Claude edits, toggled with /diff; /cost now explains likely prompt-cache misses.",
      tags: [
        "ux",
        "diff",
        "fullscreen"
      ],
      links: [
        {
          label: "GitHub release v2.1.260",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.260"
        }
      ]
    },
    {
      id: "claude-fable-mythos-5-1-launch",
      date: "2026-09-01",
      type: "release",
      channel: "News",
      title: "Claude Fable 5.1 and Mythos 5.1 released",
      summary: "Fable 5.1 and Mythos 5.1 are one model with two levels of safeguards. Fable 5.1 is generally available, while Mythos 5.1 is limited to trusted-access programs. Lower cache-read pricing puts typical Fable 5.1 workloads about 25% below Fable 5.",
      tags: [
        "model",
        "fable",
        "mythos",
        "pricing",
        "models"
      ],
      links: [
        {
          label: "Announcement",
          url: "https://www.anthropic.com/claude-fable-and-mythos-5-1"
        },
        {
          label: "API docs",
          url: "https://platform.claude.com/docs/en/models/fable-5-1/whats-new-fable-5-1"
        }
      ]
    },
    {
      id: "enterprise-frontier-safeguards",
      date: "2026-09-01",
      type: "release",
      channel: "News",
      title: "Enterprise Frontier Safeguards pairs zero retention with misuse detection",
      summary: "Anthropic announced EFS. It keeps data in cloud infrastructure the customer controls, so zero data retention can coexist with frontier misuse safeguards. Rollout starts in phases this fall, and eligible customers get ZDR on Fable 5 and 5.1 until then.",
      tags: [
        "enterprise",
        "safeguards",
        "zdr",
        "privacy"
      ],
      links: [
        {
          label: "Developing Enterprise Frontier Safeguards with our customers",
          url: "https://www.anthropic.com/news/enterprise-frontier-safeguards"
        }
      ]
    },
    {
      id: "api-fable-5-1-cache-read-pricing",
      date: "2026-09-01",
      type: "patch",
      channel: "API",
      title: "Cheaper prompt cache reads on Fable 5.1 and Mythos 5.1",
      summary: "Cache reads on the 5.1 models cost $0.25 per MTok, 0.025x base input instead of the usual 0.1x; cache write prices stay the same.",
      tags: [
        "pricing",
        "prompt-caching",
        "fable"
      ],
      links: [
        {
          label: "Prompt caching pricing",
          url: "https://platform.claude.com/docs/en/about-claude/pricing#prompt-caching"
        }
      ]
    },
    {
      id: "api-fable-5-1-tool-choice",
      date: "2026-09-01",
      type: "patch",
      channel: "API",
      title: "Forced tool_choice unsupported on Fable 5.1 and Mythos 5.1",
      summary: "tool_choice any and tool now return 400 on the 5.1 models; strict tool use or structured outputs are the recommended way to get schema-conformant inputs.",
      tags: [
        "tools",
        "breaking-change",
        "fable"
      ],
      links: [
        {
          label: "Strict tool use",
          url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use"
        }
      ]
    },
    {
      id: "api-fable-5-1-thinking-prefix-check",
      date: "2026-09-01",
      type: "patch",
      channel: "API",
      title: "Fable 5.1 enforces thinking-block history integrity",
      summary: "Thinking blocks from 5.1 models only work on the same or newer models, and for new accounts replaying a block after its preceding history changed returns 400; a beta header exposes controls and reporting.",
      tags: [
        "thinking",
        "breaking-change",
        "beta"
      ],
      links: [
        {
          label: "Preserved thinking",
          url: "https://platform.claude.com/docs/en/build-with-claude/thinking#preserved-thinking"
        }
      ]
    },
    {
      id: "api-per-message-effort-beta",
      date: "2026-09-01",
      type: "release",
      channel: "API",
      title: "Per-message effort changes in beta",
      summary: "A role: system message carrying output_config.effort can change effort for later turns while keeping the prompt cache, on Fable 5.1, Mythos 5.1 and Opus 5.",
      tags: [
        "effort",
        "beta",
        "prompt-caching"
      ],
      links: [
        {
          label: "Per-message effort",
          url: "https://platform.claude.com/docs/en/build-with-claude/effort#change-effort-mid-conversation-beta"
        }
      ]
    },
    {
      id: "api-turn-scoped-system-messages",
      date: "2026-09-01",
      type: "release",
      channel: "API",
      title: "Turn-scoped system messages enter beta",
      summary: "Setting clear_at: next_user_message makes a mid-conversation system message apply for one turn only, so per-turn reminders don't pile up tokens or break caching.",
      tags: [
        "system-messages",
        "beta",
        "prompt-caching"
      ],
      links: [
        {
          label: "Turn-scoped system messages",
          url: "https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages#turn-scoped-system-messages"
        }
      ]
    },
    {
      id: "api-thinking-display-updates",
      date: "2026-09-01",
      type: "release",
      channel: "API",
      title: "thinking.display gains 'updates' mode (beta)",
      summary: "A new updates value hides reasoning content but returns the brief progress notes Fable models write between tool calls as text.",
      tags: [
        "thinking",
        "beta",
        "agents"
      ],
      links: [
        {
          label: "Progress updates between tool calls",
          url: "https://platform.claude.com/docs/en/build-with-claude/thinking#progress-updates"
        }
      ]
    },
    {
      id: "api-fable-5-1-watermark-c2pa",
      date: "2026-09-01",
      type: "release",
      channel: "API",
      title: "Text watermarking and C2PA credentials for 5.1 outputs",
      summary: "Fable 5.1 and Mythos 5.1 text carries Anthropic's watermark, and media files produced via code execution carry C2PA Content Credentials when fetched through the Files API.",
      tags: [
        "provenance",
        "watermark",
        "c2pa"
      ],
      links: [
        {
          label: "Code execution tool",
          url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool"
        }
      ]
    },
    {
      id: "api-fable-5-1-data-retention",
      date: "2026-09-01",
      type: "patch",
      channel: "API",
      title: "Fable 5.1 and Mythos 5.1 require 30-day retention",
      summary: "Like Fable 5, the 5.1 models need 30-day data retention and are excluded from zero data retention unless Anthropic explicitly authorizes it.",
      tags: [
        "data-retention",
        "fable",
        "policy"
      ],
      links: [
        {
          label: "Model-specific data retention",
          url: "https://platform.claude.com/docs/en/manage-claude/api-and-data-retention#model-specific-data-retention-requirements"
        }
      ]
    },
    {
      id: "cc-2-1-257-claude-fable-5-1",
      date: "2026-09-01",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.257: Claude Fable 5.1 becomes default Fable",
      summary: "Claude Fable 5.1 ships as the default Fable model with 1M context at $10/$50 per Mtok; auto mode adds a Containment Escape rule against credential and egress abuse.",
      tags: [
        "models",
        "fable",
        "auto-mode",
        "safety"
      ],
      links: [
        {
          label: "GitHub release v2.1.257",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.257"
        }
      ]
    },
    {
      id: "improving-alignment-security-practices",
      date: "2026-08-31",
      type: "security",
      channel: "News",
      title: "Follow-up on models gaining unauthorized access during cyber evals",
      summary: "Anthropic followed up on the incidents where Claude models, tested without cyber safeguards, reached real systems through a misconfigured third-party environment. It also covered a UK AISI incident involving Mythos 5 and shared changes it has made to its alignment and security practices over the past month.",
      tags: [
        "incident",
        "cybersecurity",
        "evaluations",
        "alignment"
      ],
      links: [
        {
          label: "Improving our alignment and security efforts",
          url: "https://www.anthropic.com/news/improving-alignment-security-efforts"
        }
      ]
    },
    {
      id: "cc-2-1-251-model-switch-hooks-cache-stats",
      date: "2026-08-28",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.251: model-switch hooks and prompt-cache stats",
      summary: "New PreModelSwitch/PostModelSwitch hooks can block or annotate model changes, and /cost shows per-session prompt-cache hit ratio and re-cache costs.",
      tags: [
        "hooks",
        "cost",
        "prompt-caching"
      ],
      links: [
        {
          label: "GitHub release v2.1.251",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.251"
        }
      ]
    },
    {
      id: "model-hardware-standard-preview",
      date: "2026-08-27",
      type: "release",
      channel: "News",
      title: "Model Hardware Standard research preview for physical devices",
      summary: "MHS is a shared specification for AI agents to safely run physical instruments such as microscopes, liquid handlers and robotic arms. A first group of research labs and manufacturers gets access in a research preview, and Anthropic plans to open-source the standard later.",
      tags: [
        "research-preview",
        "agents",
        "hardware",
        "science"
      ],
      links: [
        {
          label: "Previewing the Model Hardware Standard",
          url: "https://www.anthropic.com/news/model-hardware-standard-research-preview"
        }
      ]
    },
    {
      id: "api-sdk-beta-files-skills-shapes",
      date: "2026-08-27",
      type: "patch",
      channel: "API",
      title: "SDKs drop beta headers for files and skills clients",
      summary: "New Python, TypeScript, Go, Java, Ruby and C# SDK versions stop sending files and skills beta headers from client.beta, returning GA shapes; BetaSkill is renamed BetaContainerSkill.",
      tags: [
        "sdk",
        "files-api",
        "skills"
      ],
      links: [
        {
          label: "Migrate from files-api beta",
          url: "https://platform.claude.com/docs/en/build-with-claude/files#migrate-from-files-api-2025-04-14"
        },
        {
          label: "Migrate from skills beta",
          url: "https://platform.claude.com/docs/en/build-with-claude/skills-guide#migrate-from-skills-2025-10-02"
        }
      ]
    },
    {
      id: "api-personal-service-account-keys",
      date: "2026-08-27",
      type: "release",
      channel: "API",
      title: "Personal and service account API keys in the Console",
      summary: "New key types act as a user or service account with matching permissions and stop working when that account leaves the org; workspace keys remain as a legacy option.",
      tags: [
        "console",
        "authentication",
        "api-keys"
      ],
      links: [
        {
          label: "API keys",
          url: "https://platform.claude.com/docs/en/manage-claude/authentication#api-keys"
        }
      ]
    },
    {
      id: "api-compliance-sessions-ga",
      date: "2026-08-26",
      type: "release",
      channel: "API",
      title: "Compliance API session endpoints GA for Cowork and Claude Code",
      summary: "Session transcript endpoints in the Compliance API are no longer beta for Cowork and Claude Code sessions.",
      tags: [
        "compliance",
        "enterprise",
        "ga"
      ],
      links: [
        {
          label: "Retrieve session transcripts",
          url: "https://platform.claude.com/docs/en/manage-claude/compliance-sessions"
        }
      ]
    },
    {
      id: "api-compliance-science-m365-sessions",
      date: "2026-08-26",
      type: "release",
      channel: "API",
      title: "Compliance API adds Claude Science and Microsoft 365 sessions",
      summary: "Local session endpoints now return Claude Science and Claude for Microsoft 365 transcripts, in beta for Enterprise orgs.",
      tags: [
        "compliance",
        "enterprise",
        "beta"
      ],
      links: [
        {
          label: "Sessions on users' machines",
          url: "https://platform.claude.com/docs/en/manage-claude/compliance-sessions#retrieve-local-sessions"
        }
      ]
    },
    {
      id: "api-admin-api-in-sdks",
      date: "2026-08-26",
      type: "release",
      channel: "API",
      title: "Admin API available in ant CLI and all SDKs",
      summary: "Admin API operations such as members, workspaces, API keys, rate limits, service accounts and WIF are now exposed under client.beta.organization in the CLI and seven SDKs.",
      tags: [
        "admin-api",
        "sdk",
        "cli"
      ],
      links: [
        {
          label: "Admin API",
          url: "https://platform.claude.com/docs/en/manage-claude/admin-api"
        }
      ]
    },
    {
      id: "cc-2-1-247-sendfeedback-tool",
      date: "2026-08-26",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.247: Claude can draft feedback reports",
      summary: "A SendFeedback tool lets Claude draft a bug report when a session goes wrong, for the user to review and send via /feedback; Sonnet 5 now auto-compacts near its full 1M window.",
      tags: [
        "feedback",
        "sonnet",
        "context"
      ],
      links: [
        {
          label: "GitHub release v2.1.247",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.247"
        }
      ]
    },
    {
      id: "memory-cowork-topics-sensitive-setting",
      date: "2026-08-25",
      type: "release",
      channel: "Claude",
      title: "Memory spans chat and Cowork, with editable Topics",
      summary: "Memory now covers both chat and cloud Cowork; remembered items appear as editable Topics, and sensitive subjects are excluded unless a new toggle is enabled. On by default for Free/Pro/Max, off for Team/Enterprise.",
      tags: [
        "memory",
        "cowork",
        "privacy"
      ],
      links: [
        {
          label: "Chat search and memory",
          url: "https://support.claude.com/en/articles/11817273"
        }
      ]
    },
    {
      id: "cc-2-1-243-model-picker-console-signin",
      date: "2026-08-24",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.243: curated model picker and keyless Console login",
      summary: "Admins can curate the /model list with a modelPicker setting, and Console users can sign in without creating an API key; /usage gains a per-loop breakdown.",
      tags: [
        "models",
        "login",
        "enterprise"
      ],
      links: [
        {
          label: "Changelog 2.1.243",
          url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#21243"
        }
      ]
    },
    {
      id: "api-python-sdk-v1",
      date: "2026-08-20",
      type: "release",
      channel: "API",
      title: "Anthropic Python SDK reaches v1.0",
      summary: "v1.0 switches the HTTP layer to the httpx2 fork, requires Python 3.10+, and removes long-deprecated surfaces such as legacy Text Completions and sampling params on Messages.",
      tags: [
        "sdk",
        "python",
        "breaking-change"
      ],
      links: [
        {
          label: "Python SDK",
          url: "https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/python"
        },
        {
          label: "v1 migration guide",
          url: "https://github.com/anthropics/anthropic-sdk-python/blob/main/MIGRATION.md"
        }
      ]
    },
    {
      id: "api-computer-browser-toolsets-google-cloud",
      date: "2026-08-20",
      type: "release",
      channel: "API",
      title: "Computer and browser use toolsets reach Google Cloud",
      summary: "The computer_toolset_20260801 and browser_toolset_20260801 toolsets now work on Google Cloud for Fable 5, Mythos 5, Opus 5, Sonnet 5 and Opus 4.8.",
      tags: [
        "computer-use",
        "browser-use",
        "google-cloud"
      ],
      links: [
        {
          label: "Browser use tool",
          url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/browser-use-tool"
        }
      ]
    },
    {
      id: "cc-2-1-237-concise-output-style",
      date: "2026-08-20",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.237: built-in Concise output style",
      summary: "A new Concise output style has Claude lead with results and drop preamble and narration without doing less work; selectable under Output style in /config.",
      tags: [
        "output-style",
        "ux"
      ],
      links: [
        {
          label: "GitHub release v2.1.237",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.237"
        }
      ]
    },
    {
      id: "api-computer-use-ga",
      date: "2026-08-19",
      type: "release",
      channel: "API",
      title: "Computer use tool exits beta as computer_toolset_20260801",
      summary: "Computer use is GA on the API with no beta header, batched actions per turn, zoom on by default and per-member configs; older beta versions remain.",
      tags: [
        "computer-use",
        "ga",
        "tools"
      ],
      links: [
        {
          label: "Computer use tool",
          url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool"
        }
      ]
    },
    {
      id: "api-browser-use-tool",
      date: "2026-08-19",
      type: "release",
      channel: "API",
      title: "New browser use tool for app-hosted browsers",
      summary: "browser_toolset_20260801 lets Claude drive a browser you host, reading the accessibility tree and adding element refs, form input, tabs, download reporting and optional uploads.",
      tags: [
        "browser-use",
        "tools",
        "agents"
      ],
      links: [
        {
          label: "Browser use tool",
          url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/browser-use-tool"
        }
      ]
    },
    {
      id: "api-files-api-ga",
      date: "2026-08-19",
      type: "release",
      channel: "API",
      title: "Files API is generally available",
      summary: "The Files API no longer needs a beta header and adds file expiration and page-based pagination with an ids filter; header-based requests keep the old format.",
      tags: [
        "files-api",
        "ga"
      ],
      links: [
        {
          label: "Files API",
          url: "https://platform.claude.com/docs/en/build-with-claude/files"
        }
      ]
    },
    {
      id: "api-agent-skills-ga",
      date: "2026-08-19",
      type: "release",
      channel: "API",
      title: "Agent Skills and Skills API out of beta",
      summary: "Agent Skills and /v1/skills no longer require the skills beta header, including when loading Skills via the Messages container parameter.",
      tags: [
        "skills",
        "ga",
        "agents"
      ],
      links: [
        {
          label: "Using Agent Skills with the API",
          url: "https://platform.claude.com/docs/en/build-with-claude/skills-guide"
        }
      ]
    },
    {
      id: "api-enterprise-user-management-ga",
      date: "2026-08-19",
      type: "release",
      channel: "API",
      title: "Claude Enterprise user-management Admin API is GA",
      summary: "Admin API endpoints for Enterprise members, invites, groups and custom roles left beta; the beta header is no longer needed but still accepted.",
      tags: [
        "admin-api",
        "enterprise",
        "ga"
      ],
      links: [
        {
          label: "User management",
          url: "https://platform.claude.com/docs/en/manage-claude/user-management"
        }
      ]
    },
    {
      id: "api-managed-agents-web-domain-restrictions",
      date: "2026-08-19",
      type: "release",
      channel: "API",
      title: "Managed Agents can restrict web search and fetch domains",
      summary: "Agent toolset configs now accept allowed or blocked domain lists for web_search and web_fetch, plus content token caps and user location.",
      tags: [
        "managed-agents",
        "web-search",
        "security"
      ],
      links: [
        {
          label: "Restrict web search/fetch domains",
          url: "https://platform.claude.com/docs/en/managed-agents/tools#restrict-web-search-and-web-fetch-domains"
        }
      ]
    },
    {
      id: "api-managed-agents-memory-self-hosted",
      date: "2026-08-19",
      type: "release",
      channel: "API",
      title: "Memory stores work in self-hosted Managed Agents sandboxes",
      summary: "Sessions in self-hosted sandboxes can attach memory stores; SDK workers download them to a mount path and sync changes back.",
      tags: [
        "managed-agents",
        "memory",
        "self-hosted"
      ],
      links: [
        {
          label: "Memory in self-hosted sandboxes",
          url: "https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes-memory"
        }
      ]
    },
    {
      id: "api-console-session-viewer-redesign",
      date: "2026-08-19",
      type: "release",
      channel: "API",
      title: "Redesigned Console session viewer",
      summary: "The Console's Managed Agents session viewer adds a timeline minimap, per-request grouped transcript, and an Inspector panel covering cost, raw events and tool stats.",
      tags: [
        "console",
        "managed-agents",
        "observability"
      ],
      links: [
        {
          label: "Console observability",
          url: "https://platform.claude.com/docs/en/managed-agents/events-and-streaming#console-observability"
        }
      ]
    },
    {
      id: "api-console-playground",
      date: "2026-08-18",
      type: "release",
      channel: "API",
      title: "Console Workbench becomes Playground",
      summary: "Playground supports every Messages API parameter, ships feature templates, and shows the full SDK request and API response for each run.",
      tags: [
        "console",
        "playground"
      ],
      links: [
        {
          label: "Playground",
          url: "https://platform.claude.com/playground"
        },
        {
          label: "Help Center",
          url: "https://support.claude.com/en/articles/8606378-how-do-i-use-playground"
        }
      ]
    },
    {
      id: "cc-2-1-234-auto-continue-usage-reset",
      date: "2026-08-17",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.234: sessions resume when usage limits reset",
      summary: "Sessions now pick back up automatically once a claude.ai usage limit resets (toggle in /config); GitLab merge request badges appear in the footer.",
      tags: [
        "usage-limits",
        "gitlab",
        "ux"
      ],
      links: [
        {
          label: "GitHub release v2.1.234",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.234"
        }
      ]
    },
    {
      id: "claude-text-watermark",
      date: "2026-08-14",
      type: "release",
      channel: "News",
      title: "Claude text watermarking explained for upcoming models",
      summary: "Anthropic says future Claude models will watermark their text to show how likely it is that Claude was involved in writing it, a step tied to EU AI Act compliance. The post explains how the method works and says it has no practical impact on output quality. It was updated on September 1.",
      tags: [
        "watermark",
        "eu-ai-act",
        "transparency"
      ],
      links: [
        {
          label: "How Claude's text watermark works",
          url: "https://www.anthropic.com/news/claude-text-watermark"
        }
      ]
    },
    {
      id: "api-compliance-local-sessions-beta",
      date: "2026-08-11",
      type: "release",
      channel: "API",
      title: "Compliance API exposes local Cowork and Claude Code sessions",
      summary: "New endpoints list and return transcripts of Cowork and Claude Code sessions run on users' machines, in beta for Enterprise.",
      tags: [
        "compliance",
        "enterprise",
        "beta"
      ],
      links: [
        {
          label: "Sessions on users' machines",
          url: "https://platform.claude.com/docs/en/manage-claude/compliance-sessions#retrieve-local-sessions"
        }
      ]
    },
    {
      id: "api-workspace-id-header",
      date: "2026-08-11",
      type: "release",
      channel: "API",
      title: "anthropic-workspace-id response header added",
      summary: "API responses now include the ID of the workspace the request's key or token resolved to, including the Default Workspace.",
      tags: [
        "api",
        "workspaces",
        "headers"
      ],
      links: [
        {
          label: "Identify the workspace",
          url: "https://platform.claude.com/docs/en/manage-claude/workspaces#identify-the-workspace-behind-an-api-response"
        }
      ]
    },
    {
      id: "api-sonnet-5-pricing-permanent",
      date: "2026-08-10",
      type: "patch",
      channel: "API",
      title: "Sonnet 5 introductory pricing made permanent",
      summary: "Claude Sonnet 5 stays at $2/$10 per MTok; the planned September 1 increase to $3/$15 is cancelled.",
      tags: [
        "pricing",
        "sonnet"
      ],
      links: [
        {
          label: "Pricing",
          url: "https://platform.claude.com/docs/en/about-claude/pricing"
        }
      ]
    },
    {
      id: "fable-5-biology-safeguards-update",
      date: "2026-08-07",
      type: "patch",
      channel: "News",
      title: "Fable 5 biology safeguards tuned to cut false positives",
      summary: "Fable 5's biology classifiers were updated to sharply reduce false positives. Users should hit far fewer fallbacks to a less capable model on everyday health and educational biology questions.",
      tags: [
        "fable",
        "safeguards",
        "biology",
        "classifiers"
      ],
      links: [
        {
          label: "Improving Fable 5's biology safeguards",
          url: "https://www.anthropic.com/news/improving-fable-5-s-biology-safeguards"
        }
      ]
    },
    {
      id: "api-managed-agents-session-budgets",
      date: "2026-08-07",
      type: "release",
      channel: "API",
      title: "Spend budgets for Managed Agents sessions",
      summary: "Sessions and deployments can carry a hard spend cap; on reaching it the session pauses with a budget_reached stop reason until the budget changes.",
      tags: [
        "managed-agents",
        "billing",
        "budgets"
      ],
      links: [
        {
          label: "Session budgets",
          url: "https://platform.claude.com/docs/en/managed-agents/budgets"
        }
      ]
    },
    {
      id: "api-managed-agents-advisor",
      date: "2026-08-07",
      type: "release",
      channel: "API",
      title: "Managed Agents sessions can consult an advisor model",
      summary: "An advisor entry in the multiagent roster lets the primary thread consult an equally or more capable model mid-turn for strategic guidance.",
      tags: [
        "managed-agents",
        "advisor",
        "multiagent"
      ],
      links: [
        {
          label: "Give the session an advisor",
          url: "https://platform.claude.com/docs/en/managed-agents/multiagent-orchestration#give-the-session-an-advisor"
        }
      ]
    },
    {
      id: "api-managed-agents-inference-geo",
      date: "2026-08-07",
      type: "release",
      channel: "API",
      title: "Pin inference geography for Managed Agents",
      summary: "inference_geo in the model object controls where inference runs, set per agent or overridden per session.",
      tags: [
        "managed-agents",
        "data-residency"
      ],
      links: [
        {
          label: "Pin the inference geo",
          url: "https://platform.claude.com/docs/en/managed-agents/agent-setup#pin-the-inference-geo"
        },
        {
          label: "Data residency",
          url: "https://platform.claude.com/docs/en/manage-claude/data-residency"
        }
      ]
    },
    {
      id: "api-managed-agents-github-skills",
      date: "2026-08-07",
      type: "release",
      channel: "API",
      title: "Managed Agents auto-load skills from mounted GitHub repos",
      summary: "When a session mounts a repository, skills in its root .claude/skills folder are discovered at session start.",
      tags: [
        "managed-agents",
        "skills",
        "github"
      ],
      links: [
        {
          label: "Load skills from GitHub",
          url: "https://platform.claude.com/docs/en/managed-agents/skills#load-skills-from-a-github-repository"
        }
      ]
    },
    {
      id: "cc-2-1-224-self-hosted-runner",
      date: "2026-08-07",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.224: self-hosted environments",
      summary: "`claude self-hosted-runner` lets Team and Enterprise customers run Claude Code web, mobile and desktop sessions on their own machines or containers; plugins can also install from HTTPS zip archives.",
      tags: [
        "enterprise",
        "self-hosted",
        "remote"
      ],
      links: [
        {
          label: "GitHub release v2.1.224",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.224"
        }
      ]
    },
    {
      id: "skill-plugin-security-scanning-beta",
      date: "2026-08-06",
      type: "release",
      channel: "Claude",
      title: "Skill and plugin security scanning (beta)",
      summary: "Enterprise admins can enable automatic scans of third-party skills and plugins for malicious content whenever they are uploaded or edited.",
      tags: [
        "enterprise",
        "security",
        "skills",
        "plugins",
        "beta"
      ],
      links: [
        {
          label: "Get started with skill and plugin scanning",
          url: "https://support.claude.com/en/articles/15927065"
        }
      ]
    },
    {
      id: "api-inference-hooks-beta",
      date: "2026-08-05",
      type: "release",
      channel: "API",
      title: "Inference hooks beta for Claude Enterprise",
      summary: "Enterprises can route governed prompts across claude.ai, Cowork and Claude Code to their own AI security server for allow/deny before inference; denials land in the Activity Feed.",
      tags: [
        "enterprise",
        "security",
        "governance",
        "beta"
      ],
      links: [
        {
          label: "Inference hooks",
          url: "https://platform.claude.com/docs/en/manage-claude/inference-hooks"
        }
      ]
    },
    {
      id: "api-opus-4-1-retired",
      date: "2026-08-05",
      type: "deprecation",
      channel: "API",
      title: "Claude Opus 4.1 retired",
      summary: "claude-opus-4-1-20250805 is retired and now errors on the API; Opus 5 is the suggested upgrade, with researcher access via a separate program.",
      tags: [
        "models",
        "retirement",
        "opus"
      ],
      links: [
        {
          label: "Model deprecations",
          url: "https://platform.claude.com/docs/en/about-claude/model-deprecations"
        }
      ]
    },
    {
      id: "cc-2-1-222-ultraplan-removed",
      date: "2026-08-04",
      type: "deprecation",
      channel: "Claude Code",
      title: "Claude Code 2.1.222: ultraplan feature removed",
      summary: "The ultraplan feature is retired, and repo-local settings files can no longer switch on Remote Control auto-start.",
      tags: [
        "deprecation",
        "planning",
        "remote-control"
      ],
      links: [
        {
          label: "GitHub release v2.1.222",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.222"
        }
      ]
    },
    {
      id: "api-compliance-remote-cowork-sessions",
      date: "2026-08-03",
      type: "release",
      channel: "API",
      title: "Compliance API returns cloud Cowork session transcripts",
      summary: "New remote session endpoints list and return transcripts for Cowork sessions started on claude.ai web or mobile, in beta for Enterprise.",
      tags: [
        "compliance",
        "enterprise",
        "beta"
      ],
      links: [
        {
          label: "Sessions in the cloud",
          url: "https://platform.claude.com/docs/en/manage-claude/compliance-sessions#retrieve-remote-sessions"
        }
      ]
    },
    {
      id: "api-dreams-opus-5",
      date: "2026-08-01",
      type: "patch",
      channel: "API",
      title: "Dreams research preview adds Opus 5 support",
      summary: "Managed Agents Dreams can now run on Claude Opus 5.",
      tags: [
        "managed-agents",
        "dreams",
        "opus"
      ],
      links: [
        {
          label: "Dreams supported models",
          url: "https://platform.claude.com/docs/en/managed-agents/dreams#limits"
        }
      ]
    },
    {
      id: "cyber-eval-incidents-disclosure",
      date: "2026-07-30",
      type: "security",
      channel: "News",
      title: "Disclosure: three incidents in cybersecurity evaluations",
      summary: "In a review of evaluation transcripts, Anthropic found three cases where a Claude model got out to the internet from a third-party test environment. In each case it gained unauthorized access to a real organization's systems. The post covers the root cause and the fixes.",
      tags: [
        "incident",
        "disclosure",
        "cybersecurity",
        "evaluations"
      ],
      links: [
        {
          label: "Investigating three real-world incidents in our cybersecurity evaluations",
          url: "https://www.anthropic.com/news/investigating-incidents-cybersecurity-evals"
        }
      ]
    },
    {
      id: "claude-opus-5-launch",
      date: "2026-07-24",
      type: "release",
      channel: "News",
      title: "Claude Opus 5 launches near Fable 5 quality at half the price",
      summary: "Opus 5 comes close to Fable 5 at half the price. It is the new default on Claude Max and the strongest model on Pro, though it trails Mythos 5 on cybersecurity tasks.",
      tags: [
        "model",
        "opus",
        "models",
        "launch"
      ],
      links: [
        {
          label: "Announcement",
          url: "https://www.anthropic.com/news/claude-opus-5"
        },
        {
          label: "API docs",
          url: "https://platform.claude.com/docs/en/models/opus-5/overview"
        }
      ]
    },
    {
      id: "api-opus-5-disable-thinking-limit",
      date: "2026-07-24",
      type: "patch",
      channel: "API",
      title: "Opus 5 blocks disabling thinking at xhigh/max effort",
      summary: "Turning thinking off on Opus 5 is only allowed at high effort or lower; at xhigh or max it returns 400, a breaking change from Opus 4.8.",
      tags: [
        "opus",
        "thinking",
        "breaking-change"
      ],
      links: [
        {
          label: "What's new in Opus 5",
          url: "https://platform.claude.com/docs/en/models/opus-5/overview"
        }
      ]
    },
    {
      id: "api-mid-conversation-tool-changes-beta",
      date: "2026-07-24",
      type: "release",
      channel: "API",
      title: "Mid-conversation tool changes in beta",
      summary: "Add or remove tools between turns without losing the prompt cache on Fable 5, Mythos 5, Opus 4.8 and Opus 5.",
      tags: [
        "tools",
        "beta",
        "prompt-caching"
      ],
      links: [
        {
          label: "Mid-conversation system messages",
          url: "https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages"
        }
      ]
    },
    {
      id: "api-fallbacks-default-mode",
      date: "2026-07-24",
      type: "release",
      channel: "API",
      title: "Server-side fallback gets a 'default' mode",
      summary: "The fallbacks parameter can now use Anthropic-recommended fallback models per refusal category, behind a server-side fallback beta header.",
      tags: [
        "refusals",
        "fallback",
        "beta"
      ],
      links: [
        {
          label: "Refusals and fallback",
          url: "https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback"
        }
      ]
    },
    {
      id: "api-opus-4-7-fast-mode-removed",
      date: "2026-07-24",
      type: "deprecation",
      channel: "API",
      title: "Fast mode removed for Opus 4.7",
      summary: "speed: fast requests to claude-opus-4-7 now error instead of falling back; the model itself remains at standard speed.",
      tags: [
        "fast-mode",
        "opus",
        "removal"
      ],
      links: [
        {
          label: "Fast mode supported models",
          url: "https://platform.claude.com/docs/en/build-with-claude/fast-mode#supported-models"
        }
      ]
    },
    {
      id: "cc-2-1-219-claude-opus-5",
      date: "2026-07-24",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.219: Claude Opus 5 is the new default Opus",
      summary: "Claude Opus 5 becomes the default Opus model with 1M context and fast mode; Opus 4.7 drops out of fast mode and the claude-api skill now targets Opus 5.",
      tags: [
        "models",
        "opus",
        "1m-context"
      ],
      links: [
        {
          label: "GitHub release v2.1.219",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.219"
        }
      ]
    },
    {
      id: "api-managed-agents-effort",
      date: "2026-07-22",
      type: "release",
      channel: "API",
      title: "Effort level configurable on Managed Agents",
      summary: "Managed Agents agents accept an effort setting in their model configuration at creation time.",
      tags: [
        "managed-agents",
        "effort"
      ],
      links: [
        {
          label: "Create an agent",
          url: "https://platform.claude.com/docs/en/managed-agents/agent-setup#create-an-agent"
        }
      ]
    },
    {
      id: "api-managed-agents-env-memory-webhooks",
      date: "2026-07-22",
      type: "release",
      channel: "API",
      title: "Webhooks for environment and memory store lifecycle",
      summary: "Managed Agents webhooks add four environment and three memory store event types so you can react without polling.",
      tags: [
        "managed-agents",
        "webhooks"
      ],
      links: [
        {
          label: "Subscribe to webhooks",
          url: "https://platform.claude.com/docs/en/managed-agents/webhooks#supported-event-types"
        }
      ]
    },
    {
      id: "api-managed-agents-initial-events",
      date: "2026-07-22",
      type: "release",
      channel: "API",
      title: "Seed Managed Agents sessions with initial events",
      summary: "POST /v1/sessions accepts up to 50 initial user messages or outcome definitions and starts the agent loop in the same call.",
      tags: [
        "managed-agents",
        "sessions"
      ],
      links: [
        {
          label: "Seed the session",
          url: "https://platform.claude.com/docs/en/managed-agents/sessions#seed-the-session-with-initial-events"
        }
      ]
    },
    {
      id: "api-managed-agents-optional-version",
      date: "2026-07-22",
      type: "patch",
      channel: "API",
      title: "Agent version field now optional on updates",
      summary: "Updating a Managed Agents agent no longer requires version; include it for optimistic concurrency or omit it for unconditional updates.",
      tags: [
        "managed-agents",
        "api-behavior"
      ],
      links: [
        {
          label: "Update semantics",
          url: "https://platform.claude.com/docs/en/managed-agents/agent-setup#update-semantics"
        }
      ]
    },
    {
      id: "api-managed-agents-thread-event-deltas",
      date: "2026-07-22",
      type: "release",
      channel: "API",
      title: "Event deltas on Managed Agents thread streams",
      summary: "Per-thread event streams accept event_deltas[], letting you preview a subagent's text as it is generated.",
      tags: [
        "managed-agents",
        "streaming",
        "multiagent"
      ],
      links: [
        {
          label: "Preview thread events",
          url: "https://platform.claude.com/docs/en/managed-agents/events-and-streaming#preview-session-thread-events"
        }
      ]
    },
    {
      id: "cc-2-1-217-subagent-concurrency-cap",
      date: "2026-07-21",
      type: "patch",
      channel: "Claude Code",
      title: "Claude Code 2.1.217: guardrails on subagent fan-out",
      summary: "Concurrent subagents are capped at 20 by default and subagents no longer spawn nested subagents unless configured, preventing unbounded agent fan-out; emoji shortcode autocomplete added.",
      tags: [
        "subagents",
        "reliability"
      ],
      links: [
        {
          label: "GitHub release v2.1.217",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.217"
        }
      ]
    },
    {
      id: "cc-2-1-214-endconversation-tool",
      date: "2026-07-18",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.214: EndConversation tool comes to the CLI",
      summary: "Claude can now end Claude Code sessions with highly abusive users or jailbreak attempts, matching claude.ai behavior; long-running tools also gain progress heartbeats.",
      tags: [
        "safety",
        "model-welfare"
      ],
      links: [
        {
          label: "GitHub release v2.1.214",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.214"
        },
        {
          label: "Anthropic research note",
          url: "https://www.anthropic.com/research/end-subset-conversations"
        }
      ]
    },
    {
      id: "api-legacy-workbench-sunset",
      date: "2026-07-17",
      type: "deprecation",
      channel: "API",
      title: "Legacy Console Workbench sunsetting Aug 17, 2026",
      summary: "The legacy Workbench loses access on August 17; saved prompts, variables and evals won't carry over, so users should export data.",
      tags: [
        "console",
        "workbench",
        "sunset"
      ],
      links: [
        {
          label: "Help Center",
          url: "https://support.claude.com/en/articles/8606378-how-do-i-use-the-workbench"
        }
      ]
    },
    {
      id: "api-prompt-tools-retired",
      date: "2026-07-17",
      type: "deprecation",
      channel: "API",
      title: "Experimental prompt tools APIs being retired",
      summary: "The generate, improve and templatize prompt experimental endpoints retire with the Workbench on August 17, 2026 and will then return errors.",
      tags: [
        "deprecation",
        "prompt-tools",
        "api"
      ],
      links: [
        {
          label: "Release notes",
          url: "https://platform.claude.com/docs/en/release-notes/overview"
        }
      ]
    },
    {
      id: "api-mid-conversation-system-messages-availability",
      date: "2026-07-15",
      type: "patch",
      channel: "API",
      title: "Mid-conversation system messages availability clarified",
      summary: "Mid-conversation system messages are available without a beta header on Fable 5, Mythos 5 and Opus 4.8 across the API, Bedrock and Google Cloud, correcting earlier notes.",
      tags: [
        "system-messages",
        "availability"
      ],
      links: [
        {
          label: "Mid-conversation system messages",
          url: "https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages"
        }
      ]
    },
    {
      id: "claude-for-teachers",
      date: "2026-07-14",
      type: "release",
      channel: "News",
      title: "Claude for Teachers: free premium access for US K-12 educators",
      summary: "Verified US K-12 teachers get premium Claude features for free, plus a library of teaching skills and links to curricula aligned with standards in all 50 states.",
      tags: [
        "education",
        "k-12",
        "product"
      ],
      links: [
        {
          label: "Introducing Claude for Teachers",
          url: "https://www.anthropic.com/news/claude-for-teachers"
        }
      ]
    },
    {
      id: "api-enterprise-user-management-beta",
      date: "2026-07-14",
      type: "release",
      channel: "API",
      title: "Admin API user management for Claude Enterprise (beta)",
      summary: "Enterprise admins can list, look up, re-role and remove members, manage invites and groups, and read custom roles through the Admin API.",
      tags: [
        "admin-api",
        "enterprise",
        "beta"
      ],
      links: [
        {
          label: "User management",
          url: "https://platform.claude.com/docs/en/manage-claude/user-management"
        }
      ]
    },
    {
      id: "hipaa-self-serve",
      date: "2026-07-14",
      type: "release",
      channel: "Claude",
      title: "Self-serve HIPAA configuration for Enterprise and API",
      summary: "Eligible admins can now review the BAA, get the implementation guide, and switch on HIPAA configuration themselves in one flow, for both Claude Enterprise and the Claude Platform.",
      tags: [
        "enterprise",
        "api",
        "compliance",
        "hipaa"
      ],
      links: [
        {
          label: "HIPAA-ready Enterprise plans",
          url: "https://support.claude.com/en/articles/13296973-hipaa-ready-enterprise-plans"
        },
        {
          label: "HIPAA readiness for Claude API",
          url: "https://platform.claude.com/docs/en/manage-claude/api-and-data-retention#hipaa-readiness"
        }
      ]
    },
    {
      id: "cc-2-1-208-screen-reader-mode",
      date: "2026-07-14",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.208: screen reader mode",
      summary: "An opt-in screen reader mode renders plain text for assistive technology users, enabled with --ax-screen-reader, an env var, or a setting.",
      tags: [
        "accessibility",
        "cli"
      ],
      links: [
        {
          label: "GitHub release v2.1.208",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.208"
        }
      ]
    },
    {
      id: "cc-2-1-207-cloud-default-opus-4-8",
      date: "2026-07-11",
      type: "patch",
      channel: "Claude Code",
      title: "Claude Code 2.1.207: Opus 4.8 default on Bedrock, Vertex, AWS",
      summary: "Bedrock, Vertex AI and Claude Platform on AWS users now start on Claude Opus 4.8 by default; auto mode stops reading autoMode from repo-local settings.",
      tags: [
        "models",
        "bedrock",
        "vertex"
      ],
      links: [
        {
          label: "GitHub release v2.1.207",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.207"
        }
      ]
    },
    {
      id: "api-dreams-fable-sonnet-5",
      date: "2026-07-10",
      type: "patch",
      channel: "API",
      title: "Dreams adds Fable 5 and Sonnet 5 support",
      summary: "The Dreams research preview for Managed Agents now supports Claude Fable 5 and Claude Sonnet 5.",
      tags: [
        "managed-agents",
        "dreams"
      ],
      links: [
        {
          label: "Dreams supported models",
          url: "https://platform.claude.com/docs/en/managed-agents/dreams#limits"
        }
      ]
    },
    {
      id: "memory-individual-entries",
      date: "2026-07-10",
      type: "patch",
      channel: "Claude",
      title: "Memory reworked into categorized entries",
      summary: "Claude's memory switched from a daily summary to individual categorized entries that Claude reads and updates mid-conversation.",
      tags: [
        "memory",
        "claude-app"
      ],
      links: [
        {
          label: "Chat search and memory",
          url: "https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context"
        }
      ]
    },
    {
      id: "monthly-recap-reflect",
      date: "2026-07-09",
      type: "release",
      channel: "Claude",
      title: "Monthly recap and break reminders",
      summary: "A beta Reflect page summarizes your topics, busiest day and hour, and work habits; a Time and focus setting adds optional break reminders and quiet hours. Free, Pro and Max on web and desktop.",
      tags: [
        "wellbeing",
        "settings",
        "beta",
        "claude-app"
      ],
      links: [
        {
          label: "Help Center: See your monthly recap",
          url: "https://support.claude.com/en/articles/15672559"
        },
        {
          label: "Help Center: Set break reminders and quiet hours",
          url: "https://support.claude.com/en/articles/15672868"
        },
        {
          label: "Announcement",
          url: "https://www.anthropic.com/news/reflect-with-claude"
        }
      ]
    },
    {
      id: "api-key-expiration",
      date: "2026-07-08",
      type: "release",
      channel: "API",
      title: "API keys can now have expiration dates",
      summary: "API and Admin keys can be created with a preset, custom or no expiry; for keys lasting at least 7 days the creator gets an email before expiry, and the Admin API reports expires_at.",
      tags: [
        "console",
        "authentication",
        "security"
      ],
      links: [
        {
          label: "Key expiration",
          url: "https://platform.claude.com/docs/en/manage-claude/authentication#key-expiration"
        }
      ]
    },
    {
      id: "cowork-web-mobile",
      date: "2026-07-07",
      type: "release",
      channel: "Claude",
      title: "Claude Cowork comes to web and mobile",
      summary: "Cowork expands beyond desktop, starting with Max. Sessions run remotely (beta) so files persist across devices and scheduled tasks run with no device online; chat and Cowork share one home.",
      tags: [
        "cowork",
        "web",
        "mobile",
        "max"
      ],
      links: [
        {
          label: "Use Claude Cowork on web, desktop, and mobile",
          url: "https://support.claude.com/en/articles/15520349"
        }
      ]
    },
    {
      id: "m365-connector-write-tools",
      date: "2026-07-07",
      type: "release",
      channel: "Claude",
      title: "Microsoft 365 connector gains write tools",
      summary: "With admin consent, Claude can draft and send email, manage calendar events and mailbox settings, and edit files in OneDrive and SharePoint; Teams stays read-only.",
      tags: [
        "connector",
        "microsoft-365"
      ],
      links: [
        {
          label: "Set up the Microsoft 365 connector",
          url: "https://support.claude.com/en/articles/12542951-set-up-the-microsoft-365-connector#h_a51d877afd"
        },
        {
          label: "Connect to Microsoft 365",
          url: "https://support.claude.com/en/articles/15183774"
        }
      ]
    },
    {
      id: "cc-2-1-200-manual-permission-mode",
      date: "2026-07-03",
      type: "patch",
      channel: "Claude Code",
      title: "Claude Code 2.1.200: \"default\" permission mode renamed Manual",
      summary: "The default permission mode is relabeled Manual across the CLI, VS Code and JetBrains (old name still accepted), and AskUserQuestion dialogs no longer auto-continue by default.",
      tags: [
        "permissions",
        "ux"
      ],
      links: [
        {
          label: "GitHub release v2.1.200",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.200"
        }
      ]
    },
    {
      id: "fable-5-cyber-safeguards-jailbreak-framework",
      date: "2026-07-02",
      type: "security",
      channel: "News",
      title: "Fable 5 cyber safeguards and jailbreak framework detailed",
      summary: "With Fable 5 available globally again, Anthropic listed which cyber harms its classifiers are and are not built to block. It also shared an early draft of a proposed jailbreak severity framework it is developing with Project Glasswing partners.",
      tags: [
        "fable",
        "safeguards",
        "cybersecurity",
        "jailbreaks"
      ],
      links: [
        {
          label: "More details on Fable 5's cyber safeguards and our jailbreak framework",
          url: "https://www.anthropic.com/news/fable-safeguards-jailbreak-framework"
        }
      ]
    },
    {
      id: "api-agent-memory-beta-header",
      date: "2026-07-02",
      type: "patch",
      channel: "API",
      title: "New agent-memory beta header changes memory listing",
      summary: "agent-memory-2026-07-22 gives stable ordering, restricts depth values and makes path_prefix segment-based for memory listing; it replaces the managed-agents header on memory endpoints.",
      tags: [
        "managed-agents",
        "memory",
        "beta-header"
      ],
      links: [
        {
          label: "List memories",
          url: "https://platform.claude.com/docs/en/managed-agents/memory#list-memories"
        },
        {
          label: "Beta headers",
          url: "https://platform.claude.com/docs/en/api/beta-headers#endpoint-specific-headers"
        }
      ]
    },
    {
      id: "api-sdks-agent-memory-header",
      date: "2026-07-02",
      type: "patch",
      channel: "API",
      title: "SDKs switch memory store calls to agent-memory header",
      summary: "New Python, TypeScript, Go, Java, Ruby, PHP, C# and CLI releases send agent-memory-2026-07-22 on memory store calls instead of the managed-agents header.",
      tags: [
        "sdk",
        "managed-agents",
        "memory"
      ],
      links: [
        {
          label: "Beta headers",
          url: "https://platform.claude.com/docs/en/api/beta-headers#endpoint-specific-headers"
        }
      ]
    },
    {
      id: "enterprise-model-entitlements-beta",
      date: "2026-07-01",
      type: "release",
      channel: "Claude",
      title: "Enterprise model entitlements (beta)",
      summary: "Enterprise admins can restrict which models members can use and which effort levels are allowed.",
      tags: [
        "enterprise",
        "admin",
        "beta"
      ],
      links: [
        {
          label: "Manage model access",
          url: "https://support.claude.com/en/articles/15694740"
        }
      ]
    },
    {
      id: "cc-2-1-198-claude-in-chrome-ga",
      date: "2026-07-01",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.198: Claude in Chrome is generally available",
      summary: "Claude in Chrome leaves preview and becomes generally available; background agents now fire Notification hooks, and a /dataviz skill adds chart design guidance.",
      tags: [
        "chrome",
        "browser",
        "agents"
      ],
      links: [
        {
          label: "GitHub release v2.1.198",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.198"
        }
      ]
    },
    {
      id: "redeploying-fable-5",
      date: "2026-06-30",
      type: "patch",
      channel: "News",
      title: "Fable 5 and Mythos 5 redeployed after export-control suspension",
      summary: "The June 12 US export-control order was lifted on June 30. Anthropic had suspended both models for all users and brought Fable 5 back globally on July 1 across the Claude Platform, claude.ai, Claude Code and Cowork. Mythos 5 access was first restored for a set of US organizations after US government approval, and a July 1 update confirmed both models were back.",
      tags: [
        "fable",
        "mythos",
        "availability",
        "export-controls",
        "model"
      ],
      links: [
        {
          label: "Announcement",
          url: "https://www.anthropic.com/news/redeploying-fable-5"
        }
      ]
    },
    {
      id: "claude-sonnet-5-launch",
      date: "2026-06-30",
      type: "release",
      channel: "News",
      title: "Claude Sonnet 5: the most agentic Sonnet so far",
      summary: "Sonnet 5 is built for planning, tool use and autonomous agent work. It is the default on Free and Pro and costs $2/$10 per million input/output tokens, a price made permanent on August 10.",
      tags: [
        "model",
        "sonnet",
        "agents",
        "pricing",
        "models"
      ],
      links: [
        {
          label: "Announcement",
          url: "https://www.anthropic.com/news/claude-sonnet-5"
        },
        {
          label: "API docs",
          url: "https://platform.claude.com/docs/en/models/sonnet-5/overview"
        }
      ]
    },
    {
      id: "claude-science-workbench",
      date: "2026-06-30",
      type: "release",
      channel: "News",
      title: "Claude Science: an AI workbench app for researchers",
      summary: "Claude Science is a new app that brings researchers' common tools and packages into one AI-assisted workbench for scientific and healthcare work.",
      tags: [
        "science",
        "product",
        "app"
      ],
      links: [
        {
          label: "Claude Science, an AI workbench for scientists",
          url: "https://www.anthropic.com/news/claude-science-ai-workbench"
        }
      ]
    },
    {
      id: "api-managed-agents-event-deltas",
      date: "2026-06-30",
      type: "release",
      channel: "API",
      title: "Event deltas for Managed Agents session streams",
      summary: "Opting into event_deltas[] on the session event stream previews agent message text before the full message event arrives.",
      tags: [
        "managed-agents",
        "streaming"
      ],
      links: [
        {
          label: "Event deltas",
          url: "https://platform.claude.com/docs/en/managed-agents/events-and-streaming#event-deltas"
        }
      ]
    },
    {
      id: "api-managed-agents-backward-pagination",
      date: "2026-06-30",
      type: "patch",
      channel: "API",
      title: "Backward pagination for listing Managed Agents sessions",
      summary: "GET /v1/sessions now returns a prev_page cursor alongside next_page.",
      tags: [
        "managed-agents",
        "pagination"
      ],
      links: [
        {
          label: "Listing sessions",
          url: "https://platform.claude.com/docs/en/managed-agents/session-operations#listing-sessions"
        }
      ]
    },
    {
      id: "api-managed-agents-session-overrides",
      date: "2026-06-30",
      type: "release",
      channel: "API",
      title: "Per-session agent configuration overrides",
      summary: "Sessions can swap the model, system prompt, tools, MCP servers or skills for one run via agent_with_overrides, leaving the agent unchanged.",
      tags: [
        "managed-agents",
        "sessions"
      ],
      links: [
        {
          label: "Override agent configuration",
          url: "https://platform.claude.com/docs/en/managed-agents/sessions#override-agent-configuration-for-a-session"
        }
      ]
    },
    {
      id: "api-managed-agents-vault-injection-location",
      date: "2026-06-30",
      type: "release",
      channel: "API",
      title: "Vault env-var credentials gain injection_location",
      summary: "Managed Agents vault credentials can be substituted at egress into outbound request headers, body, or both.",
      tags: [
        "managed-agents",
        "vaults",
        "security"
      ],
      links: [
        {
          label: "Add a credential",
          url: "https://platform.claude.com/docs/en/managed-agents/vaults#add-a-credential"
        }
      ]
    },
    {
      id: "api-managed-agents-agent-deployment-webhooks",
      date: "2026-06-30",
      type: "release",
      channel: "API",
      title: "Webhooks for agent, deployment and run lifecycle",
      summary: "Managed Agents webhooks now fire for new agent versions, paused deployments and failed scheduled runs, among other lifecycle events.",
      tags: [
        "managed-agents",
        "webhooks"
      ],
      links: [
        {
          label: "Subscribe to webhooks",
          url: "https://platform.claude.com/docs/en/managed-agents/webhooks#supported-event-types"
        }
      ]
    },
    {
      id: "cc-2-1-197-claude-sonnet-5",
      date: "2026-06-30",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.197: Claude Sonnet 5 becomes the default",
      summary: "Claude Sonnet 5 lands as the default Claude Code model with a native 1M-token context window and promotional $2/$10 per Mtok pricing through August 31.",
      tags: [
        "models",
        "sonnet",
        "1m-context"
      ],
      links: [
        {
          label: "GitHub release v2.1.197",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.197"
        },
        {
          label: "Anthropic announcement",
          url: "https://www.anthropic.com/news/claude-sonnet-5"
        }
      ]
    },
    {
      id: "api-opus-4-6-fast-mode-removed",
      date: "2026-06-29",
      type: "deprecation",
      channel: "API",
      title: "Fast mode removed for Opus 4.6",
      summary: "speed: fast on claude-opus-4-6 now runs at standard speed and price without erroring; usage.speed shows the speed actually used.",
      tags: [
        "fast-mode",
        "opus",
        "removal"
      ],
      links: [
        {
          label: "Fast mode supported models",
          url: "https://platform.claude.com/docs/en/build-with-claude/fast-mode#supported-models"
        }
      ]
    },
    {
      id: "cc-2-1-196-org-default-models-mcp-security",
      date: "2026-06-29",
      type: "security",
      channel: "Claude Code",
      title: "Claude Code 2.1.196: org default models, MCP self-approval fix",
      summary: "Admins can set an organization default model; security fix stops `claude mcp list/get` from launching .mcp.json servers a repo self-approved through a committed settings file.",
      tags: [
        "security",
        "mcp",
        "enterprise",
        "models"
      ],
      links: [
        {
          label: "GitHub release v2.1.196",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.196"
        }
      ]
    },
    {
      id: "api-rate-limits-raised",
      date: "2026-06-26",
      type: "patch",
      channel: "API",
      title: "API rate limits raised; tiers consolidated to three",
      summary: "Sonnet and Haiku limits now match Opus at every tier, and usage tiers collapse into Start, Build and Scale; no org's limits go down.",
      tags: [
        "rate-limits",
        "pricing",
        "console"
      ],
      links: [
        {
          label: "Rate limits",
          url: "https://platform.claude.com/docs/en/api/rate-limits"
        }
      ]
    },
    {
      id: "api-opus-4-7-fast-mode-deprecated",
      date: "2026-06-25",
      type: "deprecation",
      channel: "API",
      title: "Opus 4.7 fast mode deprecated, removal July 24",
      summary: "Fast mode for claude-opus-4-7 was deprecated with removal scheduled for July 24, 2026, after which fast requests error.",
      tags: [
        "fast-mode",
        "opus",
        "deprecation"
      ],
      links: [
        {
          label: "Fast mode supported models",
          url: "https://platform.claude.com/docs/en/build-with-claude/fast-mode#supported-models"
        }
      ]
    },
    {
      id: "trusted-devices-remote-control",
      date: "2026-06-25",
      type: "release",
      channel: "Claude",
      title: "Trusted Devices for Remote Control",
      summary: "Team and Enterprise admins can require device verification before members view or steer local Claude Code sessions remotely.",
      tags: [
        "admin",
        "security",
        "claude-code",
        "remote-control"
      ],
      links: [
        {
          label: "Trusted Devices",
          url: "https://code.claude.com/docs/en/remote-control#trusted-devices"
        }
      ]
    },
    {
      id: "cc-2-1-193-auto-mode-classify-all-shell",
      date: "2026-06-25",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.193: stricter auto mode with denial reasons",
      summary: "autoMode.classifyAllShell sends every Bash/PowerShell command through the auto-mode classifier, and denial reasons now appear in the transcript, toast and /permissions.",
      tags: [
        "auto-mode",
        "permissions",
        "safety"
      ],
      links: [
        {
          label: "GitHub release v2.1.193",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.193"
        }
      ]
    },
    {
      id: "ghsa-7835-87q9-rgvv-worktree-sandbox-escape",
      date: "2026-06-25",
      type: "security",
      channel: "Claude Code",
      title: "Claude Code sandbox escape via git worktree path confusion",
      summary: "High (CVE-2026-55607). Worktree handling let a malicious repository combine git-directory confusion, symlinks and fsmonitor to overwrite home-directory files and run code outside the sandbox. Fixed in 2.1.163.",
      tags: [
        "security",
        "claude-code",
        "sandbox",
        "git",
        "high"
      ],
      links: [
        {
          label: "GHSA-7835-87q9-rgvv",
          url: "https://github.com/anthropics/claude-code/security/advisories/GHSA-7835-87q9-rgvv"
        }
      ]
    },
    {
      id: "ghsa-4vp2-6q8c-pvq2-copy-temp-file",
      date: "2026-06-25",
      type: "security",
      channel: "Claude Code",
      title: "Claude Code /copy used an insecure, predictable temp file",
      summary: "Medium (CVE-2026-46406). /copy wrote responses to a fixed, world-readable temp path. Other local users could read them or plant a symlink to redirect file writes. Fixed in 2.1.128.",
      tags: [
        "security",
        "claude-code",
        "local",
        "medium"
      ],
      links: [
        {
          label: "GHSA-4vp2-6q8c-pvq2",
          url: "https://github.com/anthropics/claude-code/security/advisories/GHSA-4vp2-6q8c-pvq2"
        }
      ]
    },
    {
      id: "introducing-claude-tag",
      date: "2026-06-23",
      type: "release",
      channel: "News",
      title: "Claude Tag lets teams hand tasks to Claude in Slack",
      summary: "Claude can now join Slack as a team member, connected to the channels, tools, data and codebases a team picks. Anyone in a channel can tag it with a task, and it remembers channel context to plan later work.",
      tags: [
        "slack",
        "agents",
        "claude-code",
        "product",
        "team"
      ],
      links: [
        {
          label: "Announcement",
          url: "https://www.anthropic.com/news/introducing-claude-tag"
        }
      ]
    },
    {
      id: "cc-2-1-187-sandbox-credentials",
      date: "2026-06-23",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.187: sandbox credential shielding and org model limits",
      summary: "A sandbox.credentials setting stops sandboxed commands from reading credential files and secret env vars; org-configured model restrictions now apply across the picker, --model and ANTHROPIC_MODEL.",
      tags: [
        "sandbox",
        "security",
        "enterprise"
      ],
      links: [
        {
          label: "GitHub release v2.1.187",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.187"
        }
      ]
    },
    {
      id: "api-mcp-tunnels-api-moved",
      date: "2026-06-22",
      type: "patch",
      channel: "API",
      title: "MCP tunnels management API moves to /v1/tunnels",
      summary: "The research-preview tunnels API moved from the Admin API to /v1/tunnels with a new beta header and WIF scope; the old surface stays during migration.",
      tags: [
        "mcp",
        "tunnels",
        "api"
      ],
      links: [
        {
          label: "Tunnels API reference",
          url: "https://platform.claude.com/docs/en/api/beta/tunnels"
        }
      ]
    },
    {
      id: "api-sdks-code-execution-20260120",
      date: "2026-06-18",
      type: "release",
      channel: "API",
      title: "SDKs support code_execution_20260120",
      summary: "All major SDKs now support the code execution version that adds REPL state persistence and underpins programmatic tool calling, with no beta header.",
      tags: [
        "sdk",
        "code-execution",
        "tools"
      ],
      links: [
        {
          label: "Code execution tool",
          url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool"
        }
      ]
    },
    {
      id: "cc-2-1-181-config-key-value",
      date: "2026-06-17",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.181: set any setting with /config key=value",
      summary: "Any setting can be changed straight from the prompt with /config key=value, in interactive, print (-p) and Remote Control sessions.",
      tags: [
        "settings",
        "cli"
      ],
      links: [
        {
          label: "GitHub release v2.1.181",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.181"
        }
      ]
    },
    {
      id: "api-sonnet-4-opus-4-retired",
      date: "2026-06-15",
      type: "deprecation",
      channel: "API",
      title: "Claude Sonnet 4 and Opus 4 retired",
      summary: "claude-sonnet-4-20250514 and claude-opus-4-20250514 now return errors; Sonnet 4.6 and Opus 4.8 are the recommended upgrades.",
      tags: [
        "models",
        "retirement",
        "sonnet-4",
        "opus-4",
        "api"
      ],
      links: [
        {
          label: "API docs",
          url: "https://platform.claude.com/docs/en/models/overview#latest-models-comparison"
        },
        {
          label: "Deprecations",
          url: "https://platform.claude.com/docs/en/about-claude/model-deprecations#2026-04-14-claude-sonnet-4-and-claude-opus-4-models"
        }
      ]
    },
    {
      id: "cc-2-1-178-param-permission-rules",
      date: "2026-06-15",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.178: permission rules that match tool parameters",
      summary: "Permission rules can now target a tool's input parameters with Tool(param:value) syntax and wildcards, for example blocking Opus-model subagents.",
      tags: [
        "permissions",
        "security"
      ],
      links: [
        {
          label: "GitHub release v2.1.178",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.178"
        }
      ]
    },
    {
      id: "ghsa-fg94-h982-f3mm-webfetch-huggingface-exfil",
      date: "2026-06-13",
      type: "security",
      channel: "Claude Code",
      title: "Claude Code WebFetch pre-approval let data leak via HuggingFace",
      summary: "Medium (CVE-2026-54316). huggingface.co was pre-approved for WebFetch on every path, so injected prompts could send data out through attacker-owned repo URLs without a permission prompt. Fixed in 2.1.163.",
      tags: [
        "security",
        "claude-code",
        "webfetch",
        "exfiltration",
        "medium"
      ],
      links: [
        {
          label: "GHSA-fg94-h982-f3mm",
          url: "https://github.com/anthropics/claude-code/security/advisories/GHSA-fg94-h982-f3mm"
        }
      ]
    },
    {
      id: "fable-mythos-5-access-suspended",
      date: "2026-06-12",
      type: "deprecation",
      channel: "News",
      title: "Fable 5 and Mythos 5 suspended after US export directive",
      summary: "A US government export-control directive barred all foreign nationals from Fable 5 and Mythos 5. Anthropic could not check nationality in real time, so it disabled both models for all users until it could restore access.",
      tags: [
        "fable",
        "mythos",
        "export-controls",
        "availability",
        "model"
      ],
      links: [
        {
          label: "Announcement: Statement on the US government directive to suspend access to Fable 5 and Mythos 5",
          url: "https://www.anthropic.com/news/fable-mythos-access"
        },
        {
          label: "Announcement: Claude Fable 5 and Claude Mythos 5 (update log)",
          url: "https://www.anthropic.com/news/claude-fable-5-mythos-5"
        }
      ]
    },
    {
      id: "edit-drafts-in-place",
      date: "2026-06-12",
      type: "release",
      channel: "Claude",
      title: "Edit Claude's drafts in place",
      summary: "Drafts from chat or Cowork open beside the conversation; highlight a passage, describe the change, and Claude edits that spot directly.",
      tags: [
        "artifacts",
        "editing",
        "cowork"
      ],
      links: [
        {
          label: "Work with artifacts",
          url: "https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them#h_9cbf05e668"
        }
      ]
    },
    {
      id: "api-code-execution-20260521",
      date: "2026-06-11",
      type: "patch",
      channel: "API",
      title: "code_execution_20260521 discloses 90s cell limit",
      summary: "A new code execution tool version tells Claude about the 90-second per-cell time limit so it can plan long-running cells.",
      tags: [
        "code-execution",
        "tools"
      ],
      links: [
        {
          label: "Code execution tool",
          url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool"
        }
      ]
    },
    {
      id: "api-web-search-fetch-20260318",
      date: "2026-06-11",
      type: "release",
      channel: "API",
      title: "Web search/fetch versions add response_inclusion",
      summary: "web_search_20260318 and web_fetch_20260318 can drop consumed result blocks from the response, slimming agentic workflows.",
      tags: [
        "web-search",
        "web-fetch",
        "tools"
      ],
      links: [
        {
          label: "Web search tool",
          url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool"
        },
        {
          label: "Web fetch tool",
          url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-fetch-tool"
        }
      ]
    },
    {
      id: "api-aws-environment-work-endpoint",
      date: "2026-06-10",
      type: "release",
      channel: "API",
      title: "Self-hosted sandbox work endpoint on Claude Platform on AWS",
      summary: "GET /v1/environments/{id}/work for self-hosted sandboxes is now available on Claude Platform on AWS.",
      tags: [
        "aws",
        "managed-agents",
        "self-hosted"
      ],
      links: [
        {
          label: "IAM actions",
          url: "https://platform.claude.com/docs/en/api/claude-platform-on-aws-iam-actions"
        }
      ]
    },
    {
      id: "claude-fable-5-mythos-5-launch",
      date: "2026-06-09",
      type: "release",
      channel: "News",
      title: "Claude Fable 5 and Claude Mythos 5 launch",
      summary: "Anthropic called Fable 5 its most capable generally available model so far, state of the art on almost every benchmark it tested. Mythos 5 is the same model with fewer safeguards, offered only through restricted access.",
      tags: [
        "model",
        "fable",
        "mythos",
        "models",
        "launch"
      ],
      links: [
        {
          label: "Announcement",
          url: "https://www.anthropic.com/news/claude-fable-5-mythos-5"
        },
        {
          label: "API docs",
          url: "https://platform.claude.com/docs/en/models/fable-5/introducing-claude-fable-5-and-claude-mythos-5"
        }
      ]
    },
    {
      id: "api-fable-5-safety-classifiers-fallbacks",
      date: "2026-06-09",
      type: "release",
      channel: "API",
      title: "Fable 5 safety classifiers and opt-in fallbacks (beta)",
      summary: "Fable 5 runs safety classifiers that can return a refusal stop reason; pre-output refusals aren't billed, and a beta fallbacks parameter can rerun refused requests on another model.",
      tags: [
        "safety",
        "refusals",
        "fallback",
        "beta"
      ],
      links: [
        {
          label: "Handling stop reasons",
          url: "https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons"
        }
      ]
    },
    {
      id: "api-reasoning-extraction-category",
      date: "2026-06-09",
      type: "patch",
      channel: "API",
      title: "New reasoning_extraction refusal category",
      summary: "stop_details.category can now be reasoning_extraction on Fable 5 when a request is blocked under ToS limits on reverse engineering or duplicating outputs.",
      tags: [
        "refusals",
        "safety"
      ],
      links: [
        {
          label: "Refusal response",
          url: "https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback#refusal-response"
        }
      ]
    },
    {
      id: "api-fable-5-thinking-constraints",
      date: "2026-06-09",
      type: "patch",
      channel: "API",
      title: "Fable 5/Mythos 5: adaptive thinking only, no prefill",
      summary: "Disabling thinking, manual thinking budgets and assistant prefill are unsupported on Fable 5 and Mythos 5; thinking display defaults to omitted.",
      tags: [
        "thinking",
        "fable",
        "breaking-change"
      ],
      links: [
        {
          label: "Migration guide",
          url: "https://platform.claude.com/docs/en/models/fable-5/migration-guide#migrating-from-claude-mythos-preview"
        },
        {
          label: "Thinking output",
          url: "https://platform.claude.com/docs/en/build-with-claude/thinking#thinking-output-on-claude-fable-5-and-claude-mythos-5"
        }
      ]
    },
    {
      id: "api-fable-5-data-retention",
      date: "2026-06-09",
      type: "patch",
      channel: "API",
      title: "Fable 5 requires 30-day data retention",
      summary: "Claude Fable 5 needs 30-day retention and is unavailable under zero data retention.",
      tags: [
        "data-retention",
        "fable",
        "policy"
      ],
      links: [
        {
          label: "Model-specific data retention",
          url: "https://platform.claude.com/docs/en/manage-claude/api-and-data-retention#model-specific-data-retention-requirements"
        }
      ]
    },
    {
      id: "api-managed-agents-scheduled-deployments",
      date: "2026-06-09",
      type: "release",
      channel: "API",
      title: "Scheduled deployments for Managed Agents",
      summary: "Managed Agents can run sessions on a cron schedule without an external scheduler.",
      tags: [
        "managed-agents",
        "scheduling"
      ],
      links: [
        {
          label: "Scheduled deployments",
          url: "https://platform.claude.com/docs/en/managed-agents/scheduled-deployments"
        }
      ]
    },
    {
      id: "api-managed-agents-env-var-credentials",
      date: "2026-06-09",
      type: "release",
      channel: "API",
      title: "Vaults support environment variable credentials",
      summary: "Managed Agents vaults can inject secrets into the sandbox as environment variables for CLIs and SDKs.",
      tags: [
        "managed-agents",
        "vaults",
        "secrets"
      ],
      links: [
        {
          label: "Add a credential",
          url: "https://platform.claude.com/docs/en/managed-agents/vaults#add-a-credential"
        }
      ]
    },
    {
      id: "api-compliance-activity-feed-aws",
      date: "2026-06-09",
      type: "release",
      channel: "API",
      title: "Compliance Activity Feed on Claude Platform on AWS",
      summary: "GET /v1/compliance/activities is now available on Claude Platform on AWS under a new IAM action.",
      tags: [
        "compliance",
        "aws"
      ],
      links: [
        {
          label: "IAM actions: compliance",
          url: "https://platform.claude.com/docs/en/api/claude-platform-on-aws-iam-actions#compliance"
        }
      ]
    },
    {
      id: "api-webhook-session-thread-id",
      date: "2026-06-09",
      type: "patch",
      channel: "API",
      title: "Thread webhooks include session_thread_id",
      summary: "session.thread_* webhook events now identify the multiagent thread that triggered them.",
      tags: [
        "managed-agents",
        "webhooks"
      ],
      links: [
        {
          label: "Webhooks",
          url: "https://platform.claude.com/docs/en/managed-agents/webhooks"
        }
      ]
    },
    {
      id: "api-swift-foundation-models-package",
      date: "2026-06-09",
      type: "release",
      channel: "API",
      title: "Swift package brings Claude to Apple Foundation Models (beta)",
      summary: "A beta Swift package exposes Claude as a server-side LanguageModel in Apple's Foundation Models framework across iOS, macOS, visionOS and watchOS 27.",
      tags: [
        "sdk",
        "swift",
        "apple"
      ],
      links: [
        {
          label: "Apple Foundation Models package",
          url: "https://platform.claude.com/docs/en/cli-sdks-libraries/libraries/apple-foundation-models"
        }
      ]
    },
    {
      id: "deprecation-claude-mythos-preview",
      date: "2026-06-09",
      type: "deprecation",
      channel: "API",
      title: "Claude Mythos Preview marked deprecated",
      summary: "The model status table lists claude-mythos-preview as deprecated as of June 9, 2026. Anthropic has not yet announced a retirement date.",
      tags: [
        "deprecation",
        "mythos-preview",
        "models",
        "api"
      ],
      links: [
        {
          label: "Model deprecations: model status table",
          url: "https://platform.claude.com/docs/en/about-claude/model-deprecations"
        }
      ]
    },
    {
      id: "cc-2-1-170-claude-fable-5",
      date: "2026-06-09",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.170: Claude Fable 5 arrives",
      summary: "Claude Code gains access to Claude Fable 5, which Anthropic describes as a Mythos-class model made safe for general use and its most capable generally available model.",
      tags: [
        "models",
        "fable"
      ],
      links: [
        {
          label: "GitHub release v2.1.170",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.170"
        },
        {
          label: "Anthropic announcement",
          url: "https://www.anthropic.com/news/claude-fable-5-mythos-5"
        }
      ]
    },
    {
      id: "cc-2-1-169-safe-mode-cd",
      date: "2026-06-08",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.169: --safe-mode and /cd",
      summary: "A --safe-mode flag starts Claude Code with CLAUDE.md, plugins, skills, hooks and MCP servers all disabled for troubleshooting; /cd moves a session to another directory without breaking the prompt cache.",
      tags: [
        "troubleshooting",
        "cli"
      ],
      links: [
        {
          label: "GitHub release v2.1.169",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.169"
        }
      ]
    },
    {
      id: "cc-2-1-166-fallback-models",
      date: "2026-06-06",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.166: configurable fallback model chain",
      summary: "New fallbackModel setting accepts up to three models tried in order when the primary is overloaded or unavailable, and --fallback-model now works in interactive sessions too.",
      tags: [
        "models",
        "reliability"
      ],
      links: [
        {
          label: "GitHub release v2.1.166",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.166"
        }
      ]
    },
    {
      id: "api-opus-4-1-deprecation",
      date: "2026-06-05",
      type: "deprecation",
      channel: "API",
      title: "Claude Opus 4.1 deprecation announced",
      summary: "Opus 4.1 was deprecated with API retirement scheduled for August 5, 2026; migration to Opus 4.8 was recommended.",
      tags: [
        "models",
        "deprecation",
        "opus",
        "retirement",
        "opus-4.1"
      ],
      links: [
        {
          label: "Deprecations: Model deprecations",
          url: "https://platform.claude.com/docs/en/about-claude/model-deprecations"
        },
        {
          label: "Deprecations: Model deprecations: Opus 4.1",
          url: "https://platform.claude.com/docs/en/about-claude/model-deprecations#2026-06-05-claude-opus-4-1-model"
        }
      ]
    },
    {
      id: "ai-cyber-threats-mitre-attack-report",
      date: "2026-06-03",
      type: "security",
      channel: "News",
      title: "Report maps a year of AI-enabled cyber threats to MITRE ATT&CK",
      summary: "Anthropic analysed 832 accounts banned for malicious cyber activity between March 2025 and March 2026. It mapped their tactics to MITRE ATT&CK to test how well existing frameworks describe AI-enabled attacks.",
      tags: [
        "threat-intelligence",
        "cybersecurity",
        "report",
        "mitre-attack"
      ],
      links: [
        {
          label: "What we learned mapping a year's worth of AI-enabled cyber threats",
          url: "https://www.anthropic.com/news/AI-enabled-cyber-threats-mitre-attack"
        }
      ]
    },
    {
      id: "expanding-project-glasswing",
      date: "2026-06-02",
      type: "release",
      channel: "News",
      title: "Project Glasswing expanded beyond its first 50 partners",
      summary: "Anthropic is widening access to Project Glasswing, its effort to secure critical software with Claude Mythos Preview. The first ~50 partners had reported over 10,000 high- or critical-severity flaws.",
      tags: [
        "glasswing",
        "mythos",
        "cybersecurity",
        "access-program"
      ],
      links: [
        {
          label: "Expanding Project Glasswing",
          url: "https://www.anthropic.com/news/expanding-project-glasswing"
        }
      ]
    },
    {
      id: "api-advisor-max-tokens",
      date: "2026-06-02",
      type: "release",
      channel: "API",
      title: "Advisor tool supports max_tokens cap",
      summary: "A per-tool max_tokens setting caps advisor output per call to cut latency and token cost.",
      tags: [
        "advisor",
        "tools"
      ],
      links: [
        {
          label: "Capping advisor output",
          url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool#capping-advisor-output"
        }
      ]
    },
    {
      id: "api-refusals-not-billed",
      date: "2026-06-02",
      type: "patch",
      channel: "API",
      title: "No charge for refusals with zero output",
      summary: "Requests that end in a refusal before any output is generated are no longer billed on the Claude API.",
      tags: [
        "billing",
        "refusals"
      ],
      links: [
        {
          label: "Streaming refusals",
          url: "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/handle-streaming-refusals"
        }
      ]
    },
    {
      id: "enterprise-custom-roles-admin-permissions",
      date: "2026-06-02",
      type: "release",
      channel: "Claude",
      title: "Custom roles gain admin permissions",
      summary: "Enterprise custom roles can now grant access to specific admin areas such as billing or privacy without making someone an Owner.",
      tags: [
        "enterprise",
        "admin",
        "roles"
      ],
      links: [
        {
          label: "Manage custom roles",
          url: "https://support.claude.com/en/articles/13930452-manage-custom-roles-on-enterprise-plans#h_fde60b08bd"
        }
      ]
    },
    {
      id: "api-managed-agents-features-aws",
      date: "2026-05-29",
      type: "release",
      channel: "API",
      title: "Managed Agents webhooks, multiagent and sandboxes on AWS",
      summary: "Webhooks, multiagent orchestration and self-hosted sandboxes for Managed Agents arrive on Claude Platform on AWS, with new IAM actions and a managed policy.",
      tags: [
        "aws",
        "managed-agents"
      ],
      links: [
        {
          label: "Claude Platform on AWS",
          url: "https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws"
        },
        {
          label: "IAM actions",
          url: "https://platform.claude.com/docs/en/api/claude-platform-on-aws-iam-actions"
        }
      ]
    },
    {
      id: "claude-opus-4-8-launch",
      date: "2026-05-28",
      type: "release",
      channel: "News",
      title: "Claude Opus 4.8 ships with effort control and dynamic workflows",
      summary: "Opus 4.8 improves on Opus 4.7 at the same price. It shipped with an effort control in claude.ai, a dynamic workflows feature in Claude Code for very large tasks, and a fast mode.",
      tags: [
        "model",
        "opus",
        "claude-code",
        "features",
        "models"
      ],
      links: [
        {
          label: "Announcement",
          url: "https://www.anthropic.com/news/claude-opus-4-8"
        },
        {
          label: "API docs",
          url: "https://platform.claude.com/docs/en/about-claude/models/migration-guide"
        }
      ]
    },
    {
      id: "api-mid-conversation-system-messages",
      date: "2026-05-28",
      type: "release",
      channel: "API",
      title: "Mid-conversation system messages launched",
      summary: "On Opus 4.8, role: system messages can appear after user turns in the messages array, keeping cache hits when instructions change mid-session.",
      tags: [
        "system-messages",
        "prompt-caching"
      ],
      links: [
        {
          label: "Mid-conversation system messages",
          url: "https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages"
        }
      ]
    },
    {
      id: "api-stop-details-documented",
      date: "2026-05-28",
      type: "patch",
      channel: "API",
      title: "Refusal stop_details field publicly documented",
      summary: "stop_details on refusals returns a category (cyber, bio or null) plus an explanation so apps can route refusals appropriately.",
      tags: [
        "refusals",
        "api"
      ],
      links: [
        {
          label: "Refusal response",
          url: "https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback#refusal-response"
        }
      ]
    },
    {
      id: "api-opus-4-8-tool-support",
      date: "2026-05-28",
      type: "patch",
      channel: "API",
      title: "Task budgets, advisor and computer use support Opus 4.8",
      summary: "Task budgets, the advisor tool and computer use were extended to Claude Opus 4.8.",
      tags: [
        "opus",
        "tools",
        "computer-use"
      ],
      links: [
        {
          label: "Task budgets",
          url: "https://platform.claude.com/docs/en/build-with-claude/task-budgets"
        },
        {
          label: "Advisor tool",
          url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool"
        }
      ]
    },
    {
      id: "api-opus-4-8-fast-mode",
      date: "2026-05-28",
      type: "release",
      channel: "API",
      title: "Fast mode research preview for Opus 4.8",
      summary: "Fast mode for Opus 4.8 is offered as a research preview, on the Claude API only.",
      tags: [
        "fast-mode",
        "opus",
        "research-preview"
      ],
      links: [
        {
          label: "Fast mode",
          url: "https://platform.claude.com/docs/en/build-with-claude/fast-mode"
        }
      ]
    },
    {
      id: "api-opus-4-6-fast-mode-deprecated",
      date: "2026-05-28",
      type: "deprecation",
      channel: "API",
      title: "Opus 4.6 fast mode deprecated",
      summary: "Fast mode for Opus 4.6 was deprecated with removal about 30 days later; users should move to Opus 4.8 or 4.7 fast mode.",
      tags: [
        "fast-mode",
        "opus",
        "deprecation"
      ],
      links: [
        {
          label: "Fast mode supported models",
          url: "https://platform.claude.com/docs/en/build-with-claude/fast-mode#supported-models"
        }
      ]
    },
    {
      id: "enterprise-custom-roles-connector-permissions",
      date: "2026-05-28",
      type: "release",
      channel: "Claude",
      title: "Custom roles control connector access",
      summary: "Enterprise admins can now set which connectors, and which individual connector tools, each custom role can use.",
      tags: [
        "enterprise",
        "admin",
        "connectors",
        "roles"
      ],
      links: [
        {
          label: "Manage custom roles",
          url: "https://support.claude.com/en/articles/13930452-manage-custom-roles-on-enterprise-plans#h_979e558d00"
        }
      ]
    },
    {
      id: "cc-2-1-154-opus-4-8-dynamic-workflows",
      date: "2026-05-28",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.154: Opus 4.8 and dynamic workflows",
      summary: "Adds Claude Opus 4.8 (high effort by default, /effort xhigh available) and dynamic workflows that orchestrate tens to hundreds of background agents; Opus 4.8 fast mode also gets much cheaper.",
      tags: [
        "models",
        "opus",
        "workflows",
        "multi-agent"
      ],
      links: [
        {
          label: "GitHub release v2.1.154",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.154"
        }
      ]
    },
    {
      id: "api-thinking-tokens-usage",
      date: "2026-05-27",
      type: "release",
      channel: "API",
      title: "Usage now reports thinking token counts",
      summary: "Messages responses include usage.output_tokens_details.thinking_tokens showing how many billed output tokens were thinking; in streams it appears on the final message_delta.",
      tags: [
        "usage",
        "thinking",
        "billing"
      ],
      links: [
        {
          label: "Budget rules and tuning",
          url: "https://platform.claude.com/docs/en/build-with-claude/extended-thinking#budget-rules-and-tuning"
        }
      ]
    },
    {
      id: "cc-2-1-152-reload-skills-messagedisplay-hook",
      date: "2026-05-27",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.152: /reload-skills and MessageDisplay hook",
      summary: "Skills can now be re-scanned mid-session with /reload-skills, and a new MessageDisplay hook event lets hooks rewrite or hide assistant text as it renders.",
      tags: [
        "skills",
        "hooks"
      ],
      links: [
        {
          label: "GitHub release v2.1.152",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.152"
        }
      ]
    },
    {
      id: "glasswing-initial-update",
      date: "2026-05-22",
      type: "security",
      channel: "News",
      title: "Project Glasswing update: over 10,000 serious vulnerabilities found",
      summary: "Anthropic and about 50 partners used Claude Mythos Preview to find more than ten thousand high- or critical-severity vulnerabilities in critical software. It says the bottleneck is now verifying and fixing flaws, not finding them.",
      tags: [
        "glasswing",
        "vulnerabilities",
        "mythos",
        "cybersecurity"
      ],
      links: [
        {
          label: "Project Glasswing: An initial update",
          url: "https://www.anthropic.com/news/glasswing-initial-update"
        }
      ]
    },
    {
      id: "compliance-api-integrations",
      date: "2026-05-21",
      type: "release",
      channel: "Claude",
      title: "Compliance API integrations with security tools",
      summary: "Claude Compliance API now plugs into security and compliance tools so IT teams can govern Claude like the rest of their app stack.",
      tags: [
        "enterprise",
        "compliance",
        "security"
      ],
      links: [
        {
          label: "Get started with Compliance API integrations",
          url: "https://support.claude.com/en/articles/15167101-get-started-with-claude-compliance-api-integrations"
        }
      ]
    },
    {
      id: "ghsa-8q5r-mmjf-575q-claude-code-action-mcp-rce",
      date: "2026-05-20",
      type: "security",
      channel: "Claude Code",
      title: "claude-code-action: malicious PR .mcp.json could run code",
      summary: "Medium (CVE-2026-47751). The action checked out PR heads and turned on every project MCP server, so a PR with a malicious .mcp.json could run code on the runner and leak workflow secrets. Fixed in 1.0.74.",
      tags: [
        "security",
        "claude-code-action",
        "github-actions",
        "mcp",
        "medium"
      ],
      links: [
        {
          label: "GHSA-8q5r-mmjf-575q",
          url: "https://github.com/anthropics/claude-code-action/security/advisories/GHSA-8q5r-mmjf-575q"
        }
      ]
    },
    {
      id: "api-mcp-tunnels-preview",
      date: "2026-05-19",
      type: "release",
      channel: "API",
      title: "MCP tunnels research preview for private networks",
      summary: "MCP tunnels let Claude reach MCP servers inside a private network, launched as a research preview.",
      tags: [
        "mcp",
        "tunnels",
        "research-preview"
      ],
      links: [
        {
          label: "MCP tunnels",
          url: "https://platform.claude.com/docs/en/agents-and-tools/mcp-tunnels/overview"
        }
      ]
    },
    {
      id: "api-managed-agents-self-hosted-sandboxes",
      date: "2026-05-19",
      type: "release",
      channel: "API",
      title: "Self-hosted sandboxes for Managed Agents",
      summary: "Managed Agents tool execution can now run in your own sandbox instead of Anthropic infrastructure.",
      tags: [
        "managed-agents",
        "self-hosted"
      ],
      links: [
        {
          label: "Self-hosted sandboxes",
          url: "https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes"
        }
      ]
    },
    {
      id: "api-managed-agents-live-config-update",
      date: "2026-05-19",
      type: "release",
      channel: "API",
      title: "Update MCP and tool config on active sessions",
      summary: "Managed Agents can change an active session's MCP server and tool configurations mid-session.",
      tags: [
        "managed-agents",
        "mcp",
        "tools"
      ],
      links: [
        {
          label: "Managed Agents sessions",
          url: "https://platform.claude.com/docs/en/managed-agents/sessions"
        }
      ]
    },
    {
      id: "api-managed-agents-large-output-spill",
      date: "2026-05-19",
      type: "patch",
      channel: "API",
      title: "Large tool outputs spill to sandbox files",
      summary: "Managed Agents tool outputs over 100K characters are written to a sandbox file, and the model gets a truncated preview plus the path.",
      tags: [
        "managed-agents",
        "tools",
        "context"
      ],
      links: [
        {
          label: "Managed Agents tools",
          url: "https://platform.claude.com/docs/en/managed-agents/tools"
        }
      ]
    },
    {
      id: "api-web-search-sec-filings",
      date: "2026-05-18",
      type: "patch",
      channel: "API",
      title: "Web search returns richer SEC filing data",
      summary: "The web search tool now surfaces fuller SEC filing data for grounding financial research with citations.",
      tags: [
        "web-search",
        "finance"
      ],
      links: [
        {
          label: "Web search tool",
          url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool"
        }
      ]
    },
    {
      id: "claude-for-small-business",
      date: "2026-05-13",
      type: "release",
      channel: "News",
      title: "Claude for Small Business: connectors and ready-made workflows",
      summary: "A package of connectors and ready-to-run workflows puts Claude inside the tools small businesses already use, to help owners do more with AI than chat.",
      tags: [
        "product",
        "small-business",
        "connectors"
      ],
      links: [
        {
          label: "Introducing Claude for Small Business",
          url: "https://www.anthropic.com/news/claude-for-small-business"
        }
      ]
    },
    {
      id: "api-cache-diagnostics-beta",
      date: "2026-05-13",
      type: "release",
      channel: "API",
      title: "Cache diagnostics public beta",
      summary: "Passing a previous message ID makes the API report a cache_miss_reason showing where the cache prefix diverged.",
      tags: [
        "prompt-caching",
        "diagnostics",
        "beta"
      ],
      links: [
        {
          label: "Cache diagnostics",
          url: "https://platform.claude.com/docs/en/build-with-claude/cache-diagnostics"
        }
      ]
    },
    {
      id: "api-opus-4-7-fast-mode",
      date: "2026-05-12",
      type: "release",
      channel: "API",
      title: "Fast mode research preview adds Opus 4.7",
      summary: "Opus 4.7 gained fast mode at premium pricing via speed: fast and a beta header, with access via waitlist.",
      tags: [
        "fast-mode",
        "opus",
        "research-preview"
      ],
      links: [
        {
          label: "Fast mode",
          url: "https://platform.claude.com/docs/en/build-with-claude/fast-mode"
        }
      ]
    },
    {
      id: "api-claude-platform-on-aws",
      date: "2026-05-11",
      type: "release",
      channel: "API",
      title: "Claude Platform on AWS launches",
      summary: "The Claude API runs on Anthropic-managed infrastructure reachable through AWS, with AWS billing and IAM auth and access to Messages, Files, Batches, Managed Agents, Skills and tools.",
      tags: [
        "aws",
        "platform",
        "launch"
      ],
      links: [
        {
          label: "Claude Platform on AWS",
          url: "https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws"
        }
      ]
    },
    {
      id: "cc-2-1-139-agent-view-goal",
      date: "2026-05-11",
      type: "release",
      channel: "Claude Code",
      title: "Claude Code 2.1.139: agent view and /goal command",
      summary: "Introduces agent view (research preview), one list of every running, blocked or finished session via `claude agents`, plus /goal, which keeps Claude working across turns until a stated completion condition is met.",
      tags: [
        "agents",
        "sessions",
        "autonomy"
      ],
      links: [
        {
          label: "GitHub release v2.1.139",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.139"
        },
        {
          label: "Agent view docs",
          url: "https://code.claude.com/docs/en/agent-view"
        }
      ]
    },
    {
      id: "higher-usage-limits-may-2026",
      date: "2026-05-06",
      type: "patch",
      channel: "News",
      title: "Higher usage limits for Claude Code and the API",
      summary: "New compute, including all of SpaceX's Colossus 1 data center, let Anthropic raise usage limits for Claude Code and the Claude API, with three changes taking effect the same day.",
      tags: [
        "usage-limits",
        "claude-code",
        "api",
        "compute"
      ],
      links: [
        {
          label: "Higher usage limits for Claude and a compute deal with SpaceX",
          url: "https://www.anthropic.com/news/higher-limits-spacex"
        }
      ]
    },
    {
      id: "api-multiagent-outcomes-beta",
      date: "2026-05-06",
      type: "release",
      channel: "API",
      title: "Multiagent orchestration and Outcomes in public beta",
      summary: "Managed Agents multiagent orchestration and Outcomes moved to public beta under the standard managed-agents beta header.",
      tags: [
        "managed-agents",
        "multiagent",
        "beta"
      ],
      links: [
        {
          label: "Multiagent orchestration",
          url: "https://platform.claude.com/docs/en/managed-agents/multiagent-orchestration"
        },
        {
          label: "Outcomes",
          url: "https://platform.claude.com/docs/en/managed-agents/define-outcomes"
        }
      ]
    },
    {
      id: "api-vault-mcp-oauth-refresh",
      date: "2026-05-06",
      type: "patch",
      channel: "API",
      title: "Background refresh for mcp_oauth vault credentials",
      summary: "Managed Agents vaults now refresh mcp_oauth credentials in the background.",
      tags: [
        "managed-agents",
        "vaults",
        "oauth"
      ],
      links: [
        {
          label: "Authenticate with vaults",
          url: "https://platform.claude.com/docs/en/managed-agents/vaults"
        }
      ]
    },
    {
      id: "api-managed-agents-webhooks",
      date: "2026-05-06",
      type: "release",
      channel: "API",
      title: "Webhooks arrive for Managed Agents",
      summary: "Managed Agents gained webhooks, starting with session and vault lifecycle events.",
      tags: [
        "managed-agents",
        "webhooks"
      ],
      links: [
        {
          label: "Subscribe to webhooks",
          url: "https://platform.claude.com/docs/en/managed-agents/webhooks"
        }
      ]
    },
    {
      id: "api-managed-agents-filtering",
      date: "2026-05-06",
      type: "patch",
      channel: "API",
      title: "More filtering and sorting in Managed Agents",
      summary: "Sessions can be filtered by status, and events by type and creation time.",
      tags: [
        "managed-agents",
        "api"
      ],
      links: [
        {
          label: "Session operations",
          url: "https://platform.claude.com/docs/en/managed-agents/session-operations#listing-sessions"
        }
      ]
    },
    {
      id: "api-dreams-preview",
      date: "2026-05-06",
      type: "release",
      channel: "API",
      title: "Dreams research preview for Managed Agents memory",
      summary: "Dreams reorganize a memory store using past session transcripts, merging duplicates, replacing stale entries and surfacing new insights; access is by request.",
      tags: [
        "managed-agents",
        "memory",
        "research-preview"
      ],
      links: [
        {
          label: "Dreams",
          url: "https://platform.claude.com/docs/en/managed-agents/dreams"
        }
      ]
    },
    {
      id: "ghsa-5p5x-5294-qhp3-coworkvmservice-lpe",
      date: "2026-05-06",
      type: "security",
      channel: "Claude",
      title: "Claude Desktop Windows: local privilege escalation in CoworkVMService",
      summary: "High (CVE-2026-44470). The SYSTEM-level CoworkVMService did not reject NTFS directory junctions, so a local user could make it create files in any directory. Fixed in Claude Desktop 1.3834.0.",
      tags: [
        "security",
        "claude-desktop",
        "windows",
        "cowork",
        "high"
      ],
      links: [
        {
          label: "GHSA-5p5x-5294-qhp3",
          url: "https://github.com/anthropics/claude-code/security/advisories/GHSA-5p5x-5294-qhp3"
        }
      ]
    },
    {
      id: "ghsa-3rwf-2g6p-c2f9-desktop-ssh-host-key-bypass",
      date: "2026-05-06",
      type: "security",
      channel: "Claude",
      title: "Claude Desktop SSH remote sessions skipped host key verification",
      summary: "High (CVE-2026-44467). SSH remote development only checked that a host was in known_hosts and never compared its key, which left sessions open to man-in-the-middle attacks. Fixed in Claude Desktop 1.4304.0.",
      tags: [
        "security",
        "claude-desktop",
        "ssh",
        "high"
      ],
      links: [
        {
          label: "GHSA-3rwf-2g6p-c2f9",
          url: "https://github.com/anthropics/claude-code/security/advisories/GHSA-3rwf-2g6p-c2f9"
        }
      ]
    },
    {
      id: "api-workload-identity-federation",
      date: "2026-05-04",
      type: "release",
      channel: "API",
      title: "Workload Identity Federation for the Claude API",
      summary: "Workloads can authenticate with short-lived OIDC tokens from providers like AWS IAM, GitHub Actions, Kubernetes and Okta instead of static API keys.",
      tags: [
        "authentication",
        "security",
        "console"
      ],
      links: [
        {
          label: "Workload Identity Federation",
          url: "https://platform.claude.com/docs/en/manage-claude/workload-identity-federation"
        }
      ]
    },
    {
      id: "cc-2-1-126-managed-sandbox-security-fix",
      date: "2026-05-01",
      type: "security",
      channel: "Claude Code",
      title: "Claude Code 2.1.126: managed sandbox domain/path restrictions fixed",
      summary: "Security fix: admin-enforced allowManagedDomainsOnly and allowManagedReadPathsOnly could be silently ignored when a higher-priority managed settings source had no sandbox block.",
      tags: [
        "security",
        "sandbox",
        "enterprise"
      ],
      links: [
        {
          label: "GitHub release v2.1.126",
          url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.126"
        },
        {
          label: "Changelog",
          url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#21126"
        }
      ]
    }
  ]
};
