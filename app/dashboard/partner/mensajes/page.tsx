// LIVINNING - Mensajes del Partner

'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { OnlineStatus } from '@/components/ui/online-status';

interface Message {
  id: string;
  message: string;
  sentByAdmin: boolean;
  senderName: string;
  senderId: string;
  createdAt: number;
  read: boolean;
}

export default function PartnerMessagesPage() {
  const { user: clerkUser } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [conversationClosed, setConversationClosed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendAudioRef = useRef<HTMLAudioElement | null>(null);
  const notifyAudioRef = useRef<HTMLAudioElement | null>(null);
  const prevMessageCountRef = useRef<number>(0);

  useEffect(() => {
    sendAudioRef.current = new Audio('/sound/sended.mp3');
    notifyAudioRef.current = new Audio('/sound/notify.mp3');
  }, []);

  useEffect(() => {
    const updateActivity = async () => {
      try {
        await fetch('/api/user/activity', { method: 'POST' });
      } catch (error) {
        console.log('Error updating activity:', error);
      }
    };

    updateActivity();
    const interval = setInterval(updateActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      const currentCount = messages.length;

      if (currentCount > prevMessageCountRef.current && prevMessageCountRef.current > 0) {
        const lastMessage = messages[currentCount - 1];
        if (lastMessage.sentByAdmin) {
          notifyAudioRef.current?.play().catch(e => console.log('Audio play failed:', e));
        }
      }

      prevMessageCountRef.current = currentCount;
      setTimeout(scrollToBottom, 100);
    }
  }, [messages]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      if (isLoading) setIsLoading(true);

      const response = await fetch('/api/partner/messages');
      const data = await response.json();

      if (data.success) {
        setMessages(data.data.messages);
        setConversationClosed(data.data.conversationClosed || false);
      } else {
        if (isLoading) {
          toast.error('Error al cargar mensajes');
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (isLoading) {
        toast.error('Error al cargar mensajes');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Escribe un mensaje');
      return;
    }

    setSendingMessage(true);
    try {
      const response = await fetch('/api/partner/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (data.success) {
        sendAudioRef.current?.play().catch(e => console.log('Audio play failed:', e));
        toast.success('Mensaje enviado');
        setMessage('');
        setTimeout(() => {
          fetchMessages();
          setTimeout(scrollToBottom, 200);
        }, 100);
      } else {
        toast.error(data.error?.message || 'Error al enviar mensaje');
      }
    } catch (error) {
      toast.error('Error al enviar mensaje');
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-200px)]">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <MessageSquare className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Mensajes
            </h1>
            <p className="text-neutral-600 mt-1">
              Conversacion con el equipo de soporte
            </p>
          </div>
        </div>
      </div>

      <Card className="flex flex-col h-full">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle>Chat de Soporte</CardTitle>
              </div>
              <CardDescription>
                Comunicacion directa con el equipo administrativo
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMessages}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Actualizar'
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-3">
          {isLoading && messages.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : conversationClosed && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No hay conversacion activa</p>
                <p className="text-xs mb-4">Envia un mensaje para iniciar una nueva conversacion</p>
              </div>
            </div>
          ) : conversationClosed && messages.length > 0 ? (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                <p className="text-sm text-amber-800 font-medium">Conversacion cerrada</p>
                <p className="text-xs text-amber-600">Esta conversacion ha sido finalizada. Envia un mensaje para iniciar una nueva.</p>
              </div>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sentByAdmin ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      msg.sentByAdmin
                        ? 'bg-white border text-gray-900'
                        : 'bg-purple-500 text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sentByAdmin ? 'text-gray-500' : 'text-purple-100'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleString('es-ES', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : messages.length > 0 ? (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sentByAdmin ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      msg.sentByAdmin
                        ? 'bg-white border text-gray-900'
                        : 'bg-purple-500 text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sentByAdmin ? 'text-gray-500' : 'text-purple-100'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleString('es-ES', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No hay mensajes aun</p>
                <p className="text-xs">Envia un mensaje al equipo de soporte</p>
              </div>
            </div>
          )}
        </CardContent>

        <div className="border-t px-4 py-3 bg-white">
          <div className="flex gap-2">
            <Textarea
              placeholder="Escribe un mensaje..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (message.trim()) {
                    handleSendMessage();
                  }
                }
              }}
              rows={2}
              className="flex-1 resize-none"
            />
            <Button
              onClick={handleSendMessage}
              disabled={sendingMessage || !message.trim()}
              size="icon"
              className="h-auto px-4"
            >
              {sendingMessage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Presiona Enter para enviar, Shift+Enter para nueva linea
          </p>
        </div>
      </Card>
    </div>
  );
}
