import svgPaths from "./svg-89sgc2m1nc";
import imgPlaceholderColorPickerBg from "figma:asset/4a4f248cd1c67ac8ee4c4bb419ed2361e2294c1a.png";
import imgHueBar from "figma:asset/ece298d0ec2c16f10310d45724b276a6035cb503.png";

function ControlPanelHeader() {
  return (
    <div className="bg-[#f5f5f5] h-[62px] relative shrink-0 w-full" data-name="ControlPanelHeader">
      <div aria-hidden="true" className="absolute border-[#c4c4c4] border-[0px_1px_1px_0px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[16px] py-[8px] relative size-full">
          <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#7a7a7a] text-[21.33px] text-nowrap">RAMP CONTROLS</p>
        </div>
      </div>
    </div>
  );
}

function RampName() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-name="RampName">
      <p className="basis-0 font-['PP_Neue_Montreal:Book',sans-serif] grow leading-[normal] min-h-px min-w-px not-italic relative shrink-0 text-[#18180f] text-[37.9px]">New Ramp</p>
    </div>
  );
}

function ColorHandle() {
  return (
    <div className="absolute bg-white content-stretch flex items-center left-[271px] p-[6px] size-[30px] top-[35px]" data-name="ColorHandle">
      <div className="basis-0 bg-[#dd3637] grow h-full min-h-px min-w-px shrink-0" data-name="MiniSwatch" />
    </div>
  );
}

function ColorPicker() {
  return (
    <div className="bg-white relative shrink-0 size-[376px]" data-name="ColorPicker">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute h-[378px] left-0 top-0 w-[376px]" data-name="PlaceholderColorPickerBG">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img alt="" className="absolute h-[160.39%] left-[-8.25%] max-w-none top-[-8.7%] w-[116.5%]" src={imgPlaceholderColorPickerBg} />
          </div>
        </div>
        <div className="absolute h-[111px] left-0 top-0 w-[376px]" data-name="LightConstraintsIndicator">
          <div className="absolute inset-[-0.45%_-0.13%_-1.34%_-0.13%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 377 112.984" xmlnsXlink="http://www.w3.org/1999/xlink">
              <path d={svgPaths.p1d1b8900} id="LightConstraintsIndicator" stroke="var(--stroke-0, white)" />
            </svg>
          </div>
        </div>
        <ColorHandle />
      </div>
      <div aria-hidden="true" className="absolute border border-[#c4c4c4] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function HueBar() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="HueBar">
      <div className="absolute h-[16px] left-0 right-0 top-1/2 translate-y-[-50%]" data-name="HueBar" style={{ backgroundImage: "linear-gradient(90deg, rgb(255, 13, 1) 0%, rgb(253, 152, 11) 13.979%, rgb(255, 243, 2) 28.304%, rgb(50, 255, 3) 42.79%, rgb(6, 255, 248) 56.31%, rgb(0, 2, 255) 70.957%, rgb(128, 1, 239) 83.995%, rgb(255, 0, 8) 100%)" }} />
      <div className="absolute bg-[#020202] left-0 size-[24px] top-1/2 translate-y-[-50%]" data-name="Handle" />
    </div>
  );
}

function SimulatedOpacityBar() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="SimulatedOpacityBar">
      <div className="absolute h-[16px] left-0 right-0 top-1/2 translate-y-[-50%]" data-name="HueBar">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute bg-gradient-to-r from-[rgba(128,128,128,0.01)] inset-0 to-[#808080]" />
          <img alt="" className="absolute max-w-none object-50%-50% object-cover opacity-40 size-full" src={imgHueBar} />
        </div>
      </div>
      <div className="absolute bg-[#020202] right-0 size-[24px] top-1/2 translate-y-[-50%]" data-name="Handle" />
    </div>
  );
}

function Frame() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[24px] grow items-start min-h-px min-w-px relative shrink-0">
      <HueBar />
      <SimulatedOpacityBar />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full">
      <Frame />
    </div>
  );
}

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

function ColorInput() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full" data-name="ColorInput">
      <InputTypeDropDown />
      <Input />
    </div>
  );
}

function ControlsNewColorScale() {
  return (
    <div className="bg-[#f5f5f5] h-[1021px] relative shrink-0 w-full" data-name="Controls--NewColorScale">
      <div aria-hidden="true" className="absolute border-[#c4c4c4] border-[0px_1px_0px_0px] border-solid inset-0 pointer-events-none" />
      <div className="size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-start pb-[24px] pt-[16px] px-[24px] relative size-full">
          <RampName />
          <ColorPicker />
          <Frame1 />
          <ColorInput />
        </div>
      </div>
    </div>
  );
}

export default function ControlPanel() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="ControlPanel">
      <ControlPanelHeader />
      <ControlsNewColorScale />
    </div>
  );
}