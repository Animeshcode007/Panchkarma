import React from "react";
import { Link } from "react-router-dom";

const faqData = [
  {
    category: "Ayurveda",
    questions: [
      {
        q: "What is Ayurveda?",
        a: "Ayurveda, originating in India over 5,000 years ago, is one of the world's oldest holistic healing systems. It emphasizes a balance between mind, body, and spirit, believing that health and wellness depend on this delicate equilibrium.",
      },
      {
        q: "What are the three doshas in Ayurveda?",
        a: "The three doshas are Vata (air and space), Pitta (fire and water), and Kapha (earth and water). Each person has a unique combination of these doshas, which influences their physical and mental characteristics, and their susceptibility to certain health issues.",
      },
      {
        q: "How does Ayurveda approach health?",
        a: "Ayurveda focuses on preventive healthcare and individualized treatment plans. It considers diet, lifestyle, herbal remedies, yoga, meditation, and detoxification therapies (like Panchkarma) to restore balance and promote overall well-being.",
      },
      {
        q: "Is Ayurveda scientifically proven?",
        a: "While many Ayurvedic practices have been used for thousands of years and are supported by traditional wisdom, modern scientific research on Ayurveda is ongoing. Some studies have shown promising results for certain herbs and therapies, but more rigorous research is needed for many aspects.",
      },
      {
        q: "Can Ayurveda be combined with modern medicine?",
        a: "Yes, Ayurveda can often be used complementarily with modern medicine. It's crucial to consult with both your Ayurvedic practitioner and your conventional doctor to ensure a safe and integrated approach to your health.",
      },
    ],
  },
  {
    category: "Panchkarma",
    questions: [
      {
        q: "What is Panchkarma?",
        a: 'Panchkarma is a traditional Ayurvedic detoxification and rejuvenation therapy. It literally means "five actions" and refers to five therapeutic procedures designed to eliminate toxins (ama) from the body, restore the natural balance of the doshas, and enhance the body\'s healing capabilities.',
      },
      {
        q: "What are the five main procedures of Panchkarma?",
        a: "The five main procedures generally include: Vamana (therapeutic emesis), Virechana (purgation), Basti (medicated enema), Nasya (nasal administration of oils/herbs), and Raktamokshana (bloodletting, though less common in modern practice and often replaced by other detox methods).",
      },
      {
        q: "Who can benefit from Panchkarma?",
        a: "Panchkarma can benefit individuals seeking to detoxify their body, improve digestion, reduce stress, boost immunity, alleviate chronic conditions, and promote overall vitality. It is particularly recommended for those experiencing chronic ailments, fatigue, or stress.",
      },
      {
        q: "Is Panchkarma safe?",
        a: "When performed by a qualified and experienced Ayurvedic practitioner, Panchkarma is generally considered safe. However, it is an intensive therapy, and not suitable for everyone. A thorough consultation is essential before undergoing any Panchkarma treatment.",
      },
      {
        q: "What is involved in a typical Panchkarma treatment?",
        a: "A typical Panchkarma program involves three stages: Purva Karma (preparatory procedures like oil massages and steam baths), Pradhana Karma (the main detoxification procedures), and Paschat Karma (post-treatment procedures including diet, lifestyle modifications, and rejuvenation therapies).",
      },
      {
        q: "How long does a Panchkarma treatment last?",
        a: "The duration of a Panchkarma treatment varies depending on the individual's health, constitution, and the specific therapeutic goals. It can range from 7 to 21 days, or even longer in some cases, with daily treatments and a carefully monitored regimen.",
      },
    ],
  },
];

const FAQPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header - Re-use or adapt from LandingPage */}
      <header className="flex justify-between items-center p-6 container mx-auto bg-white shadow-sm">
        <div className="text-2xl font-bold text-gray-800">AyurSutra</div>
        <nav className="space-x-8">
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link
            to="/login"
            className="px-5 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Frequently Asked Questions
        </h1>

        {faqData.map((category, index) => (
          <section key={index} className="mb-10">
            <h2 className="text-3xl font-semibold text-gray-700 mb-6 border-b-2 border-green-500 pb-2">
              {category.category}
            </h2>
            <div className="space-y-6">
              {category.questions.map((item, qIndex) => (
                <div key={qIndex} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {item.q}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};

export default FAQPage;
