export function SiteHeader({simple=true}) {

  return (
    <>
    {!simple ? (
      <>
      <div className="flex gap-1 text-xl justify-center animate-slide-down mt-1">
        <div className="flex"><span className="font-bold">s</span><span >onic</span></div>
        <div className="flex"><span className="font-bold">h</span><span >armony</span></div>
        <div className="flex"><span className="font-bold">h</span><span >ub</span></div>
        <p className="font-extralight text-muted-foreground">v0.069</p>
      </div>
      </>

    ) : (
      <div className="flex gap-1 text-xl justify-center mt-1 animate-slide-down">
        <span className="font-bold">shh</span>
      </div>
    )}
    </>
  )
}