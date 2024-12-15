// For example, in /api/chat/send

import  prisma  from "@/app/libs/prisma";
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { conversationId, role, text } = await req.json();

  const updatedConversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      messages: {
        create: {
          role,
          text,
        }
      }
    },
    include: {
      messages: true
    }
  });

  return NextResponse.json(updatedConversation);
}
