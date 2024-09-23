const container = document.querySelector(".div-container");

let taskCounter = 1;

const data = {}
const tasks = {}

const categories = ["To do", "Doing", "Done"];

function PopUp() {
   const popOverlay = document.getElementById("pop-overlay");
   
   if (Array.from(popOverlay.classList).includes("show")) {
      document.getElementById("pop-overlay").classList.remove("show")
   } else {
      document.getElementById("pop-overlay").classList.add("show")
   }
}

function DropDown() {
   svg = document.getElementById("svg")
   path = document.getElementById("path")

   if(!Array.from(document.getElementById("drop-down").classList).includes("show")){
      document.getElementById("drop-down").classList.add("show")
      showing = true;
      svg.classList.remove("bi-arrow-up-short");
      svg.classList.add("bi-arrow-down-short");
      path.setAttribute("d", "M8 4a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5A.5.5 0 0 1 8 4")
   }else{
      document.getElementById("drop-down").classList.remove("show")
      showing = false;
      svg.classList.remove("bi-arrow-down-short");
      svg.classList.add("bi-arrow-up-short");
      path.setAttribute("d", "M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5");
   }
}

function SetupCategory(name) {
   const element = Instance("div", {
      "Class": ["area", name.replace(/\s+/g, "-")]
   });

   const textDiv = Instance("div", {
      "Class": "text",
      "Style": {
         "order": -99
      }
   }, element);

   Instance("h2", {
      "Text": name
   }, textDiv);

   data[name] = {
      "Element": element,
      "Items": {}
   }

   element.Parent = container
}

function SetupModal() {
   const dropdown = document.querySelector("#drop-down");

   const modalName = document.querySelector("#name").querySelector("textarea");
   const modalTask = document.querySelector("#task").querySelector("textarea");
   const modalSubmit = document.querySelector("#submit");
   
   let selected = undefined;

   function Selected(option){
      selected = option;
      document.getElementById("select-text").innerText = "Selected: " + selected;
      
      DropDown();
   }

   for(let i = 0; i < categories.length; i++) {
      const h4Element = Instance("h4", {
         "Text": categories[i]
      }, dropdown);

      h4Element.onmousedown = function() {
         Selected(categories[i]);
      };
   }

   modalSubmit.onmousedown = function() {
      if (selected != null && IsValidString(modalName.value) && IsValidString(modalTask.value)) {
         CreateTask(selected, modalName.value, modalTask.value)
         
         PopUp();

         document.getElementById("select-text").innerText = "Selected: None";
         [selected, modalName.value, modalTask.value] = [undefined, "", ""];
      }
   };
}

function CreateTask(targetCategory, name, task) {
   const taskKey = `task_${taskCounter++}`;
   const layoutOrder = GetLength(data[targetCategory].Items);
   
   const taskElement = Instance("div", {
      "Id": taskKey,
      "Class": "task",
      "Text": FormatString("%s (Name): %s (Task)", name, task),
      "Style": {
         "order": layoutOrder
      }
   });
   
   tasks[taskKey] = {
      "Element": taskElement,
      "Category": targetCategory,
      "LayoutOrder": layoutOrder
   }
   
   data[targetCategory].Items[taskKey] = layoutOrder;
   taskElement.Parent = data[targetCategory].Element;

   MakeDraggable(taskElement);
}

function GetKey(table, index) {
   for (const [key, value] of Object.entries(table)) {
      if (value === index) {
         return key;
      }
   }

   return;
}

for(let i = 0; i < categories.length; i++) {
   SetupCategory(categories[i]);
}

SetupModal();

for(let i = 1; i <= 4; i++) {
   CreateTask(categories[0], FormatString("Eve-%s", i), "Drawing")
}

const visualizer = {
   "Category": null,
   "Element": null
};

function MakeDraggable(element) {
   let pos1 = 0;
   let pos2 = 0;
   let pos3 = 0
   let pos4 = 0;

   element.onmousedown = Pick;

   function Pick(event) {
      event.preventDefault();
      
      pos3 = event.clientX;
      pos4 = event.clientY;

      if (visualizer.Element != null) {
         visualizer.Element.Destroy();
      }
      
      visualizer.Element = Instance("div", {
         "Class": ["visualization", "item"],
         "Style": {
            "backgroundColor": "rgba(0,0,0,0)",
            "border": "5px solid black",
            "order": tasks[element.Id].LayoutOrder
         }
      });
      
      visualizer.Element.SetParent(element, "afterend");
      Drag(event);
      
      element.Style = {
         "position": "absolute",
         "zIndex": "999999999",
         "outline": "3px solid black"
      }

      document.onmouseup = Drop;
      document.onmousemove = Drag;
   }

   function Drag(event) {
      event.preventDefault();
      
      pos1 = pos3 - event.clientX;
      pos2 = pos4 - event.clientY;
      pos3 = event.clientX;
      pos4 = event.clientY;
      
      element.Style = {
         "top": (element.offsetTop - pos2) + "px",
         "left": (element.offsetLeft - pos1) + "px"
      }
      
      Visualize(event);
   }

   function Visualize(event) {
      if (!visualizer.Element) {
         return;
      }
      
      const cursorX = event.clientX;
      const cursorY = event.clientY;
      
      let insideColumn = false;

      for (const [key, value] of Object.entries(data)) {
         const column = value.Element;
         const columnRect = column.getBoundingClientRect();

         if (cursorX >= columnRect.left && cursorX <= columnRect.right && cursorY >= columnRect.top && cursorY <= columnRect.bottom) {
            insideColumn = true;
            
            const layoutOrder = GetLength(value.Items);
            
            visualizer.Element.Parent = column;
            visualizer.Category = key;
            
            if (visualizer.Category == tasks[element.Id].Category) {
               let closestKey = null;
               let direction = 0;
               let closestDifference = Infinity;

               for(let i = -1 + tasks[element.Id].LayoutOrder; i >= 0; i--) {
                  const key = GetKey(value.Items, i);
                  const itemElement = tasks[key].Element;
                  
                  const elementRect = itemElement.getBoundingClientRect();
                  const elementCenterY = elementRect.top + elementRect.height / 2;
                  
                  if (cursorY <= elementCenterY) {
                     const difference = Math.abs(elementCenterY - cursorY);

                     if (difference < closestDifference) {
                        closestDifference = difference;
                        closestKey = key;
                        direction = -1;
                     }
                  }
               }

               for(let i = 1 + tasks[element.Id].LayoutOrder; i < GetLength(value.Items); i++) {
                  const key = GetKey(value.Items, i);
                  const itemElement = tasks[key].Element;

                  const elementRect = itemElement.getBoundingClientRect();
                  const elementCenterY = elementRect.top + elementRect.height / 2;

                  if (cursorY >= elementCenterY) {
                     const difference = Math.abs(elementCenterY - cursorY);

                     if (difference < closestDifference) {
                        closestDifference = difference;
                        closestKey = key;
                        direction = 0;
                     }
                  }
               }

               if (closestKey != null) {
                  visualizer.Element.style.order = tasks[closestKey].LayoutOrder + direction;
               } else {
                  visualizer.Element.style.order = tasks[element.Id].LayoutOrder;
               }

               return;
            }
            
            visualizer.Element.style.order = layoutOrder;
         }
      }
      
      if (!insideColumn) {
         const key = tasks[element.Id].Category;
         const layoutOrder = tasks[element.Id].LayoutOrder;

         visualizer.Element.Parent = data[key].Element;
         visualizer.Category = key;
         visualizer.Element.style.order = layoutOrder;
      }
   }
   
   function Drop(event) {
      document.onmouseup = undefined;
      document.onmousemove = undefined;
      
      const cursorX = event.clientX;
      const cursorY = event.clientY;
      
      for (const [key, value] of Object.entries(data)) {
         const column = value.Element;
         const columnRect = column.getBoundingClientRect();
         
         if (cursorX >= columnRect.left && cursorX <= columnRect.right && cursorY >= columnRect.top && cursorY <= columnRect.bottom) {
            if (key === tasks[element.id].Category) {
               let closestKey = null;
               let closestDifference = Infinity;

               for(let i = -1 + tasks[element.Id].LayoutOrder; i >= 0; i--) {
                  const key = GetKey(value.Items, i);
                  const itemElement = tasks[key].Element;
                  
                  const elementRect = itemElement.getBoundingClientRect();
                  const elementCenterY = elementRect.top + elementRect.height / 2;

                  if (cursorY <= elementCenterY) {
                     const difference = Math.abs(elementCenterY - cursorY);

                     if (difference < closestDifference) {
                        closestDifference = difference;
                        closestKey = key;
                     }
                  }
               }
               
               for(let i = 1 + tasks[element.Id].LayoutOrder; i < GetLength(value.Items); i++) {
                  const key = GetKey(value.Items, i);
                  const itemElement = tasks[key].Element;

                  const elementRect = itemElement.getBoundingClientRect();
                  const elementCenterY = elementRect.top + elementRect.height / 2;

                  if (cursorY >= elementCenterY) {
                     const difference = Math.abs(elementCenterY - cursorY);

                     if (difference < closestDifference) {
                        closestDifference = difference;
                        closestKey = key;
                     }
                  }
               }
               
               if (tasks[closestKey] != null) {
                  const keyLayoutOrder = tasks[closestKey].LayoutOrder;
                  const elementLayoutOrder = tasks[element.Id].LayoutOrder;
                  
                  console.log(elementLayoutOrder, keyLayoutOrder)
                  if (keyLayoutOrder < elementLayoutOrder) {
                     console.log("Down");

                     const keyOrders = {}

                     for (let i = keyLayoutOrder; i < elementLayoutOrder; i++) {
                        const key = GetKey(value.Items, i);
                        
                        keyOrders[key] = i;
                     }
                     
                     ForTable(keyOrders, function(key) {
                        tasks[key].LayoutOrder++;
                        tasks[key].Element.style.order = tasks[key].LayoutOrder;
                        value.Items[key] = tasks[key].LayoutOrder;
                     });
                  } else {
                     console.log("Up");
                     
                     for (let i = elementLayoutOrder; i <= keyLayoutOrder; i++) {
                        const key = GetKey(value.Items, i);
                        tasks[key].LayoutOrder--;
                        tasks[key].Element.style.order = tasks[key].LayoutOrder;
                        value.Items[key] = tasks[key].LayoutOrder;
                     }
                  }
                  
                  tasks[element.Id].LayoutOrder = keyLayoutOrder;
                  tasks[element.Id].Element.style.order = keyLayoutOrder;
                  value.Items[element.Id] = keyLayoutOrder;
               } else {
                  visualizer.Element.style.order = tasks[element.Id].LayoutOrder;
               }
            } else {
               const elementCategory = tasks[element.Id].Category;
               const layoutOrder = GetLength(value.Items);

               delete data[elementCategory].Items[element.Id];
               
               ForTable(data[elementCategory].Items, function(key, index) {
                  tasks[key].Element.style.order = index;
                  tasks[key].LayoutOrder = index;
                  data[elementCategory].Items[key] = index;
               });

               tasks[element.Id].Category = key;
               tasks[element.Id].LayoutOrder = layoutOrder;
               
               element.style.order = layoutOrder;
               value.Items[element.Id] = layoutOrder;

               column.appendChild(element);
            }
         }
      }
      
      visualizer.Element.Destroy();
      visualizer.Element = undefined;

      element.RemoveProperties("position", "top", "left", "z-index", "outline");
   }
}