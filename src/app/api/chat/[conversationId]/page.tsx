import prisma from "@/app/libs/prisma";

export default async function ConversationPage({ params }) {
    const { conversationId } = params;

    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: true }
    });

    if (!conversation) {
        return <div>Conversation not found</div>;
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Shared Conversation</h2>
            <div className="space-y-2">
                {conversation.messages.map((msg) => (
                    <div key={msg.id} className={msg.role === 'user' ? 'text-blue-600' : 'text-green-600'}>
                        <strong>{msg.role === 'user' ? 'User' : 'Bot'}:</strong> {msg.text}
                    </div>
                ))}
            </div>
        </div>
    );
}
