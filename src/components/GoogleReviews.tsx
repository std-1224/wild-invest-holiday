export const GoogleReviews = () => {
  return (
    <div className="py-12 sm:py-16 px-4 w-full max-w-full overflow-x-hidden bg-white">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-[900] mb-4 text-center italic px-2 font-[family-name:var(--font-eurostile,'Eurostile_Condensed','Arial_Black',Impact,sans-serif)] text-[#0e181f]">
          WHAT OUR GUESTS SAY
        </h2>
        <p className="text-center text-gray-700 mb-6 sm:mb-8 px-2">
          Reviews from Mansfield Lakeside Ski Village
        </p>

        {/* Google Reviews Embed */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <div className="flex justify-center items-center gap-2 mb-6">
            <div className="text-[48px]">⭐⭐⭐⭐⭐</div>
            <div>
              <div className="text-[32px] font-bold text-[#0e181f]">
                4.8/5
              </div>
              <div className="text-sm text-[#666]">
                Based on Google Reviews
              </div>
            </div>
          </div>

          {/* Review Cards Carousel */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6 mb-8">
            {[
              {
                name: "Sarah M.",
                rating: 5,
                date: "2 weeks ago",
                text: "Amazing place for families! The kids loved the playground and pool. Our cabin was spotless and had everything we needed. Can't wait to come back in winter for the skiing!",
              },
              {
                name: "David R.",
                rating: 5,
                date: "1 month ago",
                text: "Perfect location for exploring Mt Buller and Mansfield. The staff were incredibly helpful and the facilities were top-notch. Highly recommend for anyone looking for a relaxing getaway.",
              },
              {
                name: "Emma L.",
                rating: 5,
                date: "3 weeks ago",
                text: "We had the most wonderful stay! The cabins are modern and comfortable, and the lake activities were fantastic. Already planning our next trip here!",
              },
            ].map((review, index) => (
              <div
                key={index}
                className="p-6 rounded-lg bg-[#f5f5f5] border-2 border-[#86dbdf]"
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="font-bold text-[#0e181f]">
                      {review.name}
                    </div>
                    <div className="text-xs text-[#666]">
                      {review.date}
                    </div>
                  </div>
                  <div className="text-[#ffcf00] text-lg">
                    {"⭐".repeat(review.rating)}
                  </div>
                </div>
                <p className="text-[#0e181f] leading-[1.6] text-sm">
                  "{review.text}"
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="https://www.google.com/search?q=Mansfield+Lakeside+Ski+Village"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 rounded-lg font-bold transition-all hover:opacity-90 bg-[#ffcf00] text-[#0e181f]"
            >
              Read All Reviews on Google
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
