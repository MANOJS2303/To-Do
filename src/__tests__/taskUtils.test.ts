import { describe, it, expect } from 'vitest'
import { formatDeadline, generateShareLink, parseSharedTask } from '../utils/taskUtils'
import { Task } from '../types'

const mockTask: Task = {
  id: 'test-123',
  title: 'Test Task 🚀',
  description: 'A test task',
  color: '#7C3AED',
  priority: 'medium',
  completed: false,
  pinned: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe('formatDeadline', () => {
  it('marks past deadlines as overdue', () => {
    const past = new Date(Date.now() - 2 * 86400000).toISOString()
    const result = formatDeadline(past)
    expect(result.overdue).toBe(true)
    expect(result.urgent).toBe(true)
  })

  it('marks near deadlines as urgent', () => {
    const soon = new Date(Date.now() + 2 * 86400000).toISOString()
    const result = formatDeadline(soon)
    expect(result.urgent).toBe(true)
    expect(result.overdue).toBe(false)
  })

  it('marks distant deadlines as not urgent', () => {
    const far = new Date(Date.now() + 10 * 86400000).toISOString()
    const result = formatDeadline(far)
    expect(result.urgent).toBe(false)
  })
})

describe('share link round-trip', () => {
  it('encodes and decodes a task correctly', () => {
    const link = generateShareLink(mockTask)
    const url = new URL(link)
    const parsed = parseSharedTask(url.search)
    expect(parsed).not.toBeNull()
    expect(parsed!.id).toBe(mockTask.id)
    expect(parsed!.title).toBe(mockTask.title)
  })

  it('returns null for missing param', () => {
    expect(parseSharedTask('?foo=bar')).toBeNull()
  })

  it('returns null for corrupted data', () => {
    expect(parseSharedTask('?task=!!!notbase64')).toBeNull()
  })
})
