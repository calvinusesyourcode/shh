export function SiteHeader({home=false}) {

  return (
    <>
    {home ? (
      <div className="flex gap-1 text-xl justify-center animate-slide-down mt-1">
        <div className="flex"><span className="font-bold">s</span><span >onic</span></div>
        <div className="flex"><span className="font-bold">h</span><span >armony</span></div>
        <div className="flex"><span className="font-bold">h</span><span >ub</span></div>
      </div>
    ) : (
      <div className="flex gap-1 text-xl justify-center mt-1">
        <span className="font-extrabold">shh</span>
      </div>
    )}
    </>
  )
}