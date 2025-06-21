import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Check, Reply, Trash2, CheckCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@shared/schema";

export default function Messages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PUT", `/api/messages/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/messages/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Mesaj șters",
        description: "Mesajul a fost șters cu succes.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread"] });
    },
    onError: () => {
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge mesajul.",
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", "/api/messages/read-all");
    },
    onSuccess: () => {
      toast({
        title: "Mesaje marcate",
        description: "Toate mesajele au fost marcate ca citite.",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  const handleMarkAsRead = (message: Message) => {
    if (!message.isRead) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleDeleteMessage = (message: Message) => {
    if (confirm(`Sigur doriți să ștergeți mesajul de la ${message.name}?`)) {
      deleteMessageMutation.mutate(message.id);
    }
  };

  const handleReplyToMessage = (message: Message) => {
    const subject = `Re: ${message.subject}`;
    const body = `Bună ziua ${message.name},\n\nVă mulțumim pentru mesajul dumneavoastră.\n\n---\nMesajul original:\n${message.message}`;
    const mailtoLink = `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  const handleMarkAllAsRead = () => {
    if (confirm("Marcați toate mesajele ca citite?")) {
      markAllAsReadMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă mesajele...</p>
        </div>
      </div>
    );
  }

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mesaje</h1>
          <p className="text-sm sm:text-base text-gray-600">Gestionează mesajele de la pacienți</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <CardTitle className="flex items-center space-x-2">
                <span>Mesaje primite</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount} noi</Badge>
                )}
              </CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Marchează toate ca citite</span>
                  <span className="sm:hidden">Citește toate</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {messages.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-6 transition-colors ${
                      !message.isRead ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {message.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-lg font-medium text-gray-900">{message.name}</h4>
                            {!message.isRead && (
                              <Badge variant="destructive" className="text-xs">
                                Nou
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {message.email} {message.phone && `• ${message.phone}`}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Subiect:</strong> {message.subject}
                          </p>
                          <p className="text-gray-700 mb-2">{message.message}</p>
                          <p className="text-xs text-gray-500">
                            Primit: {new Date(message.createdAt!).toLocaleDateString('ro-RO', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {message.isRead && (
                              <span className="text-green-600 ml-2">• Citit</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!message.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(message)}
                            disabled={markAsReadMutation.isPending}
                            title="Marchează ca citit"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReplyToMessage(message)}
                          title="Răspunde"
                        >
                          <Reply className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMessage(message)}
                          disabled={deleteMessageMutation.isPending}
                          title="Șterge"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                Nu există mesaje.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
