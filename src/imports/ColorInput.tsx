import svgPaths from "./svg-kkxrrzwln3";

function Type() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center pb-[12px] pt-[8px] px-[16px] relative shrink-0" data-name="Type">
      <p className="font-['PP_Neue_Montreal:Book',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18180f] text-[21.33px] w-full">Hex</p>
    </div>
  );
}

function CaretDownLight() {
  return (
    <div className="relative shrink-0 size-[28.31px]" data-name="caret-down-light">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28.31 28.31">
        <g id="caret-down-light">
          <path d={svgPaths.p1efa0f00} fill="var(--fill-0, #18180F)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Plus() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip px-[3.538px] py-[14.154px] relative shrink-0 size-[46px]" data-name="plus">
      <CaretDownLight />
    </div>
  );
}

function Chevron() {
  return (
    <div className="content-stretch flex h-full items-center relative shrink-0" data-name="Chevron">
      <div className="bg-[#c4c4c4] h-full shrink-0 w-px" data-name="Div" />
      <Plus />
    </div>
  );
}

function InputTypeDropDown() {
  return (
    <div className="content-stretch flex items-center relative self-stretch shrink-0" data-name="InputTypeDropDown">
      <div aria-hidden="true" className="absolute border border-[#c4c4c4] border-solid inset-0 pointer-events-none" />
      <Type />
      <Chevron />
    </div>
  );
}

function InputField() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0" data-name="InputField">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pb-[12px] pt-[8px] px-[16px] relative w-full">
          <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#18180f] text-[21.33px] w-full">DE3636</p>
        </div>
      </div>
    </div>
  );
}

function Opacity() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center pb-[12px] pt-[8px] px-[16px] relative shrink-0" data-name="Opacity">
      <div aria-hidden="true" className="absolute border-[#c4c4c4] border-[0px_0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#18180f] text-[21.33px] w-[39px]">100</p>
      <p className="font-['PP_Neue_Montreal:Book',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18180f] text-[21.33px] text-nowrap">%</p>
    </div>
  );
}

function Input() {
  return (
    <div className="basis-0 content-stretch flex grow items-center justify-between min-h-px min-w-px relative shrink-0" data-name="Input">
      <div aria-hidden="true" className="absolute border border-[#c4c4c4] border-solid inset-0 pointer-events-none" />
      <InputField />
      <Opacity />
    </div>
  );
}

export default function ColorInput() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative size-full" data-name="ColorInput">
      <InputTypeDropDown />
      <Input />
    </div>
  );
}