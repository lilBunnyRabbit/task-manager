export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function dummyProgress(props: { count: number; delay: number; onChange: (progress: number) => void }) {
  for (let i = 0; i < props.count; i++) {
    await sleep(props.delay);
    props.onChange(i / props.count);
  }
}

export function randomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}
