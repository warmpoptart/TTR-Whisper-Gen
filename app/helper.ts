// create text using font from app/assets
export function createText(
  text: string,
  font: string,
  size: number,
  color: string
): HTMLParagraphElement {
  const p = document.createElement("p");
  p.textContent = text;
  p.style.fontFamily = font;
  p.style.fontSize = `${size}px`;
  p.style.color = color;
  return p;
}