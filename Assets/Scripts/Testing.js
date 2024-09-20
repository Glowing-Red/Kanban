const content = document.querySelector(".content");

const data = {}
const categories = ["To do", "Doing", "Done"]

categories.forEach(object => {
   data[object] = {
      "Element": Instance("div", {
         "Class": "column"
      }, content),
      
      "Items": []
   }
});

const targetCategory = "To do"
function CreateTask(text) {
   const newElement = Instance("div", {
      "Class": ["item"],
      "Text": text
   });
   
   data[targetCategory].Items.push(newElement);

   newElement.Parent = data[targetCategory].Element;
   DragElement(newElement)
}

for(let i = 1; i <= 3; i++) {
   CreateTask(i)
}

function GetCategory(element) {
   for (const [key, value] of Object.entries(data)) {
      if (value.Items.indexOf(element) !== -1) {
         return key;
      }
   }

   return null;
}

function DragElement(element) {
   let pos1 = 0;
   let pos2 = 0;
   let pos3 = 0
   let pos4 = 0;

   element.onmousedown = DragMouseDown;

   let temporaryBox;

   function DragMouseDown(event) {
      event.preventDefault();
      
      pos3 = event.clientX;
      pos4 = event.clientY;

      ElementDrag(event);
      temporaryBox = Instance("div", {
         "Class": "item",
         "Style": {
            "backgroundColor": "rgba(0,0,0,0)"
         }
      });
      element.insertAdjacentElement('afterend', temporaryBox);

      document.onmouseup = CloseDragElement;
      document.onmousemove = ElementDrag;
   }

   function ElementDrag(event) {
      event.preventDefault();
      
      pos1 = pos3 - event.clientX;
      pos2 = pos4 - event.clientY;
      pos3 = event.clientX;
      pos4 = event.clientY;
      
      element.style.position = "absolute"
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
      element.style.zIndex = "999999999";
   }
   
   function CloseDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      for (const [key, value] of Object.entries(data)) {
         if (value.Items.indexOf(element) !== -1) {
            
         } else {
            const column = value.Element;
            const columnRect = column.getBoundingClientRect();
            
            if (centerX >= columnRect.left && centerX <= columnRect.right && centerY >= columnRect.top && centerY <= columnRect.bottom) {
               const elementCategory = GetCategory(element);
               const elementIndex = data[elementCategory].Items.indexOf(element);

               data[elementCategory].Items.splice(elementIndex, 1)

               value.Items.push(element);
               column.appendChild(element);
            }
         }
      }
      
      temporaryBox.Destroy();
      element.RemoveProperties("position", "top", "left", "z-index");
   }
}