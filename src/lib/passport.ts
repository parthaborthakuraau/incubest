import { db } from "./db";

// Indian state codes (ISO 3166-2:IN)
const STATE_CODES: Record<string, string> = {
  "andhra pradesh": "AP", "arunachal pradesh": "AR", "assam": "AS",
  "bihar": "BR", "chhattisgarh": "CG", "goa": "GA", "gujarat": "GJ",
  "haryana": "HR", "himachal pradesh": "HP", "jharkhand": "JH",
  "karnataka": "KA", "kerala": "KL", "madhya pradesh": "MP",
  "maharashtra": "MH", "manipur": "MN", "meghalaya": "ML",
  "mizoram": "MZ", "nagaland": "NL", "odisha": "OD", "punjab": "PB",
  "rajasthan": "RJ", "sikkim": "SK", "tamil nadu": "TN",
  "telangana": "TS", "tripura": "TR", "uttar pradesh": "UP",
  "uttarakhand": "UK", "west bengal": "WB", "delhi": "DL",
  "jammu and kashmir": "JK", "ladakh": "LA", "chandigarh": "CH",
  "puducherry": "PY", "andaman and nicobar": "AN", "lakshadweep": "LD",
  "dadra and nagar haveli": "DN", "daman and diu": "DD",
};

function getStateCode(state?: string | null): string {
  if (!state) return "XX";
  const code = STATE_CODES[state.toLowerCase().trim()];
  return code || state.slice(0, 2).toUpperCase();
}

/**
 * Generate a Startup Passport ID: IB-2026-MH-0042
 */
export async function generateStartupPassportId(state?: string | null): Promise<string> {
  const year = new Date().getFullYear();
  const stateCode = getStateCode(state);
  const prefix = `IB-${year}-${stateCode}-`;

  // Find the highest existing number with this prefix
  const latest = await db.startup.findFirst({
    where: { passportId: { startsWith: prefix } },
    orderBy: { passportId: "desc" },
    select: { passportId: true },
  });

  let seq = 1;
  if (latest?.passportId) {
    const num = parseInt(latest.passportId.split("-").pop() || "0");
    seq = num + 1;
  }

  return `${prefix}${String(seq).padStart(4, "0")}`;
}

/**
 * Generate a Founder Passport ID: IBF-2026-MH-0007
 */
export async function generateFounderPassportId(state?: string | null): Promise<string> {
  const year = new Date().getFullYear();
  const stateCode = getStateCode(state);
  const prefix = `IBF-${year}-${stateCode}-`;

  const latest = await db.user.findFirst({
    where: { passportId: { startsWith: prefix } },
    orderBy: { passportId: "desc" },
    select: { passportId: true },
  });

  let seq = 1;
  if (latest?.passportId) {
    const num = parseInt(latest.passportId.split("-").pop() || "0");
    seq = num + 1;
  }

  return `${prefix}${String(seq).padStart(4, "0")}`;
}
