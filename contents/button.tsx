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
  const searchFilterElement = document.querySelector('.searchFilter')
  const parentElement = searchFilterElement ? searchFilterElement.parentElement : null

  return {
    element: parentElement,
    insertPosition: "afterbegin"
  }
}



