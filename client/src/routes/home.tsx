import { useQuery } from "@tanstack/react-query";
import { Cog, Sparkles, MessageCircle } from "lucide-react";
import PageTitle from "@/components/page-title";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import { NavLink } from "react-router";
import { UUID } from "@elizaos/core";
import { formatAgentName } from "@/lib/utils";

export default function Home() {
    const query = useQuery({
        queryKey: ["agents"],
        queryFn: () => apiClient.getAgents(),
        refetchInterval: 5_000
    });

    const agents = query?.data?.agents;

    return (
        <div className="flex flex-col gap-8 h-full p-6">
            {/* Modern Hero Section */}
            <div className="relative overflow-hidden rounded-2xl gradient-bg p-8 text-center text-white">
                <div className="relative z-10">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="w-8 h-8" />
                        <h1 className="text-3xl font-bold">ElizaOS Dashboard</h1>
                    </div>
                    <p className="text-blue-100 text-lg opacity-90">
                        Interact with your AI agents in a modern, intuitive interface
                    </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-gradient"></div>
            </div>

            <div className="flex items-center justify-between">
                <PageTitle title="Your Agents" />
                <div className="text-sm text-muted-foreground">
                    {agents?.length || 0} agent{agents?.length !== 1 ? 's' : ''} available
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {agents?.map((agent: { id: UUID; name: string }) => (
                    <Card key={agent.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 glassmorphism border-0">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                {agent?.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <div className="relative rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 aspect-square w-full grid place-items-center overflow-hidden group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300">
                                <div className="text-4xl font-bold uppercase bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    {formatAgentName(agent?.name)}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <div className="flex items-center gap-3 w-full">
                                <NavLink
                                    to={`/chat/${agent.id}`}
                                    className="flex-1"
                                >
                                    <Button
                                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Chat
                                    </Button>
                                </NavLink>
                                <NavLink
                                    to={`/settings/${agent.id}`}
                                    key={agent.id}
                                >
                                    <Button size="icon" className="glassmorphism hover:bg-white/10 transition-all duration-300">
                                        <Cog className="w-4 h-4" />
                                    </Button>
                                </NavLink>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
            
            {agents?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No agents found</h3>
                    <p className="text-muted-foreground">Start the ElizaOS backend to see your agents here.</p>
                </div>
            )}
        </div>
    );
}
