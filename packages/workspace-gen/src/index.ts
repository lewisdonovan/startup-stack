import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import archiver from "archiver";
import {
  SERVICE_BY_ID,
  type ServiceId,
  type ServiceDefinition,
} from "@startup-stack/catalog";

export interface WorkspaceGenInput {
  slug: string;
  companyName: string;
  userName: string;
  serviceIds: ServiceId[];
  /** Decrypted env map — only held in memory for this request */
  secrets: Record<string, string>;
  skillsRoot: string;
  verifyMcpScriptPath: string;
}

export interface GeneratedFile {
  path: string;
  content: string | Buffer;
}

function normalizeSelection(serviceIds: ServiceId[]): ServiceId[] {
  const set = new Set<ServiceId>(serviceIds);
  set.add("openrouter");
  set.add("context7");
  return [...set];
}

function selectedDefinitions(ids: ServiceId[]): ServiceDefinition[] {
  return ids.map((id) => SERVICE_BY_ID[id]).filter(Boolean);
}

export function buildMcpJson(
  serviceIds: ServiceId[],
  secrets: Record<string, string>,
  fillValues: boolean,
): Record<string, unknown> {
  const ids = normalizeSelection(serviceIds);
  const mcpServers: Record<string, unknown> = {};

  for (const def of selectedDefinitions(ids)) {
    if (!def.mcp) continue;
    const env: Record<string, string> = {};
    for (const key of def.mcp.envKeys) {
      env[key] = fillValues && secrets[key] ? secrets[key] : `<${key}>`;
    }
    const entry: Record<string, unknown> = {
      command: def.mcp.command,
      args: def.mcp.args,
      env,
    };
    if (def.mcp.transport && def.mcp.transport !== "stdio") {
      entry.transport = def.mcp.transport;
    }
    mcpServers[def.id] = entry;
  }

  return { mcpServers };
}

export function buildEnvFile(
  serviceIds: ServiceId[],
  secrets: Record<string, string>,
  fillValues: boolean,
): string {
  const ids = normalizeSelection(serviceIds);
  const lines: string[] = [
    "# Startup Stack — generated environment",
    "# Never commit this file if it contains real secrets.",
    "",
  ];

  const seen = new Set<string>();
  for (const def of selectedDefinitions(ids)) {
    if (def.envFields.length === 0) continue;
    lines.push(`# ── ${def.name} ──────────────────────────────────────────`);
    for (const field of def.envFields) {
      if (seen.has(field.key)) continue;
      seen.add(field.key);
      const value = fillValues ? (secrets[field.key] ?? "") : "";
      lines.push(`${field.key}=${value}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function parseFrontmatterTags(content: string): string[] | null {
  if (!content.startsWith("---")) return null;
  const end = content.indexOf("---", 3);
  if (end === -1) return null;
  const fm = content.slice(3, end);
  const tagsMatch = fm.match(/tags:\s*\[([^\]]*)\]/);
  if (!tagsMatch) {
    // bootstrap / skills without tags
    if (/name:\s*Bootstrap/i.test(fm)) return null;
    return [];
  }
  return tagsMatch[1]
    .split(",")
    .map((t) => t.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

export async function filterSkillFiles(
  skillsRoot: string,
  serviceIds: ServiceId[],
): Promise<Array<{ relativePath: string; content: string }>> {
  const ids = normalizeSelection(serviceIds);
  const tagSet = new Set(
    selectedDefinitions(ids).flatMap((s) => s.skillTags),
  );
  // context7 has no skill tag; openrouter always present
  tagSet.add("openrouter");

  const results: Array<{ relativePath: string; content: string }> = [];

  async function walk(dir: string, relBase: string) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      const rel = path.join(relBase, entry.name);
      if (entry.isDirectory()) {
        await walk(abs, rel);
        continue;
      }
      if (!entry.name.endsWith(".md")) continue;
      const content = await readFile(abs, "utf8");
      const tags = parseFrontmatterTags(content);
      if (tags === null) continue; // skip bootstrap / untagged meta
      if (tags.length === 0) continue;
      // Cross-platform: all tags must be in selection
      // Special-case: notion-notify-via-email needs n8n as well if path contains it
      const required = [...tags];
      if (rel.includes("notion-notify-via-email") && !required.includes("n8n")) {
        required.push("n8n");
      }
      if (required.every((t) => tagSet.has(t))) {
        results.push({ relativePath: rel, content });
      }
    }
  }

  await walk(skillsRoot, "");
  return results;
}

export function buildClaudeMd(
  serviceIds: ServiceId[],
  skillPaths: string[],
): string {
  const ids = normalizeSelection(serviceIds);
  const defs = selectedDefinitions(ids).filter((d) => d.id !== "context7" || true);

  const active = defs
    .map((d) => `- ${d.name} — ${d.purpose}`)
    .join("\n");

  const mcpList = defs
    .filter((d) => d.mcp)
    .map((d) => `- ${d.name} (\`${d.mcp!.args[d.mcp!.args.length - 1] ?? d.id}\`)`)
    .join("\n");

  const skillsList =
    skillPaths.length > 0
      ? skillPaths.map((p) => `- [${p}](skills/${p})`).join("\n")
      : "- (none)";

  return `# CLAUDE.md — Startup Stack Agent Instructions

You are the operations agent for a startup that has been bootstrapped with the Startup Stack. You have access to MCP servers connected to the business's selected SaaS tools, and you have skills loaded for common cross-platform workflows.

## Your Role

You are the central nervous system of this startup. Use MCP servers for service-specific operations and skills from \`skills/\` for multi-step workflows.

## Active Services

${active}

### MCP Servers
${mcpList || "- (none)"}

## Configuration Files

- \`.mcp.json\` — MCP server configurations
- \`.env\` — API keys and secrets (never commit)
- \`.env.example\` — Template showing required variables
- \`skills/\` — Platform-tagged workflow skills

## Operating Principles

1. Always verify connectivity before acting (\`bash scripts/verify-mcp.sh\`)
2. Never print API keys or secrets
3. Prefer idempotent creates (check before creating)
4. Use skills when a workflow matches; otherwise improvise with MCP tools

## Available Skills

${skillsList}

## Getting Help

If stuck: check skill files, verify credentials in \`.env\`, and ask the user for clarification.
`;
}

/** Export-safe sync script: no git required (folder may not be a repo). */
export function buildSyncSkillsScript(): string {
  return `#!/usr/bin/env bash
# sync-skills.sh — Copies skills/ into harness-specific skill folders.
# Safe to run without initializing git.
# Usage: bash scripts/sync-skills.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SKILLS="$REPO_ROOT/skills"

if [ ! -d "$SKILLS" ]; then
  echo "error: skills/ not found at $SKILLS" >&2
  exit 1
fi

HARNESSES=(
  ".claude/skills"
  ".cursor/skills"
  ".gemini/skills"
  ".agent/skills"
  ".agents/skills"
)

echo "Syncing skills to harness-specific folders."
echo ""

for harness in "\${HARNESSES[@]}"; do
  target="$REPO_ROOT/$harness"
  mkdir -p "$(dirname "$target")"
  rm -rf "$target"
  cp -r "$SKILLS" "$target"
  echo "✓ $harness"
done

echo ""
echo "Done. Skills are in harness-specific folders."
`;
}

export function buildWorkspaceReadme(companyName: string): string {
  return `# ${companyName} — Startup Stack Workspace

This folder is a plug-and-play agentic workspace. Open it in Claude Code, Cursor, Gemini CLI, or any MCP-capable harness.

## Quick start

1. Ensure Node.js 20+ is installed (MCP servers use \`npx\`).
2. Confirm \`.env\` has your API keys (already filled if you downloaded via Startup Stack).
3. Sync skills into harness folders (required so Claude Code / Cursor / Gemini pick them up):

\`\`\`bash
bash scripts/sync-skills.sh
\`\`\`

4. Open this directory in your harness.
5. Run \`bash scripts/verify-mcp.sh\` to check connectivity.

## What's included

- \`.mcp.json\` — MCP server configs for your selected services
- \`.env\` / \`.env.example\` — Credentials
- \`CLAUDE.md\` — Agent system prompt
- \`skills/\` — Workflow skills for your stack
- \`scripts/sync-skills.sh\` — Copies \`skills/\` into \`.claude\`, \`.cursor\`, \`.gemini\`, \`.agent\`, and \`.agents\` (no git required)
- \`scripts/verify-mcp.sh\` — Connectivity checks

## Security

Do not commit \`.env\`. Rotate any keys that may have been exposed.
`;
}

export async function buildWorkspaceFiles(
  input: WorkspaceGenInput,
): Promise<GeneratedFile[]> {
  const ids = normalizeSelection(input.serviceIds);
  const skills = await filterSkillFiles(input.skillsRoot, ids);
  const skillPaths = skills.map((s) => s.relativePath.replace(/\\/g, "/"));

  let verifyScript = "";
  try {
    verifyScript = await readFile(input.verifyMcpScriptPath, "utf8");
  } catch {
    verifyScript = "#!/usr/bin/env bash\necho \"verify-mcp.sh placeholder\"\n";
  }

  const files: GeneratedFile[] = [
    {
      path: ".mcp.json",
      content: JSON.stringify(buildMcpJson(ids, input.secrets, true), null, 2) + "\n",
    },
    {
      path: ".env",
      content: buildEnvFile(ids, input.secrets, true),
    },
    {
      path: ".env.example",
      content: buildEnvFile(ids, input.secrets, false),
    },
    {
      path: "CLAUDE.md",
      content: buildClaudeMd(ids, skillPaths),
    },
    {
      path: "README.md",
      content: buildWorkspaceReadme(input.companyName || "Startup"),
    },
    {
      path: "scripts/verify-mcp.sh",
      content: verifyScript,
    },
    {
      path: "scripts/sync-skills.sh",
      content: buildSyncSkillsScript(),
    },
  ];

  for (const skill of skills) {
    files.push({
      path: `skills/${skill.relativePath.replace(/\\/g, "/")}`,
      content: skill.content,
    });
  }

  return files;
}

/** Build a zip Buffer in memory (never writes secrets to disk). */
export async function buildWorkspaceZip(input: WorkspaceGenInput): Promise<Buffer> {
  const files = await buildWorkspaceFiles(input);
  const root = `startup-stack-${input.slug}`;

  return new Promise((resolve, reject) => {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    archive.on("data", (chunk: Buffer) => chunks.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);

    for (const file of files) {
      archive.append(file.content, { name: `${root}/${file.path}` });
    }

    void archive.finalize();
  });
}

/** Dev helper: write generated workspace to a directory (without .env fill). */
export async function writeWorkspaceToDir(
  input: WorkspaceGenInput,
  outDir: string,
  includeFilledEnv: boolean,
): Promise<void> {
  const files = await buildWorkspaceFiles(input);
  await mkdir(outDir, { recursive: true });
  for (const file of files) {
    if (!includeFilledEnv && file.path === ".env") continue;
    const dest = path.join(outDir, file.path);
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, file.content);
  }
}
