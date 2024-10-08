const container = document.querySelector(".div-container");

let taskCounter = 1;

const data = {}
const tasks = {}

const categories = ["To do", "Doing", "Done"];

function GetKey(table, index) {
   for (const [key, value] of Object.entries(table)) {
      if (value === index) {
         return key;
      }
   }

   return;
}

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

   if (!Array.from(document.getElementById("drop-down").classList).includes("show")) {
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

function SetupModal() {
   const dropdown = document.querySelector("#drop-down");

   const modalName = document.querySelector("#name").querySelector("textarea");
   const modalTask = document.querySelector("#task").querySelector("textarea");
   const modalSubmit = document.querySelector("#submit");
   
   let selected = undefined;

   function Selected(option) {
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
         AddTask(selected, modalName.value, modalTask.value)
         
         PopUp();

         document.getElementById("select-text").innerText = "Selected: None";
         [selected, modalName.value, modalTask.value] = [undefined, "", ""];
      }
   };
}

function SaveTasks() {
   function DeepCopyTasks(object) {
      const copiedObject = {}

      ForTable(object, function(key, index, value) {
         if (IsTable(value)) {
            copiedObject[key] = DeepCopyTasks(value)
         } else if (key !== "Element") {
            copiedObject[key] = value
         }
      })
      
      return copiedObject;
   }
   
   localStorage.setItem("savedTasksTest", JSON.stringify(DeepCopyTasks(tasks)));
}

function CreateCategory(name) {
   const element = Instance("div", {
      "Class": ["area", name.replace(/\s+/g, "-")]
   });

   const headDiv = Instance("div", {
      "Id": "Head",
      "Class": "text",
      "Style": {
         "order": -99
      }
   }, element);

   Instance("h2", {
      "Text": name
   }, headDiv);

   data[name] = {
      "Element": element,
      "Head": headDiv,
      "Items": {}
   }

   element.Parent = container
}

function GenerateTaskKey() {
   const keys = Object.keys(tasks);
   
   for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (key !== `task_${1 + i}`) {
         return `task_${1 + i}`;
      }
   }
   
   return `task_${1 + keys.length}`;
}

function UpdateOrder(targetKey, order) {
   tasks[targetKey].LayoutOrder = order;
   tasks[targetKey].Element.style.order = tasks[targetKey].LayoutOrder;
   data[tasks[targetKey].Category].Items[targetKey] = tasks[targetKey].LayoutOrder;
}

function AdjustOrder(taskKey) {
   console.log("adjust",taskKey,tasks[taskKey]);
   
   const previousItems = data[tasks[taskKey].Category].Items;
   const previousItemsCount = GetLength(previousItems);
   const elementLayoutOrder = tasks[taskKey].LayoutOrder;
   
   for (let i = elementLayoutOrder + 1; i < previousItemsCount; i++) {
      const indexKey = GetKey(previousItems, i);
      
      UpdateOrder(indexKey, -1 + tasks[indexKey].LayoutOrder);
   }
}

function AddTask(targetCategory, name, task, key) {
   const taskKey = IsValidString(key) ? key : GenerateTaskKey();
   const layoutOrder = GetLength(data[targetCategory].Items);
   
   const taskElement = Instance("div", {
      "Id": taskKey,
      "Class": "task",
      "Style": {
         "order": layoutOrder
      }
   });

   Instance("p", {
      "Html": FormatText(FormatString("**Name:** %s", name))
   }, taskElement);

   Instance("p", {
      "Html": FormatText(FormatString("**Task:** %s", task))
   }, taskElement);
   
   tasks[taskKey] = {
      "Name": name,
      "Task": task,
      "Element": taskElement,
      "Category": targetCategory,
      "LayoutOrder": layoutOrder
   }
   
   data[targetCategory].Items[taskKey] = layoutOrder;
   taskElement.Parent = data[targetCategory].Element;
   
   SaveTasks();
   MakeDraggable(taskElement);
}

function RemoveTask(taskKey) {
   AdjustOrder(taskKey);
   
   delete data[tasks[taskKey].Category].Items[taskKey];
   
   tasks[taskKey].Element.Destroy();
   delete tasks[taskKey];

   SaveTasks();
}

function LoadTasks() {
   const storedData = localStorage.getItem("savedTasksTest");
   const testSave = IsValidString(storedData) ? JSON.parse(storedData) : {};
   const filteredTasks = {}
   
   ForTable(testSave, function(key, index, value) {
      if (IsValidString(value.Category) && categories.includes(value.Category)) {
         if (!filteredTasks[value.Category]) {
            filteredTasks[value.Category] = {}
         }

         filteredTasks[value.Category][key] = value;
      }
   })

   ForTable(filteredTasks, function(key, index, value) {
      const sortedEntries = Object.entries(value).sort(([keyA, valueA], [keyB, valueB]) => {
         return valueA.LayoutOrder - valueB.LayoutOrder;
      });

      filteredTasks[key] = Object.fromEntries(sortedEntries);
   })

   ForTable(filteredTasks, function(category, index, categoryValue) {
      ForTable(categoryValue, function(key, index, taskValue) {
         AddTask(category, taskValue.Name, taskValue.Task, key);
      })
   })
}

for(let i = 0; i < categories.length; i++) {
   CreateCategory(categories[i]);
}

for(let i = 1; i <= 3; i++) {
   //AddTask(categories[0], FormatString("Eve-%s", i), "Kemi")
}

LoadTasks();
SetupModal();

const visualizer = {
   "Category": undefined,
   "Element": undefined
};

const taskPopup = {
   "Element": undefined,
   "Task": undefined
};

function CheckBounds(targetElement, position) {
   const targetRect = targetElement.getBoundingClientRect();
   
   return (position.X >= targetRect.left && position.X <= targetRect.right && position.Y >= targetRect.top && position.Y <= targetRect.bottom);
}

function DestroyTaskPopup() {
   if (taskPopup.Element != null) {
      taskPopup.Element.Destroy();
      taskPopup.Element = undefined;
   }

   if (taskPopup.Task != null) {
      taskPopup.Task = undefined;
   }
}

function HandlePopupClick(event) {
   if ( !(taskPopup.Element && taskPopup.Element.contains(event.target)) ) {
      document.removeEventListener("click", HandlePopupClick);

      DestroyTaskPopup();

      return;
   }
}

function MakeDraggable(element) {
   let pos = { X: 0, Y: 0, OffsetX: 0, OffsetY: 0 }
   let mousePos = { X: 0, Y: 0 }

   function InitPos(event) {
      const rect = element.getBoundingClientRect();
      
      pos.X = event.clientX;
      pos.Y = event.clientY;
      pos.elementX = rect.left;
      pos.elementY = rect.top;

      mousePos.X = event.pageX;
      mousePos.Y = event.pageY;
   }

   function UpdatePos(event) {
      mousePos.X = event.pageX;
      mousePos.Y = event.pageY;
   }

   function SetElementPosition(x, y) {
      const offsetX = pos.X - pos.elementX;
      const offsetY = pos.Y - pos.elementY;

      element.Style = {
         "top": `${y - offsetY}px`,
         "left": `${x - offsetX}px`
      }
   }

   function FixSize(targetElement) {
      const rect = element.getBoundingClientRect();
      
      targetElement.Style = {
         "height": `${rect.height}px`,
         "width": `${rect.width}px`,
         "boxSizing": "border-box"
      }
   }

   function CreateVisualizer() {
      if (visualizer.Element != null) {
         visualizer.Element.Destroy();
      }
      
      visualizer.Element = Instance("div", {
         "Class": ["task", "visualization"],
         "Style": {
            "backgroundColor": "rgba(0,0,0,0)",
            "border": "5px solid black",
            "order": tasks[element.Id].LayoutOrder
         }
      });

      FixSize(visualizer.Element);
      visualizer.Element.SetParent(element, "afterend");
   }

   function CreateTaskPopup(event) {
      DestroyTaskPopup();

      const mouseX = event.clientX;
      const mouseY = event.clientY;

      taskPopup.Task = element.Id;
      taskPopup.Element = Instance("div", {
         "Class": "task-popup"
      }, document.body);

      const popupButton = Instance("button", {
         "Text": "X"
      }, taskPopup.Element);

      popupButton.addEventListener('click', function() {
         document.removeEventListener("click", HandlePopupClick);
         
         RemoveTask(taskPopup.Task);

         DestroyTaskPopup();
      });
      
      const popupRect = taskPopup.Element.getBoundingClientRect();
      
      taskPopup.Element.Style = {
         "top": (mouseY - popupRect.height) + "px",
         "left": (mouseX) + "px"
      }
      
      document.removeEventListener("click", HandlePopupClick);
      document.addEventListener("click", HandlePopupClick);
   }

   function ResetProperties() {
      element.RemoveProperties("position", "top", "left", "z-index", "outline", "width", "height", "box-sizing");
   }

   function Drag(event) {
      event.preventDefault();
      
      UpdatePos(event);
      SetElementPosition(mousePos.X, mousePos.Y);
      
      Visualize(event);
   }

   function UpdateCategory(targetKey, category) {
      delete data[tasks[targetKey].Category].Items[targetKey];
      tasks[targetKey].Category = category;

      tasks[targetKey].Element.Parent = data[category].Element;
   }

   function GetClosestKey(event, items, sameColumn) {
      const cursorY = event.clientY;
      const itemsCount = GetLength(items);

      let closestKey = null;
      let direction = 0;
      let closestDifference = Infinity;
      
      if (sameColumn) {
         for(let i = -1 + tasks[element.Id].LayoutOrder; i >= 0; i--) {
            const key = GetKey(items, i);
            
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

         for(let i = 1 + tasks[element.Id].LayoutOrder; i < GetLength(items); i++) {
            const key = GetKey(items, i);
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
      } else {
         for(let i = -1 + itemsCount; i >= 0; i--) {
            const key = GetKey(items, i);
            
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
      }
      
      return [closestKey, direction];
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
         
         if (!CheckBounds(column, { X: cursorX, Y: cursorY })) {
            continue
         }
         
         insideColumn = true;
         
         visualizer.Element.Parent = column;
         visualizer.Category = key;
         
         const insideHead = CheckBounds(value.Head, { X: cursorX, Y: cursorY });
         const sameColumn = (visualizer.Category == tasks[element.Id].Category);
         const itemsCount = GetLength(value.Items);
         
         let [closestKey, direction] = GetClosestKey(event, value.Items, sameColumn);
         
         if (insideHead) {
            visualizer.Element.style.order = itemsCount;

            break;
         }
         
         if (closestKey != null) {
            visualizer.Element.style.order = tasks[closestKey].LayoutOrder + direction;
         } else {
            if (sameColumn) {
               visualizer.Element.style.order = tasks[element.Id].LayoutOrder;
            } else {
               visualizer.Element.style.order = itemsCount;
            }
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
      
      let insideColumn = false;

      for (const [key, value] of Object.entries(data)) {
         const column = value.Element;
         
         if (!CheckBounds(column, { X: cursorX, Y: cursorY })) {
            continue
         }
         
         insideColumn = true;
         
         const itemsCount = GetLength(value.Items);
         const insideHead = CheckBounds(value.Head, { X: cursorX, Y: cursorY });
         const sameColumn = (key == tasks[element.Id].Category);
         
         let [closestKey, direction] = GetClosestKey(event, value.Items, sameColumn);
         
         if (insideHead || itemsCount == 0 || !closestKey) {
            AdjustOrder(element.Id);
            
            if (sameColumn) {
               UpdateOrder(element.Id, -1 + itemsCount);
            } else {
               UpdateCategory(element.Id, key);
               UpdateOrder(element.Id, itemsCount);
            }
            
            break;
         }
         
         
         const keyLayoutOrder = tasks[closestKey].LayoutOrder;

         if (sameColumn) {
            const elementLayoutOrder = tasks[element.Id].LayoutOrder;
            
            if (keyLayoutOrder < elementLayoutOrder) {
               console.log("Down");

               const keyOrders = {}

               for (let i = keyLayoutOrder; i < elementLayoutOrder; i++) {
                  const taskKey = GetKey(value.Items, i);
                     
                  keyOrders[taskKey] = i;
               }
                  
               ForTable(keyOrders, function(taskKey) {
                  UpdateOrder(taskKey, 1 + tasks[taskKey].LayoutOrder);
               });
            } else {
               console.log("Up");
               
               for (let i = elementLayoutOrder; i <= keyLayoutOrder; i++) {
                  const taskKey = GetKey(value.Items, i);

                  UpdateOrder(taskKey, -1 + tasks[taskKey].LayoutOrder);
               }
            }
            
            UpdateOrder(element.Id, keyLayoutOrder);
         } else {
            const keyOrders = {}
            
            AdjustOrder(element.Id);
            
            for (let i = keyLayoutOrder; i < itemsCount; i++) {
               const taskKey = GetKey(value.Items, i);
                     
               keyOrders[taskKey] = i;
            }
            
            ForTable(keyOrders, function(taskKey) {
               UpdateOrder(taskKey, 1 + tasks[taskKey].LayoutOrder);
            });

            UpdateCategory(element.Id, key);
            UpdateOrder(element.Id, keyLayoutOrder);
         }
      }

      if (visualizer.Element) {
         visualizer.Element.Destroy();
         visualizer.Element = undefined;
      }

      SaveTasks();
      ResetProperties();
   }

   function Pick(event) {
      event.preventDefault();

      FixSize(element);
      InitPos(event);
      CreateVisualizer();

      Drag(event);
      
      element.Style = {
         "position": "absolute",
         "zIndex": "1000",
         "outline": "3px solid black"
      }
      
      document.onmouseup = Drop;
      document.onmousemove = Drag;
   }

   function DisableContextMenu(event) {
      event.preventDefault();

      MouseDown(event, true);
   }

   function MouseDown(event, rigthClick) {
      event.preventDefault();
      
      if (event.button === 0) {
         console.log("Left click");
         Pick(event);
      } else if (event.button === 2 && rigthClick) {
         console.log("Right click");
         
         CreateTaskPopup(event);
      }
   }

   element.oncontextmenu = DisableContextMenu;
   element.onmousedown = MouseDown;
}