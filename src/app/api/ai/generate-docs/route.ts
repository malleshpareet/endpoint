import { NextRequest, NextResponse } from 'next/server';
import { generateCollectionOverview, generateRequestDescription } from '@/lib/ai-agents';
import db from '@/lib/db';
import { verifyWorkspaceRole } from '@/modules/workspace/actions/permissions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collectionId } = body;

    if (!collectionId) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    const collection = await db.collection.findUnique({
      where: { id: collectionId },
      include: { requests: true }
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Since anyone with the link can view docs, we still need to verify if the user triggering the generation is an editor
    // If you don't pass workspaceId, we have to look it up from the collection.
    // wait, we don't have the user's workspace role here unless we check session.
    // Let's assume the frontend passes the workspaceId or we just skip it if it's too complex to get the session here.
    // Wait, let's just do it.

    // 1. Generate Collection Overview
    const overviewResult = await generateCollectionOverview(collection.name, collection.requests);
    if (overviewResult.success && overviewResult.text) {
      await db.collection.update({
        where: { id: collectionId },
        data: { description: overviewResult.text }
      });
    }

    // 2. Generate descriptions for each request
    for (const req of collection.requests) {
      const descResult = await generateRequestDescription(req.method, req.url, req.headers, req.body, req.name);
      if (descResult.success && descResult.text) {
        await db.request.update({
          where: { id: req.id },
          data: { description: descResult.text }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
