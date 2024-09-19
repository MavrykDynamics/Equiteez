export const ComingSoon = () => {
  return (
    <section className="w-full h-full flex-1 flex justify-center items-center">
      <h3 className="text-card-headline text-green-500">Coming Soon...</h3>
    </section>
  );
};

export const ComingSoonFiber = () => {
  return (
    <div className="absolute top-0 left-0 inxet-0 z-10 bg-[#FFFFFF80] w-full h-full">
      <ComingSoon />
    </div>
  );
};
