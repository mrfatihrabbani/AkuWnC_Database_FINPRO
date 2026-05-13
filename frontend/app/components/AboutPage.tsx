"use client";

import { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { appInfoAPI } from "../config/api";

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
}

interface AppInfo {
  aboutText: string;
  version: string;
  contactEmail?: string;
  faqs: FAQ[];
}

export default function AboutPage() {
  const [info, setInfo] = useState<AppInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"about" | "faq">("about");

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    try {
      const { data } = await appInfoAPI.getDetails();
      setInfo(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not load app information");
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  // group faqs by category
  const groupedFaqs = info?.faqs?.reduce((acc, faq) => {
    const cat = faq.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-[#a89880] text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="p-6">
        <div className="bg-[#2a2420] rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">About AkuWnC</h2>
          <p className="text-[#a89880] mb-4">
            {error || "No app information has been configured yet."}
          </p>
          <p className="text-[#a89880] text-sm">
            A social film & series platform where you can rate, review, and discover content with friends.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* tabs */}
      <div className="flex gap-1 mb-6 bg-[#2a2420] rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab("about")}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "about"
              ? "bg-[#c49148] text-white"
              : "text-[#a89880] hover:text-white"
          }`}
        >
          About
        </button>
        <button
          onClick={() => setActiveTab("faq")}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "faq"
              ? "bg-[#c49148] text-white"
              : "text-[#a89880] hover:text-white"
          }`}
        >
          FAQ
        </button>
      </div>

      {/* about */}
      {activeTab === "about" && (
        <div className="space-y-6">
          <div className="bg-[#2a2420] rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">About AkuWnC</h2>
            <p className="text-[#a89880] leading-relaxed whitespace-pre-line">
              {info.aboutText}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#2a2420] rounded-xl p-5">
              <p className="text-[#a89880] text-sm mb-1">Version</p>
              <p className="text-white font-semibold">{info.version}</p>
            </div>
            {info.contactEmail && (
              <div className="bg-[#2a2420] rounded-xl p-5">
                <p className="text-[#a89880] text-sm mb-1">Contact</p>
                <a
                  href={`mailto:${info.contactEmail}`}
                  className="text-[#c49148] font-semibold hover:underline"
                >
                  {info.contactEmail}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* faq */}
      {activeTab === "faq" && (
        <div className="space-y-6">
          {groupedFaqs && Object.keys(groupedFaqs).length > 0 ? (
            Object.entries(groupedFaqs).map(([category, faqs]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-[#c49148] mb-3">{category}</h3>
                <div className="space-y-2">
                  {faqs.map((faq) => (
                    <div
                      key={faq._id}
                      className="bg-[#2a2420] rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFaq(faq._id)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#3d352c] transition-colors"
                      >
                        <span className="text-white font-medium pr-4">{faq.question}</span>
                        {openFaq === faq._id ? (
                          <ChevronUpIcon className="w-5 h-5 text-[#a89880] flex-shrink-0" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5 text-[#a89880] flex-shrink-0" />
                        )}
                      </button>
                      {openFaq === faq._id && (
                        <div className="px-5 pb-4 border-t border-[#3d352c]">
                          <p className="text-[#a89880] pt-3 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#2a2420] rounded-2xl p-8 text-center">
              <p className="text-[#a89880]">No FAQs have been added yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
