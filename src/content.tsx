import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://turo.com/us/en/search*"],
  
  all_frames: true
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const getInlineAnchor: PlasmoGetInlineAnchor = () => {
  const searchFilterElement = document.querySelector('.searchFilter');
  const parentElement = searchFilterElement ? searchFilterElement.parentElement : null;

  return {
    element: parentElement,
    insertPosition: "afterbegin"
  };
};


const RaptorExplorerButton = () => {
  const handleClick = () => {
    console.log("Raptor Explorer clicked!")
    // Add your button click logic here
  }

  return (
    <button
      onClick={handleClick}
      className="plasmo-bg-blue-600 plasmo-text-white plasmo-px-4 plasmo-py-2 plasmo-rounded-md plasmo-font-medium plasmo-text-xs hover:plasmo-bg-blue-700 plasmo-transition-colors">
      Raptor Explorer
    </button>
  )
}

const PlasmoInject = () => {
  return <RaptorExplorerButton />
}

export default PlasmoInject