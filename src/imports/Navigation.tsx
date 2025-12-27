import svgPaths from "./svg-tnay54d3y3";

function Documentation() {
  return (
    <div className="content-stretch flex h-[62px] items-center justify-center pb-[16px] pt-[12px] px-[16px] relative shrink-0" data-name="Documentation">
      <div aria-hidden="true" className="absolute border-[#c4c4c4] border-[0px_0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <p className="font-['PP_Neue_Montreal:Book',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#7a7a7a] text-[14px] xl:text-[16px] 2xl:text-[18px] text-nowrap">Documentation</p>
    </div>
  );
}

function ExportLight() {
  return (
    <div className="relative shrink-0 size-[16px] xl:size-[18px] 2xl:size-[20px]" data-name="export-light">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="export-light">
          <path d={svgPaths.p2f505f00} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Export() {
  return (
    <div className="bg-[#020202] content-stretch flex gap-[8px] h-full items-center justify-center pb-[8px] pt-[6px] px-[16px] relative shrink-0" data-name="Export">
      <p className="font-['PP_Neue_Montreal:Book',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] xl:text-[16px] 2xl:text-[18px] text-nowrap text-white">Export</p>
      <ExportLight />
    </div>
  );
}

function ButtonGroup() {
  return (
    <div className="content-stretch flex h-full items-center justify-end relative shrink-0" data-name="ButtonGroup">
      <Documentation />
      <Export />
    </div>
  );
}

export default function Navigation() {
  return (
    <div className="bg-[#f5f5f5] relative size-full" data-name="Navigation">
      <div aria-hidden="true" className="absolute border-[#c4c4c4] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pl-[24px] pr-0 py-0 relative size-full">
          <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[14px] xl:text-[16px] 2xl:text-[18px] text-black text-nowrap">BASE PALETTE BUILDER</p>
          <ButtonGroup />
        </div>
      </div>
    </div>
  );
}