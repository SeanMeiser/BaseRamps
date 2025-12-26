import svgPaths from "./svg-j5n6q36op7";
import imgPlaceholderColorPickerBg from "figma:asset/4a4f248cd1c67ac8ee4c4bb419ed2361e2294c1a.png";

function ColorHandle() {
  return (
    <div className="absolute bg-white content-stretch flex items-center left-[270px] p-[6px] size-[30px] top-[34px]" data-name="ColorHandle">
      <div className="basis-0 bg-[#dd3637] grow h-full min-h-px min-w-px shrink-0" data-name="MiniSwatch" />
    </div>
  );
}

export default function ColorPicker() {
  return (
    <div className="bg-white border border-[#c4c4c4] border-solid relative size-full" data-name="ColorPicker">
      <div className="absolute h-[378px] left-[-1px] top-[-1px] w-[376px]" data-name="PlaceholderColorPickerBG">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[160.39%] left-[-8.25%] max-w-none top-[-8.7%] w-[116.5%]" src={imgPlaceholderColorPickerBg} />
        </div>
      </div>
      <div className="absolute h-[111px] left-[-1px] top-[-1px] w-[376px]" data-name="IsobarOverlay">
        <div className="absolute inset-[-0.45%_-0.13%_-1.34%_-0.13%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 377 112.984" xmlnsXlink="http://www.w3.org/1999/xlink">
            <path d={svgPaths.p1d1b8900} id="LightConstraintsIndicator" stroke="var(--stroke-0, white)" />
          </svg>
        </div>
      </div>
      <ColorHandle />
    </div>
  );
}