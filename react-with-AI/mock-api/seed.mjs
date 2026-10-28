// Generates mock-api/db.json — the "database" json-server reads and writes.
//
//   node mock-api/seed.mjs              -> always (re)creates db.json from scratch
//   node mock-api/seed.mjs --if-missing -> only creates it if it doesn't exist yet
//
// Why a script instead of a hand-written db.json?
//  1. Passwords must be stored as bcrypt hashes (json-server-auth compares hashes on login).
//  2. Due dates are relative to *today*, so there are always overdue and upcoming tasks.
import { existsSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'

const dbPath = fileURLToPath(new URL('./db.json', import.meta.url))

if (process.argv.includes('--if-missing') && existsSync(dbPath)) {
  process.exit(0)
}

// Test credentials (also listed in the README). Only hashes end up in db.json.
const users = [
  { id: 1, name: 'Aisha Admin', email: 'admin@taskflow.dev', password: 'Admin@123', role: 'admin' },
  { id: 2, name: 'Mohan Member', email: 'mohan@taskflow.dev', password: 'Member@123', role: 'member' },
  { id: 3, name: 'Priya Member', email: 'priya@taskflow.dev', password: 'Member@123', role: 'member' },
].map((user) => ({ ...user, password: bcrypt.hashSync(user.password, 10) }))

const projects = [
  { id: 1, name: 'Website Redesign', description: 'New marketing site with refreshed branding.' },
  { id: 2, name: 'Mobile App', description: 'First release of the iOS and Android app.' },
  { id: 3, name: 'Internal Tools', description: 'Dashboards and scripts for the support team.' },
  { id: 4, name: 'Q4 Planning', description: 'Roadmap and hiring plan for next quarter.' },
]

// "YYYY-MM-DD" for today + offset days (negative = in the past)
const day = (offset) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

// [projectId, title, status, priority, assigneeId | null, dueInDays]
const taskRows = [
  [1, 'Audit current site pages', 'done', 'medium', 2, -10],
  [1, 'Create wireframes for home page', 'done', 'high', 3, -6],
  [1, 'Design new colour palette', 'in_progress', 'medium', 3, -2],
  [1, 'Write copy for About page', 'todo', 'low', 2, 5],
  [1, 'Set up analytics tracking', 'todo', 'high', null, -1],
  [1, 'Optimise hero images', 'in_progress', 'low', 2, 3],
  [1, 'Accessibility review', 'todo', 'high', 3, 12],
  [2, 'Define app navigation', 'done', 'high', 2, -15],
  [2, 'Build login screen', 'in_progress', 'high', 2, -3],
  [2, 'Push notification spike', 'todo', 'medium', 3, 7],
  [2, 'App store screenshots', 'todo', 'low', null, 20],
  [2, 'Fix crash on Android 12', 'in_progress', 'high', 3, 1],
  [2, 'Offline mode research', 'todo', 'medium', 2, -4],
  [3, 'Ticket volume dashboard', 'done', 'medium', 3, -8],
  [3, 'Automate weekly report', 'todo', 'medium', 2, 2],
  [3, 'Clean up old scripts', 'todo', 'low', null, 30],
  [3, 'Add SSO to admin panel', 'in_progress', 'high', 3, -5],
  [3, 'Document on-call process', 'done', 'low', 2, -20],
]

const tasks = taskRows.map(([projectId, title, status, priority, assigneeId, dueInDays], i) => ({
  id: i + 1,
  projectId,
  title,
  description: `${title}. Seeded task for the TaskFlow POC.`,
  status,
  priority,
  assigneeId,
  dueDate: day(dueInDays),
  createdAt: new Date(Date.now() - (30 - i) * 86_400_000).toISOString(),
}))

// Project 4 intentionally has no tasks -> useful for checking the empty state.
writeFileSync(dbPath, JSON.stringify({ users, projects, tasks }, null, 2) + '\n')
console.log(`Seeded ${dbPath}: ${users.length} users, ${projects.length} projects, ${tasks.length} tasks`)
