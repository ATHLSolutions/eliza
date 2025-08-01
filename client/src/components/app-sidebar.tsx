import { useQuery } from "@tanstack/react-query";
import info from "@/lib/info.json";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { apiClient } from "@/lib/api";
import { NavLink, useLocation } from "react-router";
import { type UUID } from "@elizaos/core";
import { Book, Cog, User, Sparkles } from "lucide-react";
import ConnectionStatus from "./connection-status";

export function AppSidebar() {
    const location = useLocation();
    const query = useQuery({
        queryKey: ["agents"],
        queryFn: () => apiClient.getAgents(),
        refetchInterval: 5_000,
    });

    const agents = query?.data?.agents;

    return (
        <Sidebar className="glassmorphism border-r border-white/10">
            <SidebarHeader className="border-b border-white/10 pb-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-white/5 transition-all duration-300">
                            <NavLink to="/">
                                <div className="relative">
                                    <img
                                        src="/elizaos-icon.png"
                                        width="100%"
                                        height="100%"
                                        className="size-7"
                                    />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                                </div>

                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                        ElizaOS
                                    </span>
                                    <span className="text-xs text-muted-foreground">v{info?.version}</span>
                                </div>
                            </NavLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="pt-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="flex items-center gap-2 text-sm font-medium">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        Agents
                        {agents?.length > 0 && (
                            <span className="ml-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                                {agents.length}
                            </span>
                        )}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {query?.isPending ? (
                                <div className="space-y-2">
                                    {Array.from({ length: 5 }).map(
                                        (_, index) => (
                                            <SidebarMenuItem key={index}>
                                                <SidebarMenuSkeleton />
                                            </SidebarMenuItem>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {agents?.map(
                                        (agent: { id: UUID; name: string }) => (
                                            <SidebarMenuItem key={agent.id}>
                                                <NavLink
                                                    to={`/chat/${agent.id}`}
                                                >
                                                    <SidebarMenuButton
                                                        isActive={location.pathname.includes(
                                                            agent.id
                                                        )}
                                                        className="group relative overflow-hidden hover:bg-white/5 data-[active]:bg-gradient-to-r data-[active]:from-blue-500/20 data-[active]:to-purple-500/20 transition-all duration-300"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <User className="w-4 h-4" />
                                                                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
                                                            </div>
                                                            <span className="truncate">{agent.name}</span>
                                                        </div>
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                                    </SidebarMenuButton>
                                                </NavLink>
                                            </SidebarMenuItem>
                                        )
                                    )}
                                </div>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-white/10 pt-4">
                <SidebarMenu className="space-y-1">
                    <SidebarMenuItem>
                        <NavLink
                            to="https://elizaos.github.io/eliza/docs/intro/"
                            target="_blank"
                        >
                            <SidebarMenuButton className="hover:bg-white/5 transition-all duration-300">
                                <Book className="w-4 h-4" />
                                Documentation
                            </SidebarMenuButton>
                        </NavLink>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton disabled className="opacity-50">
                            <Cog className="w-4 h-4" />
                            Settings
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <ConnectionStatus />
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
