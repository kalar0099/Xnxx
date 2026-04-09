import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import AdminLogin from "@/pages/AdminLogin";
import NotFound from "@/pages/not-found";
import { useAdmin } from "@/hooks/use-admin";
import { useLocation } from "wouter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function AdminPage() {
  const { isAdmin, isLoading, logout } = useAdmin();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(222 60% 8%)" }}>
        <div style={{ color: "#aaa", fontSize: 14 }}>چاوەڕوانبە...</div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(222 60% 8%)" }}>
        <div style={{ textAlign: "center", padding: 40, background: "hsl(222 60% 12%)", borderRadius: 12, border: "1px solid hsl(220 20% 20%)", minWidth: 320 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <h2 style={{ color: "#e0e0e0", fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>چوویتەژوورەوە وەک ئەدمین</h2>
          <p style={{ color: "#666", fontSize: 13, margin: "0 0 24px" }}>دەتوانیت بچیتە پەرەی سەرەکی بۆ بەڕێوەبردنی میدیاکان</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              onClick={() => navigate("/")}
              style={{ padding: "10px 20px", background: "#4d88ff", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
            >
              بڕۆ بۆ پەرەی سەرەکی
            </button>
            <button
              onClick={() => { logout(); }}
              style={{ padding: "10px 20px", background: "transparent", color: "#f66", border: "1px solid #f664", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
            >
              دەرچوون
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminLogin onSuccess={() => navigate("/")} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
