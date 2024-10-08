function FetchJson(jsonPath) {
   return fetch(jsonPath).then(response => {
      if (!response.ok) {
         throw new Error("Network response was not ok " + response.statusText);
      }
      
      return response.json();
   });
}

function FormatText(text) {
   const regex = /\[(.*?)\]\((.*?)\)/g;
   
   let match;
   let formattedText = text
      .replace(/\*\*\*(.*?)\*\*\*/g, `<span class="Italic Bold">$1</span>`)
      .replace(/\*\*(.*?)\*\*/g, `<span class="Bold">$1</span>`)
      .replace(/\*(.*?)\*/g, `<span class="Italic">$1</span>`)
      .replace(/\^\^(.*?)\^\^/g, `<sup>$1</sup>`)
      .replace(/,,(.*?),,/g, `<sub>$1</sub>`)
      .replace(/__(.*?)__/g, `<u>$1</u>`)
      .replace(/--(.*?)--/g, `<del>$1</del>`)
      .replace(/\n(\d+)/g, (_, n) => {
         const num = Number(n);
         
         return num > 1 ? '<br>'.repeat(num) : '';
      })
      .replace(/\n/g, `<br>`);
   
   while ((match = regex.exec(text)) !== null) {
      const [fullMatch, linkText, href] = match;
      
      text = text.replace(fullMatch, `<a href="${href}"><span>${linkText}</span></a>`);
   }
   
   return formattedText;
}

function FormatString(template, ...values) {
   return template.replace(/%s/g, () => values.shift());
}

function IsTable(item) {
   return Object.prototype.toString.call(item) === "[object Object]";
}

function IsArray(item) {
   return Array.isArray(item);
}

function IsValidString(value) {
   return (typeof value === 'string' && value.trim() !== '');
}

function IsOverflow(element) {
   return element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;
}

function GetLength(table) {
   return Object.entries(table).length;
}

function ForTable(table, callback) {
   const keys = Object.keys(table);
   
   for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      callback(key, i, table[key]);
   }
}

function PropertyConvert(property) {
   const Properties = {
      "Html": "innerHTML",
      "Text": "textContent",
      "Class": "className",
      "Style": "style",
      "Id": "id"
   }
   
   if (Properties[property] != null) {
      return Properties[property];
   }
   
   return property;
}

function Instance(Instance, Properties, Parent) {
   const isElement = Instance instanceof HTMLElement
   const element = isElement ? Instance : document.createElement(Instance);
   
   for (const [key, value] of Object.entries(Properties)) {
      if (IsTable(value)) {
         for (const [key_2, value_2] of Object.entries(value)) {
            element[PropertyConvert(key)][key_2] = value_2;
         }
      } else if (IsArray(value)) {
         if (value.every(IsValidString)) {
            const combinedValue = value.join(' ');
            
            element[PropertyConvert(key)] = combinedValue;
         }
      } else {
         element[PropertyConvert(key)] = value;
      }
   }
   
   if (isElement) {
      return;
   }
   
   Object.defineProperty(element, "Parent", {
      get() {
         return this._parent;
      },
      set(newParent) {
         if (this._parent) {
            this._parent.removeChild(this);
         }
         
         if (newParent) {
            newParent.appendChild(this);
         }
         
         this._parent = newParent;
      }
   });

   Object.defineProperty(element, "Id", {
      get() {
         return this.id;
      },
      set(newId) {
         this.id = newId;
      }
   });

   Object.defineProperty(element, "Style", {
      set(table) {
         if (!IsTable(table)) {
            return
         }
         
         for (const [key, value] of Object.entries(table)) {
            element.style[key] = value;
         }
      }
   });
   
   Object.defineProperty(element, "SetParent", { 
      value: function(targetElement, adjacentPosition) {
         if (adjacentPosition) {
            targetElement.insertAdjacentElement(adjacentPosition, element)
         } else {
            element.Parent = targetElement;
         }
      }
   });

   Object.defineProperty(element, "RemoveProperties", { 
      value: function(...properties) {
         properties.forEach(prop => {
            this.style.removeProperty(prop);
         });
      }
   });

   Object.defineProperty(element, "Destroy", {
      value: function() {
         this.remove();
      }
   });
   
   if (Parent) {
      element.Parent = Parent
   }
   
   return element;
}

function WrapText(element) {
   const originalFontSize = parseFloat(window.getComputedStyle(element).fontSize);
   
   function ResizeFontSize() {
      let fontSize = parseFloat(window.getComputedStyle(element).fontSize);
      
      while (isOverflow(element) && fontSize > 1) {
         fontSize--;
         element.style.fontSize = fontSize + "px";
      }
      
      while (!isOverflow(element) && fontSize < originalFontSize) {
         fontSize++;
         element.style.fontSize = fontSize + "px";
         
         if (isOverflow(element)) {
            fontSize--;
            element.style.fontSize = fontSize + "px";
            
            return;
         }
       }
   }
   
   ResizeFontSize();
   
   const observer = new ResizeObserver(() => {
      ResizeFontSize();
   });
   
   observer.observe(element);
}