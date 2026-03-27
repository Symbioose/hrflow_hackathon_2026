import TopBar from "./components/TopBar";
import WhatsAppPanel from "./components/WhatsAppPanel";
import AgentFeed from "./components/AgentFeed";
import CandidatePanel from "./components/CandidatePanel";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-[var(--bg-deep)]">
      <TopBar />

      <div className="flex flex-1 min-h-0">
        {/* LEFT — WhatsApp */}
        <div className="w-[320px] shrink-0 border-r border-white/[0.06] flex flex-col">
          <WhatsAppPanel />
        </div>

        {/* CENTER — Agent Feed */}
        <div className="flex-1 border-r border-white/[0.06] flex flex-col min-w-0">
          <AgentFeed />
        </div>

        {/* RIGHT — Candidates */}
        <div className="w-[400px] shrink-0 flex flex-col">
          <CandidatePanel />
        </div>
      </div>
    </div>
  );
}
