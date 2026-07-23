export type ConnectMode = "builtin" | "guided_key" | "oauth" | "local_docker";

export type ServiceId =
  | "openrouter"
  | "context7"
  | "linear"
  | "notion"
  | "resend"
  | "supabase"
  | "n8n";

export interface EnvField {
  key: string;
  label: string;
  required: boolean;
  placeholder?: string;
  secret?: boolean;
}

export interface McpServerConfig {
  command: string;
  args: string[];
  envKeys: string[];
  transport?: "stdio" | "sse";
}

export interface ServiceDefinition {
  id: ServiceId;
  name: string;
  purpose: string;
  /** Always included in every workspace */
  alwaysActive: boolean;
  /** Shown in multi-select (false for context7) */
  selectable: boolean;
  required: boolean;
  connectMode: ConnectMode;
  /** OAuth available; if app credentials missing, fall back to guided_key */
  oauthProvider?: "linear" | "notion";
  signupUrl?: string;
  apiKeyUrl?: string;
  instructions: string[];
  envFields: EnvField[];
  mcp?: McpServerConfig;
  skillTags: string[];
}

export const SERVICES: ServiceDefinition[] = [
  {
    id: "openrouter",
    name: "OpenRouter",
    purpose: "AI model routing with free tier (openrouter/free)",
    alwaysActive: true,
    selectable: true,
    required: true,
    connectMode: "guided_key",
    signupUrl: "https://openrouter.ai/signup",
    apiKeyUrl: "https://openrouter.ai/settings/keys",
    instructions: [
      "Create an account at openrouter.ai",
      "Open Settings → Keys and create an API key",
      "Paste the key below",
    ],
    envFields: [
      {
        key: "OPENROUTER_API_KEY",
        label: "API Key",
        required: true,
        placeholder: "sk-or-...",
        secret: true,
      },
    ],
    mcp: {
      command: "npx",
      args: ["-y", "@openrouter/mcp-server"],
      envKeys: ["OPENROUTER_API_KEY"],
    },
    skillTags: ["openrouter"],
  },
  {
    id: "context7",
    name: "Context7",
    purpose: "Library documentation lookup (built-in, no credentials)",
    alwaysActive: true,
    selectable: false,
    required: true,
    connectMode: "builtin",
    instructions: ["Context7 is included automatically. No setup required."],
    envFields: [],
    skillTags: [],
  },
  {
    id: "linear",
    name: "Linear",
    purpose: "Project management, issues, and sprints",
    alwaysActive: false,
    selectable: true,
    required: false,
    connectMode: "oauth",
    oauthProvider: "linear",
    signupUrl: "https://linear.app/signup",
    apiKeyUrl: "https://linear.app/settings/account/security/api-keys-and-webhooks",
    instructions: [
      "Prefer Connect with Linear (OAuth) if configured",
      "Or create a Personal API key in Linear Settings → API",
      "Paste the API key below as a fallback",
    ],
    envFields: [
      {
        key: "LINEAR_API_KEY",
        label: "API Key / Access Token",
        required: true,
        placeholder: "lin_api_...",
        secret: true,
      },
    ],
    mcp: {
      command: "npx",
      args: ["-y", "@linear-app/mcp-server"],
      envKeys: ["LINEAR_API_KEY"],
    },
    skillTags: ["linear"],
  },
  {
    id: "notion",
    name: "Notion",
    purpose: "Documentation, wikis, and knowledge base",
    alwaysActive: false,
    selectable: true,
    required: false,
    connectMode: "oauth",
    oauthProvider: "notion",
    signupUrl: "https://www.notion.so/signup",
    apiKeyUrl: "https://www.notion.so/my-integrations",
    instructions: [
      "Prefer Connect with Notion (OAuth) if configured",
      "Or create an Internal Integration at notion.so/my-integrations",
      "Copy the secret, then share relevant pages with the integration",
      "Paste the integration secret below as a fallback",
    ],
    envFields: [
      {
        key: "NOTION_API_KEY",
        label: "Integration Secret / OAuth Token",
        required: true,
        placeholder: "ntn_... or secret_...",
        secret: true,
      },
      {
        key: "NOTION_INTEGRATION_TYPE",
        label: "Integration Type",
        required: true,
        placeholder: "Internal",
        secret: false,
      },
    ],
    mcp: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/notion"],
      envKeys: ["NOTION_API_KEY", "NOTION_INTEGRATION_TYPE"],
    },
    skillTags: ["notion"],
  },
  {
    id: "resend",
    name: "Resend",
    purpose: "Transactional email and templates",
    alwaysActive: false,
    selectable: true,
    required: false,
    connectMode: "guided_key",
    signupUrl: "https://resend.com/signup",
    apiKeyUrl: "https://resend.com/api-keys",
    instructions: [
      "Create an account at resend.com",
      "Open API Keys and create a key",
      "Paste the key below",
    ],
    envFields: [
      {
        key: "RESEND_API_KEY",
        label: "API Key",
        required: true,
        placeholder: "re_...",
        secret: true,
      },
    ],
    mcp: {
      command: "npx",
      args: ["-y", "resend-mcp"],
      envKeys: ["RESEND_API_KEY"],
    },
    skillTags: ["resend"],
  },
  {
    id: "supabase",
    name: "Supabase",
    purpose: "PostgreSQL database, auth, and storage",
    alwaysActive: false,
    selectable: true,
    required: false,
    connectMode: "guided_key",
    signupUrl: "https://supabase.com/dashboard/sign_up",
    apiKeyUrl: "https://supabase.com/dashboard/account/tokens",
    instructions: [
      "Create a Supabase account and a project",
      "Create a Personal Access Token (Settings → Access Tokens)",
      "Copy your project reference from the project URL",
      "Optionally paste URL and anon/service keys from Project Settings → API",
    ],
    envFields: [
      {
        key: "SUPABASE_ACCESS_TOKEN",
        label: "Access Token",
        required: true,
        secret: true,
      },
      {
        key: "SUPABASE_PROJECT_REF",
        label: "Project Ref",
        required: true,
        placeholder: "abcdefghijklmnop",
        secret: false,
      },
      {
        key: "SUPABASE_URL",
        label: "Project URL (optional)",
        required: false,
        placeholder: "https://xxxx.supabase.co",
        secret: false,
      },
      {
        key: "SUPABASE_ANON_KEY",
        label: "Anon Key (optional)",
        required: false,
        secret: true,
      },
      {
        key: "SUPABASE_SERVICE_ROLE_KEY",
        label: "Service Role Key (optional)",
        required: false,
        secret: true,
      },
    ],
    mcp: {
      command: "npx",
      args: ["-y", "@supabase/mcp"],
      envKeys: ["SUPABASE_ACCESS_TOKEN", "SUPABASE_PROJECT_REF"],
    },
    skillTags: ["supabase"],
  },
  {
    id: "n8n",
    name: "n8n",
    purpose: "Workflow automation (local Docker)",
    alwaysActive: false,
    selectable: true,
    required: false,
    connectMode: "local_docker",
    instructions: [
      "Start local n8n: docker compose --profile n8n up -d",
      "Open http://localhost:5678 and complete first-time setup",
      "Create an API key in n8n Settings → API",
      "Paste the base URL and API key below",
    ],
    envFields: [
      {
        key: "N8N_BASE_URL",
        label: "Base URL",
        required: true,
        placeholder: "http://localhost:5678",
        secret: false,
      },
      {
        key: "N8N_API_KEY",
        label: "API Key",
        required: true,
        secret: true,
      },
    ],
    mcp: {
      command: "npx",
      args: ["-y", "n8n-mcp"],
      envKeys: ["N8N_BASE_URL", "N8N_API_KEY"],
      transport: "sse",
    },
    skillTags: ["n8n"],
  },
];

export const SERVICE_BY_ID: Record<ServiceId, ServiceDefinition> = Object.fromEntries(
  SERVICES.map((s) => [s.id, s]),
) as Record<ServiceId, ServiceDefinition>;

export function getSelectableServices(): ServiceDefinition[] {
  return SERVICES.filter((s) => s.selectable);
}

export function getRequiredServiceIds(): ServiceId[] {
  return SERVICES.filter((s) => s.required).map((s) => s.id);
}

export function resolveConnectMode(
  service: ServiceDefinition,
  oauthConfigured: { linear: boolean; notion: boolean },
): ConnectMode {
  if (service.connectMode !== "oauth" || !service.oauthProvider) {
    return service.connectMode;
  }
  return oauthConfigured[service.oauthProvider] ? "oauth" : "guided_key";
}
