export const randomRange = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

export const randomInt = (min: number, max: number) => {
  return Math.round(randomRange(min, max))
}
