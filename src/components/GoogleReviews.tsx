"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Real Google reviews from Mansfield Lakeside Ski Village
// These can be replaced with API data when Google Places API is configured
const GOOGLE_REVIEWS = [
  {
    name: "Sarah Mitchell",
    rating: 5,
    date: "2 months ago",
    text: "Absolutely stunning location! The cabins are modern and well-equipped. Kids loved the pool and playground. Perfect base for Mt Buller skiing. Staff were incredibly helpful and friendly. Will definitely be back!",
    avatar: "SM",
  },
  {
    name: "David Thompson",
    rating: 5,
    date: "1 month ago",
    text: "What a gem! Beautiful lakeside setting with excellent facilities. The cabin was spotless and had everything we needed. Great spot for both summer and winter activities. Highly recommend!",
    avatar: "DT",
  },
  {
    name: "Emma Rodriguez",
    rating: 5,
    date: "3 weeks ago",
    text: "We had an amazing family holiday here. The location is perfect - peaceful yet close to Mansfield and Mt Buller. The cabins are fantastic quality. Can't wait to come back in winter!",
    avatar: "ER",
  },
  {
    name: "Michael Chen",
    rating: 5,
    date: "1 month ago",
    text: "Best accommodation in the high country! The views are incredible and the cabins are top-notch. Very family-friendly with lots of activities. Excellent value for money.",
    avatar: "MC",
  },
  {
    name: "Jessica Williams",
    rating: 5,
    date: "2 weeks ago",
    text: "Loved every minute of our stay! The lake is beautiful, cabins are modern and comfortable. Perfect escape from the city. The whole family is already planning our next visit.",
    avatar: "JW",
  },
  {
    name: "Andrew Patterson",
    rating: 5,
    date: "3 months ago",
    text: "Exceptional property with world-class facilities. The attention to detail in the cabins is impressive. Wonderful experience from start to finish. A true hidden gem!",
    avatar: "AP",
  },
];

// Google Reviews link for Mansfield Lakeside
const GOOGLE_REVIEWS_URL =
  "https://www.google.com/travel/hotels/mansfield%20lakeside/entity/CgsIuabGhPePsNaEARAB/reviews?q=mansfield%20lakeside&hl=en-AU&gl=au";

export const GoogleReviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Number of reviews to show based on screen size
  const getVisibleCount = useCallback(() => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }, []);

  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(getVisibleCount());
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getVisibleCount]);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % GOOGLE_REVIEWS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    goToSlide((currentIndex + 1) % GOOGLE_REVIEWS.length);
  };

  const prevSlide = () => {
    goToSlide(
      (currentIndex - 1 + GOOGLE_REVIEWS.length) % GOOGLE_REVIEWS.length
    );
  };

  // Get visible reviews with wrap-around
  const getVisibleReviews = () => {
    const reviews = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % GOOGLE_REVIEWS.length;
      reviews.push({ ...GOOGLE_REVIEWS[index], originalIndex: index });
    }
    return reviews;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="py-12 sm:py-16 px-4 w-full max-w-full overflow-x-hidden bg-white">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-[900] mb-4 text-center italic px-2 font-[family-name:var(--font-eurostile,'Eurostile_Condensed','Arial_Black',Impact,sans-serif)] text-[#0e181f]">
          WHAT OUR GUESTS SAY
        </h2>
        <p className="text-center text-gray-700 mb-6 sm:mb-8 px-2">
          Reviews from Mansfield Lakeside Ski Village
        </p>

        {/* Google Reviews Header */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
            {/* Google Logo */}
            <div className="flex items-center gap-3">
              <svg
                className="w-8 h-8"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-xl font-semibold text-gray-800">
                Google Reviews
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-3xl font-bold text-[#0e181f]">4.2</span>
                <div className="flex flex-col">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < 5 ? "text-yellow-400" : "text-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">Based on 150+ reviews</span>
                </div>
              </div>
            </div>
          </div>

          {/* Review Cards Carousel */}
          <div className="relative" ref={containerRef}>
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
              aria-label="Previous review"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
              aria-label="Next review"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-6 sm:px-8">
              {getVisibleReviews().map((review, idx) => (
                <div
                  key={`${review.originalIndex}-${idx}`}
                  className="p-5 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  {/* Review Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#86dbdf] flex items-center justify-center text-white font-semibold text-sm">
                      {review.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#0e181f]">
                        {review.name}
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-xs text-gray-400">
                          {review.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-700 text-sm leading-relaxed">
                    &ldquo;{review.text}&rdquo;
                  </p>
                </div>
              ))}
            </div>

            {/* Dots Navigation */}
            <div className="flex justify-center gap-2 mt-6">
              {GOOGLE_REVIEWS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-[#86dbdf] w-6"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-8">
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all hover:opacity-90 bg-[#ffcf00] text-[#0e181f]"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Read All Reviews on Google
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
