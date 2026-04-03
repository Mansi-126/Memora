"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Play, 
  Search, 
  ChevronDown, 
  MessageSquare, 
  FolderSearch, 
  Copy, 
  Link as LinkIcon, 
  Bookmark, 
  FileText, 
  MonitorPlay, 
  Globe, 
  Mail, 
  FileSpreadsheet, 
  Mic, 
  Layers, 
  Zap, 
  Tag, 
  Clock, 
  Activity, 
  LayoutTemplate, 
  RefreshCw, 
  BookOpen, 
  Download, 
  Eye, 
  Users, 
  Leaf, 
  Check,
  Star,
  Settings
} from "lucide-react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const navDisplayName = useMemo(() => {
    return (
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.user_metadata?.first_name ||
      user?.email ||
      "Account"
    );
  }, [user]);

  const navAvatarInitial = useMemo(() => {
    const s = String(navDisplayName).trim();
    return s ? s[0].toUpperCase() : "?";
  }, [navDisplayName]);

  const tabs = ["All", "Views", "Organize", "Tools"];
  const features = [
    { group: "Views", icon: <BookOpen size={20} />, name: "Notebooks", desc: "Centralized workspaces for your projects" },
    { group: "Views", icon: <FileText size={20} />, name: "Sources", desc: "All your saved links, texts, and content in one place" },
    { group: "Views", icon: <Layers size={20} />, name: "Artifacts", desc: "Generated outputs, notes, and synthesized writings" },
    
    { group: "Organize", icon: <FolderSearch size={20} />, name: "Collections", desc: "Group your sources into manageable grid folders" },
    { group: "Organize", icon: <Star size={20} />, name: "Favorites", desc: "Star critical content to keep it one click away" },

    { group: "Tools", icon: <RefreshCw size={20} />, name: "Merge Notebooks", desc: "Combine multiple notebooks seamlessly into one" },
    { group: "Tools", icon: <Activity size={20} />, name: "Compare", desc: "Contrast different sources side by side for research" },
    { group: "Tools", icon: <LayoutTemplate size={20} />, name: "Prompts", desc: "Store and reuse your best AI prompts instantly" },
    { group: "Tools", icon: <Download size={20} />, name: "Bulk Import", desc: "Mass import links and documents at once" },
  ];

  const filteredFeatures = activeTab === "All" ? features : features.filter(f => f.group === activeTab);
  
  const [faqs, setFaqs] = useState([
    { q: "Do I need a browser extension?", a: "No. Memora works with a bookmark (bookmarklet), URL paste, or copy-paste. No extension, no install, works on every browser.", open: false },
    { q: "How is this different from NotebookLM?", a: "NotebookLM searches one notebook at a time. Memora searches across all your notebooks simultaneously and gives one AI answer with citations. Also adds 20+ import types NotebookLM doesn't have.", open: false },
    { q: "How do I import ChatGPT chats?", a: 'Click "Share" in ChatGPT → copy the public link → paste into Memora. Full conversation imported in seconds. Same for Claude and Perplexity.', open: false },
    { q: "What about Gemini? It doesn't have share links.", a: "Select all text in your Gemini chat → copy → paste into Memora. Our AI detects it's a Gemini conversation and structures it correctly.", open: false },
    { q: "Does the bookmarklet work on Firefox and Safari?", a: "Yes. Unlike browser extensions, bookmarklets work on every browser — Chrome, Firefox, Safari, Edge, Brave, Arc.", open: false },
    { q: "Is my data private?", a: "Yes. Your notebooks are private by default. We never train on your data. You can export everything anytime.", open: false }
  ]);

  const toggleFaq = (idx) => {
    const newFaqs = [...faqs];
    newFaqs[idx].open = !newFaqs[idx].open;
    setFaqs(newFaqs);
  };

  const [yearly, setYearly] = useState(false);

  return (
    <div className="font-sans text-memora-text">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-memora-border z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Leaf className="text-memora-primary drop-shadow-sm" size={28} />
          <span className="font-heading font-bold text-2xl tracking-tight text-memora-text">Memora</span>
        </div>
        
        <div className="hidden md:flex gap-8 text-memora-muted font-medium">
          <Link href="#features" className="hover:text-memora-primary transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-memora-primary transition-colors">How It Works</Link>
          <Link href="#faq" className="hover:text-memora-primary transition-colors">FAQ</Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center justify-center p-0.5 rounded-full border border-gray-200 bg-white hover:border-memora-primary/40 hover:bg-memora-light/50 transition-all"
              aria-label="Open dashboard"
            >
              <div className="w-9 h-9 rounded-full bg-memora-primary text-white flex items-center justify-center text-sm font-bold overflow-hidden">
                {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.user_metadata.avatar_url ?? user.user_metadata.picture}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  navAvatarInitial
                )}
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-memora-primary hover:bg-memora-dark text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]"
            >
              Get Started Free &rarr;
            </Link>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-36 pb-20 px-6 flex flex-col items-center justify-center min-h-[90vh] text-center relative overflow-hidden" style={{
        background: 'radial-gradient(circle at 50% -20%, #DCFCE7 0%, transparent 60%)'
      }}>
        <div className="border border-memora-primary/40 bg-memora-light text-memora-dark px-4 py-1.5 rounded-full text-sm font-medium mb-8 inline-flex items-center gap-2 shadow-sm">
          <span>✨</span> No browser extension needed — works on any browser
        </div>
        
        <h1 className="font-heading font-extrabold text-5xl md:text-7xl max-w-4xl text-memora-text leading-[1.1] mb-6">
          Your AI Conversations.<br/>Your Research. <span className="text-memora-primary">One Brain.</span>
        </h1>
        
        <p className="text-xl text-memora-muted max-w-[600px] mb-10 leading-relaxed mx-auto">
          Memora connects ChatGPT, Claude, Gemini, Reddit, PDFs and more into one searchable knowledge workspace — with a bookmark, a paste, or a link.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link 
            href="/login" 
            className="bg-memora-primary hover:bg-memora-dark text-white text-lg px-8 py-4 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] w-full sm:w-auto"
          >
            Start Free — No Card Needed
          </Link>
          <button className="flex items-center gap-2 text-memora-text hover:text-memora-primary font-medium px-8 py-4 rounded-full border-2 border-transparent hover:border-memora-light transition-all w-full sm:w-auto justify-center">
            <Play size={20} className="text-memora-primary" />
            Watch 2-min Demo &rarr;
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex text-yellow-400 text-xl tracking-widest mb-1">★★★★★</div>
          <p className="text-sm font-medium text-memora-muted">Loved by 500+ researchers, students & knowledge workers</p>
          <div className="flex -space-x-3 mt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-memora-light flex items-center justify-center text-[10px] font-bold text-memora-dark z-[${5-i}] overflow-hidden`}>
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src={`https://i.pravatar.cc/100?img=${10+i}`} alt="user" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="relative w-full max-w-4xl mt-16 mx-auto perspective-1000">
          <div className="relative rounded-xl border border-gray-200 shadow-2xl bg-white overflow-hidden aspect-[16/9] z-10 transform transition-transform hover:scale-[1.01] duration-500 flex text-left">
            {/* Sidebar Mockup */}
            <div className="w-48 xl:w-56 bg-white border-r border-gray-100 flex flex-col p-4 text-[10px] sm:text-xs tracking-tight">
              <div className="flex items-center gap-2 mb-8 text-sm font-extrabold text-gray-800">
                <div className="w-6 h-6 bg-memora-primary rounded text-white flex items-center justify-center font-bold">M</div>
                Memora
              </div>
              
              <div className="text-gray-400 font-bold mb-2 uppercase tracking-wider text-[9px]">Views</div>
              <div className="flex items-center justify-between text-gray-500 py-1.5 px-2 rounded-lg mb-1">
                <div className="flex items-center gap-2"><BookOpen size={14}/> Notebooks</div>
                <span className="text-gray-400 font-medium">1</span>
              </div>
              <div className="flex items-center justify-between text-memora-dark bg-memora-light py-1.5 px-2 rounded-lg mb-1 font-bold">
                <div className="flex items-center gap-2"><FileText size={14}/> Sources</div>
                <span>3</span>
              </div>
              <div className="flex items-center justify-between text-gray-500 py-1.5 px-2 rounded-lg mb-3">
                <div className="flex items-center gap-2"><Layers size={14}/> Artifacts</div>
                <span className="text-gray-400 font-medium">0</span>
              </div>

              <div className="text-gray-400 font-bold mb-2 uppercase tracking-wider text-[9px]">Organize</div>
              <div className="flex items-center justify-between text-gray-500 py-1.5 px-2 rounded-lg mb-1">
                <div className="flex items-center gap-2"><FolderSearch size={14}/> Collections</div>
                <span className="text-gray-400 font-medium">1</span>
              </div>
              <div className="flex items-center justify-between text-gray-500 py-1.5 px-2 rounded-lg mb-3">
                <div className="flex items-center gap-2"><Star size={14}/> Favorites</div>
                <span className="text-gray-400 font-medium">2</span>
              </div>

              <div className="text-gray-400 font-bold mb-2 uppercase tracking-wider text-[9px]">Tools</div>
              <div className="flex items-center justify-between text-gray-500 py-1.5 px-2 rounded-lg mb-1">
                <div className="flex items-center gap-2"><RefreshCw size={14}/> Merge Notebooks</div>
              </div>
              <div className="flex items-center justify-between text-gray-500 py-1.5 px-2 rounded-lg mb-1">
                <div className="flex items-center gap-2"><Activity size={14}/> Compare</div>
              </div>
              <div className="flex items-center justify-between text-gray-500 py-1.5 px-2 rounded-lg mb-1">
                <div className="flex items-center gap-2"><LayoutTemplate size={14}/> Prompts</div>
              </div>
              <div className="flex items-center justify-between text-gray-500 py-1.5 px-2 rounded-lg mb-3">
                <div className="flex items-center gap-2"><Download size={14}/> Bulk Import</div>
              </div>

              <div className="mt-auto flex flex-col gap-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-gray-500 py-1.5 px-2 rounded-lg">
                  <div className="flex items-center gap-2"><Settings size={14}/> Manage Space</div>
                </div>
                <div className="flex items-center gap-3 px-2">
                  <div className="w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[10px]">M</div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold text-gray-800 leading-tight truncate">User</span>
                    <span className="text-gray-400 text-[9px] truncate">user@domain.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Mockup */}
            <div className="flex-1 bg-white flex flex-col items-stretch overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-1 font-medium">
                  Notebooks <span className="text-gray-300">›</span> <span className="text-gray-800 font-semibold">Sources</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">All Sources</h2>
                <div className="flex items-center gap-2">
                  <div className="border border-gray-200 rounded-full px-3 py-1 flex items-center gap-2 text-xs font-semibold text-gray-700 bg-white shadow-sm">
                    <span className="text-gray-400 px-1 hover:text-gray-700 cursor-pointer">{'<'}</span> All Sources / All
                  </div>
                  <div className="bg-memora-light text-memora-primary font-bold text-[10px] uppercase px-3 py-1.5 rounded-full tracking-wider">3 TOTAL</div>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-6 text-xs font-semibold text-gray-400">
                    <span className="flex items-center gap-1.5 cursor-pointer hover:text-gray-700"><Download size={14}/> Download</span>
                    <span className="flex items-center gap-1.5 cursor-pointer hover:text-gray-700"><FolderSearch size={14}/> Move to Folder</span>
                    <span className="flex items-center gap-1.5 cursor-pointer hover:text-gray-700"><MessageSquare size={14}/> Delete</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="border border-gray-200 px-3 py-2 rounded-lg bg-white font-semibold text-gray-700 shadow-sm flex items-center gap-2">All Folders <ChevronDown size={14} className="text-gray-400" /></div>
                    <div className="border border-gray-200 px-3 py-2 rounded-lg bg-white font-semibold text-gray-800 flex items-center gap-1.5 shadow-sm"><FolderSearch size={14}/> New Folder</div>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl shadow-sm text-[11px] font-medium w-full flex-1 overflow-hidden flex flex-col">
                  <div className="grid grid-cols-[auto_auto_1fr_120px_100px_140px] items-center gap-4 px-4 py-3 border-b border-gray-100 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                    <div className="w-3.5 h-3.5 rounded-sm border-2 border-gray-200"></div>
                    <Star size={12} className="text-gray-300" />
                    <div>Name</div>
                    <div>Folder</div>
                    <div>Platform</div>
                    <div>Last edited time</div>
                  </div>
                  
                  {/* Row 1 */}
                  <div className="grid grid-cols-[auto_auto_1fr_120px_100px_140px] items-center gap-4 px-4 py-3.5 border-b border-gray-50 text-gray-600 hover:bg-gray-50/50 transition-colors">
                    <div className="w-3.5 h-3.5 rounded-sm border-2 border-gray-200"></div>
                    <Star size={14} className="text-gray-200" />
                    <div className="truncate pr-4">
                      <div className="font-bold text-gray-900 text-[13px] mb-0.5 truncate">The best products in your inbox</div>
                      <div className="text-memora-primary truncate text-[11px] hover:underline cursor-pointer">https://www.producthunt.com/newsletters...</div>
                    </div>
                    <div className="text-gray-600">mnhgu</div>
                    <div className="flex"><span className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded text-[10px] font-semibold text-gray-600">web</span></div>
                    <div className="text-gray-400">4/3/2026, 12:36 PM</div>
                  </div>
                  
                  {/* Row 2 */}
                  <div className="grid grid-cols-[auto_auto_1fr_120px_100px_140px] items-center gap-4 px-4 py-3.5 border-b border-gray-50 text-gray-600 hover:bg-gray-50/50 transition-colors">
                    <div className="w-3.5 h-3.5 rounded-sm border-2 border-gray-200"></div>
                    <Star size={14} className="text-gray-200" />
                    <div className="truncate pr-4">
                      <div className="font-bold text-gray-900 text-[13px] mb-0.5 truncate">Building an efficient Kortex alternative - Claude</div>
                      <div className="text-memora-primary truncate text-[11px] hover:underline cursor-pointer">https://claude.ai/chat/986e4f0d...</div>
                    </div>
                    <div className="text-gray-600">mnhgu</div>
                    <div className="flex"><span className="bg-orange-50/50 border border-orange-100 px-2 py-0.5 rounded text-[10px] font-semibold text-orange-600">claude</span></div>
                    <div className="text-gray-400">4/3/2026, 12:36 PM</div>
                  </div>
                  
                  {/* Row 3 */}
                  <div className="grid grid-cols-[auto_auto_1fr_120px_100px_140px] items-center gap-4 px-4 py-3.5 text-gray-600 hover:bg-gray-50/50 transition-colors">
                    <div className="w-3.5 h-3.5 rounded-sm border-2 border-gray-200"></div>
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <div className="truncate pr-4">
                      <div className="font-bold text-gray-900 text-[13px] mb-0.5 truncate flex items-center gap-2">
                        Kortex-Notebooklm - $55,030 last 30 days
                      </div>
                      <div className="text-memora-primary truncate text-[11px] hover:underline cursor-pointer">https://trustmrr.com/startup/kortex...</div>
                    </div>
                    <div className="text-gray-600">Unfiled</div>
                    <div className="flex"><span className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded text-[10px] font-semibold text-gray-600">web</span></div>
                    <div className="text-gray-400">4/3/2026, 12:27 PM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating cards */}
          <div className="absolute top-10 -left-12 bg-white px-4 py-3 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3 z-20 animate-bounce" style={{animationDuration: '3s'}}>
            <div className="bg-blue-50 p-2 rounded-lg text-blue-500"><MessageSquare size={16} /></div>
            <span className="text-sm font-semibold">ChatGPT chat imported <span className="text-green-500">✅</span></span>
          </div>

          <div className="absolute bottom-20 -right-10 bg-white px-4 py-3 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3 z-20 transform rotate-3 hover:rotate-0 transition-transform">
            <div className="bg-orange-50 p-2 rounded-lg text-orange-500"><Bookmark size={16} /></div>
            <span className="text-sm font-semibold">Bookmarked from Reddit <span className="text-green-500">✅</span></span>
          </div>

          <div className="absolute -bottom-6 left-20 bg-white px-4 py-3 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3 z-20 transform -rotate-2 hover:rotate-0 transition-transform">
            <div className="bg-memora-light p-2 rounded-lg text-memora-primary"><Search size={16} /></div>
            <span className="text-sm font-semibold">Found in 3 notebooks instantly</span>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="bg-white py-24 px-6 relative border-t border-memora-border/50">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="bg-memora-light text-memora-dark font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full mb-6 max-w-max">The Problem</div>
          <h2 className="font-heading text-4xl font-bold mb-4 text-center">Your best ideas are scattered everywhere</h2>
          <p className="text-memora-muted text-center max-w-2xl text-lg mb-16">
            You save things across 6 different tools. You can never find them when you need them.
          </p>

          <div className="grid md:grid-cols-3 gap-8 w-full">
            <div className="bg-gray-50 border border-gray-100 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare size={24} />
              </div>
              <h3 className="font-bold text-xl mb-3">AI Chats Disappear</h3>
              <p className="text-memora-muted leading-relaxed">Great ChatGPT or Claude conversations vanish into history. You can never search across them or connect the dots.</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center mb-6">
                <FolderSearch size={24} />
              </div>
              <h3 className="font-bold text-xl mb-3">No Cross-Search</h3>
              <p className="text-memora-muted leading-relaxed">Your PDFs, articles, and notes live in silos. NotebookLM only searches one notebook at a time.</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-6">
                <RefreshCw size={24} />
              </div>
              <h3 className="font-bold text-xl mb-3">Manual Copy-Paste Forever</h3>
              <p className="text-memora-muted leading-relaxed">Every tool requires an extension, a download, or a workaround. Nothing just works out of the box.</p>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center text-memora-dark">
            <span className="font-bold tracking-wide uppercase text-sm mb-3">Here&apos;s the fix</span>
            <ChevronDown size={28} className="animate-bounce" />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 px-6 bg-[#F0FDF4] overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="bg-memora-primary/10 text-memora-dark font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full mb-6">How It Works</div>
          <h2 className="font-heading text-4xl font-bold mb-20 text-center">3 ways to save. One place to search.</h2>

          <div className="flex flex-col gap-24 w-full">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <div className="flex-1 space-y-6">
                <div className="bg-white border border-memora-border text-memora-dark font-bold text-sm px-3 py-1 rounded-full inline-block">Step 1</div>
                <h3 className="font-heading text-3xl font-bold">Got a ChatGPT or Claude chat? Just paste the link.</h3>
                <p className="text-lg text-memora-muted leading-relaxed">
                  Click &apos;Share&apos; in ChatGPT, Claude, or Perplexity. Paste the URL into Memora. Done — full conversation imported, structured, and searchable in seconds.
                </p>
                <div className="flex items-center gap-4 text-sm font-semibold text-memora-dark">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> ChatGPT</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Claude</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Perplexity</div>
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-memora-border relative">
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-sm border border-green-200 animate-pulse">
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <label className="text-sm font-semibold mb-2 block text-gray-700">Import via Link</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-500 font-medium flex items-center min-w-0">
                       <LinkIcon size={16} className="text-gray-400 mr-2 shrink-0" />
                       <span className="truncate text-sm">https://chatgpt.com/share/b598f3...</span>
                    </div>
                    <button className="bg-memora-primary text-white font-bold px-6 py-3 rounded-xl shadow-[0_4px_12px_rgba(34,197,94,0.3)] hover:shadow-[0_6px_16px_rgba(34,197,94,0.4)] hover:-translate-y-0.5 transition-all w-28 text-sm">Import</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
              <div className="flex-1 space-y-6">
                <div className="bg-white border border-memora-border text-memora-dark font-bold text-sm px-3 py-1 rounded-full inline-block">Step 2</div>
                <h3 className="font-heading text-3xl font-bold">From Gemini, Reddit, LinkedIn — just copy and paste.</h3>
                <p className="text-lg text-memora-muted leading-relaxed">
                  Select any text from any platform. Paste into Memora. Our AI auto-detects whether it&apos;s an AI chat, Reddit thread, LinkedIn post, or article — and structures it perfectly.
                </p>
              </div>
              <div className="flex-1 w-full relative group">
                <div className="bg-white p-2 rounded-2xl shadow-xl border border-memora-border h-64 flex flex-col relative overflow-hidden">
                  <div className="flex-1 bg-[#FAFAFA] border-2 border-dashed border-gray-200 group-hover:border-memora-primary/50 group-hover:bg-memora-primary/5 transition-colors rounded-xl flex items-center justify-center p-6 text-gray-400 text-center relative z-10">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-white rounded-full shadow border border-gray-100 flex items-center justify-center text-memora-primary group-hover:scale-110 transition-transform">
                        <Copy size={24} />
                      </div>
                      <div className="text-sm font-bold text-gray-500">Cmd+V to Paste text</div>
                    </div>
                  </div>
                  
                  {/* Hover Paste Reveal Content */}
                  <div className="absolute inset-x-8 top-1/2 -mt-10 bg-white border border-gray-100 shadow-xl p-4 rounded-xl z-20 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                    <div className="text-[10px] font-extrabold text-orange-400 uppercase tracking-widest mb-1">Reddit Pastsed Content</div>
                    <div className="text-xs text-gray-700 font-semibold leading-relaxed line-clamp-3">
                      "I built an AI tool that organizes bookmarks automatically using LLMs. How this works..."
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 right-8 bg-white px-5 py-2.5 rounded-full shadow-lg border border-memora-border font-bold text-sm flex items-center gap-2 text-memora-dark z-30 transform group-hover:scale-105 transition-transform">
                  🤖 Auto-structured: Reddit Thread <span className="text-green-500 bg-green-100 rounded-full w-5 h-5 flex items-center justify-center"><Check size={12} strokeWidth={3}/></span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <div className="flex-1 space-y-6">
                <div className="bg-white border border-memora-border text-memora-dark font-bold text-sm px-3 py-1 rounded-full inline-block">Step 3</div>
                <h3 className="font-heading text-3xl font-bold">One-click save from any webpage — no extension needed.</h3>
                <p className="text-lg text-memora-muted leading-relaxed">
                  Drag the Memora bookmark to your browser bar once. Then click it on any page — article, blog, research paper — to save it instantly. Works on Chrome, Firefox, Safari, Edge.
                </p>
              </div>
              <div className="flex-1 w-full">
                <div className="bg-white rounded-2xl shadow-xl border border-memora-border overflow-hidden flex flex-col h-[280px]">
                  <div className="bg-[#E5E7EB] border-b border-gray-300 p-3 flex items-center gap-4">
                    <div className="flex gap-1.5 ml-2">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                    </div>
                    <div className="flex gap-3 text-sm flex-1 ml-4 justify-center relative">
                       <div className="bg-white text-gray-500 px-4 py-1.5 rounded-md shadow-sm border border-gray-200 min-w-[200px] max-w-[300px] flex items-center justify-center gap-2 text-[11px] font-semibold w-full">
                         <Globe size={12}/> theverge.com/ai-news
                       </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-memora-primary/10 text-memora-dark px-3 py-1.5 rounded-md font-bold text-[11px] border border-memora-primary shadow-[0_0_10px_rgba(34,197,94,0.3)] flex items-center gap-1.5 cursor-pointer hover:bg-memora-primary hover:text-white transition-all transform hover:-translate-y-0.5">
                        <Bookmark size={12} fill="currentColor" /> Save to Memora
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 bg-white p-10 relative flex flex-col justify-center gap-5 overflow-hidden group">
                     {/* Article Mockup Content */}
                     <div className="max-w-[75%] mx-auto space-y-4 w-full">
                        <div className="h-7 w-full bg-gray-200 rounded-md"></div>
                        <div className="h-7 w-2/3 bg-gray-200 rounded-md"></div>
                        <div className="h-4 w-full bg-gray-100 rounded-md mt-6"></div>
                        <div className="h-4 w-full bg-gray-100 rounded-md"></div>
                        <div className="h-4 w-5/6 bg-gray-100 rounded-md"></div>
                     </div>

                     {/* Notification pop-up */}
                     <div className="absolute right-6 top-6 w-56 bg-white border-2 border-memora-primary/20 rounded-xl shadow-2xl p-4 animate-in slide-in-from-right-4 duration-500">
                       <div className="flex items-center gap-2 text-memora-primary font-bold text-xs mb-2 uppercase tracking-wide">
                         <Check size={14} strokeWidth={3}/> Saved Successfully
                       </div>
                       <div className="text-[11px] text-gray-500 font-medium leading-relaxed">
                         Auto-extracted text, title, and metadata to your Memora workspace.
                       </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          
          <div className="mt-24 text-center">
            <p className="text-3xl font-heading font-extrabold text-memora-dark">Then ask anything — across all of it. Instantly.</p>
          </div>
        </div>
      </section>

      {/* CROSS SEARCH SPOTLIGHT */}
      <section className="bg-[#14532D] py-24 px-6 text-white text-center">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#22C55E]/20 text-[#DCFCE7] font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full mb-6 max-w-max mx-auto border border-[#22C55E]/30">The Core Feature</div>
          <h2 className="font-heading text-5xl font-extrabold mb-6">Search everything you know.<br/>Not just one notebook.</h2>
          <p className="text-[#DCFCE7] text-xl mb-16 max-w-2xl mx-auto leading-relaxed opacity-90">
            Ask a question. Memora searches across every chat, PDF, bookmark, and note you&apos;ve ever saved — and gives you one clear answer.
          </p>

          <div className="relative mx-auto max-w-4xl bg-[#1f2937] rounded-2xl shadow-2xl p-6 md:p-10 border border-white/10 text-left mb-16">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-xl mb-8">
              <Search className="text-memora-primary" size={24} />
              <div className="text-xl font-medium tracking-wide">What did I save about machine learning?</div>
            </div>

            <div className="bg-white text-memora-text p-6 md:p-8 rounded-xl border-l-[6px] border-memora-primary shadow-xl">
              <div className="flex items-center gap-2 mb-4 text-memora-primary font-bold">
                <Zap size={20} /> AI Synthesis
              </div>
              <p className="text-lg leading-relaxed mb-6">
                Based on your saved sources, machine learning concepts you&apos;ve explored highlight that supervised learning requires labeled datasets <b>[1]</b>, whereas your recent discussions suggest exploring reinforcement learning for your new side project <b>[2][3]</b>.
              </p>
              
              <div className="border-t border-gray-100 pt-5 flex flex-wrap gap-3">
                <span className="bg-gray-100 hover:bg-gray-200 cursor-pointer border border-gray-200 text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2">
                  📄 ML Notes PDF · pg 4
                </span>
                <span className="bg-gray-100 hover:bg-gray-200 cursor-pointer border border-gray-200 text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2">
                  <MessageSquare size={14}/> ChatGPT Chat · Mar 12
                </span>
                <span className="bg-gray-100 hover:bg-gray-200 cursor-pointer border border-gray-200 text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2">
                  <LinkIcon size={14}/> Reddit r/MachineLearning
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16">
             <div className="flex flex-col items-center">
                <div className="text-4xl font-black text-memora-primary mb-2">{'<'} 2s</div>
                <div className="text-[#DCFCE7] font-medium">Search across 100s of sources</div>
             </div>
             <div className="hidden md:block w-px bg-white/20 h-16"></div>
             <div className="flex flex-col items-center">
                <div className="text-4xl font-black text-memora-primary mb-2">100%</div>
                <div className="text-[#DCFCE7] font-medium">AI answer with exact source citations</div>
             </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 px-6 bg-white border-b border-memora-border/50">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="bg-memora-light text-memora-dark font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full mb-6">Everything Included</div>
          <h2 className="font-heading text-4xl font-bold mb-10 text-center">27 features. Zero browser extensions.</h2>

          <div className="flex gap-2 overflow-x-auto w-full max-w-full pb-4 mb-8 custom-scrollbar justify-start md:justify-center">
            {tabs.map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all border ${activeTab === tab ? "bg-memora-primary text-white border-memora-primary shadow-md" : "bg-white text-memora-muted border-gray-200 hover:border-memora-primary hover:text-memora-dark"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {filteredFeatures.map((f, i) => (
              <div key={i} className="bg-white border text-left border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:border-l-4 hover:border-l-memora-primary transition-all flex flex-col gap-4 group">
                <div className="w-12 h-12 rounded-full bg-memora-light flex items-center justify-center text-memora-dark group-hover:bg-memora-primary group-hover:text-white transition-colors">
                  {f.icon}
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">{f.name}</h4>
                  <p className="text-memora-muted text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* FAQ SECTION */}
      <section id="faq" className="py-24 px-6 bg-white border-t border-memora-border/50">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="font-heading text-4xl font-bold mb-12 text-center">Common Questions</h2>
          <div className="w-full space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:border-memora-primary/50 transition-colors">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full text-left p-6 font-bold text-lg flex items-center justify-between text-memora-text bg-white"
                >
                  {faq.q}
                  <ChevronDown className={`text-memora-primary transition-transform duration-300 ${faq.open ? 'rotate-180' : ''}`} />
                </button>
                <div className={`px-6 pb-6 text-memora-muted leading-relaxed ${faq.open ? 'block' : 'hidden'}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="bg-memora-dark py-28 px-6 text-center text-white relative">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="font-heading text-5xl md:text-6xl font-extrabold mb-8 tracking-tight">Build your second brain.<br/>Today.</h2>
          <p className="text-memora-light text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Join 500+ researchers, students, and professionals who stopped losing their best ideas.
          </p>
          <Link 
            href="/login"
            className="inline-block bg-white text-memora-dark px-10 py-5 rounded-full font-bold text-lg shadow-[0_10px_25px_rgba(255,255,255,0.2)] hover:shadow-[0_15px_35px_rgba(255,255,255,0.3)] hover:-translate-y-1 transition-all"
          >
            Get Started Free — No Credit Card &rarr;
          </Link>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-white/70 font-medium text-sm">
            <span>✓ Free forever plan</span>
            <span className="hidden sm:inline">•</span>
            <span>✓ No extension needed</span>
            <span className="hidden sm:inline">•</span>
            <span>✓ Works on any browser</span>
          </div>
        </div>
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-memora-primary/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-memora-primary/30 rounded-full blur-3xl"></div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t-4 border-memora-primary pt-20 pb-8 px-6 text-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          <div className="col-span-2 md:col-span-1 border-b pb-8 md:border-0 md:pb-0">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="text-memora-primary" size={24} />
              <span className="font-heading font-bold text-xl">Memora</span>
            </div>
            <p className="text-memora-muted leading-relaxed">
              Your AI Knowledge Workspace.<br/>Search everything you know.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-memora-dark mb-4 text-base uppercase tracking-wider">Product</h5>
            <ul className="space-y-3 font-medium text-gray-500">
              <li><Link href="#features" className="hover:text-memora-primary">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-memora-primary">How It Works</Link></li>
              <li><Link href="#" className="hover:text-memora-primary">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-memora-dark mb-4 text-base uppercase tracking-wider">Resources</h5>
            <ul className="space-y-3 font-medium text-gray-500">
              <li><Link href="#" className="hover:text-memora-primary">Blog</Link></li>
              <li><Link href="#" className="hover:text-memora-primary">Documentation</Link></li>
              <li><Link href="#faq" className="hover:text-memora-primary">FAQ</Link></li>
              <li><Link href="#" className="hover:text-memora-primary">Support</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-memora-dark mb-4 text-base uppercase tracking-wider">Company</h5>
            <ul className="space-y-3 font-medium text-gray-500">
              <li><Link href="#" className="hover:text-memora-primary">About</Link></li>
              <li><Link href="#" className="hover:text-memora-primary">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-memora-primary">Terms</Link></li>
              <li><Link href="#" className="hover:text-memora-primary">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-memora-dark mb-4 text-base uppercase tracking-wider">Connect</h5>
            <ul className="space-y-3 font-medium text-gray-500">
              <li><Link href="#" className="hover:text-memora-primary">Twitter/X</Link></li>
              <li><Link href="#" className="hover:text-memora-primary">Discord</Link></li>
              <li><Link href="#" className="hover:text-memora-primary">Product Hunt</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between text-gray-400 font-medium">
          <p>© 2026 Memora. All rights reserved.</p>
          <p className="mt-2 md:mt-0 flex items-center gap-1">Built with 💚 </p>
        </div>
      </footer>
    </div>
  );
}
