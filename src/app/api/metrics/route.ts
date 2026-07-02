import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const memoryUsage = process.memoryUsage();
    
    // Convert heapUsed to MB
    const memoryMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
    const uptimeSeconds = process.uptime();
    
    return NextResponse.json({
      memoryMB,
      health: "Healthy",
      uptimeSeconds,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch metrics", health: "Unhealthy" }, { status: 500 });
  }
}
