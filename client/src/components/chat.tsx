import { Button } from "@/components/ui/button";
import {
    ChatBubble,
    ChatBubbleMessage,
    ChatBubbleTimestamp,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { useTransition, animated } from "@react-spring/web";
import { Paperclip, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Content, UUID } from "@elizaos/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { cn, moment } from "@/lib/utils";
import { Avatar, AvatarImage } from "./ui/avatar";
import CopyButton from "./copy-button";
import ChatTtsButton from "./ui/chat/chat-tts-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import AIWriter from "react-aiwriter";
import { IAttachment } from "@/types";
import { AudioRecorder } from "./audio-recorder";
import { Badge } from "./ui/badge";

interface ExtraContentFields {
    user: string;
    createdAt: number;
    isLoading?: boolean;
}

type ContentWithUser = Content & ExtraContentFields;

export default function Page({ agentId }: { agentId: UUID }) {
    const { toast } = useToast();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [input, setInput] = useState("");
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const queryClient = useQueryClient();

    const getMessageVariant = (role: string) =>
        role !== "user" ? "received" : "sent";

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop =
                messagesContainerRef.current.scrollHeight;
        }
    };
    useEffect(() => {
        scrollToBottom();
    }, [queryClient.getQueryData(["messages", agentId])]);

    useEffect(() => {
        scrollToBottom();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            handleSendMessage(e as unknown as React.FormEvent<HTMLFormElement>);
        }
    };

    const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input) return;

        const attachments: IAttachment[] | undefined = selectedFile
            ? [
                  {
                      url: URL.createObjectURL(selectedFile),
                      contentType: selectedFile.type,
                      title: selectedFile.name,
                  },
              ]
            : undefined;

        const newMessages = [
            {
                text: input,
                user: "user",
                createdAt: Date.now(),
                attachments,
            },
            {
                text: input,
                user: "system",
                isLoading: true,
                createdAt: Date.now(),
            },
        ];

        queryClient.setQueryData(
            ["messages", agentId],
            (old: ContentWithUser[] = []) => [...old, ...newMessages]
        );

        sendMessageMutation.mutate({
            message: input,
            selectedFile: selectedFile ? selectedFile : null,
        });

        setSelectedFile(null);
        setInput("");
        formRef.current?.reset();
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const sendMessageMutation = useMutation({
        mutationKey: ["send_message", agentId],
        mutationFn: ({
            message,
            selectedFile,
        }: {
            message: string;
            selectedFile?: File | null;
        }) => apiClient.sendMessage(agentId, message, selectedFile),
        onSuccess: (newMessages: ContentWithUser[]) => {
            queryClient.setQueryData(
                ["messages", agentId],
                (old: ContentWithUser[] = []) => [
                    ...old.filter((msg) => !msg.isLoading),
                    ...newMessages.map((msg) => ({
                        ...msg,
                        createdAt: Date.now(),
                    })),
                ]
            );
        },
        onError: (e) => {
            toast({
                variant: "destructive",
                title: "Unable to send message",
                description: e.message,
            });
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setSelectedFile(file);
        }
    };

    const messages =
        queryClient.getQueryData<ContentWithUser[]>(["messages", agentId]) ||
        [];

    const transitions = useTransition(messages, {
        keys: (message) =>
            `${message.createdAt}-${message.user}-${message.text}`,
        from: { opacity: 0, transform: "translateY(50px)" },
        enter: { opacity: 1, transform: "translateY(0px)" },
        leave: { opacity: 0, transform: "translateY(10px)" },
    });

    return (
        <div className="flex flex-col w-full h-[calc(100dvh)] relative">
            {/* Background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-slate-800/50 to-slate-900/50"></div>
            
            <div className="relative z-10 flex flex-col h-full p-6">
                <div className="flex-1 overflow-hidden">
                    <ChatMessageList ref={messagesContainerRef} className="h-full pb-4">
                        {transitions((styles, message) => {
                            const variant = getMessageVariant(message?.user);
                            return (
                                // @ts-expect-error
                                <animated.div
                                    style={styles}
                                    className="flex flex-col gap-3 p-2"
                                >
                                    <ChatBubble
                                        variant={variant}
                                        className={cn(
                                            "flex flex-row items-start gap-3 max-w-[80%]",
                                            variant === "sent" ? "ml-auto" : "mr-auto"
                                        )}
                                    >
                                        {message?.user !== "user" ? (
                                            <Avatar className="size-9 p-1 border border-white/20 rounded-full select-none bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                                                <AvatarImage src="/elizaos-icon.png" />
                                            </Avatar>
                                        ) : null}
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <ChatBubbleMessage
                                                isLoading={message?.isLoading}
                                                className={cn(
                                                    "rounded-2xl px-4 py-3 shadow-lg",
                                                    variant === "sent" 
                                                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white ml-auto" 
                                                        : "glassmorphism border-white/10"
                                                )}
                                            >
                                                {message?.user !== "user" ? (
                                                    <AIWriter>
                                                        {message?.text}
                                                    </AIWriter>
                                                ) : (
                                                    message?.text
                                                )}
                                                {/* Attachments */}
                                                <div>
                                                    {message?.attachments?.map(
                                                        (attachment, idx) => (
                                                            <div
                                                                className="flex flex-col gap-2 mt-3"
                                                                key={idx}
                                                            >
                                                                <img
                                                                    src={
                                                                        attachment.url
                                                                    }
                                                                    width="100%"
                                                                    height="100%"
                                                                    className="w-64 rounded-xl border border-white/10"
                                                                />
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </ChatBubbleMessage>
                                            <div className="flex items-center gap-4 justify-between w-full mt-2">
                                                {message?.text &&
                                                !message?.isLoading ? (
                                                    <div className="flex items-center gap-2">
                                                        <CopyButton
                                                            text={message?.text}
                                                        />
                                                        <ChatTtsButton
                                                            agentId={agentId}
                                                            text={message?.text}
                                                        />
                                                    </div>
                                                ) : null}
                                                <div
                                                    className={cn([
                                                        message?.isLoading
                                                            ? "mt-2"
                                                            : "",
                                                        "flex items-center justify-between gap-3 select-none",
                                                    ])}
                                                >
                                                    {message?.source ? (
                                                        <Badge variant="outline" className="text-xs border-white/20 bg-white/5">
                                                            {message.source}
                                                        </Badge>
                                                    ) : null}
                                                    {message?.action ? (
                                                        <Badge variant="outline" className="text-xs border-white/20 bg-white/5">
                                                            {message.action}
                                                        </Badge>
                                                    ) : null}
                                                    {message?.createdAt ? (
                                                        <ChatBubbleTimestamp
                                                            timestamp={moment(
                                                                message?.createdAt
                                                            ).format("LT")}
                                                            className="text-xs text-muted-foreground/70"
                                                        />
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </ChatBubble>
                                </animated.div>
                            );
                        })}
                    </ChatMessageList>
                </div>
            <div className="px-6 pb-6">
                <form
                    ref={formRef}
                    onSubmit={handleSendMessage}
                    className="relative rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl"
                >
                    {selectedFile ? (
                        <div className="p-4 flex">
                            <div className="relative rounded-xl border border-white/10 p-3 bg-background/50">
                                <Button
                                    onClick={() => setSelectedFile(null)}
                                    className="absolute -right-2 -top-2 size-[22px] ring-2 ring-background hover:bg-red-500/20 transition-colors duration-300"
                                    variant="outline"
                                    size="icon"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                                <img
                                    src={URL.createObjectURL(selectedFile)}
                                    height="100%"
                                    width="100%"
                                    className="aspect-square object-contain w-16 rounded-lg"
                                />
                            </div>
                        </div>
                    ) : null}
                    <ChatInput
                        ref={inputRef}
                        onKeyDown={handleKeyDown}
                        value={input}
                        onChange={({ target }) => setInput(target.value)}
                        placeholder="Type your message here..."
                        className="min-h-14 resize-none rounded-2xl bg-transparent border-0 p-4 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70"
                    />
                    <div className="flex items-center justify-between p-4 pt-0">
                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="hover:bg-white/10 transition-all duration-300"
                                            onClick={() => {
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.click();
                                                }
                                            }}
                                        >
                                            <Paperclip className="size-4" />
                                            <span className="sr-only">
                                                Attach file
                                            </span>
                                        </Button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p>Attach file</p>
                                </TooltipContent>
                            </Tooltip>
                            <AudioRecorder
                                agentId={agentId}
                                onChange={(newInput: string) => setInput(newInput)}
                            />
                        </div>
                        <Button
                            disabled={!input || sendMessageMutation?.isPending}
                            type="submit"
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-9 px-6"
                        >
                            {sendMessageMutation?.isPending ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Sending...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    Send
                                    <Send className="size-4" />
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
