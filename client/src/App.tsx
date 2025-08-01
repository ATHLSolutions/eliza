import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import { BrowserRouter, Route, Routes } from "react-router";
import Chat from "./routes/chat";
import Overview from "./routes/overview";
import Home from "./routes/home";
import useVersion from "./hooks/use-version";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Infinity,
        },
    },
});

function App() {
    useVersion();
    return (
        <QueryClientProvider client={queryClient}>
            <div
                className="dark antialiased min-h-screen"
                style={{
                    colorScheme: "dark",
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
                <div className="relative z-10">
                    <BrowserRouter>
                        <TooltipProvider delayDuration={0}>
                            <SidebarProvider>
                                <AppSidebar />
                                <SidebarInset>
                                    <div className="flex flex-1 flex-col size-full min-h-screen">
                                        <Routes>
                                            <Route path="/" element={<Home />} />
                                            <Route
                                                path="chat/:agentId"
                                                element={<Chat />}
                                            />
                                            <Route
                                                path="settings/:agentId"
                                                element={<Overview />}
                                            />
                                        </Routes>
                                    </div>
                                </SidebarInset>
                            </SidebarProvider>
                            <Toaster />
                        </TooltipProvider>
                    </BrowserRouter>
                </div>
            </div>
        </QueryClientProvider>
    );
}

export default App;
