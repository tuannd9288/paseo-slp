import { readFileSync } from 'node:fs';
// Only instruction-bearing requests change. Host lifecycle and permissions pass through.
export function piRoleArgs(args, instruction) {
  // Pi accepts repeated append flags, preserving host prompt sources and extensions.
  // Insert before -- so the policy cannot become a positional user message.
  const end = args.indexOf('--');
  const options = end < 0 ? args : args.slice(0, end);
  if (options.some(arg => ['--help', '-h', '--version', '-v'].includes(arg))) return [...args];
  const index = end < 0 ? args.length : end;
  return [...args.slice(0, index), '--append-system-prompt', instruction, ...args.slice(index)];
}

// Claude keeps only the LAST --append-system-prompt and refuses that flag
// alongside --append-system-prompt-file ("use only one"), so the role must be
// merged into whatever prompt the host already supplies. A second flag would
// silently discard the host's own instructions.
export function claudeRoleArgs(args, instruction) {
  // Insert before -- so the policy cannot become a positional user message.
  const end = args.indexOf('--');
  const options = end < 0 ? args : args.slice(0, end);
  if (options.some(arg => ['--help', '-h', '--version', '-v'].includes(arg))) return [...args];
  const index = end < 0 ? args.length : end;
  const head = args.slice(0, index), tail = args.slice(index);
  const merge = value => typeof value === 'string' && value.includes(instruction)
    ? value : [value, instruction].filter(Boolean).join('\n\n');
  const names = ['--append-system-prompt', '--append-system-prompt-file'];
  const at = head.findIndex(arg => names.includes(arg) || names.some(name => arg.startsWith(`${name}=`)));
  if (at < 0) return [...head, '--append-system-prompt', instruction, ...tail];
  const inline = head[at].includes('=');
  const name = inline ? head[at].slice(0, head[at].indexOf('=')) : head[at];
  const value = inline ? head[at].slice(head[at].indexOf('=') + 1) : head[at + 1];
  if (typeof value !== 'string') throw new Error(`${name} requires a value`);
  // The file form is folded into the string form: the two cannot coexist.
  const existing = name === '--append-system-prompt-file' ? readFileSync(value, 'utf8') : value;
  const rest = head.slice(at + (inline ? 1 : 2));
  return [...head.slice(0, at), '--append-system-prompt', merge(existing), ...rest, ...tail];
}

export function injectRole(message, instruction) {
  if (!['thread/start', 'thread/resume', 'turn/start'].includes(message?.method)) return message;
  const result = structuredClone(message);
  const params = result.params ??= {};
  const append = value => typeof value === 'string' && value.includes(instruction)
    ? value : [value, instruction].filter(Boolean).join('\n\n');
  // Current Codex keeps instructions on the thread; older hosts also send turn overrides.
  if (message.method !== 'turn/start' || Object.hasOwn(params, 'developerInstructions')) {
    params.developerInstructions = append(params.developerInstructions);
  }
  if (params.collaborationMode?.settings) {
    params.collaborationMode.settings.developer_instructions = append(params.collaborationMode.settings.developer_instructions);
  }
  return result;
}

// The Claude Agent SDK sends its system prompt inside the stdin `initialize`
// control request, not on the command line, so a wrapper that only rewrote argv
// would deliver no role at all in protocol mode. Merge, never replace: the host
// puts its own instructions in the same field.
export function injectClaudeRole(message, instruction) {
  if (message?.type !== 'control_request' || message.request?.subtype !== 'initialize') return message;
  const result = structuredClone(message);
  const request = result.request;
  const value = request.appendSystemPrompt;
  request.appendSystemPrompt = typeof value === 'string' && value.includes(instruction)
    ? value : [value, instruction].filter(Boolean).join('\n\n');
  return result;
}

// Generic ACP has no system-instruction channel; the role policy leads the
// first session/prompt of each session as a text block. `seen` tracks injected
// sessionIds; loading/resuming/forking a session re-arms its next prompt.
export function acpRolePrompt(message, instruction, seen) {
  const sessionId = message?.params?.sessionId;
  if (['session/load', 'session/resume', 'session/fork'].includes(message?.method)) {
    if (typeof sessionId === 'string') seen.delete(sessionId);
    return message;
  }
  if (message?.method !== 'session/prompt') return message;
  if (typeof sessionId !== 'string' || !Array.isArray(message.params.prompt)) throw new Error('Malformed session/prompt');
  if (seen.has(sessionId)) return message;
  seen.add(sessionId);
  const result = structuredClone(message);
  result.params.prompt = [{ type: 'text', text: instruction }, ...result.params.prompt];
  return result;
}
