import React from "react";

const Footer = () => {
  return (
    <div className="bg-slate-800 text-white flex flex-col justify-center items-center fixed bottom-0 w-full">
      <div className="logo font-bold text-2xl ">
        <span className="text-green-700">&lt;</span>
        <span>Pass</span>
        <span className="text-green-700">OP/&gt;</span>
      </div>
      <div className="flex justify-center items-center">
        Created with <img className="w-7 m-2" src="heart.png" alt="heart" /> by
        PSC
      </div>
    </div>
  );
};

export default Footer;
