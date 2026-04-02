"use client";

import Link from "next/link";
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
  Check
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", "Import", "Search", "Organize", "Learn", "Export", "Team"];
  const features = [
    { group: "Import", icon: <LinkIcon size={20} />, name: "Share URL Import", desc: "Paste ChatGPT/Claude/Perplexity share links directly" },
    { group: "Import", icon: <Copy size={20} />, name: "Smart Paste", desc: "Paste anything — AI detects format automatically" },
    { group: "Import", icon: <Bookmark size={20} />, name: "Bookmarklet", desc: "One-click save from any webpage, any browser" },
    { group: "Import", icon: <FileText size={20} />, name: "PDF Upload", desc: "Drag and drop PDFs, instantly indexed" },
    { group: "Import", icon: <MonitorPlay size={20} />, name: "YouTube Import", desc: "Paste YouTube URL, get full transcript saved" },
    { group: "Import", icon: <Globe size={20} />, name: "Web URL Fetch", desc: "Paste any article or blog URL to save full content" },
    { group: "Import", icon: <Mail size={20} />, name: "Email Inbox", desc: "Forward emails to save@you.memora.app — auto-imported" },
    { group: "Import", icon: <FileSpreadsheet size={20} />, name: "CSV Bulk Import", desc: "Upload CSV of URLs for bulk import" },
    { group: "Import", icon: <Mic size={20} />, name: "Audio Transcribe", desc: "Upload audio/podcast, Memora transcribes and indexes" },
    
    { group: "Search", icon: <Search size={20} />, name: "Cross-Notebook Search", desc: "Search across every notebook simultaneously" },
    { group: "Search", icon: <Zap size={20} />, name: "AI Answer Engine", desc: "Get one synthesized answer with source citations" },
    { group: "Search", icon: <Tag size={20} />, name: "Tag Filtering", desc: "Filter search by tags, type, or date" },
    { group: "Search", icon: <Clock size={20} />, name: "Instant Results", desc: "< 2 second search across 100s of sources" },
    
    { group: "Organize", icon: <FolderSearch size={20} />, name: "Nested Folders", desc: "Organize notebooks in folders and subfolders" },
    { group: "Organize", icon: <Tag size={20} />, name: "Tags System", desc: "Tag notebooks and sources for easy grouping" },
    { group: "Organize", icon: <LayoutTemplate size={20} />, name: "Prompt Library", desc: "Save reusable AI prompts for your workflows" },
    { group: "Organize", icon: <Layers size={20} />, name: "Bulk Management", desc: "Bulk delete, move, merge sources across notebooks" },
    { group: "Organize", icon: <Eye size={20} />, name: "Source Views", desc: "Save and revisit exact notebook states" },
    { group: "Organize", icon: <Activity size={20} />, name: "Knowledge Health", desc: "Per-notebook health score and coverage tracking" },

    { group: "Learn", icon: <Layers size={20} />, name: "Flashcards", desc: "Auto-generate flashcards from any source" },
    { group: "Learn", icon: <RefreshCw size={20} />, name: "Spaced Repetition", desc: "Smart review queue — review cards at the right time" },
    { group: "Learn", icon: <BookOpen size={20} />, name: "Quizzes", desc: "AI-generated quizzes from your saved content" },
    { group: "Learn", icon: <Mic size={20} />, name: "Podcast Feed", desc: "Stream your notebooks as audio on any podcast app" },
    
    { group: "Export", icon: <Download size={20} />, name: "Markdown Export", desc: "Export entire notebook as a zip of Markdown files" },
    { group: "Export", icon: <RefreshCw size={20} />, name: "Google Docs Sync", desc: "One-click sync all sources to Google Drive" },
    { group: "Export", icon: <Eye size={20} />, name: "Preview & Edit", desc: "Preview and edit before any export" },
    
    { group: "Team", icon: <Users size={20} />, name: "Team Notebooks", desc: "Shared collaborative notebook workspaces" },
    { group: "Team", icon: <LayoutTemplate size={20} />, name: "Shared Prompts", desc: "Team-wide reusable prompt library" },
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
          <Link href="#pricing" className="hover:text-memora-primary transition-colors">Pricing</Link>
          <Link href="#faq" className="hover:text-memora-primary transition-colors">FAQ</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="bg-memora-primary hover:bg-memora-dark text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]"
          >
            Get Started Free &rarr;
          </Link>
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
          <div className="relative rounded-xl border border-gray-200 shadow-2xl bg-white overflow-hidden aspect-[16/9] z-10 transform transition-transform hover:scale-[1.01] duration-500">
            {/* Mockup Topbar */}
            <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <div className="mx-auto bg-white border border-gray-200 h-6 w-1/2 rounded text-xs flex items-center justify-center text-gray-400">app.memora.com</div>
            </div>
            {/* Mockup content */}
            <div className="flex h-full bg-gray-50">
              <div className="w-48 border-r border-gray-200 bg-white p-4">
                <div className="h-4 w-24 bg-memora-border rounded mb-6"></div>
                <div className="space-y-3">
                  <div className="h-3 w-full bg-gray-100 rounded"></div>
                  <div className="h-3 w-5/6 bg-gray-100 rounded"></div>
                  <div className="h-3 w-full bg-gray-100 rounded"></div>
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="h-8 w-2/3 bg-memora-light rounded border border-memora-border"></div>
                  <div className="h-8 w-1/3 bg-memora-primary/10 rounded border border-memora-primary/20"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-32 bg-white rounded-lg border border-gray-200 shadow-sm p-4"></div>
                  <div className="h-32 bg-white rounded-lg border border-gray-200 shadow-sm p-4"></div>
                  <div className="h-32 bg-white rounded-lg border border-gray-200 shadow-sm p-4"></div>
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
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-memora-border">
                  <label className="text-sm font-semibold mb-2 block text-gray-700">Import via Link</label>
                  <div className="flex gap-2">
                    <input type="text" readOnly value="https://chatgpt.com/share/b498f..." className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-500 outline-none" />
                    <button className="bg-memora-primary text-white px-6 py-3 rounded-lg font-medium shadow w-32">Import</button>
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
              <div className="flex-1 w-full relative">
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-memora-border h-64 flex flex-col">
                  <div className="flex-1 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex items-center justify-center p-6 text-gray-400 text-center text-sm">
                    &quot;I built an AI tool that...&quot; <br/> (Pasted Reddit Thread content)
                  </div>
                </div>
                <div className="absolute -bottom-5 right-10 bg-white px-4 py-2 rounded-full shadow-lg border border-memora-border font-bold text-sm flex items-center gap-2 text-memora-dark">
                  🤖 Detected: Reddit Thread <span className="text-green-500">✅</span>
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
                <div className="bg-white rounded-2xl shadow-xl border border-memora-border overflow-hidden">
                  <div className="bg-gray-100 border-b border-gray-200 p-3 flex items-center gap-4">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex gap-3 text-sm flex-1">
                      <span className="text-gray-500 bg-gray-200 px-3 py-1 rounded cursor-default">Apps</span>
                      <span className="bg-memora-light text-memora-dark px-3 py-1 rounded font-bold border border-memora-primary shadow-[0_0_10px_rgba(34,197,94,0.3)] flex items-center gap-2 cursor-pointer">
                        💚 Save to Memora
                      </span>
                    </div>
                  </div>
                  <div className="p-6 bg-white h-40 pt-10">
                     <div className="mx-auto w-1/2 flex items-start flex-col gap-2">
                        <div className="h-6 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
                        <div className="h-4 w-4/6 bg-gray-100 rounded"></div>
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

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 px-6 bg-[#F0FDF4]">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="bg-memora-primary/10 text-memora-dark font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full mb-6">Simple Pricing</div>
          <h2 className="font-heading text-4xl font-bold mb-10 text-center">Start free. Upgrade when you&apos;re ready.</h2>

          <div className="flex items-center gap-4 bg-white p-2 rounded-full border border-memora-border mb-16 shadow-sm">
            <button className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${!yearly ? 'bg-memora-dark text-white' : 'text-memora-muted'}`} onClick={() => setYearly(false)}>Monthly</button>
            <button className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${yearly ? 'bg-memora-dark text-white' : 'text-memora-muted'}`} onClick={() => setYearly(true)}>Yearly <span className="text-memora-primary text-xs ml-1">(Save 38%)</span></button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 w-full max-w-5xl items-start">
            {/* Free */}
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm relative">
              <h3 className="font-bold text-2xl mb-2 text-gray-900">Free</h3>
              <div className="font-heading text-5xl font-extrabold mb-6">$0 <span className="text-lg font-medium text-gray-400">/ month</span></div>
              <ul className="space-y-4 mb-8 text-gray-600 font-medium text-sm">
                <li className="flex items-center gap-3"><Check size={18} className="text-memora-primary"/> 10 notebooks</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-memora-primary"/> 5 imports/day (URL, paste, bookmark)</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-memora-primary"/> Basic cross-search</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-memora-primary"/> 10 AI queries/month</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-memora-primary"/> 5 flashcard decks</li>
              </ul>
              <Link href="/login" className="block w-full text-center py-4 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors">Start Free — No Card</Link>
            </div>

            {/* Pro */}
            <div className="bg-memora-primary text-white p-8 rounded-3xl border border-memora-dark shadow-[0_20px_40px_-15px_rgba(34,197,94,0.5)] relative transform lg:-translate-y-4">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-memora-dark text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow">Most Popular</div>
              <h3 className="font-bold text-2xl mb-2 text-white/90">Pro</h3>
              <div className="font-heading text-5xl font-extrabold mb-6 text-white">${yearly ? '5.5' : '9'} <span className="text-lg font-medium text-white/70">/ month</span></div>
              <ul className="space-y-4 mb-8 text-white/90 font-medium text-sm">
                <li className="flex items-center gap-3"><Check size={18} className="text-white"/> Unlimited notebooks & imports</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-white"/> Unlimited cross-search & AI queries</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-white"/> Bookmarklet + Email inbox import</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-white"/> Cloud sync across devices</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-white"/> Automation pipelines & Podcast feed</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-white"/> Bulk import & export</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-white"/> Priority support</li>
              </ul>
              <Link href="/login" className="block w-full text-center py-4 rounded-xl bg-white text-memora-primary font-black hover:bg-gray-50 shadow-md transition-colors">Upgrade to Pro &rarr;</Link>
            </div>

            {/* Team */}
            <div className="bg-white p-8 rounded-3xl border-2 border-memora-dark/20 shadow-sm relative">
              <h3 className="font-bold text-2xl mb-2 text-gray-900">Team</h3>
              <div className="font-heading text-5xl font-extrabold mb-6">$12 <span className="text-lg font-medium text-gray-400">/ seat / month</span></div>
              <p className="text-xs text-memora-muted mb-6 -mt-4 font-medium">(min 3 seats)</p>
              <ul className="space-y-4 mb-8 text-gray-600 font-medium text-sm">
                <li className="flex items-center gap-3"><Check size={18} className="text-memora-dark"/> Everything in Pro</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-memora-dark"/> Shared team notebooks</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-memora-dark"/> Shared prompt libraries</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-memora-dark"/> Admin dashboard</li>
                <li className="flex items-center gap-3"><Check size={18} className="text-memora-dark"/> Priority support SLA</li>
              </ul>
              <Link href="/login" className="block w-full text-center py-4 rounded-xl bg-memora-dark text-white font-bold hover:bg-[#14532D] shadow transition-colors">Contact for Teams</Link>
            </div>
          </div>
          
          <div className="mt-10 font-medium text-memora-muted text-sm tracking-wide">
            30-day money-back guarantee · Cancel anytime · No hidden fees
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
              <li><Link href="#pricing" className="hover:text-memora-primary">Pricing</Link></li>
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
          <p className="mt-2 md:mt-0 flex items-center gap-1">Built with 💚 by humans & AI</p>
        </div>
      </footer>
    </div>
  );
}
