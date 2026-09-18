import { existsSync, readFileSync, lstatSync } from 'node:fs';
import { join, isAbsolute } from 'node:path';
import { roles } from './profiles.mjs';

// Optional per-role Paseo tool menus.
//
// Absent declaration means absent behaviour: no paseoTools key is written and
// every provider keeps the host's full tool surface, exactly as upstream ships.
// A declaration subtracts; it can never add a tool the host withholds.
//
// Tool names are checked for shape, never for membership in a baked-in list.
// The host's tool inventory changes between Paseo versions, and a stale list
// compiled into this package would reject valid names or silently accept
// retired ones. The host is the authority on which names exist.

export const toolsFileName = 'slp-tools.json';
const toolNamePattern = /^[a-z][a-z0-9_]*$/;
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function checkDeclaration(declaration) {
  if (!record(declaration)) throw new Error('Tool declaration must be an object');
  if (declaration.version !== 1) throw new Error('Unsupported tool declaration version');
  if (!record(declaration.roles)) throw new Error('Tool declaration requires a roles object');
  for (const [role, entry] of Object.entries(declaration.roles)) {
    if (!roles.includes(role)) throw new Error(`Unknown role in tool declaration: ${role}`);
    if (!record(entry)) throw new Error(`Tool declaration for ${role} must be an object`);
    const extra = Object.keys(entry).filter(key => !['enabled', 'disabledTools'].includes(key));
    if (extra.length) throw new Error(`Unknown key in ${role} tool declaration: ${extra[0]}`);
    if (entry.enabled != null && typeof entry.enabled !== 'boolean') throw new Error(`Invalid enabled for ${role}`);
    if (entry.enabled === false && entry.disabledTools != null) throw new Error(`${role} withholds every tool; drop its disabledTools`);
    if (entry.enabled !== false) {
      if (!Array.isArray(entry.disabledTools) || entry.disabledTools.length === 0) throw new Error(`${role} requires a non-empty disabledTools list or enabled:false`);
      if (!entry.disabledTools.every(name => typeof name === 'string' && toolNamePattern.test(name))) throw new Error(`Invalid tool name for ${role}`);
      if (new Set(entry.disabledTools).size !== entry.disabledTools.length) throw new Error(`Duplicate tool name for ${role}`);
    }
  }
  return declaration;
}

// Resolution mirrors the routing catalog: one optional file in the Paseo home.
export function readDeclaration(home) {
  if (!isAbsolute(home)) throw new Error('Absolute Paseo home required');
  const path = join(home, toolsFileName);
  if (!existsSync(path)) return null;
  if (!lstatSync(path).isFile()) throw new Error('Tool declaration must be a regular file');
  return { path, declaration: checkDeclaration(JSON.parse(readFileSync(path, 'utf8'))) };
}

// The value Paseo stores on a provider entry, or undefined to write no key.
export function toolsForRole(declaration, role) {
  const entry = declaration?.roles?.[role];
  if (!entry) return undefined;
  if (entry.enabled === false) return { enabled: false, disabledTools: [] };
  return { enabled: true, disabledTools: [...entry.disabledTools] };
}
