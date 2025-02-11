import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import RaptorExplorerButton from "~components/RaptorExplorerButton"

export const config: PlasmoCSConfig = {
  matches: ["https://turo.com/us/en/search*"],
  all_frames: true
}

// Use CSS modules for better style isolation
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText.replaceAll(':root', ':host(plasmo-csui)');
  return style
}

// Remove shadow DOM as it might interfere with Tailwind
export const getInlineAnchor: PlasmoGetInlineAnchor = () => {
  const searchFilterElement = document.querySelector('.searchFilter')
  const parentElement = searchFilterElement ? searchFilterElement.parentElement : null

  return {
    element: parentElement,
    insertPosition: "afterbegin"
  }
}

const Button = () => {
  return <RaptorExplorerButton />
}

export default Button