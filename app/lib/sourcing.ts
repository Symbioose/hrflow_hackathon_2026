import { hrflow } from "./hrflow";

export interface SourcedProfile {
  name: string;
  title: string;
  location: string;
  skills: string[];
  source: "github" | "linkedin" | "indeed";
  url: string;
  avatar?: string;
}

export const sourcing = {
  /**
   * Just-in-Time Sourcing Engine
   * In a real product, this would call specialized APIs or scrapers.
   * For the hackathon, it simulates the 'X-Ray -> Enrich -> Index' flow.
   */
  async runJitPipeline(query: string, onEvent: (event: any) => Promise<void>) {
    // 1. X-Ray Search
    await onEvent({ channel: "feed", payload: { action: "X-Ray Search", detail: `Scan web ouvert pour "${query}"`, status: "running", feedType: "source" } });
    await new Promise(r => setTimeout(r, 1500));
    
    // Simulate finding URLs
    const mockUrls = [
      { name: "Alexandre D.", source: "linkedin" as const, url: "https://linkedin.com/in/alex-dev" },
      { name: "Sophie L.", source: "github" as const, url: "https://github.com/sophie-codes" },
      { name: "Marc V.", source: "linkedin" as const, url: "https://linkedin.com/in/marc-v" }
    ];

    await onEvent({ channel: "feed", payload: { action: "X-Ray Search", detail: `${mockUrls.length} URLs pertinentes identifiées`, status: "done", feedType: "source" } });

    const results: SourcedProfile[] = [];

    // 2. Enrichment & Indexing Loop
    for (const target of mockUrls) {
      await onEvent({ channel: "feed", payload: { action: `Enrichissement ${target.name}`, detail: `Extraction des données depuis ${target.source}...`, status: "running", feedType: "analyze" } });
      await new Promise(r => setTimeout(r, 1000));

      const profile: SourcedProfile = {
        ...target,
        title: query.includes("Senior") ? "Senior Software Engineer" : "Software Engineer",
        location: "Paris, France",
        skills: ["React", "Node.js", "TypeScript", "Python"],
        avatar: `https://i.pravatar.cc/150?u=${target.name}`,
      };

      await onEvent({ channel: "feed", payload: { action: `Indexation HrFlow`, detail: `Synchronisation du profil ${target.name}`, status: "running", feedType: "parse" } });
      
      try {
        // Real HrFlow Indexing (simulated payload but real call structure)
        // In production, we'd use hrflow.indexProfile here.
        await new Promise(r => setTimeout(r, 800));
      } catch (e) {}

      await onEvent({ channel: "feed", payload: { action: `Indexation HrFlow`, detail: `${target.name} prêt pour scoring`, status: "done", feedType: "parse" } });

      // 3. Emit the profile live to the UI
      await onEvent({ 
        channel: "profiles", 
        payload: { 
          profiles: [{ ...profile, score: 85 + Math.floor(Math.random() * 12) }] 
        } 
      });
      
      results.push(profile);
    }

    return results;
  }
};
