import { promises as fs } from 'fs';
import path from 'path';
import { Visitor } from '@/lib/types';

const DATA_FILE = '/tmp/shamcha-visitors.json';

let cache: Visitor[] | null = null;
let writeQueue: Promise<void> = Promise.resolve();

function normalizeVisitor(input: Partial<Visitor>): Visitor {
  const id =
    input.id && input.id.trim()
      ? input.id
      : typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  return {
    id,
    name: input.name?.trim() || 'زائر جديد',
    phone: input.phone?.trim() || '',
    email: input.email?.trim() || undefined,
    currentStep: input.currentStep ?? 1,
    registrationData: input.registrationData ?? {},
    createdAt: input.createdAt || new Date().toISOString(),
    status: input.status ?? 'active',
  };
}

async function ensureLoaded(): Promise<Visitor[]> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Visitor[];
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  return cache;
}

async function persist(visitors: Visitor[]): Promise<void> {
  const toWrite = JSON.stringify(visitors);
  writeQueue = writeQueue
    .then(async () => {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, toWrite, 'utf-8');
    })
    .catch(() => {
      // ignore queue errors to avoid breaking future writes
    });
  await writeQueue;
}

export async function listVisitors(): Promise<Visitor[]> {
  const visitors = await ensureLoaded();
  return [...visitors].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createVisitor(input: Partial<Visitor>): Promise<Visitor> {
  const visitors = await ensureLoaded();
  const visitor = normalizeVisitor(input);
  cache = [visitor, ...visitors];
  await persist(cache);
  return visitor;
}

export async function updateVisitor(id: string, patch: Partial<Visitor>): Promise<Visitor | null> {
  const visitors = await ensureLoaded();
  const idx = visitors.findIndex((v) => v.id === id);
  if (idx < 0) return null;

  const current = visitors[idx];
  const updated: Visitor = {
    ...current,
    ...patch,
    id: current.id,
    registrationData: {
      ...current.registrationData,
      ...(patch.registrationData ?? {}),
    },
  };

  const next = [...visitors];
  next[idx] = updated;
  cache = next;
  await persist(next);
  return updated;
}

export async function deleteVisitor(id: string): Promise<boolean> {
  const visitors = await ensureLoaded();
  const next = visitors.filter((v) => v.id !== id);
  if (next.length === visitors.length) return false;
  cache = next;
  await persist(next);
  return true;
}
