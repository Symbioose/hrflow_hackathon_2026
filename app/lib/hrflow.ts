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
  async indexProfile(profile: HrFlowProfileInput) {
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
  async scoreProfiles(jobKey: string, options?: { limit?: number; page?: number }) {
    const { sourceKey, boardKey } = getConfig();
    if (!sourceKey || !boardKey) throw new Error("Missing HRFLOW_SOURCE_KEY or HRFLOW_BOARD_KEY");

    const params = new URLSearchParams({
      board_key: boardKey,
      job_key: jobKey,
      source_keys: JSON.stringify([sourceKey]),
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

  /** GET /profile/asking — Ask a natural language question about a profile */
  async askProfile(profileKey: string, question: string) {
    const { sourceKey } = getConfig();
    if (!sourceKey) throw new Error("Missing HRFLOW_SOURCE_KEY");

    const params = new URLSearchParams({
      source_key: sourceKey,
      key: profileKey,
      question,
    });

    const res = await fetch(`${HRFLOW_BASE_URL}/profile/asking?${params}`, {
      headers: authHeaders(),
    });

    return res.json();
  },

  /** GET /profile/upskilling — Explain a profile↔job recommendation */
  async explainProfile(profileKey: string, jobKey: string) {
    const { sourceKey, boardKey } = getConfig();
    if (!sourceKey || !boardKey) throw new Error("Missing HRFLOW_SOURCE_KEY or HRFLOW_BOARD_KEY");

    const params = new URLSearchParams({
      source_key: sourceKey,
      profile_key: profileKey,
      board_key: boardKey,
      job_key: jobKey,
    });

    const res = await fetch(`${HRFLOW_BASE_URL}/profile/upskilling?${params}`, {
      headers: authHeaders(),
    });

    return res.json();
  },

  /** GET /profiles/searching — List profiles in a source */
  async listProfiles(options?: { limit?: number; page?: number }) {
    const { sourceKey } = getConfig();
    if (!sourceKey) throw new Error("Missing HRFLOW_SOURCE_KEY");

    const params = new URLSearchParams({
      source_keys: JSON.stringify([sourceKey]),
      limit: String(options?.limit ?? 30),
      page: String(options?.page ?? 1),
    });

    const res = await fetch(`${HRFLOW_BASE_URL}/profiles/searching?${params}`, {
      headers: authHeaders(),
    });

    return res.json();
  },
};

// --- Types ---

export interface HrFlowProfileInput {
  info: {
    full_name: string;
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
    location?: { text: string };
    summary?: string;
  };
  reference?: string;
  experiences?: HrFlowExperience[];
  educations?: HrFlowEducation[];
  skills?: HrFlowSkill[];
  languages?: { name: string; value: string | null }[];
  tags?: HrFlowTag[];
}

export interface HrFlowExperience {
  title: string;
  company: string;
  location?: { text: string };
  date_start?: { iso8601: string };
  date_end?: { iso8601: string };
  description?: string;
}

export interface HrFlowEducation {
  title: string;
  school: string;
  location?: { text: string };
  date_start?: { iso8601: string };
  date_end?: { iso8601: string };
  description?: string;
}

export interface HrFlowSkill {
  name: string;
  type?: string;
  value?: string | null;
}

export interface HrFlowTag {
  name: string;
  value: string;
}

export interface HrFlowApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  meta?: {
    page: number;
    maxPage: number;
    count: number;
    total: number;
  };
}
