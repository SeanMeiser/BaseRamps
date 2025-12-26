function Labels() {
  return (
    <div className="content-stretch flex font-['JetBrains_Mono:Regular',sans-serif] font-normal items-end justify-between leading-[normal] relative shrink-0 text-[#7a7a7a] text-[16px] text-nowrap w-full" data-name="Labels">
      <p className="relative shrink-0">95%</p>
      <p className="relative shrink-0">5%</p>
    </div>
  );
}

function PortionActive() {
  return (
    <div className="absolute content-stretch flex items-center left-[41px] top-0 w-[294px]" data-name="PortionActive">
      <div className="bg-[#020202] shrink-0 size-[16px]" data-name="HandleMin" />
      <div className="basis-0 bg-[#020202] grow h-[6px] min-h-px min-w-px shrink-0" data-name="Active" />
      <div className="bg-[#020202] shrink-0 size-[16px]" data-name="HandleMax" />
    </div>
  );
}

function LightnessLimitControlBar() {
  return (
    <div className="h-[16px] relative shrink-0 w-[376px]" data-name="LightnessLimitControlBar">
      <div className="absolute bg-[#e6e6e6] h-[6px] left-1/2 top-[5px] translate-x-[-50%] w-[376px]" data-name="PortionDisabled" />
      <PortionActive />
    </div>
  );
}

export default function LightnessRangeControls() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative size-full" data-name="LightnessRangeControls">
      <Labels />
      <LightnessLimitControlBar />
    </div>
  );
}