const HRFLOW_BASE_URL = "https://api.hrflow.ai/v1";

function getConfig() {
  const apiKey = process.env.HRFLOW_API_KEY;
  const apiEmail = process.env.HRFLOW_API_EMAIL;
  const sourceKey = process.env.HRFLOW_SOURCE_KEY;
  const boardKey = process.env.HRFLOW_BOARD_KEY;

  if (!apiKey || !apiEmail) {
    throw new Error("Missing HRFLOW_API_KEY or HRFLOW_API_EMAIL in env");
  }

  return { apiKey, apiEmail, sourceKey, boardKey };
}

function authHeaders(): Record<string, string> {
  const { apiKey, apiEmail } = getConfig();
  return {
    "X-API-KEY": apiKey,
    "X-USER-EMAIL": apiEmail,
  };
}

export const hrflow = {
  config: getConfig,

  /** POST /profile/parsing/file — Parse a CV file */
  async parseCV(file: File, reference?: string) {
    const { sourceKey } = getConfig();
    if (!sourceKey) throw new Error("Missing HRFLOW_SOURCE_KEY");

    const form = new FormData();
    form.append("source_key", sourceKey);
    form.append("file", file);
    if (reference) form.append("reference", reference);

    const res = await fetch(`${HRFLOW_BASE_URL}/profile/parsing/file`, {
      method: "POST",
      headers: authHeaders(),
      body: form,
    });

    return res.json();
  },

  /** POST /profile/indexing — Index a parsed profile */
  async indexProfile(profile: Record<string, unknown>) {
    const { sourceKey } = getConfig();
    if (!sourceKey) throw new Error("Missing HRFLOW_SOURCE_KEY");

    const res = await fetch(`${HRFLOW_BASE_URL}/profile/indexing`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ source_key: sourceKey, profile }),
    });

    return res.json();
  },

  /** GET /profiles/scoring — Score profiles against a job */
  async scoreProfiles(jobKey: string, algorithmKey: string, options?: { limit?: number; page?: number }) {
    const { sourceKey, boardKey } = getConfig();
    if (!sourceKey || !boardKey) throw new Error("Missing HRFLOW_SOURCE_KEY or HRFLOW_BOARD_KEY");

    const params = new URLSearchParams({
      board_key: boardKey,
      job_key: jobKey,
      source_keys: JSON.stringify([sourceKey]),
      algorithm_key: algorithmKey,
      use_agent: "1",
      limit: String(options?.limit ?? 30),
      page: String(options?.page ?? 1),
      sort_by: "scoring",
      order_by: "desc",
    });

    const res = await fetch(`${HRFLOW_BASE_URL}/profiles/scoring?${params}`, {
      headers: authHeaders(),
    });

    return res.json();
  },

  /** GET /profile/asking — Ask questions about a profile (param: questions array) */
  async askProfile(profileKey: string, questions: string[]) {
    const { sourceKey } = getConfig();
    if (!sourceKey) throw new Error("Missing HRFLOW_SOURCE_KEY");

    const params = new URLSearchParams({
      source_key: sourceKey,
      key: profileKey,
      questions: JSON.stringify(questions),
    });

    const res = await fetch(`${HRFLOW_BASE_URL}/profile/asking?${params}`, {
      headers: authHeaders(),
    });

    return res.json();
  },

  /** GET /profiles/searching — Search/list profiles in a source */
  async searchProfiles(options?: {
    limit?: number;
    page?: number;
    text_keywords?: string[];
  }) {
    const { sourceKey } = getConfig();
    if (!sourceKey) throw new Error("Missing HRFLOW_SOURCE_KEY");

    const params = new URLSearchParams({
      source_keys: JSON.stringify([sourceKey]),
      limit: String(options?.limit ?? 30),
      page: String(options?.page ?? 1),
    });

    if (options?.text_keywords?.length) {
      params.set("text_keywords", JSON.stringify(options.text_keywords));
    }

    const res = await fetch(`${HRFLOW_BASE_URL}/profiles/searching?${params}`, {
      headers: authHeaders(),
    });

    return res.json();
  },

  /** GET /jobs/searching — Search/list jobs in the board */
  async searchJobs(options?: { limit?: number; page?: number }) {
    const { boardKey } = getConfig();
    if (!boardKey) throw new Error("Missing HRFLOW_BOARD_KEY");

    const params = new URLSearchParams({
      board_keys: JSON.stringify([boardKey]),
      limit: String(options?.limit ?? 10),
      page: String(options?.page ?? 1),
    });

    const res = await fetch(`${HRFLOW_BASE_URL}/jobs/searching?${params}`, {
      headers: authHeaders(),
    });

    return res.json();
  },
};
