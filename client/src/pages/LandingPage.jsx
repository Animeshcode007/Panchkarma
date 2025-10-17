// src/pages/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpa } from '@fortawesome/free-solid-svg-icons';
import { faLeaf } from '@fortawesome/free-solid-svg-icons';
import { faGopuram } from '@fortawesome/free-solid-svg-icons';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-6 container mx-auto">
        <div className="text-2xl font-bold text-gray-800">AyurSutra</div>
        <nav className="space-x-8">
          <Link to="/faq" className="text-gray-600 hover:text-gray-900">
            FAQ
          </Link>
          <Link
            to="/login"
            className="px-5 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        className="relative h-[600px] bg-cover bg-center flex items-center justify-center text-center px-4"
        style={{
          backgroundImage:
            'url("./Google_AI_Studio_2025-09-11T12_46_52.937Z.png")',
        }} // Replace with your hero image URL
      >
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative z-10 text-white">
          <h1 className="text-5xl font-bold mb-4">
            AyurSutra: Embrace the Wisdom of Ayurveda
          </h1>
          <p className="text-2xl mb-8">
            Harmonizing Mind, Body and Spirit for Optimal Well-being
          </p>
          <Link
            to="/login" // You might want to create a separate page for offerings or link to a section
            className="bg-yellow-400 text-gray-900 font-semibold py-3 px-8 rounded-full text-lg hover:bg-yellow-300 transition duration-300"
          >
            Explore Our Offerings
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto py-16 px-4">
        <div className="grid md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center">
            {/* Placeholder for icon - you'd use an SVG or an actual image here */}
            <div className="text-6xl text-gray-700 mb-4">
             <FontAwesomeIcon icon={faSpa} />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Personalized Wellness
            </h3>
            <p className="text-gray-600">
              Tailored plans to suit your unique constitution.
            </p>
          </div>
          <div className="flex flex-col items-center">
            {/* Placeholder for icon */}
            <div className="text-6xl text-gray-700 mb-4">
              <FontAwesomeIcon icon={faLeaf} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Natural Remedies</h3>
            <p className="text-gray-600">
              Harnessing nature's power for healing.
            </p>
          </div>
          <div className="flex flex-col items-center">
            {/* Placeholder for icon */}
            <div className="text-6xl text-gray-700 mb-4">
                <FontAwesomeIcon icon={faGopuram} />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Holistic Lifestyle Guidance
            </h3>
            <p className="text-gray-600">
              Integrative approaches for a balanced life.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
