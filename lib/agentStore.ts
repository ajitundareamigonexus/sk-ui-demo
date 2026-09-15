import type { Agent, AgentPricingRules } from './types';

const AGENTS_KEY = 'sk_agents_data';

// ─── Mock Agent Data ──────────────────────────────────────────────────────────

const DEFAULT_AGENTS: Agent[] = [
  {
    id: 'AGT-001',
    agentCode: 'AGT-001',
    businessName: 'Sunrise Travel Agency',
    contactName: 'Ravi Mehta',
    email: 'ravi@sunrisetravel.in',
    mobile: '9876543210',
    gstNumber: '27ABCDE1234F1Z5',
    status: 'active',
    createdAt: '2026-01-15T10:00:00.000Z',
    pricingRules: {
      baseDiscountPct: 10,
      maxMarkupPct: 20,
      tripOverrides: { oneway: 12, round: 8, local: 5, airport: 10 },
    },
  },
  {
    id: 'AGT-002',
    agentCode: 'AGT-002',
    businessName: 'Horizon Tours & Travels',
    contactName: 'Priya Sharma',
    email: 'priya@horizontours.com',
    mobile: '9123456789',
    gstNumber: '',
    status: 'active',
    createdAt: '2026-02-20T09:30:00.000Z',
    pricingRules: {
      baseDiscountPct: 8,
      maxMarkupPct: 15,
      tripOverrides: { oneway: 8, round: 6 },
    },
  },
  {
    id: 'AGT-003',
    agentCode: 'AGT-003',
    businessName: 'Global Journey Solutions',
    contactName: 'Amit Patel',
    email: 'amit@globaljourneys.in',
    mobile: '9988776655',
    gstNumber: '29XYZAB5678G1Z9',
    status: 'inactive',
    createdAt: '2026-03-05T14:20:00.000Z',
    pricingRules: {
      baseDiscountPct: 5,
      maxMarkupPct: 12,
      tripOverrides: {},
    },
  },
];

// ─── Agent CRUD (localStorage) ────────────────────────────────────────────────

function safeGetAgents(): Agent[] {
  if (typeof window === 'undefined') return DEFAULT_AGENTS;
  try {
    const raw = localStorage.getItem(AGENTS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_AGENTS;
  } catch {
    return DEFAULT_AGENTS;
  }
}

function safeSaveAgents(agents: Agent[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AGENTS_KEY, JSON.stringify(agents));
  } catch {
    console.error('Failed to save agents to localStorage');
  }
}

export function getAllAgents(): Agent[] {
  return safeGetAgents();
}

export function getAgentById(id: string): Agent | undefined {
  return safeGetAgents().find(a => a.id === id);
}

export function saveAgent(agent: Agent): void {
  const agents = safeGetAgents();
  const idx = agents.findIndex(a => a.id === agent.id);
  if (idx >= 0) {
    agents[idx] = agent;
  } else {
    agents.push(agent);
  }
  safeSaveAgents(agents);
}

export function generateAgentCode(): string {
  const agents = safeGetAgents();
  const maxNum = agents.reduce((max, a) => {
    const n = parseInt(a.agentCode.replace('AGT-', ''), 10);
    return isNaN(n) ? max : Math.max(max, n);
  }, 0);
  return `AGT-${String(maxNum + 1).padStart(3, '0')}`;
}

// ─── Pricing Helpers ──────────────────────────────────────────────────────────

/**
 * Applies the agent's discount to the base published price.
 * Returns the agent cost price.
 */
export function applyAgentDiscount(
  basePrice: number,
  rules: AgentPricingRules,
  tripType: 'oneway' | 'round' | 'local' | 'airport' = 'oneway'
): number {
  const tripOverride = rules.tripOverrides?.[tripType];
  const discountPct = tripOverride !== undefined ? tripOverride : rules.baseDiscountPct;
  return Math.round(basePrice * (1 - discountPct / 100));
}

/**
 * Validates that the proposed markup doesn't exceed the agent's limit.
 */
export function validateMarkup(
  costPrice: number,
  markupAmount: number,
  rules: AgentPricingRules
): { valid: boolean; maxMarkup: number } {
  const maxMarkup = Math.round(costPrice * (rules.maxMarkupPct / 100));
  return { valid: markupAmount <= maxMarkup, maxMarkup };
}

/**
 * Calculates final customer selling price from cost + markup.
 */
export function calculateSellingPrice(costPrice: number, markupAmount: number): number {
  return costPrice + markupAmount;
}

// ─── Agent Session (frontend only) ───────────────────────────────────────────

export function getAgentContext(): {
  agentId: string;
  agentCode: string;
  agentBusinessName: string;
  pricingRules: AgentPricingRules;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const session = localStorage.getItem('sk_active_session');
    if (!session) return null;
    const user = JSON.parse(session);
    if (user.role !== 'agent' || !user.agentId) return null;
    const agent = getAgentById(user.agentId);
    if (!agent || agent.status === 'inactive') return null;
    return {
      agentId: agent.id,
      agentCode: agent.agentCode,
      agentBusinessName: agent.businessName,
      pricingRules: agent.pricingRules,
    };
  } catch {
    return null;
  }
}
