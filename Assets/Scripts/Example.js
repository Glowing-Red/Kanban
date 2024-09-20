const paragraphContainer = Instance("div", {
   "Class": ["container", "Flex-Column"],
   "Style": {
     "alignItems": "center"
   }
});
const itemsContainer = Instance("div", {
   "Class": "container",
   "Style": {
     "marginBottom": "15px"
   }
});

for(let i = 1; i <= 6; i++) {
   Instance(FormatString("h%s", i), {
      "Text": FormatString("Hello world Number-%s!", i)
   }, itemsContainer);
}

for(let i = 1; i <= 9; i++) {
   const number = (i % 3 === 0 ? 3 : i % 3);
   
   Instance("p", {
      "Html": FormatText(`Index: ${FormatString("%s#%s%s", "*".repeat(number), i, "*".repeat(number))}`)
   }, paragraphContainer);
}

Instance("img", {
   "src": "https://www.iphonebutiken.se/files/simple-close-reflection-600.jpg"
}, paragraphContainer);

itemsContainer.Parent = document.body;
document.body.appendChild(paragraphContainer);