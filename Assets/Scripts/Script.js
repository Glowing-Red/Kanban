for(let i = 1; i <= 6; i++) {
   Instance(FormatString("h%s", i), {
      "Text": FormatString("Hello world Number-%s!", i)
   }, document.body);
}