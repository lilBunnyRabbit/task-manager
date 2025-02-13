window.addEventListener("load", async () => {
  const versions = await fetch("../../../versions.json").then((res) => res.json());

  const $title = document.querySelector("a.title");
  const defaultValue = location.href
    .split("/")
    .filter((v) => /v\d+\.\d+\.\d+/.test(v))[0]
    ?.replace("v", "");

  const $select = document.createElement("select");
  $select.className = "title";
  $select.style.marginLeft = "1rem";
  $select.defaultValue = defaultValue;
  $select.innerHTML = versions
    .map(({ root, versions }) => {
      return `<optgroup label="${root}">${versions
        .map(({ version, src }) => {
          return `<option value="${src}"${version === defaultValue ? " selected" : ""}>${version}</option>`;
        })
        .join("")}</optgroup>`;
    })
    .join("");

  $select.addEventListener("change", function () {
    window.location.replace(`../${this.value}/index.html`);
  });

  const $wrapper = document.createElement("div");
  $title.replaceWith($wrapper);
  $wrapper.appendChild($title);
  $wrapper.appendChild($select);
});
