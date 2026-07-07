
const FolderGraphic = () => {
  return (
    <section className="relative group flex flex-col items-center justify-center w-full h-full">
      <div className="file relative w-60 h-40 cursor-pointer origin-bottom perspective-[1500px] z-50">
        {/* Back Cover */}
        <div className="work-5 bg-linear-to-b from-primary/90 to-primary/30 backdrop-blur-md border border-primary/20 w-full h-full origin-top rounded-2xl rounded-tl-none group-hover:shadow-[0_20px_40px_rgba(0,0,0,.2)] transition-all ease duration-300 relative after:absolute after:content-[''] after:bottom-[99%] after:left-0 after:w-20 after:h-4 after:bg-primary/90 after:backdrop-blur-md after:border-t after:border-l after:border-primary/20 after:rounded-t-2xl before:absolute before:content-[''] before:top-[-15px] before:left-[75.5px] before:w-4 before:h-4 before:bg-primary/90 before:backdrop-blur-md before:[clip-path:polygon(0_35%,0%_100%,50%_100%);]" />
        
        {/* Papers - Hidden by default to prevent showing through closed glass cover */}
        <div className="work-4 absolute inset-1 bg-background border border-border rounded-2xl transition-all ease duration-300 opacity-0 group-hover:opacity-100 origin-bottom select-none group-hover:transform-[rotateX(-20deg)]" />
        <div className="work-3 absolute inset-1 bg-muted border border-border rounded-2xl transition-all ease duration-300 opacity-0 group-hover:opacity-100 origin-bottom group-hover:transform-[rotateX(-30deg)]" />
        <div className="work-2 absolute inset-1 bg-card border border-border shadow-sm rounded-2xl transition-all ease duration-300 opacity-0 group-hover:opacity-100 origin-bottom group-hover:transform-[rotateX(-38deg)] flex flex-col gap-2 p-4">
          <div className="w-1/2 h-2 bg-muted-foreground/20 rounded-full" />
          <div className="w-3/4 h-2 bg-muted-foreground/20 rounded-full" />
          <div className="w-5/6 h-2 bg-muted-foreground/20 rounded-full" />
        </div>
        
        {/* Front Cover */}
        <div className="work-1 absolute bottom-0 bg-linear-to-b from-primary/90 to-primary/20 backdrop-blur-xl border border-white/20 shadow-lg w-full h-[156px] rounded-2xl rounded-tr-none after:absolute after:content-[''] after:bottom-[99%] after:right-0 after:w-[146px] after:h-[16px] after:bg-primary/90 after:backdrop-blur-xl after:border-t after:border-r after:border-white/20 after:rounded-t-2xl before:absolute before:content-[''] before:top-[-10px] before:right-[142px] before:size-3 before:bg-primary/90 before:[clip-path:polygon(100%_14%,50%_100%,100%_100%);] transition-all ease duration-300 origin-bottom flex items-end group-hover:shadow-[inset_0_20px_40px_hsl(var(--primary)/0.2),inset_0_-20px_40px_hsl(var(--primary)/0.3)] group-hover:transform-[rotateX(-46deg)_translateY(1px)]" />
      </div>
    </section>
  );
}

export default FolderGraphic;
























