import React from 'react';

const DecorativeShapes = () => {
  return (
    <>
      {/* Pink shape - top right */}
      <div
        className="absolute w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full blur-[60px] md:blur-[80px] opacity-15 md:opacity-20 -top-[5%] -right-[5%] z-0"
        style={{ backgroundColor: '#FF95DD' }}
      ></div>

      {/* Blue shape - bottom left */}
      <div
        className="absolute w-[150px] h-[150px] md:w-[250px] md:h-[250px] rounded-full blur-[60px] md:blur-[80px] opacity-15 md:opacity-20 bottom-[10%] left-[10%] z-0"
        style={{ backgroundColor: '#B7BEFE' }}
      ></div>

      {/* Yellow shape - middle left */}
      <div
        className="absolute w-[120px] h-[120px] md:w-[200px] md:h-[200px] rounded-full blur-[60px] md:blur-[80px] opacity-15 md:opacity-20 bottom-[40%] left-[25%] z-0 hidden md:block"
        style={{ backgroundColor: '#F6FF7F' }}
      ></div>
    </>
  );
};

export default DecorativeShapes;
