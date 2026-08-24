import { describe, it, expect, vi } from 'vitest';
import { POST } from '../app/api/v1/groups/[id]/placeholders/route';
import { NextRequest } from 'next/server';

// Mock the database
vi.mock('@talora/database', () => ({
  db: {
    group: {
      findUnique: vi.fn(),
    },
    groupPlaceholder: {
      create: vi.fn(),
    },
  },
}));

describe('API: /api/v1/groups/[id]/placeholders', () => {
  it('should return 401 if unauthorized', async () => {
    const req = new NextRequest('http://localhost/api/v1/groups/1/placeholders', {
      method: 'POST',
      body: JSON.stringify({ name: 'John Doe' }),
    });
    const res = await POST(req, { params: { id: '1' } });
    expect(res.status).toBe(401);
  });
});
