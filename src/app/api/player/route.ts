import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Получить или создать игрока
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, username, firstName, lastName, photoUrl } = body;

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID is required' },
        { status: 400 }
      );
    }

    // Ищем существующего игрока
    let player = await db.player.findUnique({
      where: { telegramId },
    });

    // Если игрок не найден - создаем нового
    if (!player) {
      player = await db.player.create({
        data: {
          telegramId,
          username: username || null,
          firstName: firstName || null,
          lastName: lastName || null,
          photoUrl: photoUrl || null,
        },
      });
    } else {
      // Обновляем данные игрока
      player = await db.player.update({
        where: { telegramId },
        data: {
          username: username || player.username,
          firstName: firstName || player.firstName,
          lastName: lastName || player.lastName,
          photoUrl: photoUrl || player.photoUrl,
        },
      });
    }

    return NextResponse.json({ player });
  } catch (error) {
    console.error('Error in player API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Получить данные игрока
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID is required' },
        { status: 400 }
      );
    }

    const player = await db.player.findUnique({
      where: { telegramId },
    });

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ player });
  } catch (error) {
    console.error('Error in player API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Обновить данные игрока
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, nectar, totalNectar, level, medBalance } = body;

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID is required' },
        { status: 400 }
      );
    }

    const player = await db.player.update({
      where: { telegramId },
      data: {
        ...(nectar !== undefined && { nectar }),
        ...(totalNectar !== undefined && { totalNectar }),
        ...(level !== undefined && { level }),
        ...(medBalance !== undefined && { medBalance }),
      },
    });

    return NextResponse.json({ player });
  } catch (error) {
    console.error('Error in player API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
