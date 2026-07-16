import React from "react"
import tallyWordmarkGiant from "/tally-brand-assets/wordmark/tally-wordmark-blue-giant-4000px.png"

export default function Footer() {
  return (
    <footer className="relative mt-auto">
      <div className="overflow-hidden h-24 sm:h-32 md:h-40 lg:h-48 opacity-[0.08]">
        <img
          src={tallyWordmarkGiant}
          alt="Tally"
          className="w-full h-full object-cover object-bottom"
          draggable={false}
        />
      </div>
    </footer>
  )
}