import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('query')?.toLowerCase() || searchParams.get('search')?.toLowerCase() || '';
  const specialty = searchParams.get('specialty') || '';

  try {
    let whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (specialty && specialty !== 'All Specialties' && specialty !== 'All') {
      whereClause.specialty = specialty;
    }

    const guidelines = await prisma.guideline.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        specialty: true,
        version: true,
        description: true,
        // Exclude huge content array for the list view to save bandwidth
      },
      orderBy: {
        title: 'asc'
      }
    });

    return NextResponse.json(guidelines);
  } catch (error) {
    console.error("Failed to fetch guidelines from DB", error);
    return NextResponse.json([], { status: 500 });
  }
}
