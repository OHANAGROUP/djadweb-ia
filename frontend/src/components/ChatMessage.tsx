'use client';

type Props = {
  message: {
    role: string;
    content: string;
  };
};

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) return null;

  return (
    <div
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        background: isUser ? '#E65100' : '#fff',
        color: isUser ? '#fff' : '#1a1a1a',
        borderRadius: isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
        padding: '10px 14px',
        fontSize: '13px',
        lineHeight: '1.5',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        whiteSpace: 'pre-wrap'
      }}
    >
      {message.content}
    </div>
  );
}
