import React from "react";

const GlobeEarth: React.FC = () => {
  return (
    <>
      <style>{`
        @keyframes earthRotate {
          0% { background-position: 0 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes twinkling { 0%,100% { opacity:0.1; } 50% { opacity:1; } }
        @keyframes twinkling-slow { 0%,100% { opacity:0.1; } 50% { opacity:1; } }
        @keyframes twinkling-long { 0%,100% { opacity:0.1; } 50% { opacity:1; } }
        @keyframes twinkling-fast { 0%,100% { opacity:0.1; } 50% { opacity:1; } }
      `}</style>
      <div className="flex items-center justify-center h-full w-full">
        <div
          className="relative w-[320px] h-[320px] rounded-full overflow-hidden"
          style={{
            backgroundImage: "url('https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/globe.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "left",
            animation: "earthRotate 30s linear infinite",
            boxShadow:
              "0 0 60px rgba(255,107,107,0.15), 0 0 120px rgba(100,150,255,0.1), -5px 0 12px #c3f4ff inset, 15px 2px 30px #000 inset, -24px -2px 40px #c3f4ff88 inset, 280px 0 50px #00000077 inset, 180px 0 44px #000000aa inset",
          }}
        >
          <div className="absolute left-[-20px] top-[10px] w-1 h-1 bg-white rounded-full" style={{ animation: "twinkling 3s infinite" }} />
          <div className="absolute left-[-40px] top-[30px] w-1 h-1 bg-white rounded-full" style={{ animation: "twinkling-slow 2s infinite" }} />
          <div className="absolute left-[370px] top-[90px] w-1 h-1 bg-white rounded-full" style={{ animation: "twinkling-long 4s infinite" }} />
          <div className="absolute left-[200px] top-[310px] w-1 h-1 bg-white rounded-full" style={{ animation: "twinkling 3s infinite" }} />
          <div className="absolute left-[50px] top-[290px] w-1 h-1 bg-white rounded-full" style={{ animation: "twinkling-fast 1.5s infinite" }} />
          <div className="absolute left-[280px] top-[-50px] w-1 h-1 bg-white rounded-full" style={{ animation: "twinkling-long 4s infinite" }} />
          <div className="absolute left-[310px] top-[60px] w-1 h-1 bg-white rounded-full" style={{ animation: "twinkling-slow 2s infinite" }} />
        </div>
      </div>
    </>
  );
};

export default GlobeEarth;
