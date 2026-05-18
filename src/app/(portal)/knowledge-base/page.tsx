'use client';
import { useState } from "react";

interface Article {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  icon: string;
  tags: string[];
  views: number;
  updated: string;
}

const ARTICLES: Article[] = [
  {
    id: 1,
    title: "How to Handle Gold Buy/Sell Price Disputes",
    category: "Transaction Handling",
    excerpt: "Step-by-step guide for resolving customer complaints about spot price discrepancies. Includes escalation procedures and approval thresholds.",
    icon: "currency_exchange",
    tags: ["pricing", "dispute", "escalation"],
    views: 248,
    updated: "2025-05-10",
  },
  {
    id: 2,
    title: "Customer Identity Verification Protocol",
    category: "Compliance",
    excerpt: "Mandatory KYC checklist for new and returning customers. Covers ID document types, verification steps, and AML red flags.",
    icon: "verified_user",
    tags: ["kyc", "compliance", "identity"],
    views: 312,
    updated: "2025-05-08",
  },
  {
    id: 3,
    title: "Ticket Creation Best Practices",
    category: "Operations",
    excerpt: "Guidelines for creating accurate, well-structured service tickets. Covers naming conventions, required fields, and resolution notes standards.",
    icon: "confirmation_number",
    tags: ["tickets", "operations", "training"],
    views: 189,
    updated: "2025-05-12",
  },
  {
    id: 4,
    title: "Gold Purity and Weight Dispute Resolution",
    category: "Transaction Handling",
    excerpt: "How to handle disputes involving gold purity (karat), weight discrepancies, and laboratory test results. Includes third-party arbitration process.",
    icon: "balance",
    tags: ["purity", "weight", "dispute"],
    views: 156,
    updated: "2025-04-28",
  },
  {
    id: 5,
    title: "Agent Shift Handover Checklist",
    category: "Operations",
    excerpt: "Comprehensive checklist for shift transitions. Ensures all open tickets are flagged, customer callbacks noted, and pending items communicated.",
    icon: "checklist",
    tags: ["handover", "shift", "checklist"],
    views: 203,
    updated: "2025-05-01",
  },
  {
    id: 6,
    title: "Escalation Paths and Manager Contacts",
    category: "Escalation",
    excerpt: "Directory of escalation contacts by issue type and severity. Includes response time SLAs and contact hours for each escalation tier.",
    icon: "call_split",
    tags: ["escalation", "contacts", "sla"],
    views: 134,
    updated: "2025-05-06",
  },
  {
    id: 7,
    title: "LINE and Social Media Inquiry Handling",
    category: "Channel Protocols",
    excerpt: "Best practices for responding to customer inquiries via LINE, Facebook, and other social channels. Covers response templates and tone guidelines.",
    icon: "chat",
    tags: ["line", "social", "response"],
    views: 97,
    updated: "2025-04-20",
  },
  {
    id: 8,
    title: "Refund and Cancellation Policy",
    category: "Compliance",
    excerpt: "Full policy documentation for processing refunds and cancellations. Includes applicable timeframes, conditions, and required documentation.",
    icon: "assignment_return",
    tags: ["refund", "cancellation", "policy"],
    views: 221,
    updated: "2025-05-03",
  },
  {
    id: 9,
    title: "New Agent Onboarding Guide",
    category: "Training",
    excerpt: "Complete onboarding walkthrough for new customer service agents. Covers system access, ticket workflows, and first-week training schedule.",
    icon: "school",
    tags: ["onboarding", "training", "new agent"],
    views: 178,
    updated: "2025-05-14",
  },
];

const CATEGORIES = ["All", ...Array.from(new Set(ARTICLES.map((a) => a.category)))];

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openArticle, setOpenArticle] = useState<Article | null>(null);

  const filtered = ARTICLES.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.tags.some((t) => t.includes(q));
    const matchCat = activeCategory === "All" || a.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-semibold text-on-surface">Knowledge Base</h1>
          <p className="text-[16px] text-on-surface-variant mt-1">Reference guides, protocols, and training resources for the gold service team.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-on-surface-variant">{ARTICLES.length} articles</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-4 mb-6">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles, guides, and protocols…"
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container rounded-lg text-[15px] outline-none focus:bg-white focus:border focus:border-primary-container transition-all"
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Category sidebar */}
        <div className="w-56 shrink-0">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-4">
            <p className="text-[12px] text-on-surface-variant uppercase tracking-wider font-semibold mb-3">Categories</p>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => {
                const count = cat === "All" ? ARTICLES.length : ARTICLES.filter((a) => a.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] transition-colors text-left ${
                      activeCategory === cat
                        ? "bg-primary-container/20 text-on-surface font-semibold"
                        : "text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${activeCategory === cat ? "bg-primary-container text-on-primary-container" : "bg-surface-container text-on-surface-variant"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Articles grid */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-16 flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-30 mb-3">search_off</span>
              <p className="text-[16px] font-semibold text-on-surface mb-1">No articles found</p>
              <p className="text-[14px] text-on-surface-variant">Try a different search term or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setOpenArticle(article)}
                  className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-5 text-left hover:border-primary-container hover:shadow-card transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-container/15 flex items-center justify-center shrink-0 group-hover:bg-primary-container/25 transition-colors">
                      <span className="material-symbols-outlined text-primary text-[20px]">{article.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-[14px] font-semibold text-on-surface group-hover:text-primary transition-colors leading-5">{article.title}</p>
                      </div>
                      <p className="text-[12px] text-on-surface-variant mb-3 line-clamp-2 leading-5">{article.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-surface-container rounded text-on-surface-variant uppercase tracking-wider">{tag}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                          <span className="material-symbols-outlined text-[13px]">visibility</span>
                          {article.views}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-outline-variant flex items-center justify-between">
                    <span className="text-[11px] px-2 py-0.5 bg-primary-container/10 text-primary rounded-full font-medium">{article.category}</span>
                    <span className="text-[11px] text-on-surface-variant">Updated {article.updated}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Article detail modal */}
      {openArticle && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(25,28,30,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpenArticle(null)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-overlay border border-outline-variant w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-outline-variant flex items-start justify-between bg-surface-bright sticky top-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container/15 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[20px]">{openArticle.icon}</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold text-on-surface leading-6">{openArticle.title}</h3>
                  <span className="text-[12px] px-2 py-0.5 bg-primary-container/10 text-primary rounded-full font-medium">{openArticle.category}</span>
                </div>
              </div>
              <button onClick={() => setOpenArticle(null)} className="text-on-surface-variant hover:text-error transition-colors ml-4 shrink-0">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              <p className="text-[15px] text-on-surface-variant leading-7 mb-6">{openArticle.excerpt}</p>
              <div className="bg-primary-container/5 border border-primary-container/20 rounded-xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-[18px]">auto_stories</span>
                  <p className="text-[13px] font-semibold text-on-surface">Full Content</p>
                </div>
                <p className="text-[14px] text-on-surface-variant leading-7">
                  This article is maintained by the management team and reviewed monthly. Contact your supervisor or the compliance team to propose updates or corrections.
                  For urgent process clarifications, use the escalation directory in article #6.
                </p>
              </div>
              <div className="flex items-center justify-between text-[12px] text-on-surface-variant">
                <div className="flex gap-1">
                  {openArticle.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-surface-container rounded text-on-surface-variant uppercase tracking-wider">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">visibility</span>{openArticle.views} views</span>
                  <span>Updated {openArticle.updated}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
