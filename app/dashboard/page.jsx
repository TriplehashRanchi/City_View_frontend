"use client";

import React from "react";
import { 
  ArrowUpRight, 
  CalendarClock, 
  FileCheck2, 
  Handshake, 
  Sparkles, 
  Users, 
  Plus, 
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2
} from "lucide-react";


const statCards = [
  {
    title: "Quarterly Events",
    value: "45",
    change: "+12.5%",
    icon: CalendarClock,
  },
  {
    title: "Pending Proposals",
    value: "120",
    change: "+18.2%",
    icon: FileCheck2,
  },
  {
    title: "Contract Conversion",
    value: "64%",
    change: "+4.1%",
    icon: Handshake,
  },
  {
    title: "Guest Reach",
    value: "1.2k",
    change: "+6.3%",
    icon: Users,
  },
];

const upcomingEvents = [
  { 
    title: "Royal Banquet Wedding", 
    date: "March 12", 
    time: "06:00 PM", 
    venue: "Grand Ballroom",
    status: "Confirmed",
    color: "text-emerald-400" 
  },
  { 
    title: "Tech Founders Gala", 
    date: "March 14", 
    time: "07:30 PM", 
    venue: "Sky Lounge",
    status: "Preparation",
    color: "text-amber-400" 
  },
  { 
    title: "Silver Jubilee Dinner", 
    date: "March 19", 
    time: "08:00 PM", 
    venue: "Main Hall",
    status: "Drafting",
    color: "text-zinc-500" 
  },
];

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-10 p-4 md:p-8 text-zinc-300">
      
      {/* --- HERO SECTION: Editorial Style --- */}
      <header className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/80">
            <span className="h-px w-8 bg-amber-500/50"></span>
            Management Suite
          </div>
          <h1 className="text-4xl font-light tracking-tight text-black md:text-5xl">
            Good Evening, <span className="font-serif italic text-amber-200/90">Alexander</span>
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-zinc-500">
            The venue is running at peak performance. You have three gala events scheduled for this weekend.
          </p>
        </div>
        
        <button className="group flex bg-amber-300 items-center gap-3 rounded-full text px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-amber-400 hover:scale-105 active:scale-95">
          <Plus size={16} strokeWidth={3} />
          New Reservation
        </button>
      </header>

      {/* --- METRICS: Jewelry-Box Style --- */}
      <div className="grid gap-px overflow-hidden rounded-[2rem] border border-white/5 bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="group relative bg-[#0D0D0F] p-8 transition-colors hover:bg-zinc-900/40">
            <div className="mb-6 flex items-center justify-between">
              <div className="rounded-full bg-amber-500/10 p-2.5 text-amber-500 ring-1 ring-amber-500/20">
                <card.icon size={18} />
              </div>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-md">
                {card.change}
              </span>
            </div>
            <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-500">{card.title}</h3>
            <p className="mt-2 text-4xl font-light tracking-tighter text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* --- MAIN CONTENT: Balanced Asymmetry --- */}
      <div className="grid gap-10 lg:grid-cols-5">
        
        {/* Event Timeline (60% width) */}
        <section className="lg:col-span-3">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-medium tracking-tight text-black">Event Schedule</h2>
            <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 transition-colors hover:text-amber-500">
              Full Calendar <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-4">
            {upcomingEvents.map((event, i) => (
              <div key={i} className="group flex items-center gap-6 rounded-3xl border border-white/5 bg-[#141417]/50 p-6 transition-all hover:bg-zinc-900/50">
                <div className="hidden flex-col items-center text-center md:flex">
                  <span className="text-xs font-bold text-zinc-500 uppercase">{event.date.split(' ')[0]}</span>
                  <span className="text-xl font-light text-white">{event.date.split(' ')[1]}</span>
                </div>
                
                <div className="h-10 w-px bg-white/5 hidden md:block" />

                <div className="flex-1 space-y-1">
                  <h4 className="font-medium text-zinc-100 group-hover:text-amber-200 transition-colors">{event.title}</h4>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5"><Clock size={12} /> {event.time}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={12} /> {event.venue}</span>
                  </div>
                </div>

                <div className={`text-[10px] font-bold uppercase tracking-widest ${event.color}`}>
                  {event.status}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Focus List (40% width) */}
        <section className="lg:col-span-2">
          <div className="h-full rounded-[2.5rem] border border-amber-500/10 bg-gradient-to-b from-amber-500/[0.03] to-transparent p-8">
            <h2 className="text-xl font-medium tracking-tight text-black">Maitre D' Focus</h2>
            <p className="mt-1 text-xs text-zinc-500">Priority actions for the current shift</p>

            <div className="mt-10 space-y-8">
              {[
                { task: "Approve Champagne inventory for Friday", sub: "Inventory Control" },
                { task: "Finalize seating chart for Royal Banquet", sub: "Floor Management" },
                { task: "Staff briefing at 04:00 PM", sub: "Operations" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="mt-1">
                    <CheckCircle2 size={18} className="text-zinc-800 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-300 group-hover:text-white">{item.task}</p>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-2xl bg-white/[0.02] p-6 border border-white/5">
              <div className="flex items-center gap-2 text-amber-500 mb-2">
                <Sparkles size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Premium Insight</span>
              </div>
              <p className="text-xs leading-relaxed text-zinc-400">
                Wedding of Alistair has <span className="text-white">12 VIP guests</span> confirmed. Special dietary protocols have been sent to the kitchen.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}